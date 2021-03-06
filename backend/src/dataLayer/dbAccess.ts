import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { UserInfoItem } from '../models/UserInfoItem'
import { UserInfoUpdate } from '../models/UserInfoUpdate'

import { WatchItem } from '../models/WatchItem'
import { WatchItemRefresh } from '../models/WatchItemRefresh'
import { WatchItemUpdate } from '../models/WatchItemUpdate'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)

export class DbAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly userInfoTable = process.env.USER_INFO_TABLE,
    private readonly watchTable = process.env.WATCH_TABLE) {
  }

  async getUserInfoItem(userId: string) : Promise<UserInfoItem> {
    console.log("In getUserInfoItem...")

    const result = await this.docClient.get({
      TableName: this.userInfoTable,
      Key: { 'userId' : userId }
    }).promise()

    const item = (result.Item) ? result.Item as UserInfoItem : undefined
    
    console.log(`... exiting getUserInfoItem, returning result item: ${JSON.stringify(item)}`)
    return item
  }

  async updateUserInfoItem(userInfoUpdate: UserInfoUpdate, userId: string) : Promise<UserInfoItem> {
    console.log("In updateUserInfoItem...")

    const expAttribValues = {
      ':email' : userInfoUpdate.email,
      ':avatarUrl' : userInfoUpdate.avatarUrl
    }

    const expressionString = buildUpdateExpressionString(expAttribValues)
    console.log(`Expression string is: ${expressionString}`)

    const result = await this.docClient.update({
      TableName: this.userInfoTable,
      Key: {
        'userId' : userId,
      },
      UpdateExpression: expressionString,
      ExpressionAttributeValues: expAttribValues,
      ReturnValues:"ALL_NEW"
    }).promise()

    console.log("... completed updateUserInfoItem")
    return result.Attributes as UserInfoItem
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

  // Using scan to get all watch items for all user ids so we can refresh item data at regular intervals
  async getAllWatchItems(): Promise<WatchItem[]> {
    console.log(`In getAllWatchItems...`)

    // Scan operation parameters
    const scanParams = {
      TableName: this.watchTable,
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
      // HACK XXX: resetting alertTriggered here is a bit hacky, but pragmatic for now.
      UpdateExpression: 'set alertPrice = :alertPrice, alertTriggered = :alertTriggered',
      ExpressionAttributeValues: {
        ':alertPrice' : watchItemUpdate.alertPrice,
        ':alertTriggered' : false
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

}

function buildUpdateExpressionString(expressionAttributeValues: object
) : string {
  let expressionString: string = 'set '
  const kvps = Object.entries(expressionAttributeValues)
  if (kvps.length < 1) {
    throw RangeError("expressionAttributeValues must not be empty")
  }
  for (const [key, value] of kvps) {
    console.log(`${key}:${value}`)
    if (value === undefined) {
      continue
    }
    expressionString += `${key.substring(1)} = ${key},`
  }
  return expressionString.slice(0, -1)
}

function createDynamoDBClient() {
  return new DocumentClient()
}
