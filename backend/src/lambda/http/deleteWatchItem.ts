import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { deleteWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const watchId = event.pathParameters.watchId
  const userId: string = getUserId(event)

  let isDeleted = false

  try {
    isDeleted = await deleteWatchItem(userId, watchId)
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Delete failed: ${e.message}` })
  }

  return (isDeleted)
    ? buildHttpResponse(200, {})
    : buildHttpResponse(400, { error: `Delete failed: Item with id ${watchId} does not exist`})
}
