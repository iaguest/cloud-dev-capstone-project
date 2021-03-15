import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { refreshWatchItem } from '../../businessLogic/watchItems'
import { WatchItem } from '../../models/WatchItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const watchId = event.pathParameters.watchId

  let refreshedItem: WatchItem = undefined

  try {
    refreshedItem = await refreshWatchItem(getUserId(event), watchId)
  }
  catch (e) {
    return buildHttpResponse(500, { error: `Refresh failed: ${e.message}` })
  }

  const { userId, ...item } = refreshedItem

  return buildHttpResponse(200, { item })
}
