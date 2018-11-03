import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

import { LOCAL_CART_STATE_QUERY } from '../components/Cart';

/**
 * Creating and configuring Apollo cilent
 * @param  {Object} headers - http headers
 */
function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include', // include cookies
        },
        headers,
      });
    },
    // Local browser data:
    clientState: {
      // resolvers for handing client mutations:
      resolvers: {
        Mutation: {
          toggleCart(_, variables, client) {
            // read the cartOpen value from the cache:
            const { cartOpen } = client.cache.readQuery({
              query: LOCAL_CART_STATE_QUERY
            });
            // write new cart state to the cache:
            const data = {
              data: { cartOpen: !cartOpen },
            };
            client.cache.writeData(data);
            return data;
          }
        }
      },
      // default client state:
      defaults: {
        cartOpen: false,
      },
    },
  });
}

export default withApollo(createClient);
