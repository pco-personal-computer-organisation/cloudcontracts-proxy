//Error.stackTraceLimit = Infinity;

const app = require('atrus');

const packageJson = require('./package.json');
const config = require('./config/config.json');

app.locals.config = config;

app.use(app.middlewares.errorHandler());

app.addRoute({ route: '/', module: 'src' });

const port = config.listen.port || 3000;
const ip = config.listen.ip || '0.0.0.0';

app.listen(port, ip, () => {
  console.log(`${packageJson.name} listening on ${ip}:${port}!`); // eslint-disable-line no-console
});

module.exports = app;
