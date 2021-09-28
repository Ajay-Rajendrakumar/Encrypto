import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/thada.css'
import {
    Tab,Tabs
  } from "react-bootstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesList from './salesList';
import SalesEntry from './salesEntry';

class Sales extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"list"
        }
    }
    
    componentDidMount(){
        if(this.props.sales_list.length>0){
            this.setState({sales_List:this.props.sales_list})
        }else{
            this.getSales(this.props.fetch_month)
        }
    }
    getSales=(date)=>{
        console.log(date,!_.isEmpty(date))
        if(_.isEmpty(date)){
            date=this.props.fetch_month
        }
        if(!_.isEmpty(date)){
            this.props.distributer(date,"salesList").then(response => {
                if(response['status']===200){
                let sale={
                   "list": response['data']  ,
                   "month":(date['start_date']).slice(0, -3)
                }
                this.props.dataStoreSetter(sale,"SALES_LIST")
                this.setState({sales_List:sale})
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
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
    validateEntry=(sale)=>{
        let error_text=""
        if(!("billno" in sale) || sale['billno']===""){
            error_text="Invalid Bill Number"
            return {"result":false,"error":error_text}
        }
        if(!("party" in sale) || sale['party']===""){
            error_text="Invalid Sales Party"
            return {"result":false,"error":error_text}
        }
        if(!("bale" in sale) || sale['bale']==="" || parseInt(sale['bale'])<0){
            error_text="Invalid Number of Bales"
            return {"result":false,"error":error_text}
        }
        if(!("weight" in sale) || sale['weight']==="" || parseInt(sale['weight'])<0){
            error_text="Invalid Weight"
            return {"result":false,"error":error_text}
        }
        if(!("rate" in sale) || sale['rate']==="" || parseInt(sale['rate'])<0){
            error_text="Invalid Rate"
            return {"result":false,"error":error_text}
        }
        if(!("amount" in sale) || sale['amount']==="" || parseInt(sale['amount'])<0){
            error_text="Invalid Amount"
            return {"result":false,"error":error_text}
        }
        if(!("tax" in sale) || sale['tax']==="" || parseInt(sale['tax'])<0){
            error_text="Invalid Tax Amount"
            return {"result":false,"error":error_text}
        }
        this.setState({error_text:""})
        return {"result":true}
    }
    render() {
        let {currentTab,sales_List}={...this.state}
        return (
            <div>
                <div className="flex col-12">
                    <div className="mt-5">          
                        <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center m-5 p-3 h5 ">
                        <Tab eventKey="list" title="Sales List" onClick={e=>this.handleTabChange("list")}>
                                <SalesList sales_List={sales_List}   getSales={(date)=>this.getSales(date)}  validateEntry={(val)=>this.validateEntry(val)} ></SalesList>
                        </Tab>
                        <Tab eventKey="entry" title="Sales Entry" onClick={e=>this.handleTabChange("entry")}>
                                <SalesEntry  getSales={(date)=>this.getSales(date)}  validateEntry={(val)=>this.validateEntry(val)}></SalesEntry>
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
        sales_list: state.Reducer.sales_list,
        fetch_month: state.Reducer.fetch_month,
    


    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sales));