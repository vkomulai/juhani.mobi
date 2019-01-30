const scrapeIt = require("scrape-it")
 

interface Ingredient {
  amount?: string;
  name?: string;
}

//  SOPPA365: https://www.soppa365.fi/reseptit/liha-juhli-ja-nauti-kastikkeet-tahnat-ja-marinadit/lihapullapasta-uunissa

//  VALIO: https://www.valio.fi/reseptit/poropizza/

//  Kotikokkiparser!!
scrapeIt("https://www.kotikokki.net/reseptit/nayta/597832/Punajuuri-soijapihvit/", {
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
}).then(({ data, response }) => {
    console.log(`Status Code: ${response.statusCode}`)
    console.log(data.ingredients)
})