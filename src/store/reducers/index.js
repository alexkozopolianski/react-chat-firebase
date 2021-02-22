import { combineReducers } from 'redux';


import authReducer from './authReducer';
import colorsReducer from './colorReducer';
import chatReducer from './chatReducer';
import dataReducer from './dataReducer';
import channelReducer from './channelReducer';


const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  channels: channelReducer,
  colors: colorsReducer,
  data: dataReducer
});

export default rootReducer;
