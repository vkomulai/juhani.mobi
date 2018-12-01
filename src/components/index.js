import React from 'react'
import './index.css'

export { Header } from './Header/Header.jsx'
export { Button } from './Button/Button.jsx'
export { InfoView } from './InfoView/InfoView.jsx'
export { SortableList } from './SortableList/SortableList.jsx'

export const ListArea = ({ children }) => <div className='mui-container-fluid list-area'>{children}</div> //  eslint-disable-line
export const Buttons = ({ children }) => <div className='mui-container-fluid buttons'>{children}</div> //  eslint-disable-line
