import data from 'api/CategoryData.json'
import Fuse from 'fuse.js'
import _ from 'lodash'

let fuzzySearch
const init = () => {
  var options = {
    shouldSort: true,
    includeScore: true,
    threshold: 0.3,
    keys: ['items']
  }
  fuzzySearch = new Fuse(data, options)
}
init()

export const ORDER_LAST = 99999

export const getItemOrder = (item) => {
  const match = fuzzySearch.search(item)
  return _.get(match, '[0].item.order', ORDER_LAST)
}
