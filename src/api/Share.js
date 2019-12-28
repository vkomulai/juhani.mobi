export const shareList = (listId, shoppingItems) => {
  if (!navigator.share) {
    alert('Jako mahdollista vain selaimella: Chrome 61 Android!!')
    return
  }
  if (!shoppingItems || shoppingItems.length === 0) {
    alert('Lisää ostoksia ennen listan jakamista!')
    return
  }
  const now = new Date()
  const title = `Ostoslista ${now.getDate()}.${now.getMonth() + 1}. kello ${now.getHours()}.${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`
  const formattedShoppingList = shoppingItems.reduce((previous, item) => previous + '- ' + item.name + '\n', '')

  navigator.share({
    title: title,
    text: formattedShoppingList + '\n',
    url: `https://www.juhani.mobi/l/${listId}`
  })
    .then(() => console.log('Successful share'))  //  eslint-disable-line no-console
    .catch((error) => console.log('Error sharing', error))   //  eslint-disable-line no-console
}
