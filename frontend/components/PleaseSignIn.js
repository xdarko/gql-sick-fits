import React from 'react';
import { Query } from 'react-apollo';
import Signin from './Signin';

import { CURRENT_USER_QUERY } from './User';

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading...</p>;
      if (!loading && !data.currentUser) {
        return (
          <div>
            <p>Please Sign In</p>
            <Signin />
          </div>
        );
      }
      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
