export default function handler(req: any, res: any) {
  res.status(200).json({ status: 'ok', message: 'Pet World API is live on Vercel!' });
}
