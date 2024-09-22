import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showSubmitError: false,
      errorMessage: '',
      successMessage: '',
    };
  }

  onSubmitFailure = (errorMessage) => {
    this.setState({ showSubmitError: true, errorMessage });
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { username, email, password, confirmPassword } = this.state;

    // Simple validation
    if (password !== confirmPassword) {
      this.setState({ errorMessage: "Password and confirmation password do not match" });
      return;
    }

    if (password.length <= 4) {
      this.setState({ errorMessage: "Password is too short" });
      return;
    }

    // Post the data to the backend
    try {
      const response = await axios.post('http://localhost:3000/register', {
        username,
        email,
        password,
      });

      if (response.status === 200) {
        this.setState({
          successMessage: response.data.message,
          errorMessage: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      this.onSubmitFailure('An unexpected error occurred.');
    }
  };

  render() {
    const { username, email, password, confirmPassword, errorMessage, successMessage } = this.state;

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
        <form className='form-container' onSubmit={this.handleSubmit}>
          <img
            src="https://i.imgur.com/byX3w0N.png"
            className="login-website-logo-desktop-image"
            alt="website logo"
          />
          <div>
            <label className="input-label input-container" htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              className="username-input-field"
              value={username}
              onChange={this.handleChange}
              required
            />
          </div>
          <div>
            <label className="input-label input-container" htmlFor="Email">Email</label>
            <input
              type="email"
              name="email"
              className="username-input-field"
              value={email}
              onChange={this.handleChange}
              required
            />
          </div>
          <div>
            <label className='input-label input-container' htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              className="password-input-field"
              value={password}
              onChange={this.handleChange}
              required
            />
          </div>
          <div>
            <label className='input-label input-container' htmlFor="password">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="password-input-field"
              value={confirmPassword}
              onChange={this.handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">Sign Up</button>
          
          {/* Display error message if any */}
          {errorMessage && <p className="error-message">*{errorMessage}</p>}

          {/* Display success message */}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

          <Link to="/"> 
            <p style={{ color: 'green', fontFamily: 'Roboto', fontStyle:'oblique' }}>Go to Login Page</p>
          </Link>
        </form>
      </div>
    );
  }
}

export default SignupForm;
