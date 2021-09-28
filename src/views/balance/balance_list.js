import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Input, Card, CardHeader, CardBody
  } from "reactstrap";
import _ from 'lodash';
import moment from 'moment';
import * as basic from "../../store/actions/basic.action.js";
import PurchaseBalanceComponent from '../party/purchase_party_balance.js'
import SalesBalanceComponent from '../party/sales_party_balance.js'
import MonthlyComponent from './monthy_component.js'

class PurchaseParty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal:false,
            editedMaterial:{},
            filterName:"",
            addedParty:{},
            balance_party:{},
            balance_component:false,
            balance_List:[],
            partyList:[],
            calculate_month:"",
        }
    }
    
    componentDidMount(){
        this.getGetBalanceList()
    }

    getGetBalanceList=()=>{
        this.props.distributer({},"BalanceList").then(response => {
            if(response['status']===200){
                 this.setState({balance_List:response['data'],partyList:response['data']})
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }

    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    
    handleFilterChange=(val)=>{
        let {balance_List,partyList,filterName}={...this.state}
        filterName=val || ""
        balance_List=_.filter(partyList, function(o) { return ( (o['party'].toLowerCase()).includes(filterName.toLowerCase()) || (o['type'].toLowerCase()).includes(filterName.toLowerCase()))})
        this.setState({balance_List,filterName})
    }

    handle_balance_component=(item)=>{
        this.setState({modalData:item,modal:true})
    }
  
    handle_component=(item)=>{
        let {balance_component,balance_party}={...this.state}
        balance_party=Object.assign({},item)
        balance_party['id']=balance_party['partyId']
        this.setState({balance_component:!balance_component,balance_party})
    }

    render() {
        let {balance_List,modal,filterName,modalData,balance_component,balance_party}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
                    <Card className="col-lg-10">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row  col-12">
                                    <div className="col-1">Id</div>
                                    <div className="col-3">Name</div>
                                    <div className="col-2">Type</div>
                                    <div className="col-2">Opening</div>
                                    <div className="col-2">Effective</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-6"><Input  autoComplete="OFF" placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>                 
                                </div>
                    {balance_List && balance_List.map((item,ind)=>
                                <div className="row m-1  border p-3" key={ind}>
                                    <div className="col-1">{ind+1}</div>
                                    <div className="col-3">{item['party']}</div>
                                    <div className="col-2">{this.getName(item['type'])}</div>
                                    <div className="col-2">{(parseInt(item["balance"][(moment().subtract(1, "month").format("MMM").toLowerCase())]).toLocaleString('en-IN') || "Not Available")}</div>
                                    <div className="col-2">{(parseInt(item["balance"][(moment().format("MMM").toLowerCase())]).toLocaleString('en-IN') || "Not Available")}</div>
                                    <div className="col-2">
                                        <i className=" fa-lg fa fa-list-ul c-pointer text-info mr-2" onClick={e=>this.handle_component(item)}></i>
                                        <i className="fa fa-lg fa-calendar c-pointer text-primary mr-2" onClick={e=>this.handle_balance_component(item)}></i>                                      
                                        </div>
                                </div>
                    )}
                    </CardBody>
                    </Card>   

                  <MonthlyComponent modal={modal} modalData={modalData} onClose={e=>this.setState({modal:false,modalData:{}})}/>
                 {balance_component &&
                    <div className="mt-5 col-lg-12 position-absolute ml-n5">
                    {!_.isEmpty(balance_party) &&
                       balance_party['type']==="purchase" ?
                            <PurchaseBalanceComponent  salesPartyInfo={balance_party} handle_balance_component={(val)=>this.handle_component(val)}></PurchaseBalanceComponent>
                        :
                        balance_party['type']==="sales"?
                            <SalesBalanceComponent  salesPartyInfo={balance_party} handle_balance_component={(val)=>this.handle_component(val)}></SalesBalanceComponent>
                        :null}
                    </div>
                }
                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        purchase_party: state.Reducer.purchase_party,
        sales_party:state.Reducer.sales_party,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseParty));