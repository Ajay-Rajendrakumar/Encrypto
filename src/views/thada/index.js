import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Tab,Tabs
  } from "react-bootstrap";
import ThadaEntry from './thadaEntry.js';
import ThadaList from './thadaList';
import MonthList from './dailyThada.js';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";
import _ from 'lodash';

class Thada extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"list",
            cur_Date:{}
        }
    }
    
    componentDidMount(){
        if(this.props.thada_list.length>0){
            this.setState({thadaList:this.props.thada_list})
        }
        if(this.props.unit_list.length>0){
            this.setState({unitList:this.props.unit_list})
        }else{
            this.getUnitList()
        }
    
    }
    handleTabChange=(tab)=>{
        let {currentTab}={...this.state}
        currentTab=tab
        this.setState({currentTab})

    }

    getThadaList=(date)=>{
        if(_.isEmpty(date)){
            date=this.props.fetch_month
        }
        console.log(date,"-----------")
        this.props.distributer(date,"thadaList").then(response => {
            if(response['status']===200){
              this.setState({thadaList:response['data'],cur_Date:date })
              this.props.dataStoreSetter(response['data'],"THADA_LIST")             
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }
    getUnitList=()=>{
        this.props.distributer({},"unitList").then(response => {
            if(response['status']===200){
              this.setState({unitList:response['data'] })

              this.props.dataStoreSetter(response['data'],"UNIT_LIST")
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }
  
    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    render() {
        let {currentTab,thadaList,unitList,cur_Date}={...this.state}
        return (
            <div className="flex">
                <div className="mt-5">
               
                <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center m-5 h5 ">
                <Tab eventKey="list" title="Thada List" onClick={e=>this.handleTabChange("entry")}>
                    <ThadaList thadaList={thadaList} updateThadaList={(date)=>this.getThadaList(date)}></ThadaList>      
                </Tab>
                <Tab eventKey="entry" title="Thada Entry" onClick={e=>this.handleTabChange("list")}>
                    <ThadaEntry unitList={(unitList || [])} updateThadaList={(date)=>this.getThadaList(date)}></ThadaEntry>
                </Tab>
                <Tab eventKey="month" title="Daily Thada" onClick={e=>this.handleTabChange("month")}>
                    <MonthList unitList={(unitList || [])} thadaList={thadaList} cur_Date={cur_Date}></MonthList>:
                </Tab>
                </Tabs>
                    </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month,
        thada_list: state.Reducer.thada_list,
        unit_list: state.Reducer.unit_list,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
   
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Thada));