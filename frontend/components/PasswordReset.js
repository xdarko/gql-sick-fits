import React, { Component } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Form from './styles/Form';
import Error from './ErrorMessage';

import { CURRENT_USER_QUERY } from './User';

const PASSWORD_RESET_MUTATION = gql`
  mutation PASSWORD_RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

class PasswordReset extends Component {
  static propTypes = { resetToken: PropTypes.string };

  state = {
    password: '',
    confirmPassword: '',
  };

  onFieldChange = e => this.setState({ [e.target.name]: e.target.value });

  render () {
    return (
      <Mutation
        mutation={PASSWORD_RESET_MUTATION}
        variables={{ ...this.state, resetToken: this.props.resetToken }}
      >
        {(resetPassword, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await resetPassword();
              Router.push({ pathname: '/signup' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your password</h2>
              <Error error={error} />

              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onFieldChange}
                />
              </label>

              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={this.state.confirmPassword}
                  onChange={this.onFieldChange}
                />
              </label>
              
              <button type="submit">Reset Password!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default PasswordReset;
