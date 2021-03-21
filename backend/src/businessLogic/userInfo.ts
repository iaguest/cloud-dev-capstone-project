import * as AWS  from 'aws-sdk'

import { UserInfoItem } from '../models/UserInfoItem'
import { UserInfoUpdate } from '../models/UserInfoUpdate'

import { DbAccess } from '../dataLayer/dbAccess'

export async function getUserInfoItemOrDefault(userId: string
) : Promise<UserInfoItem> {
  console.log("In getUserInfoItemOrDefault...")

  const dbAccess = new DbAccess()
  const item = await dbAccess.getUserInfoItem(userId)
  if (item === undefined) {
    const defaultItem: UserInfoItem = { userId: userId }
    console.log(`Returning default item: ${JSON.stringify(defaultItem)}`)
    return defaultItem
  }

  console.log(`Info item exists, returning: ${JSON.stringify(item)}`)
  return item
}

export async function updateUserInfoItem(userInfoUpdate: UserInfoUpdate, userId: string
) : Promise<UserInfoItem> {
  const dbAccess = new DbAccess()
  const previousItem = await dbAccess.getUserInfoItem(userId)
  const updatedItem = await dbAccess.updateUserInfoItem(userInfoUpdate, userId)

  // HACK XXX: Should really be pulled out of here
  if ((previousItem === undefined || !(previousItem.email)) && updatedItem.email) {
    console.log(`Sending verification email to ${userInfoUpdate.email}...`)
    const params = { EmailAddress: userInfoUpdate.email }
    await new AWS.SES({apiVersion: '2010-12-01'}).verifyEmailIdentity(params).promise()
  }

  return updatedItem
}