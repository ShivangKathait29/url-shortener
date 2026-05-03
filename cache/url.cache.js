import redis from './index.js';

const PREFIX = 'short:';
const TTL = 86400; // 24 hours

export async function getCachedUrl(code) {
  return redis.get(`${PREFIX}${code}`);
}

export async function setCachedUrl(code, targetUrl) {
  await redis.set(`${PREFIX}${code}`, targetUrl, 'EX', TTL);
}

export async function invalidateCachedUrl(code) {
  await redis.del(`${PREFIX}${code}`);
}
