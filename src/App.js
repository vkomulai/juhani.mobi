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
import i18n from 'i18n' //  eslint-disable-line
import { withNamespaces } from 'react-i18next'

export const App = withNamespaces()(() => (
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
))