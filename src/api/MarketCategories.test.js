import {
  getItemOrder,
  ORDER_LAST
} from './MarketCategories'

describe('getItemOrder', () =>
  it('returns order for known items with exact match', () => {
    expect(getItemOrder('banaani')).toBe(1)
    expect(getItemOrder('salaatti')).toBe(1)
    expect(getItemOrder('pesuaine')).toBe(9)
    expect(getItemOrder('hammastahna')).toBe(9)
    expect(getItemOrder('mansikka')).toBe(8)
    expect(getItemOrder('puolukka')).toBe(8)
  }),

  it('returns order for known items with fuzzy match', () => {
    expect(getItemOrder('leipä')).toBe(2)
    expect(getItemOrder('mansikat')).toBe(8)
    expect(getItemOrder('puolukat')).toBe(8)
    expect(getItemOrder('leikkeleet')).toBe(3)
  }),

  it('returns order rder number for last for unknown items', () => {
    expect(getItemOrder('not_known_item')).toBe(ORDER_LAST)

  })
)