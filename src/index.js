import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

import registerServiceWorker from './registerServiceWorker';
import {Provider, connect} from 'react-redux';
import {compose,createStore,applyMiddleware} from 'redux';

import rootReducer from './store/reducers/index';
import 'semantic-ui-css/semantic.min.css';

import reduxThunk from "redux-thunk";

import { setUser, clearUser } from './store/actions/chatAction';

import firebase from './firebase';
import Spinner from './Spinner';
import { BrowserRouter as  Router, Route, Switch, withRouter } from 'react-router-dom';

import Login from './components/Auth/Login';
import App from './App';
import Register from './components/Auth/Register';

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.props.setUser(user);
        this.props.history.push("/");
      }
      else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    })
  }
  render(){
    return this.props.isLoading ? <Spinner/> :(
      

       <Switch>
          <Route exact path="/" component={App}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>

        </Switch>
    
    )
  }
    
}

const composeEnhancers =
  process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose;

const mapStateFromProps =  state => ({
  isLoading: state.auth.isLoading,
 
});

const RootWithAuth = withRouter(connect(
  mapStateFromProps, {setUser, clearUser})(Root));


const Store = createStore(rootReducer, composeEnhancers(
  applyMiddleware( reduxThunk )
));

ReactDOM.render(
  <Provider store={Store} >
<Router>
<RootWithAuth />
</Router>
</Provider>
, document.getElementById('root'));
registerServiceWorker();
