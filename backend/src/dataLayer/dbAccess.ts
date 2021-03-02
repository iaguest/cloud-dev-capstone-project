import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { WatchItem } from '../models/WatchItem'
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

  async getAllWatchItems(userId: string): Promise<WatchItem[]> {
    logger.info("In getAllWatchItems...")
    const result = await this.docClient.query({
      TableName: this.watchTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as WatchItem[]
  }

  async getWatchItem(userId: string, watchId: string) : Promise<WatchItem> {
    logger.info("In getWatchItem...")
    const result = await this.docClient.query({
      TableName : this.watchTable,
      IndexName : this.watchTableIndex,
      KeyConditionExpression: 'userId = :userId and watchId = :watchId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':watchId': watchId,
      }
    }).promise()

    const item = result.Items[0]
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
      UpdateExpression: 'set price = :price, timeStamp = :timeStamp',
      ExpressionAttributeValues: {
        ':price' : watchUpdate.price,
        ':timeStamp' : watchUpdate.timeStamp
      }
    }).promise()
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
