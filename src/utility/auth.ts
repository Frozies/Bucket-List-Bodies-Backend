import {AuthenticationError} from "apollo-server-express";
const { rule } = require('graphql-shield');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwksClient = require('jwks-rsa');

export const checkUserRole = (user: { role: any; }, allowableRoles: string | any[]) => {
    if (!user || !allowableRoles.includes(user.role)) {
        throw new AuthenticationError('Not authorized');
    }
    return true;
};

export const isAuthenticated = rule()(
    async (parent: any, args: any, ctx: { user: null; }) => {
        console.log('the user', ctx.user);
        return ctx.user !== null;
    }
);

//User authorized access scopes
export const hasScope = (requiredScope: string) =>
    rule()(async (parent: any, args: any, ctx: { user: { scope: string; }; }) => {
        try {
            const userScopes = ctx.user.scope.split(' ');
            console.log(
                'has scope',
                userScopes.includes(requiredScope)
            );

            return userScopes.includes(requiredScope);
        } catch (err) {
            console.log('the err', err);
        }
    });

export const createToken = (user: { role: any; _id: any; email: any; }) => {
    // Sign the JWT
    if (!user.role) {
        throw new Error('No user role specified');
    }
    return jwt.sign(
        {
            sub: user._id,
            email: user.email,
            role: user.role,
            iss: 'api.orbit',
            aud: 'api.orbit'
        },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
    );
};

export const hashPassword = (password: any) => {
    return new Promise((resolve, reject) => {
        // Generate a salt at level 12 strength
        bcrypt.genSalt(12, (err: any, salt: any) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err: any, hash: unknown) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

export const verifyPassword = (
    passwordAttempt: any,
    hashedPassword: any
) => {
    return bcrypt.compare(passwordAttempt, hashedPassword);
};

export const requireAdmin = (req: { user: { role: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => void) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'There was a problem authorizing the request'
        });
    }
    if (req.user.role !== 'admin') {
        return res
            .status(401)
            .json({ message: 'Insufficient role' });
    }
    next();
};

const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

export function getKey(header: { kid: any; }, callback: (arg0: null, arg1: any) => void) {
    client.getSigningKey(header.kid, function (error: any, key: { publicKey: any; rsaPublicKey: any; }) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}