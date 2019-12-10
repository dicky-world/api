import AWS = require('aws-sdk');
import * as dotenv from 'dotenv';
dotenv.config();
AWS.config.update({
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  region: process.env.SES_REGION,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  useAccelerateEndpoint: true,
});
const s3 = new AWS.S3({ apiVersion: '2010-12-01' });

class Store {
  static getSignedUrl = async (
    contentType: string,
    key: string,
    expires: number
  ) => {
    try {
      const data = s3.getSignedUrl('putObject', {
        Bucket: 'img.dicky.world',
        ContentType: contentType,
        Expires: expires,
        Key: key,
      });
      if (!data) throw new Error('S3 Failed to provide signed URL');
      console.log(data);
      return data;
    } catch (error) {
      throw new Error('S3 Error 1' + error);
    }
  };

  static deleteObject = async (keyToDelete: string) => {
    try {
      const data = s3.deleteObject(
        {
          Bucket: 'img.dicky.world',
          Key: keyToDelete,
        },
        (err) => {
          if (err) throw new Error('S3 Failed to delete image');
        }
      );
      return data;
    } catch (error) {
      throw new Error('S3 Error 2' + error);
    }
  };
}

export { Store };
