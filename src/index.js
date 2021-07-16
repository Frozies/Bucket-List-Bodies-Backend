require('dotenv').config(); // Allows use of environmental variables from the .env file

const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const queryLogger = require('./plugins/queryLogger');

const CustomerResolvers = require("./resolvers/CustomerResolvers");
const OrderResolvers = require("./resolvers/OrderResolvers");
const UtilityResolvers = require("./resolvers/UtilityResolvers");
const schema = require('./schemas/RootSchema')


const server = new ApolloServer({
    typeDefs: schema,
    resolvers: [CustomerResolvers, OrderResolvers, UtilityResolvers],
    plugins: [
        queryLogger
    ]
});

let serverPort = process.env.SERVER_PORT || 4001;

server.listen({ port: serverPort }).then(() => {
    console.log(`
    🚀  Products Server is running!
    🔉  Listening on port ${serverPort}
    📭  Query at https://studio.apollographql.com
    `);
});

mongoose.connect(process.env.MONGODB, {useNewUrlParser: true, useUnifiedTopology: true}).then(r => {return r});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('MongoDB connected successfully')
});
