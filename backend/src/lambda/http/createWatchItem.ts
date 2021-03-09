import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateWatchItemRequest } from '../../requests/CreateWatchItemRequest'
import { createWatchItem } from '../../businessLogic/watchItems'
import { getUserId } from '../utils'
import { WatchItem } from '../../models/WatchItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  const newWatchItem: CreateWatchItemRequest = JSON.parse(event.body)
  let newItem: WatchItem = undefined

  try {
    newItem = await createWatchItem(newWatchItem, getUserId(event))
  }
  catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: `Create failed: ${e.message}`
      })
    }   
  }


  const { userId, ...item } = newItem

  return {
    statusCode: 201,
    headers: headers,
    body: JSON.stringify({
      item
    })
  }
}
