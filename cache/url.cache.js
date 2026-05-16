import redis from './index.js';

const PREFIX = 'short:';
const TTL = 86400; // 24 hours

export async function getCachedUrl(code) {
  try {
    return await redis.get(`${PREFIX}${code}`);
  } catch (error) {
    console.warn('Cache read failed:', error.message);
    return null;
  }
}

export async function setCachedUrl(code, targetUrl, expiresAt = null) {
   try {
    const ttl = expiresAt
      ? Math.max(1, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      : TTL;
    await redis.set(`${PREFIX}${code}`, targetUrl, 'EX', ttl);
  } catch (error) {
    console.warn('Cache write failed:', error.message);
  }
}

export async function invalidateCachedUrl(code) {
  try {
    await redis.del(`${PREFIX}${code}`);
  } catch (error) {
    console.warn('Cache invalidation failed:', error.message);
  }
}
