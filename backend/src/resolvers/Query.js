// Public API queries go here
// Here we have access to prisma DB queries via ctx.db.query (check createServer.js to see context config)
// Express 'req' and 'res' available via 'ctx.request' and 'ctx.response'

const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  /* --------------- ITEMS QUERIES --------------- */
  /* --------------------------------------------- */

  async items(parent, args, ctx, info) {
    const items = await ctx.db.query.items(args, info);
    return items;
  },

  async item(parent, args, ctx, info) {
    const item = await ctx.db.query.item(args);
    return item;
  },

  async itemsConnection(parent, args, ctx, info) {
    const result = await ctx.db.query.itemsConnection(args, info);
    return result;
  },

  /* --------------- USERS QUERIES --------------- */
  /* --------------------------------------------- */

  async currentUser(parent, args, ctx, info) {
    // check if ID was passed via http request:
    if (!ctx.request.userId) return null;

    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info);
  },

  async users(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error('Please log in');

    // check if the user has permissions to query all the users:
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    // query all the users:
    return ctx.db.query.users({}, info);
  },

  /* --------------- ORDERS QUERIES --------------- */
  /* ---------------------------------------------- */
  async order(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error('Please log in');

    // find the order:
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);

    // check if the user has permissions to see the order:
    const isUserOwnsOrder = order.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.includes('ADMIN');
    
    if (!isUserOwnsOrder || !hasPermission) {
      throw new Error('You can\'t see this order');
    }

    return order;
  },

  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) throw new Error('Please log in');

    return ctx.db.query.orders({
      where: {
        user: { id: userId },
      },
    }, info);
  }
};

module.exports = Query;


/* ------------------------------------------------------------------------------

  If query our custom query is exactly the same as Prisma's auto generated one,
  we can forward this query directly to Prisma's DB using 'forwardTo' binding function:
  
  const { forwardTo } = require('prisma-binding');
  const Query = {
    items: forwardTo('db'),
  }

*/