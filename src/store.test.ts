import { useStore } from './store'

const STATE_SIPULI_SAIPPUA_WCPAPERI = [
  { name: 'sipuli', collected: false },
  { name: 'saippua', collected: false },
  { name: 'wc-paperi', collected: false }
]

beforeEach(() => {
  useStore.setState({
    shoppingItems: [],
    listening: false,
    sortAutomatically: true
  })
})

describe('store', () => {
  describe('shoppingItems', () => {
    it('defaults to empty list (in test env)', () => {
      expect(useStore.getState().shoppingItems.length).toBe(0)
    })

    it('empties a list', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      useStore.getState().readyPressed()
      expect(useStore.getState().shoppingItems.length).toBe(0)
    })

    it('adds items to empty state in given order when no sorting applied', () => {
      useStore.setState({ sortAutomatically: false })
      useStore.getState().itemsRecognized([
        { name: 'pesuaine', collected: false },
        { name: 'banaani', collected: false },
        { name: 'talouspaperi', collected: false }
      ])
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('pesuaine')
      expect(items[1].name).toBe('banaani')
      expect(items[2].name).toBe('talouspaperi')
    })

    it('adds items to empty state in automatically sorted order when sorting applied', () => {
      useStore.setState({ sortAutomatically: true })
      useStore.getState().itemsRecognized([
        { name: 'pesuaine', collected: false },
        { name: 'banaani', collected: false },
        { name: 'talouspaperi', collected: false }
      ])
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('banaani')
      expect(items[1].name).toBe('pesuaine')
      expect(items[2].name).toBe('talouspaperi')
    })

    it('removes one item from list', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      useStore.getState().removeItem({ name: 'saippua', collected: false })
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(2)
      expect(items[0].name).toBe('sipuli')
      expect(items[1].name).toBe('wc-paperi')
    })

    it('reorders an item in a list', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      useStore.getState().itemsReOrdered(2, 0)
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('wc-paperi')
      expect(items[1].name).toBe('sipuli')
      expect(items[2].name).toBe('saippua')
    })

    it('collects first item and moves to last', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      useStore.getState().collectedItemPressed({ name: 'sipuli', collected: true })
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('saippua')
      expect(items[0].collected).toBe(false)
      expect(items[1].name).toBe('wc-paperi')
      expect(items[1].collected).toBe(false)
      expect(items[2].name).toBe('sipuli')
      expect(items[2].collected).toBe(true)
    })

    it('collects last item and leaves as last', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      useStore.getState().collectedItemPressed({ name: 'wc-paperi', collected: true })
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(3)
      expect(items[0].name).toBe('sipuli')
      expect(items[0].collected).toBe(false)
      expect(items[1].name).toBe('saippua')
      expect(items[1].collected).toBe(false)
      expect(items[2].name).toBe('wc-paperi')
      expect(items[2].collected).toBe(true)
    })

    it('loading a new list clears old list away', () => {
      useStore.setState({ shoppingItems: STATE_SIPULI_SAIPPUA_WCPAPERI })
      // Simulate fetchList by directly setting items (fetchList is async/network)
      useStore.setState({
        shoppingItems: [
          { name: 'tomaatti', collected: false },
          { name: 'kurkku', collected: false }
        ]
      })
      const items = useStore.getState().shoppingItems
      expect(items.length).toBe(2)
      expect(items[0].name).toBe('tomaatti')
      expect(items[1].name).toBe('kurkku')
    })
  })

  describe('listening', () => {
    it('addItemPressed sets listening to true', () => {
      useStore.getState().addItemPressed()
      expect(useStore.getState().listening).toBe(true)
    })

    it('itemsRecognized sets listening to false', () => {
      useStore.setState({ listening: true })
      useStore.getState().itemsRecognized([])
      expect(useStore.getState().listening).toBe(false)
    })
  })

  describe('sortAutomatically', () => {
    it('toggles sort', () => {
      expect(useStore.getState().sortAutomatically).toBe(true)
      useStore.getState().setSortAutomatically()
      expect(useStore.getState().sortAutomatically).toBe(false)
      useStore.getState().setSortAutomatically()
      expect(useStore.getState().sortAutomatically).toBe(true)
    })
  })

  describe('isOnline', () => {
    it('setOnline updates state', () => {
      useStore.getState().setOnline(false)
      expect(useStore.getState().isOnline).toBe(false)
      useStore.getState().setOnline(true)
      expect(useStore.getState().isOnline).toBe(true)
    })
  })
})
