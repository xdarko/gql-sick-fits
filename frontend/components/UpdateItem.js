import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';

import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';


const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(data: {
      id: $id
      title: $title
      description: $description
      price: $price  
    }) {
      id
      title
      description
      price
    }
  }
`;

class UpdateItem extends Component {
  // state will contain only updated fields:
  state = {};

  handleInputChange = e => {
    const { name, type, value } = e.target;
    const formattedValue = type === 'number' ? parseFloat(value): value;
    this.setState({ [name]: formattedValue });
  };

  onFormSubmit = async (e, updateItemMutation) => {
    e.preventDefault();
    
    const res = await updateItemMutation({
      variables: { id: this.props.id, ...this.state },
    });
  };

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>no item found for id {this.props.id}</p>
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.onFormSubmit(e, updateItem)}>
                  {/* showing GQL error message: */}
                  <ErrorMessage error={error} />

                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleInputChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleInputChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Enter a description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleInputChange}
                      />
                    </label>

                    <button type="submit">Save Changes</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
