import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import User from './User';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';

import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

// Local query for fetching cart displaying state:
const LOCAL_CART_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const LOCAL_TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

// Compose multiple render prop components into single render prop component:
const ComposedData = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={LOCAL_TOGGLE_CART_MUTATION}>{render}</Mutation>,
  cartState: ({ render }) => <Query query={LOCAL_CART_STATE_QUERY}>{render}</Query>,
});

const Cart = () => (
  <ComposedData>
    {({ user, toggleCart, cartState }) => {
      const currentUser = user.data.currentUser;
      const cartOpen = cartState.data.cartOpen;

      if (!currentUser) return null;
      return (
        <CartStyles open={cartOpen}>
          <header>
            <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
            <Supreme>{currentUser.name}'s Cart</Supreme>
            <p>You have {currentUser.cart.length} Items in your cart</p>
          </header>

          <ul>
            {currentUser.cart.map(cartItem => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </ul>

          <footer>
            <p>{formatMoney(calcTotalPrice(currentUser.cart))}</p>
            <TakeMyMoney>
              <SickButton>Checkout</SickButton>
            </TakeMyMoney>
          </footer>
        </CartStyles>
      );
    }}
  </ComposedData>
);

export default Cart;
export { LOCAL_CART_STATE_QUERY, LOCAL_TOGGLE_CART_MUTATION };
