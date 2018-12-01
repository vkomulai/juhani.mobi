import React from 'react'
import { 
  Header, 
  ListArea,
  Buttons 
} from 'components'
import {
  EmptyButton,
  AddButton,
  ShoppingList,
  InfoArea
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