export interface WatchItem {
  watchId: string
  ticker: string
  description: string
  price: number
  currency: string
  timeStamp: string
  alertPrice?: number
}
