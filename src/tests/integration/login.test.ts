import * as bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import * as request from 'supertest';

import { userModel } from '../../models/user';
import { app } from '../../server';

jest.setTimeout(30000);

const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000002',
    email: 'test12@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
});

describe('## Visitor', () => {
    const testUrl = '/login';

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

        it('should validate that the `email` and `password` is valid and return 200 ok', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    email: 'test12@dicky.world',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('You are now logged-in');
        });

        it('should validate that the `email` and `password` is invalid and return 400 error', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    email: 'test12@dicky.world',
                    password: 'wrongpassword',
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Incorrect email or password');
        });

        it('should validate that the `email` is invalid and return 400 error', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    email: 'test12@dicky',
                    password: 'wrongpassword',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" must be a valid email');
        });

        it('should validate that the `password` is invalid and return 400 error', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    email: 'test12@dicky.world',
                    password: 'short',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"password\" length must be at least 6 characters long');
        });

        it('should validate that the `password` is invalid and return 400 error', async () => {
            const res = await request(app)
                .post(testUrl)
                .set('Accept', 'application/json')
                .send({
                    email: 'test_new@dicky.world',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('You have not registered');
        });

    });
});
