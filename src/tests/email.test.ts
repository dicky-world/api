
import { Email } from '../components/email';

jest.setTimeout(50000);

describe('## Visitor', () => {
    describe(`# Send an email`, () => {

        it('should validate that the `resetPasswordCode` is valid and return 200 ok', async (done) => {
            try {
                const res = await Email.confirmEmail('fullname', 'test8@dicky.world', 'confirmationcode');
                expect(res).toBe(true);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

        it('should validate that the `resetPasswordCode` is valid and return 200 ok', async (done) => {
            try {
                const res = await Email.resetPassword('fullname', 'test8@dicky.world', 'resetcode');
                expect(res).toBe(true);
            } catch (error) {
                throw new Error(error.message);
            } finally {
                done();
            }
        });

    });
});
