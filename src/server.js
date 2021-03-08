const knex = require('knex');
const app = require('./app');
const {
  PORT, DATABASE_HOST, DATABASE_NAME, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_URL
} = require('./config');

const db = knex({
  client: 'pg',
  connection: `${DATABASE_URL}?ssl=true`
});

app.set('db', db);

app.listen(PORT, () => {
  console.log('Database URL: ', DATABASE_URL);
  console.log(`Server listening at http://localhost:${PORT}`);
});
