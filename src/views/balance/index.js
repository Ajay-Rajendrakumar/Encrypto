import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/thada.css'
import * as basic from "../../store/actions/basic.action.js";
import BalanceComponent from "./balance_list"

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"list"
        }
    }
    
    componentDidMount(){
 
    }
    handleTabChange=(tab)=>{
        let {currentTab}={...this.state}
        currentTab=tab
        this.setState({currentTab})

    }
    
 
    render() {
        return (
            <div className="flex d-flex justify-content-center">
            <div className="flex col-12">
                <div className="mt-5">
                       <BalanceComponent ></BalanceComponent>
           </div>
   </div> 
   </div>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Index));