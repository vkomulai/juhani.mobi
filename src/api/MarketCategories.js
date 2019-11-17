import Fuse from 'fuse.js'
import _ from 'lodash'
import { sendClientError } from '../api/Analytics'
import testData from 'api/CategoryData.json'

export const fetchCategoryData = () => {
  if (location == 'http://localhost/') {
    return Promise.resolve(testData)  //  Ugly hack, fix this later
  }

  const apiHost = location && location.hostname !== 'localhost' ? //  eslint-disable-line
    'https://api.juhani.mobi' :
    ''
  return fetch(`${apiHost}/categories`)
    .then(response => response.json())
    .catch(err => {
      sendClientError('fetchCategoryData failed ' + err)
      return []
    })
}


let fuzzy
const init = () => {
  fetchCategoryData().then((categories) => {
    const options = {
      shouldSort: true,
      includeScore: true,
      threshold: 0.3, //  threshold 0.0 : 100% match,  threshold 1.0 : very unlikely match
      keys: ['items']
    }
    fuzzy = new Fuse(categories, options)
  })
}

init()

export const ORDER_LAST = 99999

export const getItemOrder = (item) => {
  const match = fuzzy.search(item)
  return _.get(match, '[0].item.order', ORDER_LAST)
}
