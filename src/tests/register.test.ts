import * as bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import * as request from 'supertest';

import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(30000);
const baseTestUrl = '/api/visitor';

const defaultUser = new userModel({
    confirmationCode: '0000000000',
    email: 'test@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});
const newUser = new userModel({
    email: 'test2@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});

describe('## Visitor', () => {
    const testUrl = baseTestUrl + '/register';

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
                await userModel.deleteOne({email: newUser.email});
            } catch (error) {
                throw new Error(error.message);
            }
        });

        it('should validate that the `email` has already been registered and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky.world',
                    fullName: 'test user',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('You have already registered');
        });

        it('should validate that the `email` is required and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: '',
                    fullName: 'test user',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" is not allowed to be empty');
        });

        it('should validate that the `fullName` is required and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky.world',
                    fullName: '',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"fullName\" is not allowed to be empty');
        });

        it('should validate that the `password` is required and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky.world',
                    fullName: 'test user',
                    password: '',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"password\" is not allowed to be empty');
        });

        it('should validate that the `password` is longer than 5 charectors and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky.world',
                    fullName: 'test user',
                    password: 'short',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"password\" length must be at least 6 characters long');
        });

        it('should validate that the `fullName` is not longer than 30 charectors and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky.world',
                    fullName: 'fullNameIsTooLongAndShouldFailWithError',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"fullName\" length must be less than or equal to 30 characters long');
        });

        it('should validate that the `email` is not valid and throw 400 error', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test@dicky',
                    fullName: 'test user',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" must be a valid email');
        });

        it('should validate that the `newUser` is valid and return 200 ok', async () => {
            const res = await request(app)
                .post('/register')
                .set('Accept', 'application/json')
                .send({
                    email: 'test2@dicky.world',
                    fullName: 'test user',
                    password: 'testPassword!',
                });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('You are now registered');
            expect(res.body).toHaveProperty('jwtToken');
        });
    });

});
