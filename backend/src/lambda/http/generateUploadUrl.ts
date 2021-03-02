import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId } from '../utils'
import { getTodoItemUploadUrl, getTodoItemAttachmentUrl } from '../../dataLayer/fileAccess'
import { setTodoItemAttachmentUrl } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  }

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const attachmentUrl = getTodoItemAttachmentUrl(todoId)

  try {
    await setTodoItemAttachmentUrl(userId, todoId, attachmentUrl)
  }
  catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: `Setting Attachment Url failed: ${e.message}`
      })
    }
  }

  const uploadUrl = getTodoItemUploadUrl(todoId);

  return {
    statusCode: 201,
    headers: headers,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}
