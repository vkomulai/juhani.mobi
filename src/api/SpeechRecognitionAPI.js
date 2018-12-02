const numbers = {
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

const units = {
  'gramma' : 'g',
  'grammaa' : 'g',
  'g' : 'g',
  'kilo': 'kg',
  'kiloa' : 'kg',  
  'kg': 'kg',
  'litra': 'l',
  'litraa' : 'l',
  'l': 'l',
  'metri': 'm',
  'metriä': 'm',
  'm': 'm'
}
const descriptive = [
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

const knownUnrecognizedWords = {
  'skype' : 'skyr'
}

export const supportSpeechRecognition = () =>  'webkitSpeechRecognition' in window

export const isOnline = () =>  navigator.onLine

export const startListening = (onRecognized) => {
  const recognition = new webkitSpeechRecognition() // eslint-disable-line
  recognition.continuous = true
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.lang = 'fi-FI'
  let final_transcript = ''
  let recognizedItems = []
  recognition.start()

  recognition.onresult = event => {
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
}

export const tokenizeWords = words =>  {
  const tokenizedRawWords = words.split(' ')
  return tokenizedRawWords.reduce((tokenized, word) => {
    if (!alreadyRecognized(word, tokenized)) {
      const prevWord = tokenized.length > 0 ? tokenized[tokenized.length - 1].name.split(' ').slice(-1)[0] : null
      const newItem = { name: correctRecognitionErrors(word), collected: false }
      if (isQuantityWord(prevWord) || isAdjectiveWord(prevWord)) {
        newItem.name = prependQuantityFromPrevious(newItem, tokenized)
      }
      return tokenized.concat([newItem])                              
    }
    return tokenized
  }, [])
}

export const prependQuantityFromPrevious = (newItem, recognizedItems) => {
  const prev = recognizedItems.pop()
  return `${mapToUnits(prev.name)} ${newItem.name}`
}

export const alreadyRecognized = (word, recognizedItems) => 
  recognizedItems.find(item => item.name === word) 

export const mapToUnits = word => 
  numbers[word] ||
  units[word] || 
  word

export const isQuantityWord = word => 
  Number.isInteger(Number.parseInt(word, 10)) || 
  units.hasOwnProperty(word) || 
  numbers.hasOwnProperty(word) ||
  descriptive.includes(word)

export const isAdjectiveWord = word => 
  word && word.endsWith('inen')

export const correctRecognitionErrors = word => 
  word && (knownUnrecognizedWords[word] || word)