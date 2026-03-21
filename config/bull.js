const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Primary Mailer Queue
const mailQueue = new Queue('mail-queue', { connection: redisConnection });

// Heavy Ops Queue (PDF, Analytics)
const workerQueue = new Queue('worker-queue', { connection: redisConnection });

module.exports = { mailQueue, workerQueue, redisConnection };
