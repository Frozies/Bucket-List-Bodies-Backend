const OrderResolvers = require('./OrderResolvers')
const CustomerResolvers = require('./CustomerResolvers')
const ProductResolvers = require('./productResolvers')
const UtilityResolvers = require('./UtilityResolvers')
const AuthResolvers = require('./AuthResolvers')

export const rootResolvers = [UtilityResolvers, ProductResolvers, OrderResolvers, CustomerResolvers, AuthResolvers];