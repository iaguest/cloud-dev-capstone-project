import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { WatchItem } from '../models/WatchItem'
import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'

import { createLogger } from '../utils/logger'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('dbAccess')

export class DbAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly watchTable = process.env.WATCH_TABLE,
    private readonly watchTableIndex = process.env.INDEX_NAME) {
  }

  // TODO: Re-assess use of scan here
  async getAllWatchItems(): Promise<WatchItem[]> {
    logger.info(`In getAllWatchItems...`)

    // Scan operation parameters
    const scanParams = {
      TableName: this.watchTable,
      // Limit: limit,
      // ExclusiveStartKey: nextKey
    }

    const result = await this.docClient.scan(scanParams).promise()

    const items = result.Items
    logger.info(`query result.Items are ${JSON.stringify(items)}`)

    return items as WatchItem[]
  }

  async getWatchItems(userId: string): Promise<WatchItem[]> {
    logger.info(`In getWatchItems for userId ${userId}...`)
    const result = await this.docClient.query({
      TableName: this.watchTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    logger.info(`query result.Items are ${JSON.stringify(items)}`)

    return items as WatchItem[]
  }

  async getWatchItem(userId: string, watchId: string) : Promise<WatchItem> {
    logger.info(`In getWatchItem for userId ${userId}...`)
    const result = await this.docClient.query({
      TableName : this.watchTable,
      IndexName : this.watchTableIndex,
      KeyConditionExpression: 'userId = :userId and watchId = :watchId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':watchId': watchId,
      }
    }).promise()

    const items = result.Items
    logger.info(`query result.Items are ${JSON.stringify(items)}`)

    const item = items[0]
    return item as WatchItem
  }

  async createWatchItem(watchItem: WatchItem): Promise<WatchItem> {
    logger.info("In createWatchItem...")
    await this.docClient.put({
      TableName: this.watchTable,
      Item: watchItem
    }).promise()

    return watchItem
  }

  async updateWatchItem(watchUpdate: WatchItemUpdate, userId: string, ticker: string) {
    logger.info("In updateWatchItem...")
    await this.docClient.update({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'ticker' : ticker
      },
      UpdateExpression: 'set alertPrice = :alertPrice',
      ExpressionAttributeValues: {
        ':alertPrice' : watchUpdate.alertPrice,
      }
    }).promise()
  }

  async refreshWatchItem(watchRefresh: WatchItemRefresh, userId: string, ticker: string) {
    logger.info(`In refreshWatchItem for userId ${userId}, ticker ${ticker}...`)
    logger.info(`WatchItemRefresh obj: ${JSON.stringify(watchRefresh)}`)
    await this.docClient.update({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'ticker' : ticker
      },
      UpdateExpression: 'set #ts = :ts, price = :price, previousPrice = :previousPrice',
      ExpressionAttributeNames: {
        "#ts": "timeStamp"
      },
      ExpressionAttributeValues: {
        ':previousPrice': watchRefresh.previousPrice,
        ':price' : watchRefresh.price,
        ':ts' : watchRefresh.timeStamp,
      }
    }).promise()
    logger.info("...completed refreshWatchItem")
  }

  async deleteWatchItem(userId: string, ticker: string) {
    logger.info("In deleteWatchItem...")
    await this.docClient.delete({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'ticker' : ticker
      },
    }).promise()
  }

  // async setTodoItemAttachmentUrl(userId: string, createdAt: string, url: string) {
  //   logger.info("In setTodoItemAttachmentUrl...")
  //   await this.docClient.update({
  //     TableName: this.watchTable,
  //     Key: {
  //       'userId' : userId,
  //       'createdAt' : createdAt
  //     },
  //     UpdateExpression: 'set attachmentUrl = :attachmentUrl',
  //     ExpressionAttributeValues: {
  //       ':attachmentUrl' : url,
  //     }
  //   }).promise()
  // }

}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient()
}
