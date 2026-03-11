import React from 'react'
import './index.css'

export { AddButton, EmptyButton } from './Button/Button'
export { InfoView } from './InfoView/InfoView'
export { SortableList } from './SortableList/SortableList'
export { Menu } from './HamburgerMenu/Menu'
export { Header } from './Header/Header'


export const ListArea = ({ children }) => <div className='mui-container-fluid list-area'>{children}</div> //  eslint-disable-line
export const Buttons = ({ children }) => <div className='mui-container-fluid buttons'>{children}</div> //  eslint-disable-line
