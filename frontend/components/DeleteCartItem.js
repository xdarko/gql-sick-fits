import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';

import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const RemoveButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

class DeleteCartItem extends Component {
  static propTypes = { id: PropTypes.string.isRequired };

  /**
   * Optimistically updates shopping cart after deleting the item
   * @param  {Object} cache   - apollo cache
   * @param  {Object} payload - result of the graphql request
   */
  updateCart = (cache, payload) => {
    // read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // remove item from the cart
    const removedItemId = payload.data.removeFromCart.id;
    data.currentUser.cart = data.currentUser.cart.filter(i => i.id !== removedItemId);
    // write the cart back to cache
    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data,
    });
  }

  render() {
    const { id } = this.props;

    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id }}
        update={this.updateCart}
        // create optimistic response to avoid waiting for the server:
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => {
          return (
            <RemoveButton
              title="Delete Item"
              disabled={loading}
              onClick={() => removeFromCart().catch(e => alert(e.message))}
            >
              &times;
            </RemoveButton>
          );
        }}
      </Mutation>
    );
  }
}

export default DeleteCartItem;
