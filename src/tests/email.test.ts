
import { Email } from '../components/email';

jest.setTimeout(50000);

describe('## Email Component', () => {
    describe(`# Send emails via AWS SES service`, () => {

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

    });
});
