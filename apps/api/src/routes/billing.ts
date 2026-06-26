import 'dotenv/config';
import { Hono } from 'hono';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db, users, encrypt } from '../db';
import { createMachine } from '../fly';
import { sendWelcomeEmail } from '../email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID ?? '';
const MONTHLY_PRICE_USD = 9.99;
const WEB_APP_URL = process.env.WEB_APP_URL ?? 'https://slotwatch.app';

export const billingRouter = new Hono();

// ── GET /api/pricing ──────────────────────────────────────────────────────────

billingRouter.get('/api/pricing', (c) => {
  return c.json({ monthly: MONTHLY_PRICE_USD, currency: 'usd' });
});

// ── POST /api/checkout ────────────────────────────────────────────────────────

billingRouter.post('/api/checkout', async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: MONTHLY_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${WEB_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${WEB_APP_URL}/pricing?checkout=canceled`,
    allow_promotion_codes: true,
  };

  if (body.email) {
    sessionParams.customer_email = body.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return c.json({ url: session.url });
});

// ── POST /webhooks/stripe ─────────────────────────────────────────────────────

billingRouter.post('/webhooks/stripe', async (c) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return c.json({ error: 'Webhook secret not configured' }, 500);
  }

  // Stripe requires the raw body for signature verification
  const rawBody = await c.req.text();
  const sig = c.req.header('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return c.json({ error: `Webhook Error: ${message}` }, 400);
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return c.json({ error: 'Internal handler error' }, 500);
  }

  return c.json({ received: true });
});

// ── Event handler ─────────────────────────────────────────────────────────────

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(sub);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      // Detect pause: Stripe sets pause_collection when a subscription is paused
      if (sub.pause_collection) {
        await handleSubscriptionPaused(sub);
      }
      break;
    }

    default:
      // Unhandled event types are fine — just acknowledge receipt
      break;
  }
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    console.error('checkout.session.completed: no email on session', session.id);
    return;
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  // Generate a random secret that the Fly machine uses to authenticate
  // inbound requests from this platform API
  const instanceSecret = randomBytes(32).toString('hex');

  // Provision the Fly machine
  let machineId: string | null = null;
  let machineUrl: string | null = null;

  // Insert user first so we have the UUID
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: 'active',
      instanceSecret: encrypt(instanceSecret),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        instanceSecret: encrypt(instanceSecret),
      },
    })
    .returning();

  try {
    const machine = await createMachine(newUser.id, instanceSecret);
    machineId = machine.machineId;
    machineUrl = machine.machineUrl;

    await db
      .update(users)
      .set({ flyMachineId: machineId, flyMachineUrl: machineUrl })
      .where(eq(users.id, newUser.id));
  } catch (err) {
    console.error('Failed to provision Fly machine for user', newUser.id, err);
    // Don't fail the webhook — the machine can be provisioned manually
  }

  // Send welcome email
  try {
    const dashboardUrl = `${WEB_APP_URL}/dashboard?email=${encodeURIComponent(email)}`;
    await sendWelcomeEmail(email, dashboardUrl);
  } catch (err) {
    console.error('Failed to send welcome email to', email, err);
  }
}

async function handleSubscriptionCanceled(
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.warn('subscription.deleted: no user found for customer', customerId);
    return;
  }

  await db
    .update(users)
    .set({ subscriptionStatus: 'canceled', canceledAt: new Date() })
    .where(eq(users.id, user.id));

  if (user.flyMachineId) {
    try {
      const { suspendMachine } = await import('../fly');
      await suspendMachine(user.flyMachineId);
    } catch (err) {
      console.error('Failed to suspend machine for user', user.id, err);
    }
  }
}

async function handleSubscriptionPaused(
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.warn('subscription.updated (paused): no user for customer', customerId);
    return;
  }

  await db
    .update(users)
    .set({ subscriptionStatus: 'paused' })
    .where(eq(users.id, user.id));

  if (user.flyMachineId) {
    try {
      const { suspendMachine } = await import('../fly');
      await suspendMachine(user.flyMachineId);
    } catch (err) {
      console.error('Failed to suspend machine for paused user', user.id, err);
    }
  }
}
