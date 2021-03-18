import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'

import { getUserId, buildHttpResponse } from '../utils'
import { getUserInfoItemOrDefault } from '../../businessLogic/userInfo';
import { UserInfoItem } from '../../models/UserInfoItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('In getUserInfo handler, processing event: ', event)
  let userInfo: UserInfoItem

  try {
    userInfo = await getUserInfoItemOrDefault(getUserId(event))
  } catch (e) {
    return buildHttpResponse(500, { error: `Get user info failed: ${e.message}` })
  }

  const { userId, ...item } = userInfo

  return buildHttpResponse(200, { item })
}
