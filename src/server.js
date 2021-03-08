const knex = require('knex');
const app = require('./app');
const {
  PORT, DATABASE_HOST, DATABASE_NAME, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_URL
} = require('./config');

const db = knex({
  client: 'pg',
  connection: {
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    ssl: true
  }
});

app.set('db', db);

app.listen(PORT, () => {
  console.log('Database URL: ', DATABASE_URL);
  console.log(`Server listening at http://localhost:${PORT}`);
});
