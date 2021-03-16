import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { WatchItem } from '../models/WatchItem'
import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)

export class DbAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly watchTable = process.env.WATCH_TABLE) {
  }

  async watchItemExists(userId: string, watchId: string): Promise<boolean> {
    console.log(`In watchItemExists for userId ${userId}, watchId ${watchId}...`)
  
    const result = await this.docClient.get({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
      }
    }).promise()
  
    console.log(`result.Item is ${JSON.stringify(result.Item)}`)

    const itemExists = result.Item !== undefined
    console.log(`... ${(itemExists) ? 'found item' : 'item not found'}, exiting watchItemExists`)
  
    return itemExists
  }

  async getWatchItem(userId: string, watchId: string)
  : Promise<WatchItem> {

    const result = await this.docClient.get({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
      }
    }).promise()

    return result.Item as WatchItem
  }

  async getWatchItems(userId: string): Promise<WatchItem[]> {
    console.log(`In getWatchItems for userId ${userId}...`)

    const result = await this.docClient.query({
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

  // TODO: Re-assess use of scan here
  async getAllWatchItems(): Promise<WatchItem[]> {
    console.log(`In getAllWatchItems...`)

    // Scan operation parameters
    const scanParams = {
      TableName: this.watchTable,
      // Limit: limit,
      // ExclusiveStartKey: nextKey
    }

    const result = await this.docClient.scan(scanParams).promise()

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

  async updateWatchItem(watchItemUpdate: WatchItemUpdate, userId: string, watchId: string) : Promise<WatchItem> {
    console.log("In updateWatchItem...")

    const result = await this.docClient.update({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
      },
      UpdateExpression: 'set alertPrice = :alertPrice',
      ExpressionAttributeValues: {
        ':alertPrice' : watchItemUpdate.alertPrice,
      },
      ReturnValues:"ALL_NEW"
    }).promise()

    console.log("... completed updateWatchItem")
    return result.Attributes as WatchItem
  }

  async refreshWatchItem(watchItemRefresh: WatchItemRefresh, userId: string, watchId: string): Promise<WatchItem> {
    console.log(`In refreshWatchItem for userId ${userId}, watchId ${watchId}...`)
    const result = await this.docClient.update({
      TableName: this.watchTable,
      Key: {
        'userId' : userId,
        'watchId' : watchId
      },
      UpdateExpression: 'set #ts = :ts, price = :price, previousPrice = :previousPrice, alertTriggered = :alertTriggered',
      ExpressionAttributeNames: {
        "#ts": "timeStamp"
      },
      ExpressionAttributeValues: {
        ':previousPrice': watchItemRefresh.previousPrice,
        ':price' : watchItemRefresh.price,
        ':ts' : watchItemRefresh.timeStamp,
        ':alertTriggered': watchItemRefresh.alertTriggered
      },
      ReturnValues:"ALL_NEW"
    }).promise()
    console.log("...completed refreshWatchItem")
    return result.Attributes as WatchItem
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
  return new DocumentClient()
}
