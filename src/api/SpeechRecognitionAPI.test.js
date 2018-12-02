import {
  mapToUnits,
  isQuantityWord,
  isAdjectiveWord,
  tokenizeWords
} from './SpeechRecognitionAPI'

describe('mapToUnits', () =>
  it('maps weight units', () => {
    expect(mapToUnits('kilo')).toBe('kg')
    expect(mapToUnits('kiloa')).toBe('kg')
    expect(mapToUnits('kg')).toBe('kg')
    expect(mapToUnits('g')).toBe('g')
    expect(mapToUnits('gramma')).toBe('g')
    expect(mapToUnits('grammaa')).toBe('g')
  }),

  it('maps numbers', () => {
    expect(mapToUnits('yksi')).toBe(1)
    expect(mapToUnits('kaksi')).toBe(2)
    expect(mapToUnits('puoli')).toBe('1/2')
  })
)

describe('isQuantityWord', () =>
  it('recognizes words', () => {
    expect(isQuantityWord('kilo'))
    expect(isQuantityWord('yksi'))
    expect(isQuantityWord('rasvaton'))
    expect(isQuantityWord('gramma'))
  })
)

describe('isAdjectviceWord', () =>
  it('recognizes adjectives', () => {
    expect(isAdjectiveWord('sveitsiläinen'))
    expect(isQuantityWord('kermainen'))
    expect(isQuantityWord('juustoinen'))
  })
)

describe('tokenizeWords', () => {
  it('can tokenize one plain word', () => {
    const input = 'strawberry'
    const oneWord = [{ name: 'strawberry', collected: false }]
    expect(tokenizeWords(input)).toMatchObject(oneWord)
  }),

  it('can tokenize two plain words', () => {
    const input = 'strawberry blueberry'
    const output = [
      { name: 'strawberry', collected: false },
      { name: 'blueberry', collected: false }
    ]
    expect(tokenizeWords(input)).toMatchObject(output)
  }),

  it('can tokenize three plain words', () => {
    const input = 'strawberry blueberry raspberry'
    const output = [
      { name: 'strawberry', collected: false },
      { name: 'blueberry', collected: false },
      { name: 'raspberry', collected: false }
    ]
    expect(tokenizeWords(input)).toMatchObject(output)
  }),

  it('can tokenize a word with adjective', () => {
    const input = 'sveitsiläinen juustokeitto'
    const output = [
      { name: 'sveitsiläinen juustokeitto', collected: false }
    ]
    expect(tokenizeWords(input)).toMatchObject(output)
  }),

  it('can tokenize descriptive words into one entity', () => {
    const input = 'yksi mansikka'
    const output = [{ name: '1 mansikka', collected: false }]
    expect(tokenizeWords(input)).toMatchObject(output)
  }),

  it('can tokenize word with two descriptive words into one entity', () => {
    const input = 'puoli kiloa mansikoita'
    const output = [{ name: '1/2 kiloa mansikoita', collected: false }]
    expect(tokenizeWords(input)).toMatchObject(output)
  })

  it('can tokenize two descriptive inputs into two entities ', () => {
    const input = 'puoli kiloa mansikoita 5 omenaa'
    const output = [
      { name: '1/2 kiloa mansikoita', collected: false },
      { name: '5 omenaa', collected: false }
    ]
    expect(tokenizeWords(input)).toMatchObject(output)
  })
})

