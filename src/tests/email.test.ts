import { Email } from '../components/email';

// tslint:disable-next-line:no-any
let promise: jest.Mock<any, any>;
const sendEmail = jest.fn();
jest.mock('aws-sdk', () => {
    return {
        SES: jest.fn(() => ({sendEmail})),
        config: {
            update: jest.fn(() => {}),
        },
    };
});

describe('## Email Component', () => {
    describe(`# Send emails via AWS SES service`, () => {

        beforeAll(() => {
            promise = jest.fn().mockReturnValue({MessageId: 'MessageId'});
            sendEmail.mockImplementation((params) => {
                return {promise};
            });
        });

        afterAll( () => {
            jest.clearAllMocks();
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
            promise = jest.fn().mockRejectedValue({code: 530, cfId: 12, message: 'Authentication required'});
            const res = await Email.confirmEmail('fullname', 'test8@dicky.world', 'confirmationcode');
            expect(res).toBe(false);
            done();
        });

        it('should throw the Error with `resetPassword` and console Temporary service failure', async (done) => {
            promise = jest.fn().mockRejectedValue({code: 451, cfId: 12, message: 'Temporary service failure'});
            const res = await Email.resetPassword('fullname', 'test8@dicky.world', 'resetcode');
            expect(res).toBe(false);
            done();
        });

    });
});
