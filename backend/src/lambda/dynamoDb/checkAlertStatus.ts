import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'

import { DbAccess } from '../../dataLayer/dbAccess'

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  const dbAccess = new DbAccess()
  for (const record of event.Records) {
    if (record.eventName !== 'MODIFY') {
      console.log(`Skipping record for eventID:${record.eventID} which is unrelated to modification`)
      continue
    }

    console.log('Processing modified record', JSON.stringify(record))

    const previousItem = record.dynamodb.OldImage
    if (previousItem === undefined) {
      console.log('Skip undefined OldImage...')
      continue
    }

    const isPreviousAlert = previousItem.alertTriggered.BOOL
    if (isPreviousAlert) {
      console.log('Alert trigger already set, ignore as notification will already have been handled')
      continue
    }

    const currentWatchItem = await dbAccess.getWatchItem(previousItem.userId.S, previousItem.watchId.S)
    if (!currentWatchItem.alertTriggered) {
      console.log('Alert trigger not currently set, ignore this change')
      continue
    }

    console.log("**** TRIGGER NOTIFICATION ****")
  }
}