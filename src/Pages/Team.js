import React, { Component } from "react";
import TODO from "./../Components/TODO";
import ModalComponent from "./../Components/Modal";
import { Form, Container } from "react-bootstrap";
import Box from "3box";

export default class Team extends Component {
  state = {
    posts: [],
    newTodo: "",
    moderatorsAddress: "0x2f4cE4f714C68A3fC871d1f543FFC24b9b3c2386", // update to your address
    addresses: [
      "0xab74207ee35fBe1Fb949bdcf676899e9e72Ec530", // replace these with ethereum addresses you control
      "0xFF326878D13b33591D286372E67B4AF05cD100bd",
      "0xbaeBB7d18f8b16B0A970FDa91f1EfA626D67423E",
      "0x5c44E8982fa3C3239C6E3C5be2cc6663c7C9387E",
      "0xa8eE0BABE72cD9A80Ae45dD74Cd3eaE7a82fd5d1",
      "0x5a7246af4fefe777e32399310b50bb7fe2d04f8a",
      "0x18B14A7d061B504C75C7027738d16dcED739b2E9",
      "0x5031f308AD02Ed86F44c586aD2B01ae55D034C7a",
      "0xB3B30f49384093eE32d26C2C8E38e6566482C6a8",
    ],
  };

  async componentDidMount() {
    const teamMembers = this.state.addresses.map((member) =>
      member.toLowerCase()
    ); //prevents capitalisation errors
    const spaceName = "todo-space";
    const confidentialThreadName = "confidential-todoslfhjkklxzcxzcdf1lllddddggffkk";
    const waitingRoomName = "waitingroomdfd1lllfffdggffkk";
    let teamThread; // we will set this later
    const isModerator =
      this.state.moderatorsAddress.toLowerCase() ===
      this.props.accounts[0].toLowerCase();
    // Access the moderators public space (this is used later to access thread addresses)
    const moderatorsSpace = await Box.getSpace(
      this.state.moderatorsAddress.toUpperCase(),
      spaceName
    );
    const isTeamMember = teamMembers.includes(this.props.accounts[0]);

    if (!isModerator && !isTeamMember) {
      this.setState({ notAModOrTeam: true });
    }

    if (!moderatorsSpace[confidentialThreadName] && isModerator) {
      // if theconfidentialThreadname is not saved in the moderators space
      // it means it theconfidentialThreadhas has not been created yet.
      // create the confidentialconfidentialThreadand save the address in
      // the moderators public space
      const confidentialThread = await this.props.space.createConfidentialThread(
        confidentialThreadName
      );
      await this.props.space.public.set(
        confidentialThreadName,
        confidentialThread.address
      );
      const waitingRoom = await this.props.space.joinThread(waitingRoomName);
      await this.props.space.public.set(waitingRoomName, waitingRoom.address);
      this.setState({teamThread : confidentialThread})
      console.log("confidential thread and waiting room thread made");
    }

    if(!moderatorsSpace[confidentialThreadName] && !isModerator && isTeamMember){
      this.setState({moderatorLoginToCreate : true})
    }

    if (moderatorsSpace[confidentialThreadName]) {
      if (isTeamMember && !isModerator) {
        // check for the space opening status of the team member in the
        // waitngRoom public thread
        const waitingRoom = await this.props.space.joinThreadByAddress(
          moderatorsSpace[waitingRoomName]
        );
        const rawPosts = await waitingRoom.getPosts();
        if (rawPosts.length < 1) {
          await waitingRoom.post(
            JSON.stringify({ waitingRoom: [this.props.accounts[0]], added: [] })
          );
          this.setState({ moderatorWillAdd: true });
          console.log("first team member added");
        }

        if (rawPosts.length > 0) {
          const mostRecent = JSON.parse(rawPosts[rawPosts.length - 1].message);
          // check if the user has already been added to the confidential thread
          if (mostRecent.added.includes(this.props.accounts[0])) {
            const confidentialThread = await this.props.space.joinThreadByAddress(
              moderatorsSpace[confidentialThreadName]
            );
            console.log("joinedconfidentialThreadas team");
            this.setState({
              teamThread: confidentialThread,
              teamMembersAdded: mostRecent.added,
            });
            // TODO get posts
            this.getPosts()
            return
          }
          if (mostRecent.waitingRoom.includes(this.props.accounts[0])) {
            this.setState({ moderatorWillAdd: true })
            return
          } else {
            // add user to waiting room in prep to be added to confidential thread
            console.log("adding user to waiting room");
            mostRecent.waitingRoom.push(this.props.accounts[0]);
            await waitingRoom.post(JSON.stringify(mostRecent));
            this.setState({ moderatorWillAdd: true })
            return
          }
        }

        // where we will handle the logic of adding team members to the
        // waiting room and confidential thread
      }

      // Add the moderator login here
      if (isModerator) {
        // moderator joins the confidential thread and adds users in waiting
        // room. Then move these users to the added array
        const confidentialThread = await this.props.space.joinThreadByAddress(
          moderatorsSpace[confidentialThreadName]
        );
        console.log("moderator joinedconfidentialThreads");
        const waitingRoom = await this.props.space.joinThreadByAddress(
          moderatorsSpace[waitingRoomName]
        );
        const rawPosts = await waitingRoom.getPosts();

        if (rawPosts.length > 0) {
          const mostRecent = JSON.parse(rawPosts[rawPosts.length - 1].message);
          mostRecent.waitingRoom.map(async (address) => {
            await confidentialThread.addMember(address);
          });
          // Once team members have been added to the waiting room,
          // move them to the added array
          const newWaitingRoom = {
            waitingRoom: [],
            added: mostRecent.added.concat(mostRecent.waitingRoom),
          };
          const inConfidentialThread = await confidentialThread.listMembers();
          await waitingRoom.deletePost(rawPosts[rawPosts.length - 1].postId);
          await waitingRoom.post(JSON.stringify(newWaitingRoom));
          console.log("updated waiting room array", newWaitingRoom);
        }
        this.setState({ teamThread: confidentialThread });
        // TODO get posts
        this.getPosts();
      }
    }
  }

