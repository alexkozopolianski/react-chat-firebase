import * as actions from './type';
import firebase from '../../firebase';


export const addMessage = (channel,newMessage) => async  (dispatch ) => {
    
    dispatch({ type: actions.SEND_MESSAGE});
    try {
        await firebase.database().ref('messages').child(channel.id).push().set(
            newMessage
                 )
              
                dispatch ({type: actions.SEND_SUCCESS});
        }
        
     catch(err){
        dispatch({ type: actions.SEND_MESSAGE_FAIL});
    }
}

export const fetchMessage  = (channelId) => async dispatch => {
    firebase.database().ref('messages').child(channelId).on("value", snap => {
      dispatch({
        type: actions.FETCH_MESSAGE,
        payload: snap.val()
      });
    });
  };