
import './App.css';
import React from 'react';
import { Router, Route, Switch,BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { createBrowserHistory } from 'history';
import store from './store/store';
import Layout from './layouts/index';

import LOGIN from './views/login_component';
import DASHBOARD from './views/dashBoard'
import USER from './views/user_component'
import SHARE from './views/share_component';
const history = createBrowserHistory({forceRefresh:true});


function App() {
  return (
    <Provider store={store}>
        <Router history={history} >
          <main className="h-100 main">
          <BrowserRouter>
            <Switch> 
            <Route exact={true} path="/" render={() => (
                <>
                    <div className="mainContainer" >
                      <LOGIN/>
                    </div>
                </>
              )}/>
               <Route exact={true} path="/dashboard" render={() => (
                <>
                
                    <div className="mainContainer" >
                      <Layout/>
                      <DASHBOARD/>
                    </div>
                </>
              )}/>
               <Route exact={true} path="/user" render={() => (
                <>
                
                    <div className="mainContainer" >
                      <Layout/>
                      <USER/>
                    </div>
                </>
              )}/>
              <Route exact={true} path="/share" render={() => (
                <>
                
                    <div className="mainContainer" >
                      <Layout/>
                      <SHARE/>
                    </div>
                </>
              )}/>
            </Switch>
            <ToastContainer />
            </BrowserRouter>
          </main>
        </Router>
      </Provider>
  );
}

export default App;
