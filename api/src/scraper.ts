import scrapeIt from 'scrape-it'
import { Ingredient } from './types'

const kotikokkiMapping = {
  ingredients: {
    listItem: '.ingredient',
    data: {
      amount: {
        selector: 'span',
        eq: 0,
        convert: (val: string) => val ? val : '-'
      },
      name: {
        selector: '.name span',
        eq: 0,
        convert: (val: string) => val ? val : '-'
      }
    }
  }
}

//  SOPPA365: https://www.soppa365.fi/reseptit/liha-juhli-ja-nauti-kastikkeet-tahnat-ja-marinadit/lihapullapasta-uunissa
//  VALIO: https://www.valio.fi/reseptit/poropizza/
export const scrapeRecipe = async (url: string): Promise<Ingredient[]> => {
  let dataMapping
  if (url.startsWith('https://www.kotikokki.net')) {
    dataMapping = kotikokkiMapping
  }
  if (dataMapping) {
    const response = await scrapeIt(url, dataMapping)
    return (response.data as { ingredients: Ingredient[] }).ingredients
  } else {
    throw 'unknown source'
  }
}
