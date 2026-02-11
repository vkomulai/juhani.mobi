import React from 'react'
import {
  ListArea,
  Buttons,
  EmptyButton,
  AddButton,
  SortableList,
  InfoView,
  Header,
  Menu
} from 'components'
import 'i18n'

export const App = () => (
  <>
    <Menu />
    <Header />
    <InfoView />
    <ListArea>
      <Buttons>
        <EmptyButton />
        <AddButton />
      </Buttons>
      <SortableList />
    </ListArea>
  </>
)
