import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import { refreshWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const watchId = event.pathParameters.watchId

  const userId: string = getUserId(event)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    await refreshWatchItem(userId, watchId)
  }
  catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: `Refresh failed: ${e.message}`
      })
    }
  }

  return {
    statusCode: 200,
    headers: headers,
    body: ''
  }
}
