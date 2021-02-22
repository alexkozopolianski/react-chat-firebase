import firebase from '../../firebase';
import * as actions from './type';

export const saveColors = (primary,secondary,user) => async  (dispatch ) => {
    
    dispatch({ type: actions.SAVE_COLOR});
    try {
        await firebase.database().ref('users').child(`${user.uid}/colors`)
        .push()
        .update({
            primary,
            secondary
        })
              
                dispatch ({type: actions.SEND_SUCCESS});
        }
        
     catch(err){
        dispatch({ type: actions.SAVE_COLOR_FAIL});
    }
}