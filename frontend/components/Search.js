import React, { Component } from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

// Query for items where title or description contains search term
const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm },
          { description_contains: $searchTerm }
        ]
      }) {
      id
      image
      title
    }
  }
`;

/**
 * Navigate to item's page whe it gets seleceted in the dropdown
 */
function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  });
}

/**
 * Manually runs search queries via ApolloConsumer
 */
class Autocomplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  onChange = debounce(async (e, client) => {
    this.setState({ loading: true });

    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value },
    });
    
    this.setState({ items: res.data.items, loading: false });
  }, 350);

  render() {
    resetIdCounter(); // fix aria-labelledby warning from downshift when using SSR

    return (
      <SearchStyles>
        <Downshift onChange={routeToItem} itemToString={item => !item ? '' : item.title}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {(client) => (
                  <input
                    {...getInputProps({
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      },
                      type: 'search',
                      placeholder: 'Search for an item',
                      className: this.state.loading ? 'loading' : '',
                    })}
                  />
                )}
              </ApolloConsumer>

              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img src={item.image} alt={item.title} width="50" />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!this.state.items.length && !this.state.loading && (
                    <DropDownItem>Nothing found for {inputValue}</DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}  
        </Downshift>
      </SearchStyles>
    );
  }
}

export default Autocomplete;
