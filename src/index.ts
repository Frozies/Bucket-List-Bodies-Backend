import {envChecker} from "./utility/envValidator";
require('dotenv').config();
const express = require('express');
const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require('mongoose');
import {rootSchema} from "./schemas/rootSchema";
import {rootResolvers} from "./resolvers/rootResolvers";
import {mongooseOpts} from "./utility/mongooseOpts";
import {permissions} from "./permissions";
import {getKey} from "./utility/auth";
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');

async function startExpressApolloServer() {

    /*Check first if we have all of the required envVariables before starting*/
    const envVars = [
        'MONGODB',
        'STRIPE_SECRET_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'AUTH0_AUDIENCE',
        'AUTH0_DOMAIN'
    ]
    console.log("Checking envVars")
    envChecker(envVars)

    /*Connect to the database*/
    console.log("Connecting to MongoDB")
    try {
        await mongoose.connect(process.env.MONGODB, mongooseOpts);

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
            console.log('MongoDB connected successfully')
        });
    } catch (e) {
        console.log(e)
    }

    /*Spin up an apollo server instance*/
    console.log("Starting Apollo")
    const schema = applyMiddleware(
        makeExecutableSchema({
            typeDefs: rootSchema,
            resolvers: rootResolvers
        }),
        permissions
    );

    let server = new ApolloServer({
        // @ts-ignore
        uploads: false,
        typeDefs: rootSchema,
        resolvers: rootResolvers,
        schema,
        context: async (req: any) => {
            try {
                const token = req.headers.authorization;

                if (!token) {
                    return { user: null };
                }

                const authResult = new Promise((resolve, reject) => {
                    jwt.verify(
                        token.slice(7),
                        getKey,
                        {
                            audience: process.env.API_IDENTIFIER,
                            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                            algorithms: ['RS256']
                        },
                        (error: any, decoded: unknown) => {
                            if (error) {
                                reject({ error });
                            }
                            if (decoded) {
                                resolve(decoded);
                            }
                        }
                    );
                });

                const decoded = await authResult;

                return {
                    user: decoded,
                    userId:
                    // @ts-ignore
                        decoded[`${process.env.AUTH0_JWT_NAMESPACE}/sub`]
                };
            } catch (err) {
                console.log(err);
                return { user: null };
            }
        }
    });

    await server.start();


    /*Start the express server and apply middleware on the designated port*/
    console.log("Starting Express")
    const app = express();
    app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));
    server.applyMiddleware({ app });
    server.schema;

    let serverPort = process.env.SERVER_PORT || 4001;
    new Promise((resolve) => app.listen({port: serverPort}, resolve));

    console.log(`
        🚀  Products Server is running!
        🔉  Listening on port ${serverPort}
        📭  Query at https://studio.apollographql.com
        `);
}

/*Run the app*/
startExpressApolloServer();
