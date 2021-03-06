import React  from 'react';
import { connect } from 'react-redux';
import firebase from '../../firebase'
import * as actions from '../../store/actions/index';
import _ from "lodash";

import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react'

class Channels extends React.Component {
    state = {
        activeChannel: '',
        user: this.props.currentUser,
        channels: [],
        channel: null,
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
        typingRef: firebase.database().ref('typing'),
        modal: false,
        firstLoad: true
    };


    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.props.fetchChannel();
        this.state.channelsRef.on('child_added', snap =>{
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels }, () =>
            this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    };

    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }

    getNotificationCount = channel => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if (count > 0) return count;
    }

    handleNotifications = ( channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId);

        if(index !== -1){
            if (channelId !== currentChannelId){
                lastTotal = notifications[index].total;

                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        }else{
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }
        this.setState({ notifications})
    }

    removeListeners = () => {
        this.state.channelsRef.off();
        this.state.channels.forEach(channel => {
            this.state.messagesRef.child(channel.id).off();
        })
    };

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel})
        }
        this.setState({ firstLoad: false});
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };

        this.props.addChannel(key,newChannel).then(() => {
            this.setState({ channelName: '', channelDetails: ''});
            this.closeModal();   
        })
        .catch(err => {
            console.error(err);
        })
    }

       

    removeListeners = () => {
        this.state.channelsRef.off();
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .remove();
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel});
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id 
            === this.state.channel.id)

        if (index !== -1){
            let updateNotifications = [...this.state.notifications];
            updateNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updateNotifications[index].count = 0;
            this.setState({ notifications: updateNotifications});
        }
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id})
    }

   

    displayChannels () {
        const { channels } = this.props;
        const channel2 = _.map(channels, (channel) => {
          return  <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name} style={{opacity: 0.7}} 
            active={channel.id === this.state.activeChannel}
            >
                {this.getNotificationCount(channel) && (
                    <Label color='red'>{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name} <br/>
            </Menu.Item>
        });
        if (!_.isEmpty(channel2)) {
            return channel2;
          }
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChannel();
        }
    };

    isFormValid = ({ channelName, channelDetails}) => channelName && channelDetails;

    closeModal = () => this.setState({modal: false});
    openModal = () => this.setState({modal: true});

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    render(){
        const { channels, modal } = this.state;
    return(
        <React.Fragment>
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="exchange" /> CHANNELS 
                </span>{ " "}
                ({channels.length}) <Icon  name='add' onClick={this.openModal} />
            </Menu.Item>
            {this.displayChannels()}
        </Menu.Menu>
        
        <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Add a Channel</Modal.Header>
            <Modal.Content>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input fluid label="Name of Channel " name="channelName" onChange={this.handleChange}/>
                    </Form.Field>
                    <Form.Field>
                        <Input fluid label="About the Channel" name="channelDetails" onChange={this.handleChange} />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='green' inverted onClick={this.handleSubmit}>
                    <Icon name="checkmark"/>Add
                </Button>
                <Button color='red' inverted onClick={this.closeModal}>
                    <Icon name="remove"/>Cancel
                </Button>
            </Modal.Actions>
        </Modal>
        </React.Fragment>
    )
    }
}

const mapDispatchToProps = {
    addChannel: actions.addChannel,
    fetchChannel: actions.fetchChannel,
    setCurrentChannel: actions.setCurrentChannel,
    setPrivateChannel: actions.setPrivateChannel
}

const mapStateToProps = ({ channels }) => {
    return {
      channels
    };
  };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Channels);