import { WatchItemInfo } from '../models/WatchItemInfo';
import { WatchItemInfoProvider } from '../models/WatchItemInfoProvider';

export class MockFinanceInfoProvider extends WatchItemInfoProvider {

  constructor() {
    console.log("Start construct MockFinanceInfoProvider...")
    super()
    console.log("... Finished construct MockFinanceInfoProvider")
  }

  async getInfo(ticker: string): Promise<WatchItemInfo> {
    console.log(`In getInfo, getting mock info for ${ticker}...`);
    const info: WatchItemInfo = {
      description: `${ticker} description`,
      price: Math.floor(Math.random() * 11),
      currency: 'USD',
      timeStamp: new Date().toISOString()
    }
    console.log(`... returning WatchItemInfo: ${JSON.stringify(info)} from getInfo`)
    return info
  }
}

export class YahooFinanceInfoProvider extends WatchItemInfoProvider {
  yahooFinance: any;

  constructor() {
    console.log("Start construct YahooFinanceUpdateProvider...");
    super()
    this.yahooFinance = require('yahoo-finance');
    console.log("... Finished construct YahooFinanceUpdateProvider");
  }

  async getInfo(ticker: string): Promise<WatchItemInfo> {
    console.log(`In getInfo, getting quote for ${ticker}...`);
    const quote = await this.yahooFinance.quote(ticker, ['price']);
    console.log(`... quote retrieved ${JSON.stringify(quote)}`);
    const priceInfo = quote['price'];
    return {
      description: priceInfo['shortName'],
      price: priceInfo['regularMarketPrice'],
      currency: priceInfo['currency'],
      timeStamp: priceInfo['regularMarketTime'].toISOString()
    };
  }
}
