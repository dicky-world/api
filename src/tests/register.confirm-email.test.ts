import * as request from 'supertest';
import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(50000);
const testUrl =  '/register/confirm-email';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000001',
    email: 'test4@dicky.world',
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

        it('should validate that the `validationCode` is too short and return 400 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    confirmationCode: '0000000003',
                });
                expect(res.status).toBe(400);
                expect(res.body[0].message).toEqual('\"confirmationCode\" length must be at least 40 characters long');
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `validationCode` is required and return 400 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    confirmationCode: '',
                });
                expect(res.status).toBe(400);
                expect(res.body[0].message).toEqual('\"confirmationCode\" is not allowed to be empty');
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `validationCode` is required and return 200 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    confirmationCode: '0000000001000000000100000000010000000001',
                });
                expect(res.status).toBe(200);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });


        // make a user that has already confoirmed with this confirmationo code 
        // it('should validate that the `validationCode` is required and return 200 ok', async (done) => {
        //     try {
        //         const res = await request(app).post(testUrl).set(headers).send({
        //             confirmationCode: '0000000001000000000100000000010000000001',
        //         });
        //         expect(res.status).toBe(200);
        //     } catch (error) {
        //         throw new Error(error.message);
        //     } finally {
        //         done();
        //     }
        // });

        it('should validate that the `validationCode` is invalid and return 200 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    confirmationCode: '0000000001000000000100000000010000000099',
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
