import {envChecker} from "./utility/envValidator";
require('dotenv').config(); // Allows use of environmental variables from the .env file
const express = require('express');
const { ApolloServer} = require('apollo-server-express');
import cors from "cors";
import cookieParser from "cookie-parser";
const { graphqlUploadExpress } = require("graphql-upload");
const mongoose = require('mongoose');
import {rootSchema} from "./schemas/rootSchema";
import {rootResolvers} from "./resolvers/rootResolvers";
import {mongooseOpts} from "./utility/mongooseOpts";
import { verify } from "jsonwebtoken";
const {createAccessToken, createRefreshToken, sendRefreshToken} = require("./utility/auth");
const {userModel} = require('./models/CustomerModel');

// @ts-ignore
import { IsAuthenticatedDirective, HasRoleDirective, HasScopeDirective } from "graphql-auth-directives";
import {makeExecutableSchema} from "graphql-tools";

async function startExpressApolloServer() {

    /*Check first if we have all of the required envVariables before starting*/
    const envVars = [
        'MONGODB',
        'STRIPE_SECRET_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
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

    let schema = makeExecutableSchema({
        typeDefs: rootSchema,
        schemaDirectives: {
            isAuthenticated: IsAuthenticatedDirective,
            hasRole: HasRoleDirective,
            hasScope: HasScopeDirective
        },
        resolvers: rootResolvers,
    })

    let server = new ApolloServer({
        // @ts-ignore
        uploads: false,
        schema,
        context: ( req: any ) => {
            return req;
        }
    });

    await server.start();


    /*Start the express server and apply middleware on the designated port*/
    console.log("Starting Express")
    const app = express();
    app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));

   /* app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );*/

    app.use(cookieParser());

    app.get("/", (_req: any, res: { send: (arg0: string) => any; }) => res.send("hello"));

    app.post("/refresh_token", async (
        req: { cookies: { jid: any; }; },
        res: { send: (arg0: { ok: boolean; accessToken: any; }) => any; }) => {
        console.log("Refresh token!");

        const token = req.cookies.jid;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: "" });
        }

        // token is valid and
        // we can send back an access token
        const user = await userModel.findOne({ id: payload.userId });

        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: "" });
        }

        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user) });
    });

    server.applyMiddleware({ app });
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
