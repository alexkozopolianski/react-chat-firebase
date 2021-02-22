import React from 'react';
import { Segment, Comment} from 'semantic-ui-react'
import firebase from '../../firebase';
import { connect } from 'react-redux'

import _ from "lodash";

import * as actions from '../../store/actions/index';

import MessagesHeader from './MessagesHeader';
import Message from './Message';
import Message2 from './Message2';
import MessageForm from './MessageForm';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends React.Component{
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref('messages'),
        messages: [],
        channel: this.props.currentChannel,
        isChannelStarred: false,
        user: this.props.currentUser,
        ProgressBar: false,
        usersRef: firebase.database().ref('users'),
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('info/connected'),
        listeners: []
    }

    componentDidMount(){
        const { channel, user, listeners} = this.state;


        if(channel && user){
            this.removeListeners(listeners);
            this.addListeners(channel.id);
            this.addUserStarsListener(channel.id, user.uid); 
        }
    }

    componentWillUnmount(){
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event)
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.messagesEnd){
            this.scrollToBottom();
        }
    }

    addToListeners = (id,ref,event) => {
        const index = this.state.listeners.findIndex(listener =>{
            return listener.id === id && listener.ref === ref && listener.event ===
            event;
        })

        if (index === -1){
            const newListener = {id,ref,event};
            this.setState({ listeners: this.state.listeners.concat(newListener)});
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth'});
    }

    addUserStarsListener = (channelId, userId) => {
        
        this.state.usersRef
        .child(userId)
        .child("starred")
        .once("value")
        .then(data => {
            if (data.val() !== null){
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId);
                this.setState({ isChannelStarred: prevStarred})
            }
        })

    }


    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    }


    starChannel = () => {
        if (this.state.isChannelStarred){
            this.props.starChannel(this.props.currentUser,this.props.currentChannel)
        } else{
            this.state.usersRef.child(`${this.state.user.uid}/starred`).child(this.state.channel.id)
            .remove(err => {
                if (err !== null) {
                    console.error(err);
                }
            })
        }
    }

    addListeners = channelId => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);

    }

    addTypingListeners = channelId => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if (snap.key !== this.state.user.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers})
            }
        });
        this.addToListeners(channelId,this.state.typingRef, 'child_added');

        this.state.typingRef.child(channelId).on('child_removed', snap => {
           const index = typingUsers.findIndex(user => user.id === snap.key);
           if (index !== -1){
               typingUsers = typingUsers.filter(user => user.id !== snap.key);
               this.setState({ typingUsers})
           } 
        });
        this.addToListeners(channelId,this.state.typingRef, 'child_removed');

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true){
                this.state.typingRef
                .child(channelId)
                .child(this.state.user.uid)
                .onDisconnect()
                .remove(err => {
                    if (err !== null){
                        console.error(err);
                    }
                })
            }
        })
    }

    addMessageListener = channelId => {
      let loadedMessages = [];
      this.props.fetchMessage(channelId);
      const ref = this.getMessagesRef()
     ref.child(channelId).on('child_added', snap => {
          loadedMessages.push(snap.val());
          this.setState({
              messages: loadedMessages,
              messagesLoading: false
          });
          this.countUniqueUsers(loadedMessages);
          this.countUserPosts(loadedMessages);
      })  
      this.addToListeners(channelId,ref, 'child_added');
    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc){
                acc[message.user.name].count += 1;
            }else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            
            return acc;
            
        }, {});
        this.props.setUserPosts(userPosts)
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers});
    }

    displayMessages = (messages) =>(
        
        messages.length > 0 && messages.map(message => (
            <Message 
            key={message.timestamp}
            message={message}
            user={this.state.user}
            />
        ))
    )

    displayMessages2 (searchMessage) {
        
        const { data } = this.props;
        const message = _.map(data, (value, key) => {
          return <Message key={key} key={key} message={value} user={this.props.currentUser} />;
        });
        if (!_.isEmpty(message)) {
            return message;
          }
         
    }

    isProgressBarVisible = percent => {
        if (percent > 0){
            this.setState({ProgressBar:true});
        }
    }

    handleSearchChange = e => {
        this.setState({
            searchTerm: e.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const  data2 = _.values(this.props.data);
       const regex = new RegExp(this.state.searchTerm, 'gi');
       
      const searchResults = data2.reduce((acc,message) =>{
           if (message.content && message.content.match(regex) ||
            message.user.name.match(regex)){
               acc.push(message);
           }
           return acc;
       }, []); 
       this.setState({ searchResults});
       setTimeout(() => this.setState({ searchLoading: false}), 1000);
    }

    displayChannelName = channel =>{
         return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` :
         '';
    }

    displayTypingUsers = users => (
       users.length > 0 && 
       users.map(user => (
        <div style={{ display: 'flex', alignItems: "center", marginBottom: '0.2em' }}
        key={user.id}>
        <span className="user__typing">{user.name} is typing</span> <Typing />
        </div>
       )) 
    )

    displayMessageSkeleton = loading => (
        loading == false ? (
            <React.Fragment>
                {[...Array(3)].map((_,i) => (
                    <Skeleton key={i} />
                ))}
            </React.Fragment>
        ) : null
    )

    render(){
        const { messagesRef,  channel, user,progressBar, numUniqueUsers,
            searchResults,searchTerm,searchLoading, privateChannel, isChannelStarred,typingUsers} = this.state;
    return(
        <React.Fragment>
            <MessagesHeader channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers} handleSearchChange={this.handleSearchChange}
             searchLoading={searchLoading} isPrivateChannel={privateChannel} handleStar={this.handleStar} isChannelStarred={isChannelStarred}/>

            <Segment>
                <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                    {this.displayMessageSkeleton(this.props.isLoading)}
                    {searchTerm ? this.displayMessages(searchResults) : this.displayMessages2()}
                    {this.displayTypingUsers(typingUsers)} <div ref={node => (this.messagesEnd = node)}></div>
                </Comment.Group>
            </Segment>

            <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={user}
             isPrivateChannel={privateChannel} isProgressBarVisible={this.isProgressBarVisible} getMessagesRef={this.getMessagesRef}/>
        </React.Fragment>
    )
    }
}

const mapDispatchToProps = {
    fetchMessage: actions.fetchMessage,
    setUserPosts: actions.setUserPosts,
    starChannel: actions.starChannel
}

const mapStateToProps = state => {
    return {
      data: state.data.data,
      isLoading: state.data.isLoading
    };
  };



export default connect(mapStateToProps, mapDispatchToProps )(Messages);