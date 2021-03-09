import * as uuid from 'uuid'

import { WatchItem } from '../models/WatchItem'
import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'
import { DbAccess } from '../dataLayer/dbAccess'
//import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateWatchItemRequest } from '../requests/CreateWatchItemRequest'
import { UpdateWatchItemRequest } from '../requests/UpdateWatchItemRequest'

import { MockFinanceInfoProvider } from './infoProviders'

const dbAccess = new DbAccess()
const watchItemInfoProvider = new MockFinanceInfoProvider()

export async function getWatchItems(
  userId: string
) : Promise<WatchItem[]> {
  return dbAccess.getWatchItems(userId)
}

export async function createWatchItem(
  createWatchItemRequest: CreateWatchItemRequest,
  userId: string
) : Promise<WatchItem> {
  
  const ticker = createWatchItemRequest.ticker

  const itemInfo = await watchItemInfoProvider.getInfo(ticker)

  return await dbAccess.createWatchItem({
    userId: userId,
    watchId: uuid.v4(),
    ticker: ticker,
    alertPrice: null,
    previousPrice: null,
    ...itemInfo
  })
}

export async function updateWatchItem(
  updateWatchItemRequest: UpdateWatchItemRequest,
  userId: string,
  watchId: string
) {
  const watchItemUpdate: WatchItemUpdate = {
    ...updateWatchItemRequest,
  }

  const currentWatchItem: WatchItem = await dbAccess.getWatchItem(userId, watchId)

  await dbAccess.updateWatchItem(watchItemUpdate, userId, currentWatchItem.ticker)
}

// Refresh watch items for all users
export async function refreshAllWatchItems() {
  const allWatchItems = await dbAccess.getAllWatchItems()
  await refreshItems(allWatchItems)
}

// Refresh watch items for a single user
export async function refreshWatchItems(userId: string) {

  const userWatchItems = await getWatchItems(userId)
  await refreshItems(userWatchItems)
}

async function refreshItems(watchItems: WatchItem[]) {
  console.log(`In refreshItems: refreshing ${watchItems.length} items...`)

  watchItems.forEach(async watchItem => {
    const userId = watchItem.userId
    const ticker = watchItem.ticker

    console.log(`refreshing item with userId: ${userId}, ticker: ${ticker}`)

    const itemInfo = await watchItemInfoProvider.getInfo(ticker)

    const watchItemRefresh: WatchItemRefresh = {
      previousPrice: watchItem.price,
      ...itemInfo
    }

    await dbAccess.refreshWatchItem(watchItemRefresh, userId, ticker)    
  });  

  console.log("... exiting refreshItems")
}

// export async function setTodoItemAttachmentUrl(
//   userId: string,
//   todoId: string,
//   url: string
// ) {
//   const currentTodoItem: WatchItem = await dbAccess.getWatchItem(userId, todoId)
  
//   await dbAccess.setTodoItemAttachmentUrl(userId, currentTodoItem.createdAt, url)
// }

export async function deleteWatchItem(
  userId: string,
  watchId: string
) {
  const currentWatchItem: WatchItem = await dbAccess.getWatchItem(userId, watchId)

  //if (currentTodoItem.attachmentUrl !== undefined) {
  //  await deleteTodoItemAttachment(watchId)
  //}

  await dbAccess.deleteWatchItem(userId, currentWatchItem.ticker)
}