import { sendClientError } from '../api/Analytics'
import { ShoppingItem } from 'types'

export const scrapeRecipe = (recipeUrl: string): Promise<ShoppingItem[]> => {
  const apiHost = location && location.hostname !== 'localhost'
    ? 'https://api.juhani.mobi'
    : ''

  return fetch(`${apiHost}/recipe?url=${recipeUrl}`)
    .then(response => response.json())
    .then((json: Array<{ name: string }>) => json.map(ingredient => ({ name: ingredient.name, collected: false })))
    .catch(err => {
      sendClientError('scrapeRecipe failed ' + err)
      return []
    })
}
