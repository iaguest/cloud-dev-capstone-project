import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'

import { getUserId, buildHttpResponse } from '../utils'
import { getWatchItems } from '../../businessLogic/watchItems';
import { WatchItem } from '../../models/WatchItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  let watchItems: WatchItem[]

  try {
    watchItems = await getWatchItems(getUserId(event))
  } catch (e) {
    return buildHttpResponse(500, { error: `Get items failed: ${e.message}` })
  }

  const items = watchItems.map(function(elem: WatchItem){
    const { userId, ...item } = elem
    return item
  })

  return buildHttpResponse(200, { items })
}
