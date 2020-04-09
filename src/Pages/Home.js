import React, { Component} from 'react';
import BounceLoader from "react-spinners/BounceLoader";

export default class Home extends Component {
    render() {
      return (<>
        <h5 style={{textAlign : "center"}}>Welcome</h5>
        <div style={{width : '180px', margin : "auto", height : '100px'}}>

        </div>
        {(!this.props.space)&& <div style={{display : "block", margin : "auto", width : '50px'}}>
              <BounceLoader color={'#D8EEEC'} />
          </div>}
      </>);
    }
  }