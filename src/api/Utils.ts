export const getApiHost = (): string => {
  return location && location.hostname !== 'localhost'
    ? 'https://api.juhani.mobi'
    : ''
}
