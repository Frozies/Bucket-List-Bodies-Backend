const {userModel} = require('../models/CustomerModel');

import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { Response } from "express";

export const createAccessToken = (user: typeof userModel) => {
    return sign({ userID: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: "15m"
    });
};

export const createRefreshToken = (user: typeof userModel) => {
    return sign(
        { userID: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: "7d"
        }
    );
};

export const isAuth = (context: any, next: any) => {
    const authorization = context.req.req.headers["authorization"];

    if (!authorization) {
        throw new Error("not authenticated");
    }

    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.req.req.payload = payload as any;

    } catch (err) {
        console.log(err);
        throw new Error("not authenticated");
    }

    return next();
};

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie("jid", token, {
        httpOnly: true,
        path: "/refresh_token"
    })
};