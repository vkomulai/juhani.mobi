import basicAuth from 'express-basic-auth'

export function initBasicAuth() {
  const name = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD
  if (!name || !password) {
    console.warn('BASIC_AUTH_USER or BASIC_AUTH_PASSWORD not set')
    return basicAuth({ users: {} })
  }
  return basicAuth({ users: { [name]: password } })
}
