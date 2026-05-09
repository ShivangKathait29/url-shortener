import { clickQueue } from './index.js';

export async function enqueueClickEvent({ urlId, ip, userAgent, referer }) {
  await clickQueue.add('click', { urlId, ip, userAgent, referer }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
}
