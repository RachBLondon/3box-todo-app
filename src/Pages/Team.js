import React, { Component } from 'react';
import TODO from './../Components/TODO';
import ModalComponent from './../Components/Modal';
import { Form, Container } from 'react-bootstrap';

export default class Team extends Component {
  state = {
    posts: [],
    newTodo: ""
  }
  

  
  
  



  render() {
    return (
      <div>
        <h2>Team TODOs</h2>
        <p>Team Member</p>
        <div style={{height : '10vh'}}>
          {/* Team Members Section */}
        </div>
        <br/>
        <br/>
        {/* {TODO Section} */}
      </div>
    )
  }
}