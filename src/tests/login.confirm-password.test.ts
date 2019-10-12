import * as request from 'supertest';
import { userModel } from '../models/user';
import { app } from '../server';

jest.setTimeout(50000);
const testUrl = '/login/confirm-password';
const headers = ['Accept', 'application/json'];
const defaultUser = new userModel({
    confirmationCode: '0000000001000000000100000000010000000004',
    email: 'test7@dicky.world',
    fullName: 'test user',
    password: '$2b$10$sdo7.5u0tANjLx09q2hFBuLe/YfgO6aLFGWwu7CSVHEcvC.Cn4ARS',
    resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
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

        it('should validate that the `resetPasswordCode` is valid and return 200 ok', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    newPassword: 'test7@dicky.world',
                    resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toEqual('Password reset');
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `email` is too short and return 400 error', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    newPassword: 'test7@dicky.world',
                    resetPasswordCode: 'e0d22659bb727',
                });
                expect(res.status).toBe(400);
                expect(res.body[0].message).toEqual('\"resetPasswordCode\" length must be at least 39 characters long');
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `newPassword` is too short and return 400 error', async (done) => {
            try {
                const res = await request(app).post(testUrl).set(headers).send({
                    newPassword: 'short',
                    resetPasswordCode: 'e0da14ff211f3167f9a74085ba3d2f22659bb727',
                });
                expect(res.status).toBe(400);
                expect(res.body[0].message).toEqual('\"newPassword\" length must be at least 6 characters long');
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });
    });
});
