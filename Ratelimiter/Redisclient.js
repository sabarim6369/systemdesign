// redisClient.js
const { createClient } = require('redis');

const redisClient = createClient({ url: "redis://localhost:6379" });

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
