// Configuring yoga graphQl server:

const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

function createServer() {
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: { Mutation, Query },
    // turned off to prevent some warning messages:
    resolverValidationOptions: { requireResolversForResolveType: false },
    // get access to DB inside of every request (query, mutation) to the server:
    context: req => ({...req, db}),
  });
}

module.exports = createServer;
