import app from '../server';

export default function handler(req: any, res: any) {
  // Preserve original requested URL path from Vercel rewrites header
  const rawUrl = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-rewrite-url'] as string) || req.url;
  if (rawUrl) {
    req.url = rawUrl;
  }
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
