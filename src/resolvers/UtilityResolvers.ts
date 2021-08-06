// const {GraphQLDateTime} = require("graphql-iso-date/dist");
import { AWSS3Uploader } from '../lib/uploaders/s3';
import { GraphQLUpload } from 'graphql-upload';

const s3MealPhotoUploader = new AWSS3Uploader({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    destinationBucketName: 'bucket-list-bodies/meals'
});

export const UtilityResolvers = {
    // Date: GraphQLDateTime
    /*Upload: GraphQLUpload,

    Mutation: {
        singleUpload: s3MealPhotoUploader.singleFileUploadResolver.bind(s3MealPhotoUploader),
        multipleUpload: s3MealPhotoUploader.multipleUploadsResolver.bind(s3MealPhotoUploader)
    }*/

    Query: {
        helloWorld() {
            return "Hello World!"
        }
    }

    /*
    * TODO: Stripe Queries
    * TODO: Mutations
    * TODO: Find existing customer for stripe
    */
}
module.exports = UtilityResolvers;