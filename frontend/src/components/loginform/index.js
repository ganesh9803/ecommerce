import React, { Component } from 'react';
import Cookies from 'js-cookie';
import './index.css';
import withRouter from '../withRouter'; // Import the withRouter component
import { Link, Navigate } from 'react-router-dom';


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showSubmitError: false,
      errorMsg: '',
    };
  }

  onSubmitSuccess = (jwtToken) => {
    const { router } = this.props;
    const { navigate } = router; // Use navigate from router
    Cookies.set('jwt_token', jwtToken, { expires: 30 });
    navigate('/'); // Use navigate instead of history.replace
  };

  onSubmitFailure = (errorMsg) => {
    this.setState({ showSubmitError: true, errorMsg });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    const userDetails = { username, password };
    const url = 'http://localhost:3000/login_token'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        this.onSubmitSuccess(data.jwt_token);
      } else {
        this.onSubmitFailure(data.error_msg);
      }
    } catch (error) {
      console.error('Error:', error);
      this.onSubmitFailure('An unexpected error occurred.');
    }
  };

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Navigate to ="/" />
    }
    const { showSubmitError, errorMsg } = this.state;
    return (
      <div className="login-form-container">
        <img
          src="https://i.imgur.com/byX3w0N.png"
          className="login-website-logo-mobile-image"
          alt="website logo"
        />
        <img
          src="https://i.imgur.com/BRNMFxu.jpeg"
          className="login-image"
          alt="website login"
        />
        <form className="form-container" onSubmit={this.handleSubmit}>
          <img
            src="https://i.imgur.com/byX3w0N.png"
            className="login-website-logo-desktop-image"
            alt="website logo"
          />
          <div>
            <label className="input-label input-container" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="username-input-field"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </div>
          <div>
            <label className="input-label input-container" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="password-input-field"
              value={this.state.password}
              onChange={this.handleChange}
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
          <Link to="/signup"> <p style={{ color: 'green', fontFamily: 'Roboto', fontstyle:'oblique' }}>Create Account</p>
          </Link>
        </form>
      </div>
    );
  }
}

export default withRouter(Login);
