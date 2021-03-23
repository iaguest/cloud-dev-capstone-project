import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'

import { DbAccess } from '../../dataLayer/dbAccess'
import { trySendAlertEmailNotification } from '../../dataLayer/emailAccess'
import { getUserInfoItemOrDefault } from '../../businessLogic/userInfo'

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

    const userId = previousItem.userId.S
    const userInfo = await getUserInfoItemOrDefault(userId)
    if (!userInfo.email) {
      console.log('No email available for this userId so skip this record...')
      continue
    }

    const isPreviousAlert = previousItem.alertTriggered.BOOL
    if (isPreviousAlert) {
      console.log('Alert trigger already set, ignore as notification will already have been handled')
      continue
    }

    const currentWatchItem = await dbAccess.getWatchItem(userId, previousItem.watchId.S)
    if (!currentWatchItem.alertTriggered) {
      console.log('Alert trigger not currently set, ignore this change')
      continue
    }

    console.log("**** TRIGGER NOTIFICATION ****")
    await trySendAlertEmailNotification(
      userInfo.email, currentWatchItem.ticker, currentWatchItem.price, currentWatchItem.currency
    )
  }
}
