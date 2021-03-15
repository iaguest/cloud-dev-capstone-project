import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateWatchItemRequest } from '../../requests/CreateWatchItemRequest'
import { createWatchItem } from '../../businessLogic/watchItems'
import { getUserId, buildHttpResponse } from '../utils'
import { WatchItem } from '../../models/WatchItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const newWatchItem: CreateWatchItemRequest = JSON.parse(event.body)
  let newItem: WatchItem = undefined

  try {
    newItem = await createWatchItem(newWatchItem, getUserId(event))
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Create failed: ${e.message}` })  
  }

  const { userId, ...item } = newItem

  return buildHttpResponse(201, { item })
}
