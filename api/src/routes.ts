import * as express from 'express'
import * as scraper from './scraper'
import * as db from './database'

const api = express.Router()
api.post('/recipe', async (req: express.Request, res: express.Response) => {
  const url: String = req.body.url
  if (!url) {
    res.status(400).json({error: 'Missing POST parameter "url"'})
  } else {
    try {
      let recipe = await db.find(url)
      if (recipe.length === 0) {
        console.info('/recipe : not found from DB, scraping url=' + url)
        recipe = await scraper.scrapeRecipe(url)
        await db.save(url, recipe)
      }
      res.json(recipe) 
    } catch (error) {
      console.error(`/recipe : url=${url} failed with error "${error}"`)
      res.status(400).json({error})
    }
  }
})

export default api
