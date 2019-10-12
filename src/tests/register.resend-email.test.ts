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

describe('## Visitor', () => {
    describe(`# POST ${testUrl}`, () => {

        beforeAll(async (done) => {
            try {
                await defaultUser.save();
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        afterAll(async (done) => {
            try {
                await userModel.deleteOne({email: defaultUser.email});
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `jwtToken` is valid and return 200 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF9.7G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
                });
                expect(res.status).toBe(200);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `jwtToken` is invalid and return 400 error', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQGRpY2t5LndvcmxkIiwiaWQiOiI1ZGExMjhjZTEwZDhlMzZiNzlkN2YzZmIiLCJpYXQiOjE1NzA4NDI4MzF97G0zv3Pgey__oT-8SuurKlWYrilqnIv772yG3pmnocA',
                });
                expect(res.status).toBe(400);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `jwtToken` is invalid and return 400 error', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    jwtToken: 'NiIsInR5XVCJ9.eym4NDI4MzF9.7G0zv3PmnocA',
                });
                expect(res.status).toBe(400);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });
    });
});
