import Router from 'koa-router';
import moment from 'moment';
import bcrypt from 'bcrypt';

import {
  verifyRefreshToken,
} from '../helper/jwt';

import {
  INVALID_PARAMS,
} from '../errors/general_200';
import {
  AUTH_LOGIN_FAILED,
  TOKEN_VERIFY_FAILED,
  DUPLICATED_ACCOUNT,
  PERMISSION_FAILED,
  EDIT_PASSWORD_FAILED,
} from '../errors/auth_100';

import { db } from '../db';

const router = new Router({
  prefix: '/auth',
});

router.get('/authRequiredEndpoint', async (ctx) => {
  if (!ctx.req.member || ctx.req.member.role !== 'NORMAL') ctx.throw(400, PERMISSION_FAILED);

  ctx.body = {
    ...ctx.req.member,
    expireAt: moment.unix(ctx.req.member.exp).format('YYYY-MM-DD HH:mm:ss'),
    message: 'You Pass!',
  };
});

router.post('/register', async (ctx) => {
  const {
    name,
    account,
    password,
  } = ctx.request.body;

  if (
    !name
    || !account
    || !password
  ) {
    ctx.throw(400, INVALID_PARAMS);
  }

  const existUser = await db.models.User.findOne({
    where: {
      account,
    },
  });

  if (existUser) ctx.throw(400, DUPLICATED_ACCOUNT);

  const newUser = await db.models.User.create({
    name,
    account,
    password,
    role: 'NORMAL',
  });

  ctx.status = 201;
  ctx.body = {
    id: newUser.id,
    name: newUser.name,
    account: newUser.account,
  };
});

router.post('/login', async (ctx) => {
  const {
    account,
    password,
  } = ctx.request.body;

  if (!account || !password) ctx.throw(400, INVALID_PARAMS);

  const targetUser = await db.models.User.findOne({
    where: {
      account,
    },
    include: [{
      model: db.models.RefreshToken,
      order: [['createdAt', 'ASC']],
    }],
  });

  if (!targetUser) ctx.throw(400, AUTH_LOGIN_FAILED);

  if (!await targetUser.validatePassword(password)) ctx.throw(400, AUTH_LOGIN_FAILED);

  const promises = [
    targetUser.accessToken(targetUser.role),
    targetUser.refreshToken(targetUser.role),
  ];

  // 最多同時登入五台裝置, 超過將最早之前的刪除
  if (targetUser.RefreshTokens.length >= 5) {
    promises.push(targetUser.RefreshTokens[0].destroy({
      force: true,
    }));
  }

  const [accessToken, refreshToken] = await Promise.all(promises);

  await db.models.RefreshToken.create({
    token: refreshToken,
    UserId: targetUser.id,
  });

  ctx.body = {
    accessToken,
    refreshToken,
  };
});

// 登出將 refreshToken 刪除讓 token 失效
router.post('/logout', async (ctx) => {
  const {
    refreshToken,
  } = ctx.request.body;

  if (!refreshToken) ctx.throw(400, INVALID_PARAMS);

  await db.models.RefreshToken.destroy({
    where: {
      token: refreshToken,
    },
    force: true,
  });

  ctx.status = 204;
});

router.post('/refreshToken', async (ctx) => {
  const {
    refreshToken,
  } = ctx.request.body;

  if (!refreshToken) ctx.throw(400, INVALID_PARAMS);

  const checkTokenExist = await db.models.RefreshToken.findOne({
    where: {
      token: refreshToken,
    },
    include: [{
      model: db.models.User,
      required: true,
    }],
  });

  if (!checkTokenExist) ctx.throw(400, TOKEN_VERIFY_FAILED);

  try {
    await verifyRefreshToken(refreshToken);
    // 需不需要重給 refreshToken ? 如果給
    // 優點：可能token被竊取 但使用者剛好權限過期 用此 API 換 token, 原本被偷的 token 就無效
    // 缺點：使用者ㄧ定要30天都沒打request才會登出, 不然的話使用者永遠不會登出, 不給的話30天後 refreshToken 失效, 使用者一定得重登
    const accessToken = await checkTokenExist.User.accessToken(checkTokenExist.User.role);
    ctx.body = {
      accessToken,
    };
  } catch {
    ctx.throw(400, TOKEN_VERIFY_FAILED);
  }
});

// 忘記密碼 => token => 寄信 => 網址跳轉更改密碼
// 更改密碼 => 輸入原本密碼..
// 最安全應是改密碼都透過 token 寄信 網址跳轉
router.patch('/editPassword', async (ctx) => {
  if (!ctx.req.member) ctx.throw(400, PERMISSION_FAILED);

  const targetUser = await db.models.User.findByPk(ctx.req.member.id);

  if (!targetUser) ctx.throw(400, PERMISSION_FAILED);

  const {
    originalPwd,
    newPwd,
  } = ctx.request.body;

  if (!originalPwd || !newPwd) ctx.throw(400, INVALID_PARAMS);

  if (!await targetUser.validatePassword(originalPwd)) ctx.throw(400, EDIT_PASSWORD_FAILED);

  // 刪除所有 refreshToken
  await Promise.all([
    targetUser.update({
      password: bcrypt.hashSync(newPwd, bcrypt.genSaltSync(10)),
    }),
    db.models.RefreshToken.destroy({
      where: {
        UserId: targetUser.id,
      },
      force: true,
    }),
  ]);

  ctx.status = 204;
});

export default router;
