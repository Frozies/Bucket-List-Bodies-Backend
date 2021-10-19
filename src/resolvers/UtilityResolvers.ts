// const {GraphQLDateTime} = require("graphql-iso-date/dist");
import { GraphQLUpload } from 'graphql-upload';
// @ts-ignore
import promisesAll from 'promises-all';
import {createToken, hashPassword, verifyPassword} from "../utility/auth";
import {ApolloError, UserInputError} from "apollo-server-express";
const User = require('../models/User');
const jwtDecode = require('jwt-decode');


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

    Query: {
        users: async (parent: any, args: any, context: any) => {
            // checkUserRole(context.user, ['admin']);
            try {
                return await User.find()
                    .lean()
                    .select('_id firstName lastName avatar bio');
            } catch (err) {
                return err;
            }
        },
        user: async (parent: any, args: any, context: any) => {
            // checkUserRole(context.user, ['user', 'admin']);
            try {
                const { userId } = context;
                return await User.findOne({ _id: userId })
                    .lean()
                    .select('_id firstName lastName role avatar bio');
            } catch (err) {
                return err;
            }
        },
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

        login: async (parent: any, args: any) => {
            try {
                const { email, password } = args;

                const user = await User.findOne({
                    email
                }).lean();

                if (!user) {
                    throw new UserInputError(
                        'Wrong email or password'
                    );
                }

                const passwordValid = await verifyPassword(
                    password,
                    user.password
                );

                if (passwordValid) {
                    const { password, bio, ...rest } = user;
                    const userInfo = Object.assign({}, { ...rest });

                    const token = createToken(userInfo);

                    const decodedToken = jwtDecode(token);
                    const expiresAt = decodedToken.exp;

                    return {
                        message: 'Authentication successful!',
                        token,
                        userInfo,
                        expiresAt
                    };
                } else {
                    throw new UserInputError(
                        'Wrong email or password'
                    );
                }
            } catch (err) {
                return err;
            }
        },
        signup: async (parent: any, args: any) => {
            try {
                const {
                    firstName,
                    lastName,
                    email,
                    password
                } = args;

                const hashedPassword = await hashPassword(password);

                const userData = {
                    email: email.toLowerCase(),
                    firstName,
                    lastName,
                    password: hashedPassword,
                    role: 'admin'
                };

                const existingEmail = await User.findOne({
                    email: userData.email
                }).lean();

                if (existingEmail) {
                    throw new ApolloError('Email already exists');
                }

                const newUser = new User(userData);
                const savedUser = await newUser.save();

                if (savedUser) {
                    const token = createToken(savedUser);
                    const decodedToken = jwtDecode(token);
                    const expiresAt = decodedToken.exp;

                    const {
                        _id,
                        firstName,
                        lastName,
                        email,
                        role
                    } = savedUser;

                    const userInfo = {
                        _id,
                        firstName,
                        lastName,
                        email,
                        role
                    };

                    return {
                        message: 'User created!',
                        token,
                        userInfo,
                        expiresAt
                    };
                } else {
                    throw new ApolloError(
                        'There was a problem creating your account'
                    );
                }
            } catch (err) {
                return err;
            }
        },
        updateUserRole: async (parent: any, args: any, context: any) => {
            // checkUserRole(context.user, ['user', 'admin']);
            try {
                const { userId } = context;
                const { role } = args;
                const allowedRoles = ['user', 'admin'];

                if (!allowedRoles.includes(role)) {
                    throw new ApolloError('Invalid user role');
                }
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { role }
                );
                return {
                    message:
                        'User role updated. You must log in again for the changes to take effect.',
                    user: updatedUser
                };
            } catch (err) {
                return err;
            }
        },

    }
}
module.exports = UtilityResolvers;