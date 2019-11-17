import serverless from 'serverless-http'
import * as bodyParser from 'body-parser'
import * as express from 'express'
import api from './routes'

const corsMiddleware = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
}
const bodyParserMiddleware = bodyParser.urlencoded({ extended: true })
const app: express.Application = express()
app.use(corsMiddleware)
app.use(bodyParserMiddleware)
app.use(api)

export const handler = serverless(app)
