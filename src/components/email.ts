import AWS = require('aws-sdk');
import * as dotenv from 'dotenv';
dotenv.config();

class Email {

  static confirmEmail = async (fullName: string, email: string, confirmationCode: string) => {
    AWS.config.update({
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      region: process.env.SES_REGION,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    });
    try {
      const html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
          <title>Confirm your ${process.env.SITE_NAME} account, ${fullName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F7F7F7; min-height: 100vh">
          <h1>Confirm your ${process.env.SITE_NAME} account<h1/>
          <hr/>
          Hi, ${fullName}.<br/>
          Please confirm your ${process.env.SITE_NAME} account by clicking this link:
          ${process.env.FRONT_END_URL}/confirm_email/${confirmationCode}/<br/>
          Once you confirm, you will have full access to ${process.env.SITE_NAME} and all future<br/>
          notifications will be sent to this email address.<br/><br/>
          - Team ${process.env.SITE_NAME}<br/><br/>
          Control which emails you receive from ${process.env.SITE_NAME} by adjusting your <a href='${process.env.FRONT_END_URL}/my/settings/'>settings.<a/>
        </body>
      </html>
      `;
      const params = {
        Destination: { ToAddresses: [email] },
        Message: { Body: { Html: { Charset: 'UTF-8', Data: html }},
        Subject: { Charset: 'UTF-8', Data: `Confirm your ${process.env.SITE_NAME} account, ${fullName}`} },
        ReplyToAddresses: [process.env.EMAIL_FROM], Source: process.env.EMAIL_FROM,
      };
      const data = await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
      if (!data) return false; else return true;
    } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err.message);
        return false;
    }
  };

  static resetPassword = async (fullName: string, email: string, resetCode: string) => {
    AWS.config.update({
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      region: process.env.SES_REGION,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    });
    try {
      const html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
          <title>Reset your ${process.env.SITE_NAME} password, ${fullName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F7F7F7; min-height: 100vh">
          <h1>Reset your ${process.env.SITE_NAME} password<h1/>
          <hr/>
          Hi, ${fullName}.<br/>
          If you requested a password reset link, click the link below. If you didn’t make the request, you can safely discard this email.
          ${process.env.FRONT_END_URL}/reset_password/${resetCode}/<br/><br/>
          - Team ${process.env.SITE_NAME}<br/><br/>
          Control which emails you receive from ${process.env.SITE_NAME} by adjusting your <a href='${process.env.FRONT_END_URL}/my/settings/'>settings.<a/>
        </body>
      </html>
      `;
      const params = {
        Destination: { ToAddresses: [email] },
        Message: { Body: { Html: { Charset: 'UTF-8', Data: html }},
        Subject: { Charset: 'UTF-8', Data: `Confirm your ${process.env.SITE_NAME} account, ${fullName}`} },
        ReplyToAddresses: [process.env.EMAIL_FROM], Source: process.env.EMAIL_FROM,
      };
      const data = await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
      if (!data) return false; else return true;
    } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err.message);
        return false;
    }
  };
}

export { Email };
