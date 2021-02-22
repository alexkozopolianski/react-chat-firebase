import * as actions from './type';
import firebase from '../../firebase';
import md5 from 'md5';




// Sign up action creator
export const signUp = (email,password,username) => async (
  dispatch,
  getState,
  { getFirebase }
) => {
  
  dispatch({ type: actions.AUTH_START });
  try {
     await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(createdUser => {
        createdUser.user.updateProfile({
          displayName: username,
          photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
        })
      })

    // Send the verfication email
    const user = firebase.auth().currentUser;
    await user.sendEmailVerification();

    
      
    dispatch({ type: actions.AUTH_SUCCESS });
  } catch (err) {
    dispatch({ type: actions.AUTH_FAIL, payload: err.message });
  }
  dispatch({ type: actions.AUTH_END });
};

// Logout action creator
export const signOut = () => async (dispatch, getState) => {
  
  try {
    await firebase.auth().signOut();
  } catch (err) {
    console.log(err.message);
  }
};

// Login action creator
export const signIn = (email,password) => async (dispatch, getState) => {
  
  dispatch({ type: actions.AUTH_START });
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    dispatch({ type: actions.AUTH_SUCCESS });
  } catch (err) {
    dispatch({ type: actions.AUTH_FAIL, payload: err.message });
  }
  dispatch({ type: actions.AUTH_END });
};

// Clean up messages
export const clean = () => ({
  type: actions.CLEAN_UP,
});







