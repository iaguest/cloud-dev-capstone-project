import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'

import { UserInfoItem } from '../../models/UserInfoItem'
import { UserInfoUpdate } from '../../models/UserInfoUpdate'
import { updateUserInfoItem } from '../../businessLogic/userInfo'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('In updateUserInfo handler, processing event: ', event)

  const updatedUserInfoItem: UserInfoUpdate = JSON.parse(event.body)

  let updatedItem: UserInfoItem = undefined

  try {
    updatedItem = await updateUserInfoItem(updatedUserInfoItem, getUserId(event))
  }
  catch (e) {
    return buildHttpResponse(500, {error: `Update user info failed: ${e.message}`})
  }

  const { userId, ...item } = updatedItem

  return buildHttpResponse(200, { item })
}