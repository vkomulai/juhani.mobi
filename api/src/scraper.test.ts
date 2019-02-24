import { scrapeRecipe } from './scraper'

describe('scrapeRecipe', () => {
  it('scrapes known source properly', async () => {
    const knownSource = 'https://www.kotikokki.net/reseptit/nayta/574/Maailman%20paras%20pannukakku/'
    const ingrendients = await scrapeRecipe(knownSource)
    expect(ingrendients.length).toBe(8)
  }),

  it('throws error for unknown source', async () => {
    const unknownSource = 'https://www.this-is-not-known-source.com/'
    try {
      expect.assertions(1)
      await scrapeRecipe(unknownSource)
    } catch (error) {
      expect(error).toBe('unknown source')
    }
  })
})