# 02 — Speech Recognition

## Overview

The app uses the browser's `webkitSpeechRecognition` API to recognize Finnish (or English) speech and convert spoken words into shopping list items. A custom tokenization pipeline handles Finnish number words, units, adjectives, and known recognition errors.

## User-Facing Behavior

### Starting Speech Recognition

- User presses the **Lisää** (Add) button.
- The app dispatches `ADD_ITEM_PRESSED` (sets `listening: true`), then calls `startListening(language, callback)`.
- The info panel turns green with text "Kuuntelen" (I'm listening).
- Speech recognition runs continuously (`continuous: true`) with `interimResults: false` and `maxAlternatives: 1`.

### Language Selection

- Speech language follows the UI language:
  - Finnish UI → `fi-FI`
  - English UI → `en-GB`
- Determined by `getLocaleLang()` in `src/i18n.js`.

### Recognition Flow

1. `recognition.start()` begins capturing audio.
2. `onresult` fires for each final result, extracting `event.results[i][0].transcript`.
3. Each transcript is tokenized via `tokenizeWords()` and appended to `recognizedItems`.
4. `onspeechend` fires when speech stops → callback is invoked with all `recognizedItems`.
5. On error/exception, the callback receives an empty array `[]`.

### Tokenization Algorithm (`tokenizeWords`)

Input: a space-separated transcript string (e.g., `"puoli kiloa mansikoita"`).

For each word:
1. **Deduplication**: Skip if `word` already exists in `tokenized` results (by `name`).
2. **Error correction**: Replace known misrecognitions (e.g., `skype` → `skyr`).
3. **Quantity/adjective prepending**: If the *previous* word was a quantity word or adjective:
   - Pop the previous item from the result array.
   - Map the previous word to its unit equivalent (numbers map, units map, or identity).
   - Prepend it to the current word: `"${mapped_prev} ${current_word}"`.
4. Create item: `{ name: correctedWord, collected: false }`.

### Number Map

| Finnish word | Value |
|-------------|-------|
| yksi | 1 |
| kaksi | 2 |
| kolme | 3 |
| neljä | 4 |
| viisi | 5 |
| kuusi | 6 |
| seitseman | 7 |
| kahdeksan | 8 |
| yhdeksan | 9 |
| kymmenen | 10 |
| puoli | 1/2 |

### Unit Map

| Input | Mapped |
|-------|--------|
| gramma, grammaa, g | g |
| kilo, kiloa, kg | kg |
| litra, litraa, l | l |
| metri, metriä, m | m |

### Descriptive Words

Treated as quantity words (trigger prepending): `maustamaton`, `rasvaton`, `kevyt`, `kulutus`, `sininen`, `punainen`, `vaalea`, `tumma`, `1/2`.

### Adjective Detection

A word is considered an adjective if it ends with `"inen"` (e.g., `sveitsiläinen`, `rasvaton` is NOT caught by this — it's in the descriptive list instead).

### Known Error Corrections

| Misrecognized | Corrected |
|--------------|-----------|
| skype | skyr |

### Quantity Word Detection (`isQuantityWord`)

A word is a quantity word if ANY of:
- It parses as an integer (`Number.parseInt(word, 10)` is an integer).
- It is a key in the `units` map.
- It is a key in the `numbers` map.
- It is in the `descriptive` array.

## Key Source Files

| File | Role |
|------|------|
| `src/api/SpeechRecognitionAPI.js` | All speech recognition logic, tokenization, number/unit maps |
| `src/containers/AddButton.js` | Triggers `startListening()` with language and callback |
| `src/i18n.js` | `getLocaleLang()` maps UI language to speech language code |

## Acceptance Criteria

1. Pressing Add starts `webkitSpeechRecognition` with the correct language.
2. Single words become individual items: `"banaani maito"` → `["banaani", "maito"]`.
3. Number + noun compounds: `"yksi mansikka"` → `["1 mansikka"]`.
4. Unit + noun compounds: `"puoli kiloa mansikoita"` → `["1/2 kiloa mansikoita"]`.
5. Adjective + noun compounds: `"sveitsiläinen juusto"` → `["sveitsiläinen juusto"]`.
6. Error correction: `"skype"` → `["skyr"]`.
7. Duplicate words within utterance are skipped.
8. Speech errors produce an empty item list (no crash).

## Edge Cases

- Empty transcript: `tokenizeWords("")` produces `[{ name: "", collected: false }]` (single item with empty name — the empty string passes through).
- Transcript starting with a number: `"3 banaania"` → number detected as quantity, prepended to next word → `["3 banaania"]`.
- Consecutive quantity words: `"puoli kilo"` → `puoli` becomes item, then `kilo` is a quantity word, pops `puoli` and prepends → `["1/2 kilo"]`.
- Browser doesn't support `webkitSpeechRecognition`: `supportSpeechRecognition()` returns `false`; UI shows "Selaimesi EI tue puheentunnistusta".
