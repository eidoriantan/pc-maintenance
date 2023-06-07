
import React from 'react';
import { Navigate } from 'react-router-dom';

class SignOut extends React.Component {
  render () {
    localStorage.removeItem('token');
    localStorage.removeItem('payload');
    return <Navigate to="/login" />;
  }
}

export default SignOut;
