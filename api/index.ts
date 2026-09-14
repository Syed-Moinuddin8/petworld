export default async function handler(req: any, res: any) {
  try {
    const serverModule = await import('../server');
    const app = serverModule.default || serverModule;

    const rawUrl = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-rewrite-url'] as string) || req.url;
    if (rawUrl) {
      req.url = rawUrl;
    }
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Handler Exception: ${err.message}\n${err.stack}`);
  }
}
