export interface Ingredient {
  amount: string
  name: string
}

export interface Category {
  name: string
  order: number
  items: string[]
}

export interface ListItem extends Category {}
