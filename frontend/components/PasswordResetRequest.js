import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Form from './styles/Form';
import Error from './ErrorMessage';

import { CURRENT_USER_QUERY } from './User';

const PASSWORD_RESET_REQUEST_MUTATION = gql`
  mutation PASSWORD_RESET_REQUEST_MUTATION($email: String!) {
    requestPasswordReset(email: $email) {
      message
    }
  }
`;

class PasswordResetRequest extends Component {
  state = { email: '' };

  onFieldChange = e => this.setState({ [e.target.name]: e.target.value });

  render () {
    return (
      <Mutation
        mutation={PASSWORD_RESET_REQUEST_MUTATION}
        variables={this.state}
      >
        {(requestPasswordReset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await requestPasswordReset();
              this.setState({ email: '' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>
              <Error error={error} />
              {!error && !loading && called && (
                <p>Check your email for reset link!</p>
              )}

              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.onFieldChange}
                />
              </label>
              
              <button type="submit">Request a reset!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default PasswordResetRequest;
