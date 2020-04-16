import React, { Component } from 'react';
import TODO from './../Components/TODO';
import ModalComponent from './../Components/Modal';
import { Form, Container } from 'react-bootstrap';



export default class Personal extends Component {
  state = {
    posts: null,
    newTodo: ""
  }

  parsePosts = (postArr) => {
    return postArr.map((rawPost) => {
      let post = JSON.parse(rawPost.message)
      post.id = rawPost.postId
      return post
    })
  }

  async getPosts() {
    const rawPosts = await this.state.personalThread.getPosts()
    const posts = this.parsePosts(rawPosts)
    this.setState({ posts })
  }

  async componentDidMount() {

    const threadName = "personalListAddress-dragonquest"
    const confidentialThreadAddress = await this.props.space.private.get(threadName)
    let personalThread

    if (confidentialThreadAddress) {
      // the personal confidential list has been created already
      // use it's adddress to join
      personalThread = await this.props.space.joinThreadByAddress(confidentialThreadAddress)
    }
    if (!confidentialThreadAddress) {
      // the personal confidential list does not exist
      // create it and save the address to the user's private space
      personalThread = await this.props.space.createConfidentialThread(threadName)
      await this.props.space.private.set(threadName, personalThread._address)
    }
    this.setState({ personalThread })
    // TODO add getPosts
    this.getPosts()
  }

  toggleDone = async(todo)=> {
    const post = JSON.stringify({ text: todo.text, completed: !todo.completed, show: true, order : todo.order, postedBy: todo.postedBy })
    await this.state.personalThread.post(post)
    await this.state.personalThread.deletePost(todo.id)
    this.getPosts()
  }

  deletePost = async (postId) => {
    await this.state.personalThread.deletePost(postId)
    await this.getPosts()
  }

  onSubmit = async () => {
		// only submit to 3Box if there is a new todo
    if (this.state.newTodo) {
			// keeps a consistent order of the todo posts in the UI
      const orderNumber = this.state.posts.length > 0 ? (this.state.posts[this.state.posts.length - 1].order + 1 ): (1)
			const post = JSON.stringify({ text: this.state.newTodo, completed: false, show: true, order : orderNumber, postedBy: this.props.accounts[0]})
      await this.state.personalThread.post(post)
      this.setState({ newTodo: "" })
      this.getPosts()
    }
  }

  render() {
    return (
      <div>
        <h2>Personal TODOs</h2>
        {this.state.posts &&
          <TODO 
              posts={this.state.posts} 
              deletePost={this.deletePost}
              toggleDone={this.toggleDone}
              accounts={this.props.accounts} />
        }
        <ModalComponent
          buttonText={"Add a ToDo"}
          ModalHeader={"Add a Todo"}
          ModalBodyText={"One more thing on the list."}
          submitFunc={this.onSubmit} >
          <Container>
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>New Item</Form.Label>
                <Form.Control
                  type="text"
                  value={this.state.newTodo}
                  onChange={(e) => (this.setState({ newTodo: e.target.value }))}
                />
              </Form.Group>
            </Form>
          </Container>
        </ModalComponent>
      </div>
    )
  }
}