import React, { Component } from 'react';
import TODO from './../Components/TODO';
import ModalComponent from './../Components/Modal';
import { Form, Container } from 'react-bootstrap';



export default class Personal extends Component {
  state = {
    posts: null,
    newTodo: ""
  }

  render() {
    return (
      <div>
        <h2>Personal TODOs</h2>
      </div>
    )
  }
}