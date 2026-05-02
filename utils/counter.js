import redis from '../cache/index.js';

const COUNTER_KEY = 'url:counter';

export async function getNextId() {
  return redis.incr(COUNTER_KEY);
}
