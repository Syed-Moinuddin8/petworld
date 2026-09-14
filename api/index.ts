import app from '../expressServer';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Vercel Handler Error: ${err.message}\n${err.stack}`);
  }
}
