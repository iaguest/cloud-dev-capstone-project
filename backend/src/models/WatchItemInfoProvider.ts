import { WatchItemInfo } from "./WatchItemInfo"

export abstract class WatchItemInfoProvider {
    abstract getInfo(ticker: string): WatchItemInfo
}
