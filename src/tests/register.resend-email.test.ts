import * as request from 'supertest';
import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(50000);
const testUrl = '/register/resend-email';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001',
    email: 'test3@dicky.world',
    fullName: 'test user',
    password: 'testPassword!',
});

describe('## Register / Resend Email', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            await defaultUser.save();
            done();
        });

        afterAll(async (done) => {
            await userModel.deleteOne({email: defaultUser.email});
            done();
        });

        it('should validate that the `jwtToken` is valid and return 200 ok', async (done) => {
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
    });
});
