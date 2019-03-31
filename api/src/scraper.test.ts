import { scrapeRecipe } from './scraper'

describe('scrapeRecipe', () => {
  it('scrapes kotikokki.net source properly', async () => {
    const knownSource = 'https://www.kotikokki.net/reseptit/nayta/574/Maailman%20paras%20pannukakku/'
    const ingrendients = await scrapeRecipe(knownSource)
    expect(ingrendients.length).toBe(8)
  }),

  it('scrapes kotikokki.net source properly', async () => {
    const knownSource = 'https://www.kotikokki.net/kumppanit/kotikokkitestaa/reseptit/nayta/799366/Suolaiset%20joulutortut%20kolmella%20tapaa/'
    const ingrendients = await scrapeRecipe(knownSource)
    console.log(ingrendients)
    expect(ingrendients.length).toBe(16)
  }),

  it('scrapes kotikokki.net source properly', async () => {
    const knownSource = 'https://www.kotikokki.net/reseptit/nayta/563041/Ihanat%20täytetyt%20kesäkurpitsat/'
    const ingrendients = await scrapeRecipe(knownSource)
    expect(ingrendients.length).toBe(8)
  }),

  it('scrapes kotikokki.net source properly', async () => {
    const knownSource = 'https://www.kotikokki.net/reseptit/nayta/92313/Mummon%20Lihapullat/'
    const ingrendients = await scrapeRecipe(knownSource)
    expect(ingrendients.length).toBe(7)
  }),

  xit('throws error for unknown source', async () => {
    const unknownSource = 'https://www.this-is-not-known-source.com/'
    try {
      expect.assertions(1)
      await scrapeRecipe(unknownSource)
    } catch (error) {
      expect(error).toBe('unknown source')
    }
  })
})