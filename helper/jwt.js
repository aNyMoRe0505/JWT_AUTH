import jwt from 'jsonwebtoken';

export const JWT_TOKEN_SECRET = 'AUTH_PRACTICE_ACCESSTOKEN';
export const JWT_REFRESH_TOKEN_SECRET = 'AUTH_PRACTICE_REFRESHTOKEN';

export const TOKEN_EXPIRED_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRED_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_TOKEN_SECRET, (error, payload) => {
      if (error) reject(error);
      resolve(payload);
    });
  });
}

export function verifyRefreshToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_REFRESH_TOKEN_SECRET, (error, payload) => {
      if (error) reject(error);
      resolve(payload);
    });
  });
}

export function jwtSignRefreshToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRED_SECONDS,
    }, (error, token) => {
      if (error) reject(error);
      resolve(token);
    });
  });
}

export function jwtSign(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_TOKEN_SECRET, {
      expiresIn: TOKEN_EXPIRED_SECONDS,
    }, (error, token) => {
      if (error) reject(error);
      resolve(token);
    });
  });
}
