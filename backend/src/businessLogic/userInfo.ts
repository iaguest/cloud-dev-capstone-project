import { UserInfoItem } from '../models/UserInfoItem'
import { UserInfoUpdate } from '../models/UserInfoUpdate'

import { DbAccess } from '../dataLayer/dbAccess'
import { trySendVerificationEmailForNewAddress } from '../dataLayer/emailAccess'

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

  // HACK XXX: Should really be pulled out of here - separation of concerns
  if (previousItem !== undefined && updatedItem.email && previousItem.email !== updatedItem.email) {
    await trySendVerificationEmailForNewAddress(userInfoUpdate.email)
  }

  return updatedItem
}
