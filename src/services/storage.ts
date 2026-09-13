const PREFIX = 'scrapsetu_';

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateReferenceId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `EW-${yy}${mm}${dd}-${random}`;
}

export function generateHandoverId(): string {
  const random = String(Math.floor(Math.random() * 900000) + 100000);
  return `HND-${random}`;
}

export function generateTransactionId(): string {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 90000) + 10000);
  return `TXN-${year}-${random}`;
}
