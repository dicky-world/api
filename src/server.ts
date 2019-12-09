import * as bluebird from 'bluebird';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';
import * as mongoose from 'mongoose';
import * as morgan from 'morgan';
import * as path from 'path';
import * as socketIo from 'socket.io';
import { router } from './router';
import { tasks } from './tasks/tasks';

// Set env values
dotenv.config();

// Connect to MongoDB
bluebird.promisifyAll(mongoose);
let connectionString;
if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
  connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true`;
} else {
  connectionString = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true`;
}

// Setup cron jobs
tasks(connectionString);

mongoose.connect(connectionString, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (error) => {
  throw new Error(error.message);
});

// Configure CORS
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  credentials: true,
  methods: 'GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE',
  origin: (origin, callback) => {
    console.log(origin);
    console.log('----');
    console.log(process.env.CORS_WHITELIST);
    console.log(process.env.CORS_WHITELIST.indexOf(origin));
    // callback(null, process.env.CORS_WHITELIST.indexOf(origin) !== -1), {preflightContinue: false};
  }
};

// Configure Server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const server = new http.Server(app);
const io = socketIo(server);

// Configure App
app.use(helmet());
app.use(morgan('dev'));
app.use(cors(options));
app.options('*', cors(options));

// Catch Syntax Error in JSON
interface Error {
  status?: number;
}
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.status === 400 && err instanceof SyntaxError && 'body' in err) {
      res.status(400).send({ message: 'JSON Syntax Error' });
    } else {
      next();
    }
  }
);
app.use('/', router);

io.on('connection', (socket) => {
  // tslint:disable-next-line: no-console
  console.log('Socket Connected');
});

// Start Server
const port = process.env.API_PORT;
// tslint:disable-next-line: no-console
server.listen(port, () => console.log(`listening on ${port}`));

// Serve Socket test page
app.get('/socket', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve('./src/client/index.html'));
});

export { app, server };
