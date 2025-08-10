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
    const targetUrl = url.searchParams.get('url');

    // Security check: only allow Cloudinary URLs
    if (!targetUrl || !targetUrl.includes('res.cloudinary.com')) {
      return new Response('Invalid or missing url', { status: 400 });
    }

    try {
      const response = await fetch(targetUrl, {
        cf: {
          cacheTtl: 86400, // cache for 24h
          cacheEverything: true,
        }
      });

      // Copy all headers except for problematic ones
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Cache-Control', 'public, max-age=86400');

      // Remove security headers that would block browser use
      newHeaders.delete('content-security-policy');
      newHeaders.delete('content-security-policy-report-only');
      newHeaders.delete('clear-site-data');

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
}
