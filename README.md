# JWT_AUTH
JWT based auth practice https://anymore0505.github.io/official-site/blog/article/9

## API
### GET /auth/authRequiredEndpoint
測試普通權限的 endpoint

header 帶 authorization `Bearer accessToken`

### POST /auth/register
註冊 endpoint

帶 body json
```
{
	"name": "Paul",
	"account": "youraccount",
	"password": "yourpwd"
}
```

### POST /auth/login
登入 endpoint

帶 body json
```
{
	"account": "youraccount",
	"password": "yourpwd"
}
```
回傳
```
{
	"accessToken": "your accessToken",
	"refreshToken": "your refreshToken"
}
```

### POST /auth/logout
登出 endpoint

帶 body json
```
{
	"refreshToken": "refreshToken"
}
```

### POST /auth/refreshToken
用refreshToken 換 accessToken endpoint

帶 body json
```
{
	"refreshToken": "refreshToken"
}
```
回傳
```
{
	"accessToken": "your accessToken"
}
```

### PATCH /auth/editPassword
更改密碼 endpoint

header 帶 authorization `Bearer accessToken`

帶 body json
```
{
  "originalPwd": "originalPwd",
  "newPwd": "newPwd"
}

