import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FakeRouter from './components/FakeRouter';
import { configureUrlQuery } from "react-url-query";

import history from "./history";

// link the history used in our app to url-query so it can update the URL with it.
configureUrlQuery({ history });


ReactDOM.render(<FakeRouter />, document.getElementById('root'));
