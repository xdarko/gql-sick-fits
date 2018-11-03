// Public API mutations go here
// Here we have access to prisma's DB mutations via ctx.db.mutation (check createServer.js to see context config)

const sgMail = require('@sendgrid/mail');
const stripe = require('../stripe');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { hasPermission } = require('../utils');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const randomBytesPromisified = promisify(randomBytes);

const Mutations = {
  /* --------------- ITEMS MUTATIONS --------------- */
  
  async createItem(parent, args, ctx, info) {
    // check if the user is logged in:
    if (!ctx.request.userId) throw new Error('You must be logged in');
    
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args.data,
        user: {
          connect: { id: ctx.request.userId }, // <- create relation to the user
        },
      },
    }, info); // <- info contains the data, that needs to be returned after request

    return item;
  },

  async updateItem(parent, args, ctx, info) {
    // take a copy of item update without id, since we don't need to update id:
    const updates = { ...args.data };
    delete updates.id;
    // run the update with prisma's mutation:
    const item = await ctx.db.mutation.updateItem({
      data: updates,
      where: { id: args.data.id },
    }, info); // <- return requested response data

    return item;
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    
    // find the item,
    // instead of passing info, pass raw graphql to get response data:
    const item = await ctx.db.query.item(
      { where },
      '{ id title user { id } }' // <- get item user id as well
    );
    
    // check if the user owns that item or have permissions to delete:
    const isUserOwnsItem = item.user.id === ctx.request.userId;
    const isHasPermissions = ctx.request.user.permissions.some(permission => {
      return ['ADMIN', 'ITEMDETELE'].includes(permission);
    });

    if (!isUserOwnsItem && !isHasPermissions) {
      throw new Error('You don\'t have permission to delete that item!' )
    }
    
    // delete the item:
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  /* --------------- USERS MUTATIONS --------------- */

  async signup(parent, args, ctx, info) {
    // lowercase user's email:
    args.email = args.email.toLowerCase();
    
    // hash the password:
    const password = await bcrypt.hash(args.password, 10);
    
    // create the user in the DB:
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }, // set 'user' permission
      },
    }, info);

    // create JWT token:
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set jwt as a cookie on the response:
    ctx.response.cookie('token', token, {
      httpOnly: true, // make cookie unaccessable for javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // return the user in the response:
    return user;
  },

  async signin(parent, { email, password } , ctx, info) {
    // check if the user exists:
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error('Unable to login with provided credentials');

    // check if password is correct:
    const isPwdValid = await bcrypt.compare(password, user.password);
    if (!isPwdValid) throw new Error('Unable to login with provided credentials');

    // generate jwt:
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set the cookie:
    ctx.response.cookie('token', token, {
      httpOnly: true, // make cookie unaccessable for javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });
     
    // return the user:
    return user;
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbuye!' };
  },

  async requestPasswordReset(parent, args, ctx, info) {
    // Check if this is a real user:
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error('Wrong credentials provided');

    // Set a reset token and expiry on that user:
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });

    // Send an email with reset token to the user:
    const email = {
      to: user.email,
      from: 'sick-fits@example.com',
      subject: 'Password Reset',
      templateId: 'd-ac6bd119df7349db93fb3d04cab6787b',
      dynamic_template_data: {
        name: user.name,
        resetToken,
      }
    };
    sgMail.send(email);

    return { message: 'Password reset initiated' };
  },

  async resetPassword(parent, args, ctx, info) {
    // Check if the passwords match:
    if (args.password !== args.confirmPassword) {
      throw new Error('Password don\'t match');
    }

    // Check if reset token is legit, check if reset token is expired:
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired');
    }
    
    // Hash a new password:
    const password = await bcrypt.hash(args.password, 10);

    // Save new password:
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { password, resetToken: null, resetTokenExpiry: null },
    });
    
    // Genereate and set JWT to cookie:
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true, // make cookie unaccessable for javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // Return the user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) throw new Error('Please log in');

    const currentUser = await ctx.db.query.user({
      where: { id: ctx.request.userId },
    }, info);

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser({
      data: {
        permissions: { set: args.permissions },
      },
      where: { id: args.userId },
    }, info);
  },

  /* --------------- CART MUTATIONS --------------- */

  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) throw new Error('Please log in');

    // query the user's current cart:
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    // check if the item is already in the cart, increment quantity if it is:
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      }, info);
    }
    // otherwise create a new cart item:
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
    }, info);
  },

  async removeFromCart(parent, args, ctx, info) {
    // find the cart item:
    const cartItem = await ctx.db.query.cartItem({
      where: { id: args.id },
    }, '{ id, user { id } }');
    if (!cartItem) {
      throw new Error('No cart item found');
    }
    // make sure that the user owns that item:
    if (cartItem.user.id !== ctx.request.userId) throw new Error('Not your cart!');
    // delete cart item:
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info);
  },

  /* --------------- CART MUTATIONS --------------- */

  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) throw new Error('Please log in');

    // query the current user:
    const user = await ctx.db.query.user(
      { where: { id: userId }, },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item { title price id description image }
        }
      }`
    );

    // recalculate the total for the price:
    const amount = user.cart.reduce((tally, cartItem) => {
      return tally + cartItem.item.price * cartItem.quantity;
    }, 0)

    // create the stripe charge:
    const charge = await stripe.charges.create({
      source: args.token,
      currency: 'USD',
      amount,
    });

    // convert the CartItems to OrderItems:
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: {
          connect: { id: userId }
        },
      };
      delete orderItem.id;
      return orderItem;
    });

    // create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems }, // create an array of items
        user: { connect: { id: userId } }
      },
    });

    // clear the user's cart, delete cart items
    const cartItemsIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemsIds },
    });

    // send the order to the client
    return order;
  },
};

module.exports = Mutations;
