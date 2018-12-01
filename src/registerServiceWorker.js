export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope)// eslint-disable-line
      }, (err) => {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err)// eslint-disable-line
      })
    })
  }
}
