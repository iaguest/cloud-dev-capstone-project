import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { refreshWatchItems } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const userId: string = getUserId(event)

  try {
    await refreshWatchItems(userId)
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Refresh failed: ${e.message}` })
  }

  return buildHttpResponse(200, {})
}
