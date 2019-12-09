import * as Agenda from 'agenda';
import fetch from 'node-fetch';
import { goldPriceModel, GoldPriceModelInterface } from '../models/goldPrice';

const tasks = (connectionString: string) => {
  const agenda = new Agenda({ db: { address: connectionString } });

  agenda.define('Get Gold Price', async (job) => {
    try {
      const url = `https://xml.dgcsc.org/xml.cfm?password=${process.env.GOLDAPI_PASSWORD}&action=GoldJBO`;
      const response = await fetch(url);
      const content = await response.json();
      const ouncePriceUsd = content.GoldPrice.USD.bid;
      const user = new goldPriceModel({
        ouncePriceUsd,
      } as GoldPriceModelInterface);
      await user.save();
    } catch (error) {
      // TODO: Send email to admin if this fails
      // tslint:disable-next-line: no-console
      console.error('Failed to save Gold Price' + error);
    }
  });

  (async () => {
    await agenda.start();
    await agenda.every('00 * * * *', 'Get Gold Price');
  })();
};

export { tasks };
