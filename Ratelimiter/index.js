//using express-rate-limiter will stor in its local memory.But for global level that is if we use microservice,We would use redis-rate-limiter

//express-rate-limiter
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000, 
//   max: 100, 
//   message: 'Too many requests from this IP, please try again after an hour'
// });

// app.use(limiter);


//redis-rate-limiter
const RedisStore = require('rate-limit-redis');
const redisClient = require('./Redisclient'); 
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 60 * 60 * 1000,
  max: 100,
});
const express=require("express");
const app=express();
app.use(limiter)
