import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { refreshWatchItems } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const userId: string = getUserId(event)
  let isRefreshed = false

  try {
    isRefreshed = await refreshWatchItems(userId)
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Refresh failed: ${e.message}` })
  }

  return (isRefreshed)
         ? buildHttpResponse(200, {})
         : buildHttpResponse(400, { error: `Refresh failed: Items for userId ${userId} do not exist`})
}
