export const queryLogger = {

    // Fires whenever a GraphQL request is received from a client.
    requestDidStart(requestContext: { request: { query: string; }; }) {
        console.log('Request started! Query:\n' +
            requestContext.request.query);

        return {

            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            parsingDidStart() {
                console.log('Parsing started!');
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            validationDidStart() {
                console.log('Validation started!');
            },

        }
    },
};

module.exports = queryLogger;