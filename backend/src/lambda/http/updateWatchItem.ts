import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { UpdateWatchItemRequest } from '../../requests/UpdateWatchItemRequest'
import { updateWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const watchId = event.pathParameters.watchId
  const updatedWatchItem: UpdateWatchItemRequest = JSON.parse(event.body)

  const userId: string = getUserId(event)

  let isUpdated = false

  try {
    isUpdated = await updateWatchItem(updatedWatchItem, userId, watchId)
  }
  catch (e) {
    return buildHttpResponse(500, {error: `Update failed: ${e.message}`})
  }

  return (isUpdated)
    ? buildHttpResponse(200, {})
    : buildHttpResponse(400, {error: `Update failed: Item with id ${watchId} does not exist`})
}
