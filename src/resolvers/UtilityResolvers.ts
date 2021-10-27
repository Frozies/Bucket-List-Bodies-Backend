// const {GraphQLDateTime} = require("graphql-iso-date/dist");
import { GraphQLUpload } from 'graphql-upload';
// @ts-ignore
import promisesAll from 'promises-all';

const processUpload = async (upload: PromiseLike<any>) => {
    const { filename, mimetype, createReadStream } = await upload;
    const stream = createReadStream();

    const cloudinary = require('cloudinary');
    cloudinary.config(
        {
            cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        }
    );

    let resultUrl = '', resultSecureUrl = '';
    const cloudinaryUpload = async ({stream}: any) => {
        try {
            await new Promise((resolve, reject) => {
                console.log("Promise " + stream)

                const streamLoad = cloudinary.v2.uploader.upload_stream(function (error: any, result: { secure_url: string; }) {
                    if (result) {
                        resultUrl = result.secure_url;
                        resultSecureUrl = result.secure_url;
                        resolve(resultUrl)
                    } else {
                        reject(error);
                    }
                });

                stream.pipe(streamLoad);
            });
        }
        catch (err) {
            throw new Error(`Failed to upload profile picture ! Err:${err.message}`);
        }
    };

    await cloudinaryUpload({stream});

    return(resultUrl)
};

export enum StatusCode {
    UNMADE = "UNMADE",
    MADE = "MADE",
    DELIVERED = "DELIVERED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED",
}

export const UtilityResolvers = {
    // Date: GraphQLDateTime
    Upload: GraphQLUpload,

    StatusCode: {
        UNMADE: StatusCode.UNMADE,
        MADE: StatusCode.MADE,
        DELIVERED: StatusCode.DELIVERED,
        CANCELED: StatusCode.CANCELED,
        REFUNDED: StatusCode.REFUNDED,
    },

    Mutation: {
        async singleFileUpload(parent: any, {file}: any) {
            return(processUpload(file))

        },
        async multipleFileUpload(parent: any, {files}: any) {
            const {resolve, reject} = await promisesAll.all(
                files.map(processUpload)
            );

            if (reject.length) {
                reject.forEach(
                    ({name, message}: any) => {
                        console.error(`${name}:${message}`)
                    }
                )
            }
            return resolve;
        },
    }
}
module.exports = UtilityResolvers;