  async getPosts() {
    const rawPosts = await this.state.teamThread.getPosts();
    const posts = this.parsePosts(rawPosts);
    this.setState({ posts });
  }

  parsePosts = (postArr) => {
    return postArr.map((rawPost) => {
      let post = JSON.parse(rawPost.message);
      post.id = rawPost.postId;
      return post;
    });
  };

  onSubmit = async () => {
    if (this.state.newTodo) {
      const orderNumber =
        this.state.posts.length > 0
          ? this.state.posts[this.state.posts.length - 1].order + 1
          : 1;
      const post = JSON.stringify({
        text: this.state.newTodo,
        completed: false,
        show: true,
        order: orderNumber,
        postedBy: this.props.accounts[0],
      });
      await this.state.teamThread.post(post);
      this.setState({ newTodo: null });
      this.getPosts();
    }
  };

  toggleDone = async (todo) => {
    const post = JSON.stringify({
      text: todo.text,
      completed: !todo.completed,
      show: true,
      order: todo.order,
      postedBy: todo.postedBy,
    });
    await this.state.teamThread.post(post);
    await this.state.teamThread.deletePost(todo.id);
    this.getPosts();
  };

  deletePost = async (postId) => {
    await this.state.teamThread.deletePost(postId);
    await this.getPosts();
  };

  render() {
    const isActiveMember =  !this.state.notAModOrTeam && !this.state.moderatorWillAdd && !this.state.moderatorLoginToCreate && this.state.teamThread
    return (
      <div>
        <h2>Team TODOs</h2>
        <p>Team Member</p>
        <div style={{ height: "10vh" }}>{/* Team Members Section */}</div>
        {/* {TODO Section} */}
        {this.state.notAModOrTeam && <h1>You are not part of this team</h1>}
        {this.state.moderatorLoginToCreate && <h1>Ask your moderator to login to start</h1>}
        {this.state.moderatorWillAdd && <h1>Wait for your moderator to log in and add you</h1>}
        {this.state.posts && isActiveMember && (
          <TODO
            posts={this.state.posts}
            deletePost={this.deletePost}
            toggleDone={this.toggleDone}
            accounts={this.props.accounts}
          />
        )}
        { isActiveMember && (
          <>
            <ModalComponent
              buttonText={"Add a ToDo"}
              ModalHeader={"Add a Todo"}
              ModalBodyText={"One more thing on the list."}
              submitFunc={this.onSubmit}
            >
              <Container>
                <Form>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>New Item</Form.Label>
                    <Form.Control
                      type="text"
                      value={this.state.newTodo}
                      onChange={(e) =>
                        this.setState({ newTodo: e.target.value })
                      }
                    />
                  </Form.Group>
                </Form>
              </Container>
            </ModalComponent>
          </>
        )}
      </div>
    );
  }
}
