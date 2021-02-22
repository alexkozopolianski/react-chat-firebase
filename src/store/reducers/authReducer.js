import * as actionTypes from '../actions/type';

const initialState = {
  error: null,
  currentUser: null,
 isLoading: true,
  loading: false,
  /*verifyEmail: {
    error: null,
    loading: false,
  },*/
  
 
  
};

// HELPER FUNCTIONS

const authStart = state => {
  return { ...state, loading: true };
};

const authEnd = state => {
  return { ...state, loading: false };
};

const authFail = (state, payload) => {
  return { ...state, error: payload };
};

const authSuccess = state => {
  return { ...state, error: false };
};

const currentUserSucces = (state,payload) => {
  return { ...state,  currentUser: payload.currentUser,
    isLoading: false}
}

const clearUser = state => {
  return{...state,isLoading: false }
}








const cleanUp = state => {
  return {
    ...state,
    error: null,
    loading: false,
    verifyEmail: {
      ...state.verifyEmail,
      loading: false,
      error: null,
    },
    
    deleteUser: {
      ...state.deleteUser,
      loading: false,
      error: null,
    },
  };
};

export default (state = initialState, { type, payload,action }) => {
  switch (type) {
    case actionTypes.CLEAN_UP:
      return cleanUp(state);

    case actionTypes.AUTH_START:
      return authStart(state);

    case actionTypes.AUTH_END:
      return authEnd(state);

    case actionTypes.AUTH_FAIL:
      return authFail(state, payload);

    case actionTypes.AUTH_SUCCESS:
      return authSuccess(state);

    case actionTypes.SET_USER:
        return currentUserSucces(state,payload)
    case actionTypes.CLEAR_USER:
        return clearUser(state)
         

  

   

   

    

    default:
      return state;
  }
};
