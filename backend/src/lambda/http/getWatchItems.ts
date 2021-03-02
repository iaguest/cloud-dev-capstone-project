import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'

import { getUserId } from '../utils'
import { getAllWatchItems } from '../../businessLogic/watchItems';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // TODO: Get all watch items for a current user

  const allWatchItems = await getAllWatchItems(getUserId(event))

  const items = allWatchItems.map(function(elem){
    const { userId, ...item } = elem
    return item
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }
}
