import { apiEndpoint } from '../config'
import Axios from 'axios'

import { UserInfoItem } from '../types/UserInfoItem';
import { UpdateUserInfoRequest } from '../types/UpdateUserInfoRequest';

export async function getUserInfo(idToken: string): Promise<UserInfoItem> {
  console.log('Fetching user info...')

  const response = await Axios.get(`${apiEndpoint}/userinfo`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('user info:', response.data)
  return response.data.item
}

export async function updateUserInfo(
  idToken: string,
  updateUserInfoRequest: UpdateUserInfoRequest
): Promise<UserInfoItem> {

  console.log(`Calling update user info with id token ${idToken}...`)

  const replacer = (key:any, value:any) =>
    typeof value === 'undefined' ? null : value;

  const response = await Axios.post(`${apiEndpoint}/userinfo`, JSON.stringify(updateUserInfoRequest, replacer), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  const item = response.data.item
  console.log(`... response item is ${JSON.stringify(item)}, exiting updateUserInfo`)
  return item
}

export async function getUploadUrl(
  idToken: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/userinfo/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
