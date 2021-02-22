import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';

import ColorPanel from './components/ColorPanel/ColorPanel';
import SidePanel from './components/SidePanel/SidePanel';
import Messages from './components/Message/Messages';
import MetaPanel from './components/MetaPanel/MetaPanel';


const App = (
  {currentUser, currentChannel, isPrivateChannel,userPosts,primaryColor,secondaryColor}
  ) => (

   <Grid  columns="equal" className="app" style={{ background: secondaryColor}}>
       <ColorPanel key={currentUser && currentUser.name} currentUser={currentUser}/>
       <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} primaryColor={primaryColor}/>
       <Grid.Column style={{ marginLeft: 320}}>
         <Messages key={currentChannel && currentChannel.id} currentChannel={currentChannel} currentUser={currentUser} isPrivateChannel={isPrivateChannel}/>
       </Grid.Column>
       <Grid.Column width={4}>
        <MetaPanel currentChannel={currentChannel} key={currentChannel && currentChannel.name} userPosts={userPosts} isPrivateChannel={isPrivateChannel} />
       </Grid.Column>
   </Grid>
)

const mapStateToProps = state => ({
 currentUser: state.auth.currentUser,
 currentChannel: state.chat.currentChannel ,
 isPrivateChannel: state.chat.isPrivateChannel,
 userPosts: state.chat.userPosts,
 primaryColor: state.colors.primaryColor,
 secondaryColor: state.colors.secondaryColor
})

export default connect(mapStateToProps)(App);
