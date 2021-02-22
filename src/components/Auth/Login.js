import React, {useEffect} from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import * as actions from '../../store/actions';



class Login extends React.Component{

   state = { 
   email: "",
   password: "",
   errors: [],
   loading: false,

  };

  displayErrors = errors => errors.map((error,i) => 
  <p key={i}>{error.message}</p>
  );

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)){
    this.setState({ errors: [], loading: true});
    this.props.signIn(this.state.email,this.state.password)
    .then(signedUser => {
      console.log(signedUser);
    })
    .catch(err => {
      this.setState({
        errors: this.state.errors.concat(err),
        loading: false
      })
    })
    
  }
}

isFormValid = ({ email, password}) => email && password;

  handleChange = event => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value});
  };

    render(){
      const { email, password, loading} = this.state;
    return (
      
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450}}>
          <Header as="h1" icon color="blue" textAlign="center">
            <Icon className="modx" color="blue" />
            Login to DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
             
              <Form.Input  fluid name="email" icon="mail" iconPosition="left"
              placeholder="Email Address " onChange={this.handleChange} value={email} type="email" />
              
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" 
              onChange={this.handleChange}  value={password} type="password" />  
              
              <Button disabled={loading} className={loading ? 'loading': ""} color="blue" fluid size="large">
                Submit
              </Button>
            </Segment>
          </Form>
           {this.state.errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(this.state.errors)}
            </Message>
          )}
          <Message>Don't have an account?<Link to='/register'>Register</Link></Message>
        </Grid.Column>
      </Grid>
      
    
    );
  }
}

const mapDispatchToProps = {
  signIn: actions.signIn
}



export default connect(null, mapDispatchToProps) (Login);
