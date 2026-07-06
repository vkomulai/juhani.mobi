import Fuse from 'fuse.js'
import { sendClientError } from 'api/Analytics'
import { getApiHost } from 'api/Utils'
import testData from 'api/CategoryData.json'
import { ShoppingItem, CategoryData } from 'types'

export const fetchCategoryData = (): Promise<CategoryData[]> => {
  if (location.hostname === 'localhost') {
    return Promise.resolve(testData as CategoryData[])
  }

  return fetch(`${getApiHost()}/categories`)
    .then(response => response.json())
    .catch(err => {
      sendClientError('fetchCategoryData failed ' + err)
      return []
    })
}

let fuzzy: Fuse<CategoryData>
const init = (): void => {
  fetchCategoryData().then((categories) => {
    const options: Fuse.IFuseOptions<CategoryData> = {
      includeScore: true,
      threshold: 0.3,
      keys: ['items']
    }
    fuzzy = new Fuse(categories, options)
  })
}
init()

export const UNKNOWN_ITEM_ORDER = 99999
export const getItemOrder = (item: string): number => {
  const match = fuzzy.search(item)
  return match[0]?.item?.order ?? UNKNOWN_ITEM_ORDER
}

export const getItemsWithUnknownOrder = (items: ShoppingItem[]): string[] => {
  return [...new Set(items
    .filter(item => getItemOrder(item.name) === UNKNOWN_ITEM_ORDER)
    .map(item => item.name))]
}
