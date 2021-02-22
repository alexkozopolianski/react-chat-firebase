import React from 'react';
import { Menu} from 'semantic-ui-react'
import UserPanel from './UserPanel'
import { connect } from 'react-redux';


import Channels from './Channels';
import DirectMessages from './DirectMessages'
import Starred from './Starred';

 


class Sidepanel extends React.Component {

  render() {
        const { currentUser, primaryColor } = this.props;

    return(
      <Menu size="large" inverted fixed='left' vertical style={{ background: primaryColor, fontSize: "1.2rem"}}>
        <UserPanel primaryColor={primaryColor} currentUser={currentUser}  />
        <Starred currentUser={currentUser} />
        <Channels currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
    </Menu>
    
    )
    }
}




const mapStateToProps = (state) => ({
    currentUser: state.auth.currentUser
  });

  export default connect(
    mapStateToProps)(Sidepanel);