import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { WatchItem } from '../models/WatchItem'
//import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)

export class DbAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly watchTable = process.env.WATCH_TABLE,
    private readonly watchTableIndex = process.env.INDEX_NAME) {
  }

  // TODO: Re-assess use of scan here
  async getAllWatchItems(): Promise<WatchItem[]> {
    console.log(`In getAllWatchItems...`)

    // Scan operation parameters
    const scanParams = {
      ConsistentRead: true,
      TableName: this.watchTable,
      // Limit: limit,
      // ExclusiveStartKey: nextKey
    }

    const result = await this.docClient.scan(scanParams).promise()

    const items = result.Items
    console.log(`query result.Items are ${JSON.stringify(items)}`)

    return items as WatchItem[]
  }

  async getWatchItems(userId: string): Promise<WatchItem[]> {
    console.log(`In getWatchItems for userId ${userId}...`)
    const result = await this.docClient.query({
      ConsistentRead: true,
      TableName: this.watchTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()

    const items = result.Items
    console.log(`query result.Items are ${JSON.stringify(items)}`)

    return items as WatchItem[]
  }

  async getWatchItem(userId: string, watchId: string) : Promise<WatchItem> {
    console.log(`In getWatchItem for userId ${userId}...`)
    const result = await this.docClient.query({
      ConsistentRead: true,
      TableName : this.watchTable,
      IndexName : this.watchTableIndex,
      KeyConditionExpression: 'userId = :userId and watchId = :watchId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':watchId': watchId,
      }
    }).promise()

    const items = result.Items
    console.log(`query result.Items are ${JSON.stringify(items)}`)

    const item = items[0]
    return item as WatchItem
  }

  async createWatchItem(watchItem: WatchItem): Promise<WatchItem> {
    console.log("In createWatchItem...")
    await this.docClient.put({
      TableName: this.watchTable,
      Item: watchItem
    }).promise()

    return watchItem
  }

  async updateWatchItem(watchUpdate: WatchItemUpdate, userId: string, ticker: string) {
    console.log("In updateWatchItem...")
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

  async refreshWatchItem(watchItemRefresh: WatchItem) {
    console.log(`In refreshWatchItem...`)
    console.log(`Refreshed watch item is ${JSON.stringify(watchItemRefresh)}`)
    await this.docClient.put({
      TableName: this.watchTable,
      Item: watchItemRefresh
    }).promise()
    console.log(`... exiting dbAccess refreshWatchItem`)
  }

  async deleteWatchItem(userId: string, ticker: string) {
    console.log("In deleteWatchItem...")
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
