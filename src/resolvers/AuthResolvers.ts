import { hash, compare } from "bcryptjs";
import {createAccessToken, createRefreshToken, isAuth, sendRefreshToken} from "../utility/auth";
import {verify} from "jsonwebtoken";
const {customerModel} = require('../models/CustomerModel')

export const AuthResolvers = {
    Query: {
        async me(parent: any, args: any, context: any) {
            return customerModel.findOne({_id: context.user.userID});
        },

        async users() {
            return customerModel.find();
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
                await customerModel.create({
                    email: args.email,
                    password: hashedPassword,
                });
            }
            catch (err) {
                console.log("Error registering new user: " + err);
                return false;
            }

            return true
        },

        async login(parent: any, args: any, context: any) {
          const user = await customerModel.findOne({email: args.email}).select('+password');

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
            await customerModel.findOneAndUpdate(args.userID,{
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