import { v1 as uuidv1 } from 'uuid'
import { useStore } from 'store'
import { shareList } from 'api/Share'

import './Header.css'
import shareIcon from './shareIcon.png'

export const Header = () => {
  const shoppingItems = useStore((s) => s.shoppingItems)
  const storeList = useStore((s) => s.storeList)

  const onClick = () => {
    const listId = uuidv1()
    storeList(listId)
    shareList(listId, shoppingItems)
  }

  return (
    <div className="header mui-appbar">
      <h3 className="title mui--text-center">Juhani.mobi</h3>
      <img src={shareIcon} alt="sharing is caring" onClick={onClick} />
    </div>
  )
}
