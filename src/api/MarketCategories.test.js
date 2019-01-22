import {
  getItemOrder
} from './MarketCategories'

describe('getItemOrder', () =>
  it('returns order for known items', () => {
    expect(getItemOrder('banaani')).toBe(1)
    expect(getItemOrder('pesuaine')).toBe(9)
    expect(getItemOrder('hammastahna')).toBe(9)
  }),

  it('returns order -1 for known items', () => {
    expect(getItemOrder('not_known_item')).toBe(-1)
  })
)