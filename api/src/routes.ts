import * as express from 'express'
import * as scraper from './scraper'
import * as db from './database'
import { initBasicAuth } from './auth'
const requireAuth = initBasicAuth()
const api = express.Router()

api.get('/recipe', async (req: express.Request, res: express.Response) => {
  const url: String = req.query.url
  if (!url) {
    res.status(400).json({ error: 'Missing Query parameter "url"' })
  } else {
    try {
      let recipe = await db.findRecipe(url)
      if (recipe.length === 0) {
        console.info('/recipe : not found from DB, scraping url=' + url)
        recipe = await scraper.scrapeRecipe(url)
        await db.saveRecipe(url, recipe)
      }
      res.json(recipe)
    } catch (error) {
      console.error(`/recipe : url=${url} failed with error "${error}"`)
      res.status(400).json({ error })
    }
  }
})

api.get('/list/:id', async (req: express.Request, res: express.Response) => {
  const listId: String = req.params.id
  try {
    let shoppingList = await db.findList(listId)
    if (shoppingList.length === 0) {
      console.info(`/list/${listId} not found from DB`)
    }
    res.json(shoppingList)
  } catch (error) {
    console.error(`/list/${listId} failed with error "${error}"`)
    res.status(400).json({ error })
  }
})

api.post('/list/:id', async (req: express.Request, res: express.Response) => {
  const listId: String = req.params.id
  try {
    const listItems = JSON.parse(req.body)
    db.saveList(listId, listItems)
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error(`/list/${listId} : failed with error "${error}"`)
    res.status(400).json({ error })
  }
})

api.get('/categories', async (_req: express.Request, res: express.Response) => {
  try {
    const categories = await db.fetchCategoryData()
    res.json(categories)
  } catch (error) {
    console.error(`/categories : failed with error "${error}"`)
    res.status(400).json({ error })
  }
})

api.post('/sync-content', requireAuth, async (req: express.Request, res: express.Response) => {
  try {
    const categoryData = JSON.parse(req.body).fields
    const data = {
      name: categoryData.name['en-US'] as string,
      order: categoryData.order['en-US'] as number,
      items: categoryData.items['en-US'] as string[]
    }
    db.saveCategoryData(data)
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error(`/sync-content : failed with error "${error}"`)
    res.status(400).json({ error })
  }
})

export default api
