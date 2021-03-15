import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { UpdateWatchItemRequest } from '../../requests/UpdateWatchItemRequest'
import { updateWatchItem } from '../../businessLogic/watchItems'
import { WatchItem } from '../../models/WatchItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const watchId = event.pathParameters.watchId
  const updatedWatchItem: UpdateWatchItemRequest = JSON.parse(event.body)

  let updatedItem: WatchItem = undefined

  try {
    updatedItem = await updateWatchItem(updatedWatchItem, getUserId(event), watchId)
  }
  catch (e) {
    return buildHttpResponse(500, {error: `Update failed: ${e.message}`})
  }

  const { userId, ...item } = updatedItem

  return buildHttpResponse(200, { item })
}
