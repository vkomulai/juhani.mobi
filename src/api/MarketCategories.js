import data from 'api/CategoryData.json'
import Fuse from 'fuse.js'
import _ from 'lodash'

let fuzzy
const init = () => {
  var options = {
    shouldSort: true,
    includeScore: true,
    threshold: 0.3, //  threshold 0.0 : 100% match,  threshold 1.0 : very unlikely match
    keys: ['items']
  }
  fuzzy = new Fuse(data, options)
}
init()

export const ORDER_LAST = 99999

export const getItemOrder = (item) => {
  const match = fuzzy.search(item)
  return _.get(match, '[0].item.order', ORDER_LAST)
}
