import React from 'react';
import PasswordReset from '../components/PasswordReset';

const PasswordResetPage = props => (
  <div>
    <PasswordReset resetToken={props.query.resetToken} />
  </div>
);

export default PasswordResetPage;
