export default function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'Pet World API is live on Vercel!' });
}
