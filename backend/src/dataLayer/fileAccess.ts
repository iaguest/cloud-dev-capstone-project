import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
  
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export function getUserInfoUploadUrl(userId: string) {
    console.log("In getUserInfoUploadUrl...")
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: userId,
        Expires: urlExpiration
    })
}

export function getUserInfoAttachmentUrl(userId: string) {
    return `https://${bucketName}.s3.amazonaws.com/${userId}`
}

export async function deleteUserInfoAttachment(userId: string) {
    console.log("In deleteUserInfoAttachment...")
    await s3.deleteObject({
        Bucket: bucketName,
        Key: userId,
    }).promise()
}
