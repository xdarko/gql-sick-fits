import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { CURRENT_USER_QUERY } from './User';

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`;

class Signout extends Component {
  render () {
    return (
      <Mutation
        mutation={SIGNOUT_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signout, { error, loading }) => (
          <button onClick={signout}>Sign Out</button>
        )}
      </Mutation>
    );

    // return (
    //   <Mutation
    //     mutation={SIGNIN_MUTATION}
    //     variables={this.state}
    //     refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    //   >
    //     {(signout, { error, loading }) => (
    //       <button>Sign Out</button>
    //     )}
    //   </Mutation>
    // );
  }
}

export default Signout;
