import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
   Input,Modal,ModalBody,ModalFooter, Card, CardHeader, CardBody, ModalHeader
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import BalanceComponent from './sales_party_balance.js'


class SalesParty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal:false,
            editedMaterial:{},
            filterName:"",
            addedParty:{},
            balance_component:false,
            balance_party:{},
            error_text:"",
        }
    }
    
    
    componentDidMount(){
        if(this.props.sales_party.length>0){
            this.setState({currentList:this.props.sales_party,partyList:this.props.sales_party})
        }else{
            this.getPartyList()
        }
    }

    getPartyList=()=>{
        this.props.distributer({},"salesPartyList").then(response => {
            if(response['status']===200){
              let party=response['data']    
              this.setState({currentList:party,partyList:party})
              this.props.dataStoreSetter(response['data'],"SALES_PARTY")
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
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
    
    handleChange=(e)=>{
        let { addedParty } = { ...this.state }
            addedParty[e.target.name] = e.target.value       
            this.setState({ addedParty })
    }

 

    upload=()=>{
        let {addedParty}={...this.state}
        let valid=this.validateEntry(addedParty)
        if(valid['result']){
            addedParty['balance']=0
            addedParty['address']='-'
            this.props.distributer([this.state.addedParty],"uploadSalesParty").then(response => {
                if(response['status']===200){
                    this.setState({addedParty:{},modal:false})
                    this.getPartyList()
                
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }else{
            this.setState({error_text:valid['error']})
        }     
    }
    validateEntry=(party)=>{
        let error_text=""
        if(!("party" in party) || party['party']===""){
            error_text="Invalid Party Name"
            return {"result":false,"error":error_text}
        }
        if(!("quality" in party) || party['quality']===""){
            error_text="Invalid Quality"
            return {"result":false,"error":error_text}
        }
        if(!("rate" in party) || party['rate']==="" || parseInt(party['rate'])<0){
            error_text="Invalid Rate"
            return {"result":false,"error":error_text}
        }
        this.setState({error_text:""})
        return {"result":true}
    }
    editParty=()=>{
        let {addedParty}={...this.state}
        this.props.distributer(addedParty,"editSalesParty").then(response => {
            if(response['status']===200){ 
                this.setState({addedParty:{},modal:false})
                this.getPartyList()
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }
    deleteParty=(item)=>{
        if(window.confirm("Are you sure?")){
            this.props.distributer(item,"deleteSalesParty").then(response => {
                if(response['status']===200){
                    this.getPartyList()
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
        
    }

    
    handleFilterChange=(val)=>{
        let {currentList,partyList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(partyList, function(o) { return ((o['party'].toLowerCase()).includes(filterName.toLowerCase()) || (o['quality'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName})
    }

    handle_balance_component=(item)=>{
        let {balance_component}={...this.state}
        this.setState({balance_component:!balance_component,balance_party:item})
    }

    render() {
        let {currentList,modal,balance_component,filterName,mode,addedParty,balance_party,error_text}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
                    <Card className="col-lg-10">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row  col-12">
                                    <div className="col-3">Name</div>
                                    {/* <div className="col-1">Address</div> */}
                                    <div className="col-3">Quality</div>
                                    <div className="col-3">Rate</div>
                                    {/* <div className="col-2">Balance</div> */}
                                    <div className="col-3">Actions</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">
                            <span className="col-lg-6"><Input autoComplete="OFF" placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                            <span className="col-lg-6"><button className="btn  btn-sm btn-success" onClick={e=>this.setState({modal:true,mode:"add"})}><i className="fa fa-lg fa-plus m-2 c-pointer text-light"></i>New Party</button></span>                              
                        </div>
                        {currentList && currentList.map((item,ind)=>
                                <div className="row m-1  border p-3" key={ind}>
                                    <div className="col-3">{ind+1+") "}{item['party']}</div>                 
                                    {/* <div className="col-1">{item['address']}</div> */}
                                    <div className="col-3">{item['quality']}</div>
                                    <div className="col-3">{item['rate']}</div>
                                    {/* <div className="col-2">{item['balance']}</div> */}
                                    <div className="col-3">
                                        <i className="fa fa-lg fa-eye c-pointer text-primary mr-2" onClick={e=>this.handle_balance_component(item)}></i>
                                        <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.setState({addedParty:item,modal:true,mode:"edit"})}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteParty(item)}></i>
                                        </div>
                                </div>
                        )}
                    </CardBody>
                    </Card>   

                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <ModalHeader className=" h4 text-light bg-info">
                        <span className="col-10 h4 text-light bg-info">{mode==="add"?"New":"Edit"} Party</span>
                    </ModalHeader>
                    <ModalBody>
                                <div className="flex row  p-3 text-primary">
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Name:</div>
                                            <div className="col-lg-6 row"><Input value={addedParty['party'] || ""} name="party" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    {/* <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Address:</div>
                                            <div className="col-lg-6 row"><Input value={addedParty['address'] || ""} name="address" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div> */}
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Quality:</div>
                                            <div className="col-lg-6 row"><Input type="text" value={addedParty['quality'] || ""} name="quality" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Rate:</div>
                                            <div className="col-lg-6 row"><Input type="number" value={addedParty['rate'] || ""} name="rate" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    {/* <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Balance:</div>
                                            <div className="col-lg-6 row"><Input type="number" value={addedParty['balance'] || ""} name="balance" onChange={e=>this.handleChange(e)} ></Input></div>
                                    </div> */}
                                    <div className="col-lg-12 m-2 d-flex justify-content-center">
                                        {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                                    </div>
                                </div>
                            
                          
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-success" onClick={e=> 
                                            
                                            mode==="add"?
                                                (this.upload())
                                                :
                                                (this.editParty())

                                            
                                            
                                            }>Save</button>{' '}
                        <button className="btn btn-danger" onClick={e=>this.setState({addedParty:{},modal:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>   

                 {balance_component && balance_party &&
                        <BalanceComponent salesPartyInfo={balance_party} handle_balance_component={(val)=>this.handle_balance_component(val)}></BalanceComponent>

                 }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SalesParty));