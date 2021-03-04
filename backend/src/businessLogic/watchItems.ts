import * as uuid from 'uuid'

import { WatchItem } from '../models/WatchItem'
import { WatchItemInfo } from '../models/WatchItemInfo'
import { WatchItemInfoProvider } from '../models/WatchItemInfoProvider'
import { WatchItemUpdate } from '../models/WatchItemUpdate'
import { DbAccess } from '../dataLayer/dbAccess'
//import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateWatchItemRequest } from '../requests/CreateWatchItemRequest'
import { UpdateWatchItemRequest } from '../requests/UpdateWatchItemRequest'

import { createLogger } from '../utils/logger'

const logger = createLogger('dbAccess')

class YahooFinanceInfoProvider extends WatchItemInfoProvider {
  yahooFinance: any
  
  constructor() { 
    logger.info("Start construct YahooFinanceUpdateProvider...")
    super()
    this.yahooFinance = require('yahoo-finance')
    logger.info("... Finished construct YahooFinanceUpdateProvider")
  }

  async getInfo(ticker: string): Promise<WatchItemInfo> {
    logger.info("In getUpdate, getting quote...")
    const quote = await this.yahooFinance.quote(ticker, ['price']);
    logger.info(`... quote retrieved ${JSON.stringify(quote)}`)
    const priceInfo = quote['price']
    return { description: priceInfo['shortName'],
             price: priceInfo['regularMarketPrice'],
             currency: priceInfo['currency'],
             timeStamp: priceInfo['regularMarketTime'].toISOString() }
  }
}

const dbAccess = new DbAccess()
const watchItemInfoProvider = new YahooFinanceInfoProvider()

export async function getAllWatchItems(
  userId: string
) : Promise<WatchItem[]> {
  return dbAccess.getAllWatchItems(userId)
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
    description: itemInfo.description,
    price: itemInfo.price,
    currency: itemInfo.currency,
    timeStamp: itemInfo.timeStamp,
    alertPrice: null,
    previousPrice: null
  })
}

export async function updateWatchItem(
  updateWatchItemRequest: UpdateWatchItemRequest,
  userId: string,
  watchId: string
) {
  const watchItemUpdate : WatchItemUpdate = {
    ...updateWatchItemRequest,
  }

  const currentWatchItem: WatchItem = await dbAccess.getWatchItem(userId, watchId)

  await dbAccess.updateWatchItem(watchItemUpdate, userId, currentWatchItem.ticker)
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