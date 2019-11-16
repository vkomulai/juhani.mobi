import * as basicAuth from 'express-basic-auth'

export function initBasicAuth() {
  const name = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD
  const user = {}
  user[name] = password
  return basicAuth({ users: user })
}
