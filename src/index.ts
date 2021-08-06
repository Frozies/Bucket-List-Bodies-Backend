// @ts-ignore
require('dotenv').config(); // Allows use of environmental variables from the .env file

const {ApolloServer} = require('apollo-server-express');
const express = require('express');
const {graphqlUploadExpress} = require('graphql-upload');
const mongoose = require('mongoose');

const {rootSchema} = require('./schemas/rootSchema');

const OrderResolvers = require('./resolvers/OrderResolvers');
const CustomerResolvers = require('./resolvers/CustomerResolvers');
const MealResolvers = require('./resolvers/MealResolvers');
const UtilityResolvers = require('./resolvers/UtilityResolvers');

const {queryLogger} = require('./plugins/queryLogger')


async function startExpressApolloServer() {
    try {
        /*await connect.then(() => {
            console.log("Connected 🚀 To MongoDB Successfully");
        });*/

        // @ts-ignore
        mongoose.connect(process.env.MONGODB, {useNewUrlParser: true, useUnifiedTopology: true});

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
            console.log('MongoDB connected successfully')
        });


        const server = new ApolloServer({
            // @ts-ignore
            uploads: false,
            typeDefs: [
                rootSchema
            ],
            resolvers: [
                UtilityResolvers
/*                UtilityResolvers,
                MealResolvers,
                OrderResolvers,
                CustomerResolvers*/
            ],
            plugins: [
                // @ts-ignore
                queryLogger
            ],

        });

        await server.start();
        const app = express();

        app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));
        server.applyMiddleware({ app });

        let serverPort = process.env.SERVER_PORT || 4001;

        // @ts-ignore
        await new Promise((resolve) => app.listen({port: serverPort}, resolve));
        console.log(`
            🚀  Products Server is running!
            🔉  Listening on port ${serverPort}
            📭  Query at https://studio.apollographql.com
        `);


    } catch (err) {
        console.error(err);
    }

}

startExpressApolloServer();

