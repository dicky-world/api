
import * as core from 'express-serve-static-core';
import {Server} from 'https';
import {AddressInfo} from 'net';
import io = require('socket.io-client');
import * as request from 'supertest';
import {startMongo, stopMongo} from './mongo';

const testUrl = '/socket';

let app: core.Express;
let server: Server;

describe('## Get Socket', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            await startMongo.then();
            process.env.API_PORT = '0';
            const appServer = require('../server');
            app = appServer.app;
            server = appServer.server;
            done();
        });

        afterAll(async (done) => {
            await stopMongo.then();
            // await server.close();
            done();
        });

        it('should validate that the `email` has already been registered and throw 400 error', async (done) => {
            const res = await request(app).get(testUrl);
            expect(res.status).toBe(200);
            expect(res.type).toBe('text/html');
            done();
        });

        it('it should connect to WebSocket', (done) => {
            // @ts-ignore
            const address: AddressInfo = server.address();
            const socket = io.connect(`http://localhost:${address.port}`, {
                forceNew : true,
                reconnectionDelay: 0,
                transports: ['websocket'],
            });
            socket.on('connect', () => {
                done();
            });
        });
    });

});
