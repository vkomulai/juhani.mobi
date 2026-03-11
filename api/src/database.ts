import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { Ingredient, Category, ListItem } from './types'

const RecipesTable = process.env.RECIPES_TABLE
const ListsTable = process.env.LISTS_TABLE
const CategoryTable = process.env.CATEGORY_TABLE

const client =
  process.env.NODE_ENV === 'development'
    ? new DynamoDBClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    : new DynamoDBClient()

const dynamoDb = DynamoDBDocumentClient.from(client)

export async function saveRecipe(recipeUrl: string, ingrediends: Ingredient[]): Promise<void> {
  try {
    await dynamoDb.send(new PutCommand({
      TableName: RecipesTable,
      Item: {
        RecipeUrl: recipeUrl,
        Ingredients: ingrediends
      }
    }))
  } catch (err) {
    console.error(`saveRecipe() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Saving recipe failed'
  }
}

export async function findRecipe(recipeUrl: string): Promise<Ingredient[]> {
  try {
    const result = await dynamoDb.send(new GetCommand({
      TableName: RecipesTable,
      Key: {
        RecipeUrl: recipeUrl
      }
    }))
    return (result.Item?.Ingredients as Ingredient[]) ?? []
  } catch (err) {
    console.error(`findRecipe() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Finding recipe failed'
  }
}

export async function findList(listId: string): Promise<ListItem[]> {
  try {
    const result = await dynamoDb.send(new GetCommand({
      TableName: ListsTable,
      Key: {
        ListId: listId
      }
    }))
    return (result.Item?.ListItems as ListItem[]) ?? []
  } catch (err) {
    console.error(`findList(${listId}) failed, err=${err}`)
    throw 'Finding List failed'
  }
}

export async function saveList(listId: string, listItems: ListItem[]): Promise<void> {
  try {
    await dynamoDb.send(new PutCommand({
      TableName: ListsTable,
      Item: {
        ListId: listId,
        ListItems: listItems
      }
    }))
  } catch (err) {
    console.error(`saveList(${listId}), listItems=${listItems} failed, err=${err}`)
    throw 'Saving list failed'
  }
}

export async function fetchCategoryData(): Promise<Category[]> {
  try {
    //  Tradeoff: Not the most efficient, but it doesn't matter on this scale
    //  Also, category data is easier to edit when they are in separate objects
    const data = await dynamoDb.send(new ScanCommand({
      TableName: CategoryTable
    }))
    return (data.Items as Category[]) ?? []
  } catch (err) {
    console.error(`fetchCategoryData() : failed, err=${err}`)
    throw 'Fetching all categories failed'
  }
}

export async function saveCategoryData(data: Category): Promise<void> {
  try {
    await dynamoDb.send(new PutCommand({
      TableName: CategoryTable,
      Item: data
    }))
  } catch (err) {
    console.error(`save() : data=${data} failed, err=${err}`)
    throw 'Saving updated Category Data'
  }
}
