// const {GraphQLDateTime} = require("graphql-iso-date/dist");
import { AWSS3Uploader } from '../lib/uploaders/s3';
require('dotenv').config(); // Allows use of environmental variables from the .env file

const s3Uploader = new AWSS3Uploader({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    destinationBucketName: 'bucket-list-bodies'
});

export const UtilityResolvers = {
    // Date: GraphQLDateTime

    Mutation: {
        singleUpload: s3Uploader.singleFileUploadResolver.bind(s3Uploader),
        multipleUpload: s3Uploader.multipleUploadsResolver.bind(s3Uploader)
    }

    /*
    * TODO: Stripe Queries
    * TODO: Mutations
    * TODO: Find existing customer for stripe
    */
}
module.exports = UtilityResolvers;