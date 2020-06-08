/* eslint-disable no-console */
import {
  SERVER_ERROR,
} from '../errors/general_200';

export default async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);

    ctx.status = e.status || 500;

    if (e.code && e.message) {
      ctx.body = {
        ...e,
      };
      return;
    }

    ctx.body = SERVER_ERROR;
  }
};
