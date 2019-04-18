Error.stackTraceLimit = Infinity;

/* eslint-disable import/no-extraneous-dependencies */

const tap = require('tap');
const request = require('supertest');
const express = require('express');
const proxy = require('atrus');
const Sequelize = require('sequelize');
const path = require('path');

const app = express();
const explorer = express();
const demo = express();

process.env.DEFAULT_INSTANCE_URL = 'http://localhost:3001';

proxy.locals.config = {
  db: {
    dialect: 'sqlite',
    storage: 'test.sqlite',
  },
  explorer: {
    enable: true,
    url: 'http://localhost:3002',
  },
  demo: {
    enable: true,
    url: 'http://localhost:3003',
  },
  listen: {
    ip: '0.0.0.0',
    port: 3000,
  },
  analytics: false,
};

const db = new Sequelize('test', 'root', '', {
  dialect: proxy.locals.config.db.dialect,
  logging: false,
  operatorsAliases: false,
  storage: proxy.locals.config.db.storage,
});

const User = db.import(path.resolve('./models/User.js'));
const AccessToken = db.import(path.resolve('./models/AccessToken.js'));
const Kunden = db.import(path.resolve('./models/Kunden.js'));
const Analytics = db.import(path.resolve('./models/Analytics.js')); // eslint-disable-line no-unused-vars

proxy.use(proxy.middlewares.errorHandler());
proxy.addRoute({ route: '/', module: 'src' });
proxy.listen(3000, () => console.log('proxy listening on :3000')); // eslint-disable-line no-console

app.all('*', (req, res) => res.send('app'));
app.listen(3001, () => console.log('app listening on :3001')); // eslint-disable-line no-console

explorer.all('*', (req, res) => res.send('explorer'));
explorer.listen(3002, () => console.log('explorer listening on :3002')); // eslint-disable-line no-console

demo.all('*', (req, res) => res.send('demo'));
demo.listen(3003, () => console.log('demo listening on :3003')); // eslint-disable-line no-console

db.sync({ force: true })
  .then(() => User.create({
    id: 1,
    username: 'test',
    email: 'test@example.org',
    idKunde: 1,
  }))
  .then(() => AccessToken.create({
    id: 'blablabla',
    userId: 1,
  }))
  .then(() => Kunden.create({
    id: 1,
    status: 1,
    instanceUrl: 'http://localhost:3001',
  }))
  .then(() => tap.test('POST /api/Users/login', assert => Promise.resolve()
    .then(() => request('http://localhost:3000')
      .post('/api/Users/login')
      .type('json')
      .send({ username: 'test', password: 'test' })
      .expect(200))
    .then(res => assert.equal(res.text, 'app', 'Erwartungswert "app" geliefert!'))
    .then(() => assert.pass('post api login passed'))))
  .then(() => tap.test('ALL /api/*', assert => Promise.resolve()
    .then(() => request('http://localhost:3000')
      .get('/api/Users/1')
      .set('Authorization', 'blablabla')
      .expect(200))
    .then(res => assert.equal(res.text, 'app', 'Erwartungswert "app" geliefert!'))
    .then(() => assert.pass('get user passed'))
    .then(() => request('http://localhost:3000')
      .get('/api/Users/1')
      .expect(401))
    .then(() => assert.pass('401 wenn kein Token mitgeliefert wird'))))
  .then(() => tap.test('ALL /demo/', assert => Promise.resolve()
    .then(() => request('http://localhost:3000')
      .post('/demo/login')
      .type('json')
      .send({ username: 'test', password: 'test' })
      .expect(200))
    .then(res => assert.equal(res.text, 'demo', 'Erwartungswert "demo" geliefert!'))
    .then(() => assert.pass('demo login passed'))))
  .then(() => tap.test('ALL /explorer/', assert => Promise.resolve()
    .then(() => request('http://localhost:3000')
      .get('/explorer/')
      .expect(200))
    .then(res => assert.equal(res.text, 'explorer', 'Erwartungswert "explorer" geliefert!'))
    .then(() => assert.pass('getting explorer index passed'))))
  .then(() => tap.test('GET /*', assert => Promise.resolve()
    .then(() => request('http://localhost:3000')
      .get('/index.html')
      .expect(200))
    .then(res => assert.equal(res.text, 'app', 'Erwartungswert "app" geliefert!'))
    .then(() => assert.pass('getting files passed'))
    .then(() => request('http://localhost:3000')
      .post('/lalala')
      .expect(401))
    .then(() => assert.pass('post not allowed on /*/'))))
  .then(() => process.exit(0))
  .catch(console.error); // eslint-disable-line no-console
