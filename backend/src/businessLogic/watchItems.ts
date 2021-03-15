import * as uuid from 'uuid'

import { WatchItem } from '../models/WatchItem'
import { WatchItemUpdate } from '../models/WatchItemUpdate'
import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemInfoProvider } from '../models/WatchItemInfoProvider'
import { DbAccess } from '../dataLayer/dbAccess'
//import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateWatchItemRequest } from '../requests/CreateWatchItemRequest'
import { UpdateWatchItemRequest } from '../requests/UpdateWatchItemRequest'

import { MockFinanceInfoProvider } from './infoProviders'

export async function getWatchItems(
  userId: string
) : Promise<WatchItem[]> {
  const dbAccess = new DbAccess()
  return dbAccess.getWatchItems(userId)
}

export async function createWatchItem(
  createWatchItemRequest: CreateWatchItemRequest,
  userId: string
) : Promise<WatchItem> { 

  const ticker = createWatchItemRequest.ticker

  const watchItemInfoProvider = createWatchItemInfoProvider()
  const itemInfo = await watchItemInfoProvider.getInfo(ticker)

  const dbAccess = new DbAccess()
  return await dbAccess.createWatchItem({
    userId: userId,
    watchId: uuid.v4(),
    ticker: ticker,
    alertPrice: null,
    previousPrice: null,
    description: itemInfo.description,
    price: itemInfo.price,
    currency: itemInfo.currency,
    timeStamp: itemInfo.timeStamp
  })
}

export async function updateWatchItem(
  updateWatchItemRequest: UpdateWatchItemRequest,
  userId: string,
  watchId: string
) : Promise<WatchItem> {
  const dbAccess = new DbAccess()

  const itemExists = await dbAccess.watchItemExists(userId, watchId)
  if (!itemExists) {
    throw new RangeError("Item does not exist")
  }

  const watchItemUpdate: WatchItemUpdate = {
    alertPrice: updateWatchItemRequest.alertPrice
  }
  return await dbAccess.updateWatchItem(watchItemUpdate, userId, watchId)
}

export async function refreshWatchItem(
  userId: string,
  watchId: string
) : Promise<WatchItem> {
  const dbAccess = new DbAccess()

  const itemExists = await dbAccess.watchItemExists(userId, watchId)
  if (!itemExists) {
    throw new RangeError("Item does not exist")
  }
  
  const currentItem = await dbAccess.getWatchItem(userId, watchId)
  const infoProvider = createWatchItemInfoProvider()
  const itemInfo = await infoProvider.getInfo(currentItem.ticker)

  const watchItemRefresh: WatchItemRefresh = {
    previousPrice: currentItem.price,
    price: itemInfo.price,
    timeStamp: itemInfo.timeStamp
  }

  return await dbAccess.refreshWatchItem(watchItemRefresh, userId, watchId)
}

export async function deleteWatchItem(
  userId: string,
  watchId: string
) {
  const dbAccess = new DbAccess()

  const itemExists = await dbAccess.watchItemExists(userId, watchId)
  if (!itemExists) {
    throw new RangeError("Item does not exist")
  }

  await dbAccess.deleteWatchItem(userId, watchId)
}

function createWatchItemInfoProvider(): WatchItemInfoProvider {
  return new MockFinanceInfoProvider()
}