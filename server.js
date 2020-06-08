import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import debug from 'debug';

import initDB from './db';
import authRouter from './routes/auth';

import errorMiddleware from './helper/errorMiddleware';
import authMiddleware from './helper/authMiddleware';

const debugDB = debug('Auth_Practice:SERVER');

const PORT = '6679';

const app = new Koa();

app.use(errorMiddleware);
app.use(authMiddleware);
app.use(bodyParser());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

initDB().then(() => {
  app.listen(PORT, () => debugDB(`🚀 Server Listen on Port: ${PORT}`));
});
