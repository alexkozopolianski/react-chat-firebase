import React from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react'
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index'


class ColorPanel extends React.Component {

    state = {
        modal: false,
        primary: '',
        secondary: '',
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        userColors: []
    }

    componentDidMount() {
        if (this.state.user){
            this.addListener(this.state.user.uid)
        }
    }

    componentWillUnmount(){
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
    }

    addListener = userId => {
        let userColors = [];
        this.state.usersRef
        .child(`${userId}/colors`)
        .on("child_added", snap => {
            userColors.unshift(snap.val());
            this.setState({ userColors})
        })
    }

    handleChangePrimary = color => this.setState({ primary: color.hex});
    handleChangeSecondary = color => this.setState({ secondary: color.hex})

    openModal = () => this.setState({modal: true});
    closeModal = () => this.setState({modal: false});

    handleSaveColors = () => {
        if (this.state.primary && this.state.secondary){
            this.saveColors(this.state.primary, this.state.secondary)
        }
    }

    saveColors = (primary, secondary) => {
        this.props.saveColors(primary,secondary,this.props.currentUser)
        .then(() => {
            this.closeModal();
        })
        .catch(err => console.error(err))

    }

    displayUserColor = colors => (
        colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div className="color__container" onClick={() => this.props.setColors(color.primary, color.secondary)}>
                    <div className="color__ square" style={{background: color.primary}}>
                        <div className="color__overlay" style={{background: color.secondary}}></div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    


    render(){
        const { modal, primary, secondary, userColors } = this.state
    return(
        <Sidebar
        as={Menu}
        icons="labeled"
        inverted
        vertical
        visible
        width="very thin"
        >
            <Divider />
            <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
            {this.displayUserColor(userColors)}
            <Modal basic open={modal} onClose={this.closeModal}>
               <Modal.Header>Choose App Color</Modal.Header>
               <Modal.Content>
                   <Segment inverted>
                 <Label content="Primary Color" />
                 <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
                 </Segment>

                 <Segment inverted>
                 <Label content="Secondary Color" />
                 <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                 </Segment>
               </Modal.Content>
                <Modal.Actions>
                  <Button color="green" inverted onClick={this.handleSaveColors}>
                   <Icon name="checkmark" /> Save Colors    
                  </Button> 
                  <Button color="red" inverted onClick={this.closeModal} >
                   <Icon name="remove" /> Cancel
                  </Button>   
                </Modal.Actions> 
            </Modal>
        </Sidebar>
    )
    }
}

const mapDispatchToProps = {
    setColors: actions.setColors,
    saveColors: actions.saveColors
}

export default connect(null, mapDispatchToProps)(ColorPanel);