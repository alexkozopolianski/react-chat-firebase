import * as actionTypes from '../actions/type';

const initialColorsState = {
    primaryColor: '#3977db',
    secondaryColor: '#eee'
}

export default  (state = initialColorsState, action) => {
    switch (action.type){
        case actionTypes.SET_COLORS:
            return{
                primaryColor: action.payload.primaryColor,
                secondaryColor: action.payload.secondaryColor
            }
        default:
            return state;
    }
}