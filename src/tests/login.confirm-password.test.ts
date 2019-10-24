import * as core from 'express-serve-static-core';
import * as request from 'supertest';
import { userModel } from '../models/user';
import { mockApp } from './app';
import {stopMongo} from './mongo';

jest.setTimeout(50000);
const testUrl = '/login/confirm-password';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000004',
    email: 'test7@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
    resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
});

let app: core.Express;
describe('## Login / Confirm Password', () => {
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

        it('should validate that the `resetPasswordCode` is valid and return 200 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                newPassword: 'test7@dicky.world',
                resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Password reset');
            done();
        });

        it('should validate that the `email` is too short and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                newPassword: 'test7@dicky.world',
                resetPasswordCode: 'e0d22659bb727',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"resetPasswordCode\" length must be at least 39 characters long');
            done();
        });

        it('should validate that the `newPassword` is too short and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                newPassword: 'short',
                resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"newPassword\" length must be at least 6 characters long');
            done();
        });
    });
});
