require('dotenv').config(); // Allows use of environmental variables from the .env file

const express = require('express');
const { ApolloServer} = require('apollo-server-express');

const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require('mongoose');
import {rootSchema} from "./schemas/RootSchema";
import {queryLogger} from "./plugins/queryLogger";

const OrderResolvers = require('./resolvers/OrderResolvers')
const CustomerResolvers = require('./resolvers/CustomerResolvers')
const MealResolvers = require('./resolvers/MealResolvers')
const UtilityResolvers = require('./resolvers/UtilityResolvers')


async function startExpressApolloServer() {
        /*await connect.then(() => {
            console.log("Connected 🚀 To MongoDB Successfully");
        });*/

        mongoose.connect(process.env.MONGODB, {useNewUrlParser: true, useUnifiedTopology: true});

        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
            console.log('MongoDB connected successfully')
        });

        const server = new ApolloServer({
            // @ts-ignore
            uploads: false,
            typeDefs: rootSchema,
            resolvers: [UtilityResolvers, MealResolvers, OrderResolvers, CustomerResolvers],
        });

        await server.start();

        const app = express();
        app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));
        server.applyMiddleware({ app });

        let serverPort = process.env.SERVER_PORT || 4001;

        await new Promise((resolve) => app.listen({port: serverPort}, resolve));
        console.log(`
            🚀  Products Server is running!
            🔉  Listening on port ${serverPort}
            📭  Query at https://studio.apollographql.com
        `);

}

startExpressApolloServer();

/*

const express = require('express');
// @ts-ignore
const { ApolloServer, gql } = require('apollo-server-express');

async function startApolloServer() {
    // Construct a schema, using GraphQL schema language
    const typeDefs = gql`
        type Query {
            hello: String
        }
    `;

    // Provide resolver functions for your schema fields
    const resolvers = {
        Query: {
            hello: () => 'Hello world!',
        },
    };

    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    const app = express();
    server.applyMiddleware({ app });

    await new Promise(resolve => app.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    return { server, app };
}
startApolloServer();*/
