const { Queue } = require('bullmq');
const { Redis } = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 5000);
    return delay;
  }
});

redisConnection.on('error', (err) => {
  if (err.message.includes('ETIMEDOUT')) {
    console.warn('[WARN] Redis connection timed out. Background workers may be offline.');
  } else {
    console.error('[ERR] Redis Error:', err.message);
  }
});

redisConnection.on('connect', () => {
  console.log('[SYS] Redis connected successfully.');
});

// Primary Mailer Queue
const mailQueue = new Queue('mail-queue', { 
  connection: /** @type {any} */ (redisConnection) 
});

// Heavy Ops Queue (PDF, Analytics)
const workerQueue = new Queue('worker-queue', { 
  connection: /** @type {any} */ (redisConnection) 
});

module.exports = { mailQueue, workerQueue, redisConnection };
