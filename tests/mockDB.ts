// @ts-ignore
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {ApolloServer} from "apollo-server-express";
import {rootResolvers} from "../src/resolvers/rootResolvers";
import {rootSchema} from "../src/schemas/rootSchema";
import {mongooseOpts} from "../src/utility/mongooseOpts";
import exp = require("constants");


let mongoServer: MongoMemoryServer;
let apolloServer: ApolloServer;

//todo: this can be its own utility file
let apolloConfig = {
    // @ts-ignore
    uploads: false,
    typeDefs: rootSchema,
    resolvers: rootResolvers,
}

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    console.log("Created in memory database")

    apolloServer = new ApolloServer(apolloConfig);
    console.log("Created Apollo server")

    module.exports = apolloServer;
});

module.exports.executeOperation = async (args: any) => {
    return await apolloServer.executeOperation({...args})
}

module.exports.connect = async () => {
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, mongooseOpts);
}

module.exports.getUri = async () => {
    return mongoServer.getUri();
}

after(async () => {
    // await mongoServer.disconnect();
    await mongoServer.stop();
});

