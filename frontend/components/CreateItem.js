import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';

import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(data: {
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price  
    }) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: 'dog.jpg',
    largeImage: 'large-dog.jpg',
    price: 0,
  };

  handleInputChange = e => {
    const { name, type, value } = e.target;
    const formattedValue = type === 'number' ? parseFloat(value): value;
    this.setState({ [name]: formattedValue });
  };

  /**
   * Uploads image to cloudinary
   */
  uploadFile = async e => {
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits'); // preset name for cloudinary

    const res = await fetch('https://api.cloudinary.com/v1_1/dgtodtly2/image/upload', {
      method: 'POST',
      body: data,
    });

    const file = await res.json();
    console.log(file);
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    });
  };

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
              onSubmit={async e => {
                e.preventDefault();
                // call mutation:
                const res = await createItem();
                // navigate the user to item page:
                Router.push({
                  pathname: '/item',
                  query: { id: res.data.createItem.id },
                });
              }}
          >

            {/* showing GQL error message: */}
            <ErrorMessage error={error} />

            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img src={this.state.image} alt="Upload preview" width="200px"/>
                )}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
                  onChange={this.handleInputChange}
                />
              </label>

              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };