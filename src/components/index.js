import React from 'react'
import './index.css'

export { Button } from './Button/Button.jsx'
export { InfoView } from './InfoView/InfoView.jsx'
export { SortableList } from './SortableList/SortableList.jsx'
export { Menu } from './HamburgerMenu/Menu.jsx'


export const ListArea = ({ children }) => <div className='mui-container-fluid list-area'>{children}</div> //  eslint-disable-line
export const Buttons = ({ children }) => <div className='mui-container-fluid buttons'>{children}</div> //  eslint-disable-line
