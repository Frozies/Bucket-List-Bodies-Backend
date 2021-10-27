
// @ts-ignore
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {ApolloServer} from "apollo-server-express";
import {rootResolvers} from "../src/resolvers/rootResolvers";
import {rootSchema} from "../src/schemas/rootSchema";
import {mongooseOpts} from "../src/utility/mongooseOpts";
require('dotenv').config(); // Allows use of environmental variables from the .env file



let mongoServer: any; /*: MongoMemoryServer*/
let apolloServer: ApolloServer;

//todo: this can be its own utility file
let apolloConfig = {
    // @ts-ignore
    uploads: false,
    typeDefs: rootSchema,
    resolvers: rootResolvers,
}

before(async () => {
    //todo: cleanup
    // mongoServer = await MongoMemoryServer.create();
    //    console.log("Created in memory database")

    //Server database
    // @ts-ignore
    mongoServer = await mongoose.connect(process.env.MONGODB, mongooseOpts);
    console.log("Connected to mongodb server")

    apolloServer = new ApolloServer(apolloConfig);
    console.log("Created Apollo server")

    module.exports = apolloServer;
});


//These are exports for use in test files. for example you may want to connect and disconnect from the DB for testing.
// TODO: add comments here
module.exports.executeOperation = async (args: any) => {
    return await apolloServer.executeOperation({...args})
}

module.exports.connect = async () => {
    // const uri = mongoServer.getUri();
    // @ts-ignore
    mongoServer = await mongoose.connect(process.env.MONGODB, mongooseOpts);

}

module.exports.disconnect = async () => {
    await mongoose.disconnect();
}

module.exports.getUri = async () => {
    return mongoServer.getUri();
}

after(async () => {
    //TODO: Clean up all test data from stripe.

    // await mongoServer.disconnect();
    await mongoServer.stop();
});