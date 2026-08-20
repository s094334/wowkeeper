import { recognise } from "./recognise.js";

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/recognise") {
      return recognise(request, env);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
