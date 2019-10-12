import * as bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import * as request from 'supertest';

import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(30000);

const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000001',
    email: 'test4@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});

describe('## Visitor', () => {
    const testUrl =  '/register/confirm-email';

    describe(`# POST ${testUrl}`, () => {

        beforeAll(async () => {
            try {
                await defaultUser.save();
            } catch (error) {
                throw new Error(error.message);
            }
        });

        afterAll(async () => {
            try {
                await userModel.deleteOne({email: defaultUser.email});
            } catch (error) {
                throw new Error(error.message);
            }
        });

        it('should validate that the `validationCode` is too short and return 400 ok', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    confirmationCode: '0000000003',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"confirmationCode\" length must be at least 40 characters long');
        });

        it('should validate that the `validationCode` is required and return 400 ok', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    confirmationCode: '',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"confirmationCode\" is not allowed to be empty');
        });

        it('should validate that the `validationCode` is required and return 400 ok', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    confirmationCode: '0000000001000000000100000000010000000001',
                });
            expect(res.status).toBe(200);
        });
    });
});
