import * as actionTypes from '../actions/type';

const initialState = {
    currentUser: null,
    isLoading: true
     
};

export default   (state = initialState, action ) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            };
        case actionTypes.CLEAR_USER:
            return {
              ...state,
              isLoading: false
            }
        default:
            return state;
    }
}



