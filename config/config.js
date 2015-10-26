var redis = require( 'redis' );

var development = {
  secret: 'hellovelocity',
  redisClient: redis.createClient()
};

var production = {
  secret: 'hellovelocity',
  redisClient: redis.createClient( 6379, 'silent.redis.cache.windows.net', {auth_pass: 'yi2f1yelyDAKO3Cys6dSDyFRZ6n+W1kG3phGFOLmmGU=' })
};

module.exports = process.env.NODE_ENV == 'production' ? production : development;

