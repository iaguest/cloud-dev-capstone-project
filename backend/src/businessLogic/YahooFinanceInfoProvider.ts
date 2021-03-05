import { WatchItemInfo } from '../models/WatchItemInfo';
import { WatchItemInfoProvider } from '../models/WatchItemInfoProvider';
import { createLogger } from '../utils/logger'

export const logger = createLogger('YahooFinanceInfoProvider')

export class YahooFinanceInfoProvider extends WatchItemInfoProvider {
  yahooFinance: any;

  constructor() {
    logger.info("Start construct YahooFinanceUpdateProvider...");
    super();
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
