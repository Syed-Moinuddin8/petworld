export function normalizeBarcode(raw: any): string {
  if (raw === null || raw === undefined) return '';
  const str = String(raw).trim();
  return str.replace(/\s+/g, '');
}
