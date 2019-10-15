import AWS = require('aws-sdk');
import * as sinon from 'sinon';
import { Email } from '../components/email';

let sinonSandbox: sinon.SinonSandbox;
let promise: sinon.SinonStub;

describe('## Email Component', () => {
    describe(`# Send emails via AWS SES service`, () => {

        beforeAll(() => {
            sinonSandbox = sinon.createSandbox();
            promise = sinon.stub().returns({MessageId: 'MessageId'});
            const aws = sinonSandbox.stub(AWS, 'SES').withArgs(sinon.match.object);
            aws.returns({ sendEmail: () => ({promise})});
        });

        afterAll( () => {
            sinonSandbox.restore();
        });

        it('should validate that the `confirmEmail` send an email and return 200 ok', async (done) => {
            const res = await Email.confirmEmail('fullname', 'test8@dicky.world', 'confirmationcode');
            expect(res).toBe(true);
            done();
        });

        it('should validate that the `resetPassword`sends an email and return 200 ok', async (done) => {
            const res = await Email.resetPassword('fullname', 'test8@dicky.world', 'resetcode');
            expect(res).toBe(true);
            done();
        });

        it('should throw the Error with `confirmEmail` and console Authentication required', async (done) => {
            promise = sinon.stub().throwsException({code: 530, cfId: 12, message: 'Authentication required'});
            const res = await Email.confirmEmail('fullname', 'test8@dicky.world', 'confirmationcode');
            expect(res).toBe(false);
            done();
        });

        it('should throw the Error with `resetPassword` and console Temporary service failure', async (done) => {
            promise = sinon.stub().throwsException({code: 451, cfId: 12, message: 'Temporary service failure'});
            const res = await Email.resetPassword('fullname', 'test8@dicky.world', 'resetcode');
            expect(res).toBe(false);
            done();
        });

    });
});
