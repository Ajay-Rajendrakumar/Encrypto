import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/thada.css'
import * as basic from "../../store/actions/basic.action.js";
import {
    Tab,Tabs
  } from "react-bootstrap";
import SalesParty from "./sales_party.js"
import PurchaseParty from "./purchase_party.js"

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"sales"
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
        let {currentTab}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
                <div className="col-lg-12">
                    <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center  p-4 h5 ">
                        <Tab eventKey="sales" title="Sales Party" onClick={e=>this.handleTabChange("list")}>
                            <SalesParty ></SalesParty>
                        </Tab>
                        <Tab eventKey="purchase" title="Purchase Party" onClick={e=>this.handleTabChange("entry")}>
                            <PurchaseParty></PurchaseParty>
                        </Tab>                  
                    </Tabs>
                </div>
            </div> 
        );
    }
}

function mapStateToProps(state) {
    return {
        sales_party: state.Reducer.sales_party,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Index));