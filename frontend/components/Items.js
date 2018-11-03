import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { perPage } from '../config';

import Item from './Item';
import Pagination from './Pagination';

/**
 * Fetches items
 * $skip - how many items should be skipped
 * $first - how many items to fetch
 * orderBy: createdAt_DESC - order by 'createdAt' field, new items go frist
 */
const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Center>
        <Pagination page={this.props.page} />
          <div>Items</div>
          <Query
            query={ALL_ITEMS_QUERY}
            // for example on page 1 skip 4 - 4 = 0 items
            // and show first 4 items (see default $first variable):
            variables={{ skip: this.props.page * perPage - perPage }}>
            {({ data, error, loading }) => {
              console.log(data)
              if (loading) return <p>Loading...</p>
              if (error) return <p>Error: {error.message}</p>
              return (
                <ItemsList>
                  {data.items.map(item => <Item key={item.id} item={item} />)}
                </ItemsList>
              );
            }}
          </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}

export default Items;
export { ALL_ITEMS_QUERY };