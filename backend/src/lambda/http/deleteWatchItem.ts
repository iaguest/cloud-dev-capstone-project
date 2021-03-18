import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { deleteWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('In deleteWatchItem handler, processing event: ', event)

  const watchId = event.pathParameters.watchId
  const userId: string = getUserId(event)

  try {
    await deleteWatchItem(userId, watchId)
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Delete failed: ${e.message}` })
  }

  return buildHttpResponse(200, {})
}
