import { DynamoDB } from 'aws-sdk'
import { Ingredient, Category, ListItem } from './types'
import * as _ from 'lodash'

const RecipesTable = process.env.RECIPES_TABLE
const ListsTable = process.env.LISTS_TABLE
const CategoryTable = process.env.CATEGORY_TABLE
const dynamoDb =
  process.env.NODE_ENV === 'development'
    ? new DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    : new DynamoDB.DocumentClient()

export async function saveRecipe(recipeUrl: String, ingrediends: Ingredient[]): Promise<void> {
  const insert = {
    TableName: RecipesTable,
    Item: {
      RecipeUrl: recipeUrl,
      Ingredients: ingrediends
    }
  }

  try {
    await dynamoDb.put(insert).promise()
  } catch (err) {
    console.error(`saveRecipe() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Saving recipe failed'
  }
}

export async function findRecipe(recipeUrl: String): Promise<Ingredient[]> {
  const query = {
    TableName: RecipesTable,
    Key: {
      RecipeUrl: recipeUrl
    }
  }

  try {
    const result = await dynamoDb.get(query).promise()
    return <Ingredient[]>_.get(result, 'Item.Ingredients', [])
  } catch (err) {
    console.error(`findRecipe() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Finding recipe failed'
  }
}

export async function findList(listId: String): Promise<ListItem[]> {
  const query = {
    TableName: ListsTable,
    Key: {
      ListId: listId
    }
  }

  try {
    const result = await dynamoDb.get(query).promise()
    return (result.Item.ListItems as ListItem[]) || []
  } catch (err) {
    console.error(`findList(${listId}) failed, err=${err}`)
    throw 'Finding List failed'
  }
}

export async function saveList(listId: String, listItems: ListItem[]): Promise<void> {
  const insert = {
    TableName: ListsTable,
    Item: {
      ListId: listId,
      ListItems: listItems
    }
  }

  try {
    await dynamoDb.put(insert).promise()
  } catch (err) {
    console.error(`saveList(${listId}), listItems=${listItems} failed, err=${err}`)
    throw 'Saving list failed'
  }
}

export async function fetchCategoryData(): Promise<Category[]> {
  try {
    //  Tradeoff: Not the most efficient, but it doesn't matter on this scale
    //  Also, category data is easier to edit when they are in separate objects
    const data = await dynamoDb
      .scan({
        TableName: CategoryTable
      })
      .promise()
    return (data.Items as Category[]) || []
  } catch (err) {
    console.error(`fetchCategoryData() : failed, err=${err}`)
    throw 'Fetching all categories failed'
  }
}

export async function saveCategoryData(data: Category): Promise<void> {
  try {
    await dynamoDb
      .put({
        TableName: CategoryTable,
        Item: data
      })
      .promise()
  } catch (err) {
    console.error(`save() : data=${data} failed, err=${err}`)
    throw 'Saving updated Category Data'
  }
}
