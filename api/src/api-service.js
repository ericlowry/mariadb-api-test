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

app.get('/api/users', cex(async (req, res, next) => {
  const limit = Math.min(100, parseInt(req.query.limit || 10));
  const offset = parseInt(req.query.offset || 0);

  console.log(limit);

  const users = await db.query(SQL`SELECT * FROM "users" LIMIT :limit OFFSET :offset`, { limit, offset });

  const roles = await db.query(SQL`
      SELECT * FROM "user_roles" 
      WHERE "user_id" IN (:userids)`, { limit, offset, userids: users.map(user => user.id) });

  users.forEach(user => {
      user.roles = [];
      roles.filter(role => role.user_id === user.id).forEach(role => {
          user.roles.push(role.role_id);
      })
  });

  res.send({ ok: true, users });
}));

app.get('/api/user/:id', cex(async (req, res, next) => {
  const users = await db.query(SQL`SELECT * FROM "users" WHERE "id" = :id`, req.params);
  if (!users.length) throw httpError(404, "User Not Found", `No user ${req.params.id}`);
  const user = users[0];
  const roles = await db.query(SQL`SELECT * FROM "user_roles" WHERE "user_id" = :id`, req.params);
  user.roles = roles.map(r => r.role_id);
  res.send({ ok: true, user });
}));

app.post('/api/user', cex(async (req, res, next) => {
  console.log(req.body);
  const conn = await db.getConnection();
  
  await conn.beginTransaction();

  try {
      const result = await conn.query(SQL`
      INSERT INTO "users" ( "id", "label", "email", "password", "version" ) 
      VALUES ( :id, :label, :email, :password, :version )`, req.body);

      const roles = req.body.roles || [];

      for (i = 0; i < roles.length; i++) {
          await conn.query(SQL`
          INSERT INTO "user_roles" ("user_id","role_id") 
          VALUES ( :user_id, :role_id )
          `, { user_id: req.body.id, role_id: roles[i] })
      }

      console.log('committing');
      await conn.commit();

  } catch (err) {
      console.log('rolling back!');
      await conn.rollback();
      throw err;
  }

  res.send({ ok: true });
}));

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

    const players = await db.query(sql, { limit, offset });

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

    const player = await db.query(sql, req.params);
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
