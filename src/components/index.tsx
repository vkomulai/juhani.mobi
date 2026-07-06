import { ReactNode } from 'react'
import './index.css'

export { AddButton, EmptyButton } from './Button/Button'
export { InfoView } from './InfoView/InfoView'
export { SortableList } from './SortableList/SortableList'
export { Menu } from './HamburgerMenu/Menu'
export { Header } from './Header/Header'

interface ChildrenProps {
  children: ReactNode
}

export const ListArea = ({ children }: ChildrenProps) => <div className='mui-container-fluid list-area'>{children}</div>
export const Buttons = ({ children }: ChildrenProps) => <div className='mui-container-fluid buttons'>{children}</div>
