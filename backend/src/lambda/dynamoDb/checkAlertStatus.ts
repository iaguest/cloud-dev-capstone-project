import * as AWS  from 'aws-sdk'

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
    await sendAlertEmailNotification(currentWatchItem.ticker, currentWatchItem.price, currentWatchItem.currency)
  }
}

async function sendAlertEmailNotification(ticker: string, price: number, currency: string) {
  console.log(`In sendAlertEmailNotification for ${ticker}@${price} ${currency}`)

  // Create sendEmail params 
  var params = {
    Destination: { /* required */
      ToAddresses: [
        '<**** TARGET_EMAIL ****>',
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Text: {
        Charset: "UTF-8",
        Data: `Your alert for ${ticker} at ${price}${currency} has been triggered.`
        }
      },
       Subject: {
        Charset: 'UTF-8',
        Data: `Watch list alert ${ticker}`
       }
      },
    Source: '<**** SOURCE_EMAIL ****>', /* required */
  };

  console.log("Sending email...")
  try {
    await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise()
    console.log("... email sent")
  } catch (e) {
    console.log(`... email send failed: ${e.message}`)
  }
  
  console.log("... exiting sendAlertEmailNotification")
}