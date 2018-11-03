import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;


class DeleteItem extends Component {
  /**
   * Runs after mutation successfully completed
   * @param  {Object} cache   - apollo client cache
   * @param  {Object} payload - response of the mutation
   */
  update = (cache, payload) => {
    // manually update on the client, so it's matches the server
    // 1. read the client cache (by using graphql query) and find deleted item:
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    // 2. filter deleted item out of the page:
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    // put filtered items back to cache:
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: data });
  };

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
        {(deleteItem, { error }) => {
          return (
            <button
              onClick={() => {
                if (confirm('Are you sure you wanted to dete this item?')) {
                  deleteItem().catch(e => alert(e.message));
                }
              }}>
              {this.props.children}
            </button>
          );
        }}
      </Mutation>
    );
  }
}

export default DeleteItem;
