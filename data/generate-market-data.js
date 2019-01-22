const wtf = require('wtf_wikipedia')

const fruitsWikipediaPageId = 44202
const vegetablesWikipediaPageId = 1000967
const milkProducts = 26575  //  https://fi.wikipedia.org/wiki/Luokka:Maitotuotteet

wtf.fetch(vegetablesWikipediaPageId, 'fi').then(doc => {
  console.log(JSON.stringify(doc.lists(), null, 2))
  console.log(doc.json())
})
