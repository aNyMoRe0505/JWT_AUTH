import Sequelize from 'sequelize';
import debug from 'debug';
import fs from 'fs';
import path from 'path';

const debugDB = debug('Auth_Practice:DB');

const DB_URL = 'mysql://root:dbpwd@127.0.0.1/auth_practice';

export const db = new Sequelize(DB_URL, {
  timezone: '+08:00',
  benchmark: true,
  logging: (log) => debugDB(log),
  define: {
    paranoid: true,
  },
});

const models = fs.readdirSync(path.resolve(__dirname, 'models'));

models.forEach((modelName) => {
  db.import(path.resolve(__dirname, 'models', modelName));
});

Object.keys(db.models).forEach((key) => db.models[key].associate());

debugDB('Sequelize Model Loaded.', { models: Object.keys(db.models) });

export default async () => {
  await db.sync();
  debugDB('db Model Syncd.');
};
