import React, { Component } from 'react';
import App from './App';
import history from '../history';

class FakeRouter extends Component {
  componentDidMount() {
    // force an update if the URL changes
    history.listen(() => this.forceUpdate());
  }

  render() {
    return (
      <App />
    );
  }
}

export default FakeRouter;