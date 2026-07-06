declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}

declare module 'react-burger-menu' {
  import { ComponentType, ReactNode } from 'react'
  interface BurgerMenuProps {
    width?: string
    children?: ReactNode
    [key: string]: unknown
  }
  export const slide: ComponentType<BurgerMenuProps>
}

// eslint-disable-next-line no-var
declare var webkitSpeechRecognition: {
  new(): SpeechRecognition
}

interface Window {
  gtag: (command: string, ...args: unknown[]) => void
}

declare const process: {
  env: {
    NODE_ENV: string
    PUBLIC_URL: string
    REACT_APP_SIMULATE_ANALYTICS_PRODUCTION: string
  }
}
