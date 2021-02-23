import * as actionTypes from './type';
import firebase from '../../firebase'

export const setUser = user => {
    return{
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER
    }
}

export const setCurrentChannel = channel =>{
    return{
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel
        }
    }
}

export const setPrivateChannel = isPrivateChannel => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel
        }
    }
}

export const setUserPosts = userPosts => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload: {
            userPosts
        }
    }
}

export const setColors = (primaryColor, secondaryColor) => {
    return {
        type: actionTypes.SET_COLORS,
        payload: {
            primaryColor,
            secondaryColor
        }
    }
}



export const fetchChannel = () => async dispatch => {
    firebase.database().ref('channels').on("value", snap => {
      dispatch({
        type: actionTypes.FETCH_CHANNEL,
        payload: snap.val()
      });
    });
  };

  export const addChannel = (key,newChannel) => async  (dispatch ) => {
    dispatch({ type: actionTypes.ADD_CHANNEL});
    try {
        await firebase.database().ref('channels').child(key)
        .update(newChannel)   
    } catch(err){
        dispatch({ type: actionTypes.ADD_CHANNEL_FAILED});
    }
}

export const starChannel = (user,channel) => async (dispatch) => {
    dispatch({ type: actionTypes.STARRED_CHANNEL});
    try {
        await firebase.database().ref('users').child(`${user.uid}/starred`)
        .update({
            [channel.id] : {
                name: channel.name,
                details: channel.details,
                createdBy: {
                    name: channel.createdBy.name,
                    avatar: channel.createdBy.avatar
                }
            }
        })  
    }
    catch(err){
        dispatch({type: actionTypes.STARRED_CHANNEL_FAILED})
    }
}

export const uploadImage = (blob,metadata,userRef,user) => async (dispatch) => {

        try {
            firebase.storage().ref().child(`avatars/user/${userRef.uid}`)
            .put(blob,metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                  changeAvatar(downloadURL)
                  userAvatarUpdated(userRef,downloadURL)
                })
            })
           
        }
        catch(err){
            dispatch({type: actionTypes.UPLOAD_IMAGE_ERROR})
        }

}


const userAvatarUpdated = (userRef,image)  => {
    firebase.database().ref('users').child(`${userRef.uid}`).update({ avatar: image})
}

const changeAvatar = (downloadURL)  => {
    firebase.auth().currentUser.updateProfile({
            photoURL: downloadURL
        })
}
