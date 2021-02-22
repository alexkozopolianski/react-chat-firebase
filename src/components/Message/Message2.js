import React from 'react';
import { Comment, Image} from 'semantic-ui-react';
import moment from 'moment';


const timeFromNow = timestamp => 
moment(timestamp).fromNow();

const isOwnMessage = (mes,user) =>{
    return mes.user.id === user.uid ? 'message__self' : '';
}

const isImage = (mes) => {
    return mes.hasOwnProperty('image') && !mes.hasOwnProperty('content');
}



const Message2 = ({ mes,user}) => ( 
    
    <Comment>
        <Comment.Avatar src={mes.user.avatar} />
        <Comment.Content className={isOwnMessage(mes,user)} >
            <Comment.Author as="a">{mes.user.name}</Comment.Author>
            <Comment.Metadata>{timeFromNow(mes.timestamp)}</Comment.Metadata>
            {isImage(mes) ? <Image src={mes.image} className="message__image" /> :
            <Comment.Text>{mes.content}  </Comment.Text>
            
            }
        </Comment.Content>
    </Comment>
            
       
)

export default Message2;