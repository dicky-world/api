import * as bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import * as request from 'supertest';

import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(50000);

const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000003',
    email: 'test6@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
});

describe('## Visitor', () => {
    const testUrl = '/login/reset-password';

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

        it('should validate that the `email` is valid and return 200 ok', async () => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test6@dicky.world',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('Reset password email sent');
        });

        it('should validate that the `email` exists and return 400 error', async () => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test66@dicky.world',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('You need to register first');
        });

        it('should validate that the `email` exists and return 400 error', async () => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test60@dicky',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" must be a valid email');
        });
    });
});
