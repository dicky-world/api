import * as Agenda from 'agenda';
import fetch from 'node-fetch';

const tasks = (connectionString: string) => {
  const agenda = new Agenda({ db: { address: connectionString } });

  agenda.define('Top of the hour', async (job) => {
    try {
      console.log('Top of the hour!');
    } catch (error) {
      console.error('Task Error' + error);
    }
  });

  (async () => {
    await agenda.start();
    await agenda.every('00 * * * *', 'Top of the hour');
  })();
};

export { tasks };
