const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const script = fs.readFileSync(path.join(__dirname, '000-init-up.sql')).toString();
  return knex.raw(script);
}

exports.down = function(knex) {
  const script = fs.readFileSync(path.join(__dirname, '000-init-down.sql')).toString();
  return knex.raw(script);
}
