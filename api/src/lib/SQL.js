//
// usage:
//
// const sql = SQL`SELECT * FROM "player" where id = :playerId`;
// const player = db.query(sql,{playerId:'tom'});
//
module.exports = (strings, ...args) => ({
  sql: strings
    .map((s, i) => s + (args[i] || ''))
    .join('')
    .trim()
    .replace(/[ \t]*\n[ \t]*/g, ' ')
    .replace(/\"/g, '`'),
  namedPlaceholders: true,
});
