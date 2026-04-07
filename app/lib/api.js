const API = 'http://localhost:3000';

export async function getLatestData() {
  const res = await fetch(`${API}/api/data/latest`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal ambil data');
  return res.json();
}

export async function getHistory(range = '24h') {
  const res = await fetch(`${API}/api/data/history?range=${range}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal ambil history');
  return res.json();
}

export async function getFanStatus() {
  const res = await fetch(`${API}/api/fan/status`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal ambil status kipas');
  return res.json();
}

export async function controlFan(body) {
  const res = await fetch(`${API}/api/fan/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Gagal kontrol kipas');
  return res.json();
}