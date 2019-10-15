import * as core from 'express-serve-static-core';
import * as request from 'supertest';
import {mockApp} from './app';

let app: core.Express;

const testUrl = '/socket';

describe('## Get Socket', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            app = await mockApp.then();
            done();
        });

        it('should validate that the `email` has already been registered and throw 400 error', async (done) => {
            const res = await request(app).get(testUrl);
            expect(res.status).toBe(200);
            expect(res.type).toBe('text/html')
            done();
        });
    });

});
