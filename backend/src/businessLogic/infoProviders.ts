import { WatchItemInfo } from '../models/WatchItemInfo';
import { WatchItemInfoProvider } from '../models/WatchItemInfoProvider';
import { createLogger } from '../utils/logger'

export const logger = createLogger('infoProvider')

export class MockFinanceInfoProvider extends WatchItemInfoProvider {

  constructor() {
    logger.info("Start construct MockFinanceInfoProvider...")
    super()
    logger.info("... Finished construct MockFinanceInfoProvider")
  }

  async getInfo(ticker: string): Promise<WatchItemInfo> {
    logger.info(`In getInfo, getting mock info for ${ticker}...`);
    const info: WatchItemInfo = {
      description: `${ticker} description`,
      price: Math.floor(Math.random() * 11),
      currency: 'USD',
      timeStamp: new Date().toISOString()
    }
    logger.info(`... returning WatchItemInfo: ${JSON.stringify(info)} from getInfo`)
    return info
  }
}

export class YahooFinanceInfoProvider extends WatchItemInfoProvider {
  yahooFinance: any;

  constructor() {
    logger.info("Start construct YahooFinanceUpdateProvider...");
    super()
    this.yahooFinance = require('yahoo-finance');
    logger.info("... Finished construct YahooFinanceUpdateProvider");
  }

  async getInfo(ticker: string): Promise<WatchItemInfo> {
    logger.info(`In getInfo, getting quote for ${ticker}...`);
    const quote = await this.yahooFinance.quote(ticker, ['price']);
    logger.info(`... quote retrieved ${JSON.stringify(quote)}`);
    const priceInfo = quote['price'];
    return {
      description: priceInfo['shortName'],
      price: priceInfo['regularMarketPrice'],
      currency: priceInfo['currency'],
      timeStamp: priceInfo['regularMarketTime'].toISOString()
    };
  }
}
