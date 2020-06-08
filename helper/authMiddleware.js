import {
  verifyToken,
} from './jwt';

export default async (ctx, next) => {
  let token = ctx.header.authorization;

  if (!token) {
    ctx.req.member = null;
    await next();
    return;
  }

  token = token.replace('Bearer ', '');

  try {
    const payload = await verifyToken(token);
    ctx.req.member = payload;
  } catch (error) {
    ctx.req.member = null;
  }

  await next();
};
