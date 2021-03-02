import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId } from '../utils'
import { deleteWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // TODO: Remove a watch item by id

  const watchId = event.pathParameters.watchId
  const userId: string = getUserId(event)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    await deleteWatchItem(userId, watchId)
  }
  catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: `Delete failed: ${e.message}`
      })
    }
  }

  return {
    statusCode: 200,
    headers: headers,
    body: ''
  }
}
