
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import Header from '../Header';
import './style.scss';

class Login extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      error: '',
      signingin: false
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleInput (event) {
    const target = event.target;
    const state = this.state;
    state[target.name] = target.value;
    this.setState(state);
  }

  async handleLogin (event) {
    event.preventDefault();

    const form = event.target;
    this.setState({
      error: '',
      signingin: true
    });

    const data = {
      username: this.state.username,
      password: this.state.password
    };

    const response = await axios.post(form.action, data);
    if (response.data.success) {
      const token = response.data.token;
      const payload = window.atob(token.split('.')[1]);
      localStorage.setItem('token', token);
      localStorage.setItem('payload', payload);

      const navigate = this.props.navigate;
      navigate('/');
    } else {
      this.setState({
        signingin: false,
        error: response.data.message
      });
    }
  }

  render () {
    return (
      <React.Fragment>
        <Header />

        <main>
          <form action="/api/accounts/login" method="post" className="login-form box mx-auto mt-4 p-4" onSubmit={this.handleLogin}>
            <h4>Log In</h4>

            <div className="form-group mb-2">
              <label htmlFor="login-username">Username:</label>
              <input type="text" id="login-username" name="username" value={this.state.username} autoComplete="username" onChange={this.handleInput} />
            </div>

            <div className="form-group mb-2">
              <label htmlFor="login-password">Password:</label>
              <input type="password" id="login-password" name="password" value={this.state.password} autoComplete="current-password" onChange={this.handleInput} />
            </div>

            { this.state.error !== '' && <div className="box box-error d-block mb-2">{ this.state.error }</div> }

            <div className="form-actions">
              <button type="submit" className="btn btn-block" disabled={this.state.signingin}>
                { this.state.signingin ? 'Signing In' : 'Sign In' }
              </button>
            </div>
          </form>
        </main>
      </React.Fragment>
    );
  }
}

Login.propTypes = {
  navigate: PropTypes.func.isRequired
};

export default function LoginWrap (props) {
  const navigate = useNavigate();
  return <Login {...props} navigate={navigate} />;
}
