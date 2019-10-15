import { drop, start, stop} from 'mongo-unit';
import { parse } from 'url';

const startMongo = start({ dbName: 'test'}).then((url) => {
    process.env.DB_HOST = `localhost:${parse(url).port}`;
    process.env.DB_NAME = 'test';
    process.env.DATABASE_URL = url;
});

const stopMongo = stop().then(() => {
    // return drop().then(() => {
    //     console.log('fake mongo is stopped and cleared ');
    // });
});

export { startMongo, stopMongo };
