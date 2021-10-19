const {hasScope, isAuthenticated} = require("./utility/auth");
const { shield } = require('graphql-shield');

export const permissions = shield({
    Query: {
        user: hasScope('read:user'),
    },
    Mutation: {
        updateUserRole: hasScope('edit:user'),
    }
});