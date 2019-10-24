import * as core from 'express-serve-static-core';
import jwt = require('jsonwebtoken');
import * as request from 'supertest';
import {Email} from '../components/email';
import { userModel } from '../models/user';
import { mockApp } from './app';
import {stopMongo} from './mongo';

const testUrl = '/register/resend-email';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001',
    email: 'test3@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});
let app: core.Express;

describe('## Register / Resend Email', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            app = await mockApp.then();
            await defaultUser.save();
            done();
        });

        afterAll(async (done) => {
            await userModel.deleteOne({email: defaultUser.email});
            jest.clearAllMocks();
            await stopMongo.then();
            done();
        });

        it('should validate that the `jwtToken` is valid and return 200 ok', async (done) => {
            Email.confirmEmail = jest.fn().mockReturnValue(true);
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF9.7G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
            });
            expect(res.status).toBe(200);
            done();
        });

        it('should validate that the `jwtToken` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF97G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
            });
            expect(res.status).toBe(400);
            done();
        });

        it('should validate that the `jwtToken` is invalid and return 400 error', async (done) => {
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'NiIsInR5XVCJ9.eym4NDI4MzF9.7G0zv3PmnocA',
            });
            expect(res.status).toBe(400);
            done();
        });

        it('should validate that the `jwtToken` is valid and not able to send Email with 400 error', async (done) => {
            Email.confirmEmail = jest.fn().mockReturnValue(false);
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF9.7G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
            });
            expect(res.status).toBe(400);
            done();
        });

        it('should validate that the `jwtToken` is valid and not able to send Email with 400 error', async (done) => {
            Email.confirmEmail = jest.fn().mockReturnValue(false);
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF9.7G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email not resent');
            done();
        });

        it('should validate that the `jwtToken` is Not valid and  with 400 error', async (done) => {
            jwt.verify = jest.fn().mockImplementation(() => {throw Error('Invalid Json Token Signature'); });
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'NiIsInR5XVCJ9.eym4NDI4MzF9.7G0zv3PmnocA',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid Token');
            done();
        });

        it('should validate that the `jwtToken` is valid and not able to send Email with 400 error', async (done) => {
            jwt.verify = jest.fn().mockImplementation(() => 'NiIsInR5XVCJ9.eym4NDI4MzF9.7G0zv3PmnocA');
            const res = await request(app).post(testUrl).set(headers).send({
                jwtToken: 'NiIsInR5XVCJ9.eym4NDI4MzF9.7G0zv3PmnocA',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid Token');
            done();
        });

    });
});
