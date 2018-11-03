import React from 'react';
import PropTypes from 'prop-types';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';

import DeleteCartItem from './DeleteCartItem';

const CartItemStyles = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3 {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  if (!cartItem.item) {
    return <CartItemStyles>This item has been removed</CartItemStyles>;
  }

  return (
    <CartItemStyles>
      <img
        src={cartItem.item.image}
        alt={cartItem.item.title}
        width="100"
      />
      <div className="cart-item-details">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {' - '}
          <em>{cartItem.quantity} &times; {formatMoney(cartItem.item.price)}</em>
        </p>
      </div>
      <DeleteCartItem id={cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.propTypes = { cartItem: PropTypes.object.isRequired };

export default CartItem;
