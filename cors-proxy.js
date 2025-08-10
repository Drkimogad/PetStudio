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
          "Access-Control-Max-Age": "86400"
        },
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Security: Only allow Cloudinary URLs
    if (!targetUrl || !/^https:\/\/res\.cloudinary\.com\//.test(targetUrl)) {
      return new Response('Invalid or missing url', { status: 400 });
    }

    try {
      const upstreamResp = await fetch(targetUrl, {
        cf: {
          cacheTtl: 86400,
          cacheEverything: true,
        }
      });

      // Clone the upstream response as arrayBuffer to avoid streaming body issues
      const body = await upstreamResp.arrayBuffer();
      const headers = new Headers(upstreamResp.headers);

      // Set CORS and other headers
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Expose-Headers', '*');
      headers.set('Cache-Control', 'public, max-age=86400');
      headers.delete('content-security-policy');
      headers.delete('content-security-policy-report-only');
      headers.delete('clear-site-data');

      return new Response(body, {
        status: upstreamResp.status,
        statusText: upstreamResp.statusText,
        headers
      });
    } catch (err) {
      return new Response(err.message, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
}
