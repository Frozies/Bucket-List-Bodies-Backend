const { and, or, rule, shield } = require("graphql-shield");

function checkPermission(user: { [x: string]: { permissions: string | any[]; }; }, permission: string) {
    if (user && user["https://spaceapi.com/graphql"]) {
        return user["https://spaceapi.com/graphql"].permissions.includes(
            permission
        );
    }
    return false;
}

const isAuthenticated = rule()((parent: any, args: any, {user}: any) => {
    return user !== null;
});

const canReadAnyUser = rule()((parent: any, args: any, {user}: any) => {
    return checkPermission(user, "read:any_user");
});

const canReadOwnUser = rule()((parent: any, args: any, {user}: any) => {
    return checkPermission(user, "read:own_user");
});

const isReadingOwnUser = rule()((parent: any, {id}: any, {user}: any) => {
    return user && user.sub === id;
});

export default shield({
    Query: {
        user: or(and(canReadOwnUser, isReadingOwnUser), canReadAnyUser),
        viewer: isAuthenticated
    }
});