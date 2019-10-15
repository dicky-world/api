
import { startMongo } from './mongo';

export const mockApp = startMongo.then((url) => {
     process.env.API_PORT = '0';
     process.env.JWT_SECRET = 'secret';
     process.env.EMAIL_FROM = 'test8@dicky.world';
     return require('../server').app;
});
