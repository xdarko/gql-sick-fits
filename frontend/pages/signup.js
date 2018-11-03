import React from 'react';
import Signup from '../components/Signup';
import Signin from '../components/Signin';
import PasswordResetRequest from '../components/PasswordResetRequest';
import styled from 'styled-components';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const SignupPage = props => (
  <Columns>
    <Signup />
    <Signin />
    <PasswordResetRequest />
  </Columns>
);

export default SignupPage;
