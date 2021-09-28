import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Tab,Tabs
  } from "react-bootstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import TransactionList from './TransactionList';
import TransactionEntry from './TransactionEntry';

class Transaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            currentTab:"list"
        }
    }
    
    componentDidMount(){
   
    }
  


   

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    handleTabChange=(tab)=>{
        let {currentTab}={...this.state}
        currentTab=tab
        this.setState({currentTab})

    }
    
    handleFilterChange=(val)=>{
        let {currentList,materialList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(materialList, function(o) { return ((o['name'].toLowerCase()).includes(filterName.toLowerCase()) || (o['symbol'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName})
    }
    render() {
        let {currentTab}={...this.state}
        return (
            <div>
                <div className="flex col-12">
                    <div className="mt-5">
                        <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center m-5 p-3 h5 ">
                            <Tab eventKey="list" title="Transaction List" onClick={e=>this.handleTabChange("list")}>
                                <TransactionList></TransactionList>
                            </Tab>
                            <Tab eventKey="entry" title="Transaction Entry" onClick={e=>this.handleTabChange("entry")}>
                                <TransactionEntry ></TransactionEntry>
                            </Tab>                  
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month,


    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Transaction));