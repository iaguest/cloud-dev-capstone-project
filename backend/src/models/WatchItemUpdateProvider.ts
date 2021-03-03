import { WatchItemUpdate } from "./WatchItemUpdate";

export abstract class WatchItemUpdateProvider {
    abstract getUpdate(ticker: string): Promise<WatchItemUpdate>;
}
