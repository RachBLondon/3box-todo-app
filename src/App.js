import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Navbar, Nav } from 'react-bootstrap';
import Home from './Pages/Home';
import Profile from './Pages/Profile'
import Personal from './Pages/Personal';
import Team from './Pages/Team';

export default class App extends Component {

  state = {
    needToAWeb3Browser: false,
  }

  async getAddressFromMetaMask() {
    if (typeof window.ethereum == "undefined") {
      this.setState({ needToAWeb3Browser: true });
    } else {
      window.ethereum.autoRefreshOnNetworkChange = false; //silences warning about no autofresh on network change
      const accounts = await window.ethereum.enable();
      this.setState({ accounts });
    }
  }
  async componentDidMount() {
    await this.getAddressFromMetaMask();
    if (this.state.accounts) {
      // Now MetaMask's provider has been enabled, we can start working with 3Box

    }
  }
  render() {
    if (this.state.needToAWeb3Browser) {
      return <h1>Please install metamask</h1>
    }


    return (
      <Router>
        <div>
          <Navbar bg="light" expand="lg" style={{ minHeight: '40px' }}>
            {this.state.accounts && (
              <Nav fill style={{ width: "100%" }} >
                <Nav.Item><Link to="/">Home</Link></Nav.Item>
                  <>
                    <Nav.Item><Link to="/team">Team TODOs</Link></Nav.Item>
                    <Nav.Item><Link to="/personal">Personal TODOs</Link></Nav.Item>
                    <Nav.Item><Link to="/profile">Profile Update</Link></Nav.Item>
                  </>

              </Nav>
            )}

          </Navbar>
          <div className="container" style={{ paddingTop: '50px' }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontWeight: '900' }}>✅ 3Box TODOs</h1>
              <p>Stuff that needs to get done!</p>
            </div>
            {this.state.needToAWeb3Browser && <h2 style={{ textAlign: "center" }}>Please install metamask🦊</h2>}
            {(!this.state.needToAWeb3Browser && !this.state.accounts) && <h2 style={{ textAlign: "center" }}>Connect MetaMask🤝</h2>}
            {this.state.accounts && (
              <Switch>
                  <>
                    <Route path="/personal">
                      <Personal 
                        accounts={this.state.accounts}/>
                    </Route>
                    <Route path="/team">
                      <Team 
                      accounts={this.state.accounts} />
                    </Route>
                    <Route path="/profile">
                      <Profile
                      />
                    </Route>
                  </>)
                <Route path="/">
                  <Home
                    ethAddress={this.state.accounts[0]}
                  />
                </Route>
              </Switch>
            )}
          </div>
        </div>
      </Router>
    );
  }
}









