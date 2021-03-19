import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId, buildHttpResponse } from '../utils'
import { getUserInfoUploadUrl, getUserInfoAttachmentUrl } from '../../dataLayer/fileAccess'
import { updateUserInfoItem } from '../../businessLogic/userInfo'
import { UserInfoUpdate } from '../../models/UserInfoUpdate'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const userId: string = getUserId(event)

  const updatedUserInfoItem: UserInfoUpdate = {
    avatarUrl: getUserInfoAttachmentUrl(userId)
  }

  try {
    await updateUserInfoItem(updatedUserInfoItem, getUserId(event))
  }
  catch (e) {
    return buildHttpResponse(500, {error: `Setting avatar url failed: : ${e.message}`})
  }

  const uploadUrl = getUserInfoUploadUrl(userId);

  return buildHttpResponse(201, { uploadUrl: uploadUrl })
}
