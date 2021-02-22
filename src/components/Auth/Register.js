import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component{

   state = { 
   username: "",
   email: "",
   password: "",
   passwordConfirmation: "",
   errors: [],
   loading: false,
   userRef: firebase.database().ref('users')

  };

  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)){
      error = { message: 'Fill in all fields'}
      this.setState({errors: errors.concat(error)});
      return false;
    }else if (!this.isPasswordValid(this.state)){
      error = { message: 'Password is invalid'};
      this.setState({ errors: errors.concat(error)});
      return false
    }else{
      return true;
    }
  }

  isPasswordValid = ({ password, passwordConfirmation}) => {
    if (password.length < 6 || passwordConfirmation.length <6){
      return false;
    }else if ( password !== passwordConfirmation){
      return false;
    }else{
      return true;
    }
  }

  displayErrors = errors => errors.map((error,i) => 
  <p key={i}>{error.message}</p>
  );

  isFormEmpty = ({ username, email, password, passwordConfirmation}) =>{
    return !username.length || !email.length || !password.length
     || !passwordConfirmation.length;
  }
  
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()){
    this.setState({ errors: [], loading: true})
    firebase
    .auth()
    .createUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(createdUser => {
      createdUser.user.updateProfile({
        displayName: this.state.username,
        photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
      })
      .then(() =>{
        this.saveUser(createdUser).then(() =>{
          console.log('user saved');
        })
      })
      .catch(err => {
        console.error(err);
        this.setState({ errors: this.state.errors
        .concat(err), loading: false})
      })
      
    })
    .catch(err => {
      console.error(err);
      this.setState({ errors: this.state.errors
      .concat(err), loading: false})
    })
  }
}

saveUser = createdUser => {
  return this.state.userRef.child(createdUser.user.uid).set({
    name: createdUser.user.displayName,
    avatar: createdUser.user.photoURL
  })
}

  handleChange = event => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value});
  };

    render(){
      const { username, 
        email,
         password, 
         passwordConfirmation,
        loading} = this.state;
    return (
      
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450}}>

          <Header as="h1" icon color="blue" textAlign="center">
            <Icon className="modx" color="blue" />
            Register for DevChat
          </Header>

          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left"
              placeholder="Username"  onChange={this.handleChange} type="text" value={username} />

              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address " 
                onChange={this.handleChange} value={email} type="email" />
               
              <Form.Input  fluid  name="password" icon="lock"  iconPosition="left" 
               placeholder="Password"  onChange={this.handleChange} value={password} type="password" />

              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
              placeholder="Password Confirmation" onChange={this.handleChange} value={passwordConfirmation} type="password" />

              <Button disabled={loading} className={loading ? 'loading': ""} color="blue" fluid size="large">
                Submit</Button>
            </Segment>
          </Form>
           {this.state.errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(this.state.errors)}
            </Message>
          )}
          <Message>Already a user ?<Link to='/login'>Login</Link></Message>
        </Grid.Column>
      </Grid>
      
    
    );
  }
}


export default Register;
