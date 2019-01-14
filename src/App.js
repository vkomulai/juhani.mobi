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
  Header
} from 'containers'

export const App = () => (
  <>
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