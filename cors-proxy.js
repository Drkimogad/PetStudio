export default {
  async fetch(request, env, ctx) {
    // 1. Safer CORS handling
    const corsHeaders = {
      "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "*"
    };

    // 2. Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders
      });
    }

    // 3. Enhanced URL validation
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    const allowedDomains = [
      /^https:\/\/res\.cloudinary\.com\//,
       /^https:\/\/drkimogad\.github\.io\//
      /^https:\/\/petstudio\.dr-kimogad\.workers\.dev\//  // Worker URL
    ];
    
    if (!targetUrl || !allowedDomains.some(regex => regex.test(targetUrl))) {
      return new Response('Invalid URL', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // 4. Better error handling
    try {
      const upstreamResp = await fetch(targetUrl, {
        cf: {
          cacheTtl: 86400,
          cacheEverything: true,
        },
        headers: {
          // Forward necessary headers
          'Accept': request.headers.get('Accept') || 'image/*',
          'User-Agent': request.headers.get('User-Agent') || 'Cloudflare Worker'
        }
      });

      // 5. Stream the response instead of buffering
      const response = new Response(upstreamResp.body, upstreamResp);
      
      // 6. Set headers more efficiently
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }
      
      // 7. Security headers
      response.headers.set('Vary', 'Origin');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      
      return response;

    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, {
        status: 502,
        headers: corsHeaders
      });
    }
  }
}
