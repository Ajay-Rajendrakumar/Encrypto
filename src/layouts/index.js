import React, { Component } from 'react';
import Header from "./header.js";
import Sidemenu from "./sidemenu.js";
class index extends Component {
    
    render() {
        return (
            <>
                <Header {...this.props} />
                <Sidemenu {...this.props} />
            
            </>
        );
    }
}



export default index;