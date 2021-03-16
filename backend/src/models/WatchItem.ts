export interface WatchItem {
  userId: string
  watchId: string
  ticker: string
  description: string
  price: number
  currency: string
  timeStamp: string
  alertPrice?: number
  alertTriggered: boolean
  previousPrice?: number
}
