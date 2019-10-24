import * as core from 'express-serve-static-core';
import * as request from 'supertest';
import { userModel } from '../models/user';
import { mockApp } from './app';
import {stopMongo} from './mongo';

const testUrl = '/login';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000002',
    email: 'test5@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
});

let app: core.Express;
describe('## Login', () => {
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

        it('should validate that the `email` and `password` is valid and return 200 ok', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test5@dicky.world',
                password: 'testPassword!',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toEqual('You are now logged-in');
            done();
        });

        it('should validate that the `email` and `password` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test5@dicky.world',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Incorrect email or password');
            done();
        });

        it('should validate that the `email` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test5@dicky',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"email\" must be a valid email');
            done();
        });

        it('should validate that the `password` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test5@dicky.world',
                password: 'short',
            });
            expect(res.status).toBe(400);
            expect(res.body[0].message).toEqual('\"password\" length must be at least 6 characters long');
            done();
        });

        it('should validate that the `password` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                email: 'test_new@dicky.world',
                password: 'testPassword!',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('You have not registered');
            done();
        });
    });
});
