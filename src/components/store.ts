import AWS = require('aws-sdk');
import * as dotenv from 'dotenv';
dotenv.config();

class Store {
  static getSignedUrl = async (
    contentType: string,
    key: string,
    expires: number
  ) => {
    try {
      AWS.config.update({
        accessKeyId: process.env.SES_ACCESS_KEY_ID,
        region: process.env.SES_REGION,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
        useAccelerateEndpoint: true,
      });
      const data = new AWS.S3({ apiVersion: '2010-12-01' })
      .getSignedUrl('putObject', {
        Bucket: process.env.SES_BUCKET_NAME,
        ContentType: contentType,
        Expires: expires,
        Key: key,
      });
      if (!data) return false;
      else return data;
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error.message);
      return false;
    }
  };
}

export { Store };
