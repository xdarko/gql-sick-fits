// Connecting to remote Prisma DB for fetching the data using Prisma Binding:

const { Prisma } = require('prisma-binding');

const db = new Prisma({
  // use type defenitions automatically created by prisma:
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  // print queries to console:
  debug: true,
});

module.exports = db;
