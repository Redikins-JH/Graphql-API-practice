const Query = require('./Query')
const Mutation = require('./Mutation')
const Type = require('./Type')
const Subscription = require('./Subscription')

const resolvers = {
  Query,
  Mutation,
  Subscription,
  ...Type
}

module.exports = resolvers
