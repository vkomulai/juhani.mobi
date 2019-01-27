const wtf = require('wtf_wikipedia')

const fruitsWikipediaPageId = 44202
const vegetablesWikipediaPageId = 1000967
const categories = [fruitsWikipediaPageId, vegetablesWikipediaPageId]

categories.forEach(categoryId => {
  wtf.fetch(categoryId, 'fi').then(doc => {
    const products = doc.links().reduce((acc, curr) => {
      const name = curr.page.toLowerCase()
      if (name.indexOf('luettelo') == -1 && name.toLowerCase().indexOf('kuva:') == -1) {
        return acc.concat('"' + name + '", ')
      } else {
        return acc
      }
    }, '')
    console.log(products) //  eslint-disable-line no-console
  })
})
