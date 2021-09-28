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
import PurchaseList from './purchaseList.js';
import PurchaseEntry from './purchaseEntry.js';
import PurchaseTax from './purchaseTax.js';
import TaxList from './TaxList.js';

class Purchase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            currentTab:"entry"
        }
    }
    
    componentDidMount(){
        if(this.props.purchase_list && this.props.purchase_list.length>0){
            this.setState({purchase_List:this.props.purchase_list})
        }else{
           // this.getpurchase()
        }
    }
    getpurchase=()=>{
        let obj=this.props.fetch_month
        if(!_.isEmpty(obj)){
            this.props.distributer(obj,"PurchaseList").then(response => {
                if(response['status']===200){
                let sale=response['data']  
                this.props.dataStoreSetter(response['data'],"PURCHASE_LIST")
                this.setState({purchase_List:sale})
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server1")
                }
            }).catch((err)=>{
                this.toasterHandler("error",err)
            })
        }
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
                    <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center  p-4 mb-3 h5 ">
                        <Tab eventKey="entry" title="Purchase Entry" onClick={e=>this.handleTabChange("entry")}>
                            <PurchaseEntry  getPurchase={e=>this.getPurchase()}></PurchaseEntry>
                        </Tab>
                        <Tab eventKey="list" title="Purchase List" onClick={e=>this.handleTabChange("entry")}>
                            <PurchaseList></PurchaseList>
                        </Tab>  
                        <Tab eventKey="tax" title="Purchase Tax Entry" onClick={e=>this.handleTabChange("tax")}>
                            <PurchaseTax></PurchaseTax>
                        </Tab>      
                        <Tab eventKey="taxlist" title="Purchase Tax List" onClick={e=>this.handleTabChange("taxlist")}>
                            <TaxList></TaxList>
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
        Purchase_list: state.Reducer.Purchase_list,
        fetch_month: state.Reducer.fetch_month,


    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Purchase));