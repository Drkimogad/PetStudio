export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const url = new URL(request.url);
    // Extract everything after /proxy/
    const targetUrl = url.pathname.slice('/proxy/'.length) + url.search;
    
    // Only allow Cloudinary URLs
    if (!targetUrl.includes('res.cloudinary.com')) {
      return new Response('Invalid URL', { status: 400 });
    }

    try {
      const response = await fetch(targetUrl, {
        cf: {
          cacheTtl: 86400, // Cache for 24 hours
          cacheEverything: true,
        }
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": response.headers.get("Content-Type"),
          "Cache-Control": "public, max-age=86400"
        }
      });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
}
