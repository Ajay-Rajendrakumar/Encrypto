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
import ProductionList from './productionList.js';
import ProductionEntry from './productionEntry.js';
import DailyProduction from './dailyProduction';
class Production extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"list",
            production_list:[],
        }
    }
    
    componentDidMount(){
        this.getProduction()
        if(this.props.unit_list.length>0){
            this.setState({unitList:this.props.unit_list})
        }else{
            this.getUnitList()
        }
   
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
    getProduction=(date)=>{
        if(_.isEmpty(date)){
            date=this.props.fetch_month
        }
        if(!_.isEmpty(date)){
            this.props.distributer(date,"productionList").then(response => {
                if(response['status']===200){
                this.setState({production_list:response['data'] })
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
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
        if(!("unit" in sale) || sale['unit']===""){
            error_text="Invalid Unit"
            return {"result":false,"error":error_text}
        }
        if(!("dayshift" in sale) || sale['dayshift']==="" || parseInt(sale['dayshift'])<0){
            error_text="Invalid Number of Day Bales"
            return {"result":false,"error":error_text}
        }
        if(!("dayweight" in sale) || sale['dayweight']==="" || parseInt(sale['dayweight'])<0){
            error_text="Invalid  Day Shift Weight"
            return {"result":false,"error":error_text}
        }
        if(!("nightshift" in sale) || sale['nightshift']==="" || parseInt(sale['nightshift'])<0){
            error_text="Invalid Number of Night Bales"
            return {"result":false,"error":error_text}
        }
        if(!("nightweight" in sale) || sale['nightweight']==="" || parseInt(sale['nightweight'])<0){
            error_text="Invalid Night Shift Weight"
            return {"result":false,"error":error_text}
        }
        this.setState({error_text:""})
        return {"result":true}
    }

    render() {
        let {currentTab,production_list,unitList}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
                <div className="mt-2">
                <Tabs defaultActiveKey={currentTab} className=" d-flex justify-content-center p-3 mb-4 h5 ">
                    <Tab eventKey="list" title="Production List" onClick={e=>this.handleTabChange("list")}>
                        <ProductionList unit_list={unitList} production_List={production_list }  getProduction={(val)=>this.getProduction(val)} validateEntry={(val)=>this.validateEntry(val)}  ></ProductionList>
                    </Tab>
                    <Tab eventKey="entry" title="Production Entry" onClick={e=>this.handleTabChange("entry")} >
                        <ProductionEntry getProduction={(val)=>this.getProduction(val)} validateEntry={(val)=>this.validateEntry(val)}></ProductionEntry>
                    </Tab>  
                    <Tab eventKey="daily" title="Production View" onClick={e=>this.handleTabChange("daily")}>
                        <DailyProduction unitList={unitList} production_List={production_list}></DailyProduction>
                    </Tab>                
                </Tabs>
                </div> 
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        unit_list: state.Reducer.unit_list,
        production_list: state.Reducer.production_list,
        fetch_month:state.Reducer.fetch_month

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Production));