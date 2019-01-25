import React from 'react'
import { 
  ListArea,
  Buttons 
} from 'components'
import {
  EmptyButton,
  AddButton,
  ShoppingList,
  InfoArea,
  Header,
  ApplicationMenu
} from 'containers'


export const App = () => (
  <>
    <ApplicationMenu />
    <Header />
    <InfoArea />
    <ListArea>
      <Buttons>
        <EmptyButton />
        <AddButton />
      </Buttons>
      <ShoppingList />
    </ListArea>
  </>
)