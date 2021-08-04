declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SERVER_PORT: number;
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            PWD: string;
            MONGODB: string;
            STRIPE_SECRET_KEY: string;
            S3_ACCESS_KEY_ID: string;
            S3_ACCESS_SECRET_KEY: string;
            S3_DESTINATION_BUCKET_NAME: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}