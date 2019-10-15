import * as core from 'express-serve-static-core';
import * as request from 'supertest';
import { userModel } from '../models/user';
import { mockApp } from './app';
import {stopMongo} from './mongo';

const testUrl =  '/register/confirm-email';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000001',
    email: 'test4@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});
let app: core.Express;

describe('## Register / Confirm Email', () => {
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

        it('should validate that the `validationCode` is too short and return 400 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                confirmationCode: '0000000003',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"confirmationCode\" length must be at least 40 characters long');
            done();
        });

        it('should validate that the `validationCode` is required and return 400 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                confirmationCode: '',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"confirmationCode\" is not allowed to be empty');
            done();
        });

        it('should validate that the `validationCode` is required and return 200 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                confirmationCode: '0000000001000000000100000000010000000001',
            });
            expect(res.status).toBe(200);
            done();
        });

        it('should validate that the `validationCode` is invalid and return 200 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                confirmationCode: '0000000001000000000100000000010000000099',
            });
            expect(res.status).toBe(400);
            done();
        });
    });
});
