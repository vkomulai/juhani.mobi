import { ShoppingItem } from 'types'

const numbers: Record<string, number | string> = {
  'yksi': 1,
  'kaksi': 2,
  'kolme': 3,
  'neljä': 4,
  'viisi': 5,
  'kuusi': 6,
  'seitseman': 7,
  'kahdeksan': 8,
  'yhdeksan': 9,
  'kymmenen': 10,
  'puoli': '1/2'
}

const units: Record<string, string> = {
  'gramma': 'g',
  'grammaa': 'g',
  'g': 'g',
  'kilo': 'kg',
  'kiloa': 'kg',
  'kg': 'kg',
  'litra': 'l',
  'litraa': 'l',
  'l': 'l',
  'metri': 'm',
  'metriä': 'm',
  'm': 'm'
}
const descriptive: string[] = [
  'maustamaton',
  'rasvaton',
  'kevyt',
  'kulutus',
  'sininen',
  'punainen',
  'vaalea',
  'tumma',
  '1/2'
]

const knownUnrecognizedWords: Record<string, string> = {
  'skype': 'skyr'
}

export const supportSpeechRecognition = (): boolean => 'webkitSpeechRecognition' in window

export const isOnline = (): boolean => navigator.onLine

export const startListening = (language: string, onRecognized: (items: ShoppingItem[]) => void): void => {
  try {
    const recognition = new webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.lang = language
    let final_transcript = ''
    let recognizedItems: ShoppingItem[] = []
    recognition.start()

    recognition.onresult = (event: Event & { resultIndex: number, results: SpeechRecognitionResultList }) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript = event.results[i][0].transcript
        }
      }
      let lastDebounceTranscript = ''
      if (lastDebounceTranscript !== final_transcript) {
        lastDebounceTranscript = final_transcript
        const tokenized = tokenizeWords(lastDebounceTranscript)
        recognizedItems = recognizedItems.concat(tokenized)
      }
    }
    recognition.onspeechend = () => onRecognized(recognizedItems)
  } catch (e) {
    console.log('startListening(): ', e)
    onRecognized([])
  }
}

export const tokenizeWords = (words: string): ShoppingItem[] => {
  const tokenizedRawWords = words.split(' ')
  return tokenizedRawWords.reduce((tokenized: ShoppingItem[], word: string) => {
    if (!alreadyRecognized(word, tokenized)) {
      const prevWord = tokenized.length > 0 ? tokenized[tokenized.length - 1].name.split(' ').slice(-1)[0] : null
      const newItem: ShoppingItem = { name: correctRecognitionErrors(word), collected: false }
      if (isQuantityWord(prevWord) || isAdjectiveWord(prevWord)) {
        newItem.name = prependQuantityFromPrevious(newItem, tokenized)
      }
      return tokenized.concat([newItem])
    }
    return tokenized
  }, [])
}

export const prependQuantityFromPrevious = (newItem: ShoppingItem, recognizedItems: ShoppingItem[]): string => {
  const prev = recognizedItems.pop()!
  return `${mapToUnits(prev.name)} ${newItem.name}`
}

export const alreadyRecognized = (word: string, recognizedItems: ShoppingItem[]): ShoppingItem | undefined =>
  recognizedItems.find(item => item.name === word)

export const mapToUnits = (word: string): number | string =>
  numbers[word] ||
  units[word] ||
  word

export const isQuantityWord = (word: string | null): boolean =>
  word !== null && (
    Number.isInteger(Number.parseInt(word, 10)) ||
    Object.prototype.hasOwnProperty.call(units, word) ||
    Object.prototype.hasOwnProperty.call(numbers, word) ||
    descriptive.includes(word)
  )

export const isAdjectiveWord = (word: string | null): boolean =>
  word !== null && word.endsWith('inen')

export const correctRecognitionErrors = (word: string): string =>
  knownUnrecognizedWords[word] || word
