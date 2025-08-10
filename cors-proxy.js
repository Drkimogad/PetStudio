export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const CLOUDINARY_BASE = "https://res.cloudinary.com/dh7d6otgu";
    const url = new URL(request.url);
    const cloudinaryPath = url.pathname.replace("/proxy", "");

    const response = await fetch(`${CLOUDINARY_BASE}${cloudinaryPath}${url.search}`);
    const modified = new Response(response.body, response);

    modified.headers.set("Access-Control-Allow-Origin", "*");
    modified.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    modified.headers.set("Access-Control-Allow-Headers", "*");

    return modified;
  },
};
