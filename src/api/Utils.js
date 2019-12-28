export const getApiHost = () => {
  return location && location.hostname !== 'localhost' ? //  eslint-disable-line
    'https://api.juhani.mobi' :
    ''
}