import thunk from 'redux-thunk';
import {withRouter} from 'react-router';
import { applyMiddleware, createStore } from 'redux';
 import { reducer } from "./reducers/index";

 let store=createStore(reducer, applyMiddleware(thunk))

export default withRouter(store);