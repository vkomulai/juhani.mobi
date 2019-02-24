import * as scrapeIt from 'scrape-it'
import { Ingredient } from './types' 

const kotikokkiMapping = {
  ingredients: {
    listItem: ".ingredient", 
    data: {
      amount: {
        selector: "span",
        eq: 0
      },
      ingredient: {
        selector: ".name span",
        eq: 0
      }
    }
  }
}

//  SOPPA365: https://www.soppa365.fi/reseptit/liha-juhli-ja-nauti-kastikkeet-tahnat-ja-marinadit/lihapullapasta-uunissa
//  VALIO: https://www.valio.fi/reseptit/poropizza/
export const scrapeRecipe = async (url: String) : Promise<Ingredient[]> => {
  let dataMapping
  if (url.startsWith('https://www.kotikokki.net')) {
    dataMapping = kotikokkiMapping
  }
  if (dataMapping) {
    return await scrapeIt(url, dataMapping).then((response: any) => response.data.ingredients)
  } else {
    throw 'unknown source'
  }
}