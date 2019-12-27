import AWS = require('aws-sdk');
import * as dotenv from 'dotenv';
dotenv.config();

class Email {
  static confirmEmail = async (
    fullName: string,
    email: string,
    confirmationCode: string
  ) => {
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="background-color: #ebeced; padding: 30px; font-family: 'Helvetica Neue',Helvetica Neue,Helvetica,Arial,sans-serif;">
          <table style="width: 100%; max-width: 800px; border-collapse: collapse; margin: 0 auto; border-radius: 3px; overflow: hidden;">
          <tr><td style="background-color: white; padding: 50px 60px"><table style="width: 100%; color: #373d48">
          <tr><td><img src='https://i.imgur.com/RIcrIZw.png'></td></tr><tr><td style="font-size: 19px; font-weight: bold; padding-top: 40px">
              Confirm your ${process.env.SITE_NAME} account, ${fullName}
          </td><td></td></tr><tr><td colspan="2" style="padding-bottom: 20px">
          <hr style="border-top: 1px solid #ebeced" /></td></tr><tr>
          <td colspan="2" style="padding-bottom:24px; font-size: 14px; line-height: 24px;"><p>
              Hi ${fullName},
          </p><p>
              Please confirm your ${process.env.SITE_NAME} account by clicking click the button below. If you didn’t make the request, you can safely discard this email.
          </p></td></tr><tr><td colspan="2" style="width: 100%; text-align: center; background-color: #2581e3; border-radius: 3px;">
          <a href="${process.env.FRONT_END_URL}/confirm-email/${confirmationCode}" target="_blank" style="color: white; text-decoration: none; font-weight: bold; width: 100%; display: block; line-height: 45px">
              Confirm Email
          </a></td></tr><tr><td colspan="2" style="padding-top:24px; font-size: 12px; line-height: 2px;"><p>
              Or you can click the link below
          </p><p><a href="${process.env.FRONT_END_URL}/confirm-email/${confirmationCode}" style="color: #2581e3; text-decoration: none">
              ${process.env.FRONT_END_URL}/confirm-email/${confirmationCode}
          </a></p></td></tr></table></td></tr><tr><td style="background-color: #4f5a67; padding: 20px 60px;">
          <table style="color: white; width: 100%;"><tr><td style="font-size:11px">
              Control which emails you receive from ${process.env.SITE_NAME} by adjusting your settings.
          </td><td></td></tr><tr><td colspan="2" style="font-size:11px; color: #ffffff66">© 2019 ${process.env.SITE_NAME}.</td></tr><tr><td colspan="2" style="font-size:11px; color: #ffffff66">
          <a href="${process.env.FRONT_END_URL}/privacy" target="_blank" style="color: #ffffff66">Privacy Policy</a> | <a href="${process.env.FRONT_END_URL}/terms" target="_blank" style="color: #ffffff66">
          Terms of Service</a></td></tr></table></td></tr></table></body>
      </html>
      `;
      const params = {
        Destination: { ToAddresses: [email] },
        Message: {
          Body: { Html: { Charset: 'UTF-8', Data: html } },
          Subject: {
            Charset: 'UTF-8',
            Data: `Confirm your ${process.env.SITE_NAME} account, ${fullName}`,
          },
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Source: process.env.EMAIL_FROM,
      };
      const data = await new AWS.SES({ apiVersion: '2010-12-01' })
        .sendEmail(params)
        .promise();
      if (!data) return false;
      else return true;
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.error(err.message);
      return false;
    }
  };

  static resetPassword = async (
    fullName: string,
    email: string,
    resetCode: string
  ) => {
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="background-color: #ebeced; padding: 30px; font-family: 'Helvetica Neue',Helvetica Neue,Helvetica,Arial,sans-serif;">
        <table style="width: 100%; max-width: 800px; border-collapse: collapse; margin: 0 auto; border-radius: 3px; overflow: hidden;">
        <tr><td style="background-color: white; padding: 50px 60px"><table style="width: 100%; color: #373d48">
        <tr><td><img src='https://i.imgur.com/RIcrIZw.png'></td></tr><tr><td style="font-size: 19px; font-weight: bold; padding-top: 40px">
            Reset your ${process.env.SITE_NAME} password, ${fullName}
        </td><td></td></tr><tr><td colspan="2" style="padding-bottom: 20px">
        <hr style="border-top: 1px solid #ebeced" /></td></tr><tr>
        <td colspan="2" style="padding-bottom:24px; font-size: 14px; line-height: 24px;"><p>
            Hi ${fullName},
        </p><p>
            If you requested a password reset link, click the link below. If you didn’t make the request, you can safely discard this email.
        </p></td></tr><tr><td colspan="2" style="width: 100%; text-align: center; background-color: #2581e3; border-radius: 3px;">
        <a href="${process.env.FRONT_END_URL}/reset-password/${resetCode}/" target="_blank" style="color: white; text-decoration: none; font-weight: bold; width: 100%; display: block; line-height: 45px">
            Reset Email
        </a></td></tr><tr><td colspan="2" style="padding-top:24px; font-size: 12px; line-height: 2px;"><p>
            Or you can click the link below
        </p><p><a href="${process.env.FRONT_END_URL}/reset-password/${resetCode}/" style="color: #2581e3; text-decoration: none">
        ${process.env.FRONT_END_URL}/reset-password/${resetCode}/
        </a></p></td></tr></table></td></tr><tr><td style="background-color: #4f5a67; padding: 20px 60px;">
        <table style="color: white; width: 100%;"><tr><td style="font-size:11px">
            Control which emails you receive from ${process.env.SITE_NAME} by adjusting your settings.
        </td><td></td></tr><tr><td colspan="2" style="font-size:11px; color: #ffffff66">© 2019 ${process.env.SITE_NAME}.</td></tr><tr><td colspan="2" style="font-size:11px; color: #ffffff66">
        <a href="${process.env.FRONT_END_URL}/privacy" target="_blank" style="color: #ffffff66">Privacy Policy</a> | <a href="${process.env.FRONT_END_URL}/terms" target="_blank" style="color: #ffffff66">
        Terms of Service</a></td></tr></table></td></tr></table></body>
      </html>
      `;
      const params = {
        Destination: { ToAddresses: [email] },
        Message: {
          Body: { Html: { Charset: 'UTF-8', Data: html } },
          Subject: {
            Charset: 'UTF-8',
            Data: `Reset your ${process.env.SITE_NAME} password, ${fullName}`,
          },
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Source: process.env.EMAIL_FROM,
      };
      const data = await new AWS.SES({ apiVersion: '2010-12-01' })
        .sendEmail(params)
        .promise();
      if (!data) return false;
      else return true;
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.error(err.message);
      return false;
    }
  };
}

export { Email };
