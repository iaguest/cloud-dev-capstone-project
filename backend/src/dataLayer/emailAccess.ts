import * as AWS  from 'aws-sdk'

export async function trySendAlertEmailNotification(targetEmail: string, ticker: string, price: number, currency: string) {
  console.log(`In sendAlertEmailNotification for ${ticker}@${price} ${currency}`)

  // Create sendEmail params 
  var params = {
    Destination: { /* required */
      ToAddresses: [
        targetEmail,
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

export async function trySendVerificationEmailForNewAddress(email: string) {
  console.log(`Try sending verification email to ${email}...`)

  try {
    const verifyResult = await new AWS.SES({
      apiVersion: '2010-12-01',
      accessKeyId: "<ACCESS_KEY_ID>",
      secretAccessKey: "<SECRET_ACCESS_KEY>"
    }).verifyEmailIdentity({EmailAddress: email}).promise()
    console.log(`verifyEmailIdentity returned: ${JSON.stringify(verifyResult)}`)
  } catch (e) {
    console.log(`verifyEmailIdentity call failed: ${e.message}`)
  }
}
