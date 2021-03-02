import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateWatchItemRequest } from '../../requests/CreateWatchItemRequest'
import { createWatchItem } from '../../businessLogic/watchItems'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // TODO: Implement creating a new watch item

  const newWatchItem: CreateWatchItemRequest = JSON.parse(event.body)

  const newItem = await createWatchItem(newWatchItem, getUserId(event))
  const { userId, ...item } = newItem

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
