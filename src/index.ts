import {envChecker} from "./utility/envValidator";

require('dotenv').config(); // Allows use of environmental variables from the .env file

const express = require('express');
const { ApolloServer} = require('apollo-server-express');

const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require('mongoose');
import {rootSchema} from "./schemas/rootSchema";

const OrderResolvers = require('./resolvers/OrderResolvers')
const CustomerResolvers = require('./resolvers/CustomerResolvers')
const MealResolvers = require('./resolvers/MealResolvers')
const UtilityResolvers = require('./resolvers/UtilityResolvers')


async function startExpressApolloServer() {

        /*Check first if we have all of the required envVariables before starting*/
        try {
            const envVars = [
                'MONGODB',
                'STRIPE_SECRET_KEY',
                'CLOUDINARY_CLOUD_NAME',
                'CLOUDINARY_API_KEY',
                'CLOUDINARY_API_SECRET',
            ]
            envChecker(envVars)
        } catch (e) {
            throw (new Error('Error with your environmental variables. Please check the template or your configuration.'))
        }

        /*Connect to the database*/
        try {
            await mongoose.connect(process.env.MONGODB, {useNewUrlParser: true, useUnifiedTopology: true});

            const db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function() {
                console.log('MongoDB connected successfully')
            });
        } catch (e) {
            throw (new Error('Error connecting to the database: ' + e));
        }

        /*Spin up an apollo server instance*/
        let server;
        try {
            server = new ApolloServer({
                // @ts-ignore
                uploads: false,
                typeDefs: rootSchema,
                resolvers: [UtilityResolvers, MealResolvers, OrderResolvers, CustomerResolvers],
            });

            await server.start();
        } catch (e) {
            throw (new Error('Error starting Graphql server: ' + e))
        }

        /*Start the express server and apply middleware on the designated port*/
        try {
            const app = express();
            app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));
            server.applyMiddleware({ app });

            let serverPort = process.env.SERVER_PORT || 4001;
            new Promise((resolve) => app.listen({port: serverPort}, resolve));
            console.log(`
            🚀  Products Server is running!
            🔉  Listening on port ${serverPort}
            📭  Query at https://studio.apollographql.com
        `);
        } catch (e) {
            throw (new Error('Error starting express server: ' + e));
        }

}

/*Run the app*/
startExpressApolloServer();
