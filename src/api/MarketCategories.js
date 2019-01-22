import data from 'api/CategoryData.json'

let categories = {}
const init = () => {
  data.forEach(category => {
    const { order, items } = category
    items.forEach(item => {
      categories[item] = {
        category: category.name, 
        order
      }
    })
  })
}
init()

export const getItemOrder = (item) => {
  if (!categories) {
    init()
  }
  return categories[item] ? categories[item].order : -1
}
