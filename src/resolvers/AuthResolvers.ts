import { hash, compare } from "bcryptjs";
import {createAccessToken, createRefreshToken, isAuth, sendRefreshToken} from "../utility/auth";
import {verify} from "jsonwebtoken";
const {userModel} = require('../models/CustomerModel')

export const AuthResolvers = {
    Query: {
        async me(parent: any, args: any, context: any) {
            const authorization = context.req.req.headers['authorization'];

            if (!authorization) {
                console.log("No auth")
                return null;
            }

            try {
                const token = authorization.split(" ")[1];
                const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
                return userModel.findOne(payload.userID);
            } catch (err) {
                console.log("Error @me: " + err);
                throw new Error("Error @me: " + err);
            }
        },

        async users() {
            return userModel.find();
        },
/*
        async bye(parent: any, args: any, context: any) {
            return isAuth(context, () => {
                return 'Your userID is: ' + context.req.req.payload.userID
            })
        },

        async hello() {
            return 'Hi!';
        }*/
    },

    Mutation: {
        async register(parent: any, args: any) {
            const hashedPassword = await hash(args.password, 12)

            try {
                await userModel.create({
                    email: args.email,
                    password: hashedPassword,
                })
            }
            catch (err) {
                console.log("Error registering new user: " + err);
                return false;
            }

            return true
        },

        async login(parent: any, args: any, context: any) {
          const user = await userModel.findOne({email: args.email}).select('+password');

          if (!user) {
              throw new Error('Could not find user!');
          }

          const validPassword = compare(args.password, user.password);

          if (!validPassword) {
              throw new Error('Invalid Password');
          }

          sendRefreshToken(context.req.res, createRefreshToken(user));

          return {
              accessToken: createAccessToken(user),
              user
          }
        },

        async revokeRefreshTokenForUser(parent: any, args: any) {
            await userModel.findOneAndUpdate(args.userID,{
                $inc: {
                    tokenVersion: 1
                }
            });
            return true
        },

        async logout(parent: any, args: any, context: any) {
          sendRefreshToken(context.req.res, "");
          return true;
        },
    }
}
module.exports = AuthResolvers;