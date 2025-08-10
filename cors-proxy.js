addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const CLOUDINARY_BASE = 'https://res.cloudinary.com/dh7d6otgu'
  const url = new URL(request.url)
  const cloudinaryPath = url.pathname.replace('/proxy', '')
  
  const response = await fetch(`${CLOUDINARY_BASE}${cloudinaryPath}${url.search}`)
  const modified = new Response(response.body, response)
  
  modified.headers.set('Access-Control-Allow-Origin', '*')
  modified.headers.set('Access-Control-Allow-Methods', 'GET')
  return modified
}
