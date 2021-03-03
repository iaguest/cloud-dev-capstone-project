import * as uuid from 'uuid'

import { WatchItem } from '../models/WatchItem'
import { WatchItemUpdateProvider } from '../models/WatchItemUpdateProvider'
import { WatchItemUpdate } from '../models/WatchItemUpdate'
import { DbAccess } from '../dataLayer/dbAccess'
//import { deleteTodoItemAttachment } from '../dataLayer/fileAccess'
import { CreateWatchItemRequest } from '../requests/CreateWatchItemRequest'
import { UpdateWatchItemRequest } from '../requests/UpdateWatchItemRequest'

import { createLogger } from '../utils/logger'

const logger = createLogger('dbAccess')

class YahooFinanceUpdateProvider extends WatchItemUpdateProvider {
  yahooFinance: any
  
  constructor() { 
    logger.info("Start construct YahooFinanceUpdateProvider...")
    super()
    this.yahooFinance = require('yahoo-finance')
    logger.info("... Finished construct YahooFinanceUpdateProvider")
  }

  async getUpdate(ticker: string): Promise<WatchItemUpdate> {
    logger.info("In getUpdate, getting quote...")
    const quote = await this.yahooFinance.quote(ticker, ['price']);
    logger.info(`... quote retrieved ${JSON.stringify(quote)}`)
    const priceInfo = quote['price']
    return { price: priceInfo['regularMarketPrice'],
             timeStamp: priceInfo['regularMarketTime']}
  }

}

const dbAccess = new DbAccess()
const watchItemUpdateProvider = new YahooFinanceUpdateProvider()

export async function getAllWatchItems(
  userId: string
) : Promise<WatchItem[]> {
  await watchItemUpdateProvider.getUpdate('TSLA')
  return dbAccess.getAllWatchItems(userId)
}

export async function createWatchItem(
  createWatchItemRequest: CreateWatchItemRequest,
  userId: string
) : Promise<WatchItem> {
  return await dbAccess.createWatchItem({
    userId: userId,
    watchId: uuid.v4(),
    ticker: createWatchItemRequest.ticker,
    description: createWatchItemRequest.description,
    timeStamp: new Date().toISOString(),              // HACK XXX: Needs time relating to price info
    price: 1234.0                                     // HACK XXX: Needs actual price info
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