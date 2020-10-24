const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favIcon = require('serve-favicon');
const logger = require('morgan');

const db = require('./store/db');
const SQL = require('./lib/SQL');

const PORT = parseInt(process.env.PORT || 3000);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(favIcon(path.join(__dirname, '..', 'public', 'favicon.ico')));

app.use(logger('dev'));

app.get('/', (req, res) => {
  res.send({ ok: true, message: 'Hello World!' });
});

const APIError = (status, message, reason = undefined) => {
  const err = new Error(message);
  err.status = status;
  err.reason = reason;
  return err;
};

//
// cex(): middleware wrapper for catching exceptions
//
const cex = (fn) => (...args) => fn(...args).catch(args[2]);

const qt = (s) => '`' + s + '`';

app.get(
  '/api/player',
  cex(async (req, res) => {

    const limit = parseInt(req.query.limit || 100);
    const offset = parseInt(req.query.offset || 0);

    // query for all users
    const sql = SQL`
      SELECT *
      FROM "players"
      ORDER BY "label"
      LIMIT :limit
      OFFSET :offset
    `;

    console.log(sql);

    const players = await db.query(
      { sql, namedPlaceholders: true },
      { limit, offset }
    );
    res.send({
      ok: true,
      players,
    });
  })
);

app.get(
  '/api/player/:playerId',
  cex(async (req, res) => {
    const sql = SQL`
      SELECT *
      FROM "players"
      WHERE "id" = :playerId
      ORDER BY "label"
    `;

    const player = await db.query({ sql, namedPlaceholders: true }, req.params );
    if (!player.length) throw APIError(403, 'Player Not Found');
    res.send({
      ok: true,
      player: player[0],
    });
  })
);

// 404 handler
app.use(
  cex((req) => {
    throw APIError(403, 'Not Found', `no route to (${req.method}) ${req.path}`);
  })
);

// global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  // const className = err.constructor.name;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).send({
    ok: false,
    status,
    error: err.message || err.toString(),
    reason: err.reason || err.code,
  });
});

app.listen(PORT, () => {
  console.log(`listening on http://0.0.0.0:${PORT}`);
});
