import { DynamoDB } from 'aws-sdk'
import { Ingredient }from './types'
import * as _ from 'lodash'

const TableName = process.env.RECIPES_TABLE
const dynamoDb = process.env.NODE_ENV === 'development' ? 
  new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  }) : 
  new DynamoDB.DocumentClient()

export async function save(recipeUrl: String, ingrediends: Ingredient[]): Promise<void> {
  const insert = {
    TableName,
    Item: {
      RecipeUrl: recipeUrl,
      Ingredients: ingrediends
    }
  }
  
  try {
    await dynamoDb.put(insert).promise()
  } catch (err) {
    console.error(`save() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Saving recipe failed'
  }
}

export async function find(recipeUrl: String): Promise<Ingredient[]> {
  const query = {
    TableName,
    Key: {
      RecipeUrl: recipeUrl
    }
  }

  try {
    const result = await dynamoDb.get(query).promise()
    return <Ingredient[]>_.get(result, 'Item.Ingredients', [])
  } catch (err) {
    console.error(`find() : recipeUrl=${recipeUrl} failed, err=${err}`)
    throw 'Finding recipe failed'
  }
}