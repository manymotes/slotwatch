import 'dotenv/config';

const FLY_APP_NAME = 'slotwatch-instances';
const MACHINES_BASE = 'https://api.machines.dev/v1';

function flyHeaders(): Record<string, string> {
  const token = process.env.FLY_API_TOKEN;
  if (!token) throw new Error('FLY_API_TOKEN environment variable is required');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlyMachine {
  id: string;
  state: string;
  [key: string]: unknown;
}

interface CreateMachineResult {
  machineId: string;
  machineUrl: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function flyRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${MACHINES_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: flyHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fly API ${method} ${path} → ${res.status}: ${text}`);
  }

  // Some endpoints (e.g. stop / delete) return 200 with empty body
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a new Fly Machine for a customer.
 * Each machine runs the slotwatch instance image in isolation.
 */
export async function createMachine(
  userId: string,
  instanceSecret: string,
): Promise<CreateMachineResult> {
  const org = process.env.FLY_ORG;
  if (!org) throw new Error('FLY_ORG environment variable is required');

  const machineConfig = {
    name: `slotwatch-${userId.slice(0, 8)}`,
    config: {
      image: 'registry.fly.io/slotwatch:latest',
      env: {
        INSTANCE_SECRET: instanceSecret,
        DATA_DIR: '/data',
        PORT: '3001',
      },
      guest: {
        cpu_kind: 'shared',
        cpus: 1,
        memory_mb: 256,
      },
      mounts: [
        {
          volume: '',           // empty string → Fly auto-creates a volume
          path: '/data',
          size_gb: 1,
          auto_extend_size_threshold: 80,
          auto_extend_size_increment_gb: 1,
          auto_extend_size_limit_gb: 10,
        },
      ],
      services: [
        {
          internal_port: 3001,
          protocol: 'tcp',
          ports: [
            {
              port: 443,
              handlers: ['tls', 'http'],
            },
          ],
        },
      ],
    },
  };

  const machine = await flyRequest<FlyMachine>(
    'POST',
    `/apps/${FLY_APP_NAME}/machines`,
    machineConfig,
  );

  const machineId = machine.id as string;
  const machineUrl = `https://${machineId}.fly.dev`;

  return { machineId, machineUrl };
}

/**
 * Stops (suspends) a machine without deleting its data.
 */
export async function suspendMachine(machineId: string): Promise<void> {
  await flyRequest('POST', `/apps/${FLY_APP_NAME}/machines/${machineId}/stop`);
}

/**
 * Permanently deletes a machine and its associated volume.
 */
export async function deleteMachine(machineId: string): Promise<void> {
  // First stop the machine gracefully, ignore errors if already stopped
  try {
    await flyRequest('POST', `/apps/${FLY_APP_NAME}/machines/${machineId}/stop`);
    // Give the machine a moment to stop before deletion
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch {
    // Already stopped — continue to deletion
  }

  await flyRequest(
    'DELETE',
    `/apps/${FLY_APP_NAME}/machines/${machineId}?force=true`,
  );
}

/**
 * Kill switch: stops every running machine in the slotwatch-instances app.
 */
export async function suspendAll(): Promise<{ suspended: string[] }> {
  const machines = await flyRequest<FlyMachine[]>(
    'GET',
    `/apps/${FLY_APP_NAME}/machines`,
  );

  const running = machines.filter(
    (m) => m.state !== 'stopped' && m.state !== 'destroyed',
  );

  const results = await Promise.allSettled(
    running.map((m) => suspendMachine(m.id)),
  );

  const suspended: string[] = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      suspended.push(running[i].id);
    } else {
      console.error(
        `Failed to suspend machine ${running[i].id}:`,
        (results[i] as PromiseRejectedResult).reason,
      );
    }
  }

  return { suspended };
}

/**
 * Returns the total number of machines (all states) in the app.
 */
export async function countMachines(): Promise<number> {
  const machines = await flyRequest<FlyMachine[]>(
    'GET',
    `/apps/${FLY_APP_NAME}/machines`,
  );
  return machines.length;
}
