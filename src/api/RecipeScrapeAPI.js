import {sendClientError } from '../api/Analytics'

export const scrapeRecipe = (recipeUrl) => {
  const apiHost = location && location.hostname !== 'localhost' ? //  eslint-disable-line
    'https://api.juhani.mobi' : 
    ''

  return fetch(`${apiHost}/recipe?url=${recipeUrl}`)
            .then(response => response.json())
            .then(json => json.map(ingredient => ( {name: ingredient.name, collected: false} )))
            .catch(err => {
              sendClientError('scrapeRecipe failed ' + err)
              return []
            })
}