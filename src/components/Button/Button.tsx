import { useTranslation } from 'react-i18next'
import { useStore } from 'store'
import { getLocaleLang } from 'i18n'
import { startListening } from 'api/SpeechRecognitionAPI'
import {
  sendAddButtonPressedEvent,
  sendEmptyButtonPressedEvent,
  sendItemsRecognizedEvent
} from 'api/Analytics'
import './Button.css'

interface ButtonProps {
  enabled: boolean
  labelKey: string
  onClick: () => void
}

const Button = ({ enabled, labelKey, onClick }: ButtonProps) => {
  const { t } = useTranslation()
  return (
    <button className="mui-btn mui-btn--raised app-button" disabled={!enabled} onClick={onClick}>
      {t(labelKey)}
    </button>
  )
}

export const AddButton = () => {
  const addItemPressed = useStore((s) => s.addItemPressed)
  const itemsRecognized = useStore((s) => s.itemsRecognized)

  const onClick = () => {
    sendAddButtonPressedEvent()
    addItemPressed()
    startListening(getLocaleLang(), (recognizedItems) => {
      if (recognizedItems && recognizedItems.length > 0) {
        sendItemsRecognizedEvent(recognizedItems)
      }
      itemsRecognized(recognizedItems)
    })
  }

  return <Button enabled={true} labelKey="buttons.add" onClick={onClick} />
}

export const EmptyButton = () => {
  const shoppingItems = useStore((s) => s.shoppingItems)
  const isOnline = useStore((s) => s.isOnline)
  const readyPressed = useStore((s) => s.readyPressed)

  const onClick = () => {
    sendEmptyButtonPressedEvent()
    readyPressed()
  }

  return (
    <Button
      enabled={shoppingItems.length > 0 && isOnline}
      labelKey="buttons.clear"
      onClick={onClick}
    />
  )
}
