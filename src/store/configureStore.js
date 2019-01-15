import { applyMiddleware, createStore, compose } from "redux";
import createSagaMiddleware from "redux-saga";

// Import the state interface and our combined reducers/sagas.
import { rootReducer, rootSaga } from "./index";

export default function configureStore(initialState) {
    // create the composing function for our middlewares
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    // create the redux-saga middleware
    const sagaMiddleware = createSagaMiddleware();

    // We'll create our store with the combined reducers/sagas, and the initial Redux state that
    // we'll be passing from our entry point.
    const store = createStore(
      rootReducer,
      initialState,
      composeEnhancers(applyMiddleware(sagaMiddleware)),
    );

    // Don't forget to run the root saga, and return the store object.
    sagaMiddleware.run(rootSaga);
    return store;
  }