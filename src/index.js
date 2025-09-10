import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import configureStore from "./store/configureStore";
import { BrowserRouter as Router } from "react-router-dom";
import './styles/index.scss';
import 'antd/dist/antd.css';
import App from './containers/App';
import * as serviceWorker from './config/serviceWorker';

const initialState = window.initialReduxState;
const store = configureStore(initialState);

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
