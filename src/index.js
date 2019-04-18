const useragent = require('useragent');
const path = require('path');

module.exports = (route) => {
  const { config } = route.locals;
  const { hasKey } = route;
  const { httpProxy, bodyParser } = route.middlewares;
  const Sql = route.tools.sql;

  const db = new Sql(config.db.database || 'test', config.db.user || 'root', config.db.password || '', {
    host: config.db.host || 'localhost',
    dialect: config.db.dialect || 'mysql',
    logging: false,
    operatorsAliases: false,
    storage: config.db.storage,
  });

  const User = db.import(path.resolve('./models/User.js'));
  const AccessToken = db.import(path.resolve('./models/AccessToken.js'));
  const Kunden = db.import(path.resolve('./models/Kunden.js'));
  const Analytics = db.import(path.resolve('./models/Analytics.js'));

  const proxy = (req, res, target) => httpProxy({ target })(req, res, (error) => {
    if (error) {
      console.log('proxy error', error); // eslint-disable-line no-console
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' });
      }

      res.end(JSON.stringify({
        error: 'proxy_error',
        reason: error.message,
      }));
    }
  });

  const instanceOfUser = where => User.findOne({
    where,
    attributes: ['idKunde'],
  })
    .then(user => Kunden.findOne({
      where: { id: user.idKunde },
      attributes: ['status', 'laufzeitende', 'instanceUrl'],
    }))
    .then(kunde => new Promise((resolve, reject) => (kunde.status === 1 ? resolve(kunde.instanceUrl) : reject()))) // eslint-disable-line max-len
    .catch(console.log); // eslint-disable-line no-console

  if (config.explorer.enable) {
    route.all('^/explorer/*', httpProxy({ target: config.explorer.url }));
  }

  if (config.demo.enable) {
    route.all('^/demo/*', httpProxy({ target: config.demo.url }));
  }

  route.head('/', (req, res) => res.send());

  route.all('*', bodyParser(), (req, res) => {
    if (hasKey(req.headers, 'authorization') || hasKey(req.query, 'access_token')) {
      AccessToken.findOne({
        where: { id: hasKey(req.headers, 'authorization') ? req.headers.authorization : req.query.access_token },
        attributes: ['userId'],
      })
        .then(token => instanceOfUser({ id: token.userId }))
        .then(target => proxy(req, res, target))
        .catch(() => res.sendStatus(401));

      if (config.analytics) {
        const agent = useragent.parse(req.headers['user-agent']);
        Analytics.create({
          browser: agent.family,
          version: agent.major,
          useragent: agent.source,
          os: agent.os.family,
          device: agent.device.family,
          path: req.originalUrl.split('?')[0],
        });
      }
    } else if (req.method === 'POST' && req.path === '/api/Users/login' && (hasKey(req.body, 'password') && (hasKey(req.body, 'username') || hasKey(req.body, 'email')))) {
      const where = {};
      if (hasKey(req.body, 'username')) {
        where.username = req.body.username;
      } else {
        where.email = req.body.email;
      }
      instanceOfUser(where)
        .then(target => proxy(req, res, target))
        .catch(() => res.sendStatus(401));
    } else if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      proxy(req, res, process.env.DEFAULT_INSTANCE_URL);
    } else {
      res.sendStatus(401);
    }
  });
};
