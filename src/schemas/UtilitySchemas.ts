import { gql } from "apollo-server-express";

export const utilSchema = gql`
    scalar Date
    scalar Upload
    
    type UploadedFileResponse {
        filename: String!
        mimetype: String!
        encoding: String!
        url: String!
    }

    extend type Mutation {
        singleUpload(file: Upload!): UploadedFileResponse!
        multipleUpload (files: [Upload!]!): UploadedFileResponse!
    }
    
    type Address {
        city: String
        line1: String
        line2: String
        postal: Int
        state: String
    }
`;

module.exports = utilSchema;