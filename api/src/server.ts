import serverless from 'serverless-http'
import express from 'express'
import api from './routes'

const corsMiddleware = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
}
const app: express.Application = express()
app.use(corsMiddleware)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(api)

export const handler = serverless(app)
