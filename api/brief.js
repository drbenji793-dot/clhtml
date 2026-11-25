module.exports = async function brief(request, response) {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).end('This handoff is read only.\n');
  }
  try {
    const endpoint = new URL('/rest/v1/clhtml_public_handoff', process.env.SUPABASE_URL);
    endpoint.search = new URLSearchParams({ select: 'body', slot: 'eq.current' }).toString();
    const result = await fetch(endpoint, {
      headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(6000)
    });
    if (!result.ok) throw new Error('Handoff unavailable');
    const [handoff] = await result.json();
    if (!handoff || typeof handoff.body !== 'string' || !handoff.body.trim()) {
      throw new Error('No current handoff');
    }
    return response.status(200).end(request.method === 'HEAD' ? undefined : handoff.body);
  } catch {
    return response.status(503).end('The live handoff is unavailable. Open the release copy at /handoff.txt.\n');
  }
};
