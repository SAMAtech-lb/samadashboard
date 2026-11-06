import { onRequestPost as __api_contact_js_onRequestPost } from "C:\\Users\\User\\Desktop\\testcl\\samadashboard\\functions\\api\\contact.js"
import { onRequest as __api_contact_js_onRequest } from "C:\\Users\\User\\Desktop\\testcl\\samadashboard\\functions\\api\\contact.js"

export const routes = [
    {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_contact_js_onRequest],
    },
  ]