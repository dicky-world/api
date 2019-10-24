import * as core from 'express-serve-static-core';
import * as request from 'supertest';
import { userModel } from '../models/user';
import { mockApp } from './app';
import {stopMongo} from './mongo';

const testUrl = '/login/reset-password';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000003',
    email: 'test6@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
});
let app: core.Express;
describe('## ## Login / Reset Password', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            app = await mockApp.then();
            await defaultUser.save();
            done();
        });

        afterAll(async (done) => {
            await userModel.deleteOne({email: defaultUser.email});
            await stopMongo.then();
            done();
        });

        it('should validate that the `email` is valid and return 200 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test6@dicky.world',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Reset password email sent');
            done();
        });

        it('should validate that the `email` exists and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'testNewOne@dicky.world',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('You need to register first');
            done();
        });

        it('should validate that the `email` exists and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test6@dicky',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" must be a valid email');
            done();
        });
    });
});
