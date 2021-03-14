import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { WatchItem } from '../models/WatchItem'
//import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)

export class DbAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly watchTable = process.env.WATCH_TABLE) {
  }

  async watchItemsExist(userId: string) : Promise<boolean> {
    console.log(`In watchItemsExist for userId ${userId}`)

    const result = await this.docClient.query({
      ConsistentRead: true,
      TableName: this.watchTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()

    console.log(`... exiting watchItemsExist, result.Items are ${JSON.stringify(result.Items)}`)

    return result.Items.length > 0
  }

  async watchItemExists(userId: string, watchId: string): Promise<boolean> {
    console.log(`In watchItemExists for userId ${userId}, watchId ${watchId}...`)
  
    const result = await this.docClient.get({
      ConsistentRead: true,
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
      }
    }).promise()
  
    console.log(`... exiting watchItemExists, result.Item is ${JSON.stringify(result.Item)}`)
  
    return result.Item !== undefined
  }

  // TODO: Re-assess use of scan here
  // async getAllWatchItems(): Promise<WatchItem[]> {
  //   console.log(`In getAllWatchItems...`)

  //   // Scan operation parameters
  //   const scanParams = {
  //     ConsistentRead: true,
  //     TableName: this.watchTable,
  //     // Limit: limit,
  //     // ExclusiveStartKey: nextKey
  //   }

  //   const result = await this.docClient.scan(scanParams).promise()

  //   const items = result.Items
  //   console.log(`query result.Items are ${JSON.stringify(items)}`)

  //   return items as WatchItem[]
  // }

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

  async createWatchItem(watchItem: WatchItem): Promise<WatchItem> {
    console.log("In createWatchItem...")

    await this.docClient.put({
      TableName: this.watchTable,
      Item: watchItem
    }).promise()

    return watchItem
  }

  async updateWatchItem(watchUpdate: WatchItemUpdate, userId: string, watchId: string) {
    console.log("In updateWatchItem...")

    await this.docClient.update({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
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

  async deleteWatchItem(userId: string, watchId: string) {
    console.log("In deleteWatchItem...")

    await this.docClient.delete({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
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
  return new DocumentClient({
    maxRetries: 3,
    httpOptions: {
      timeout: 5000
    }
  })
}
