import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import { UpdateWatchItemRequest } from '../../requests/UpdateWatchItemRequest'
import { updateWatchItem } from '../../businessLogic/watchItems'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // TODO: Update a watch item with the provided id using values in the "updatedWatchItem" object

  const watchId = event.pathParameters.watchId
  const updatedWatchItem: UpdateWatchItemRequest = JSON.parse(event.body)

  const userId: string = getUserId(event)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  try {
    await updateWatchItem(updatedWatchItem, userId, watchId)
  }
  catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: `Update failed: ${e.message}`
      })
    }
  }

  return {
    statusCode: 200,
    headers: headers,
    body: ''
  }
}
