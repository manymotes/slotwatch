import { onRequestOptions as __api_notify_js_onRequestOptions } from "/Users/kendallmotes/slotwatch/apps/web/functions/api/notify.js"
import { onRequestPost as __api_notify_js_onRequestPost } from "/Users/kendallmotes/slotwatch/apps/web/functions/api/notify.js"

export const routes = [
    {
      routePath: "/api/notify",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_notify_js_onRequestOptions],
    },
  {
      routePath: "/api/notify",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notify_js_onRequestPost],
    },
  ]