import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Label,Input,Modal,ModalBody,ModalFooter, Card, CardHeader, CardBody, ModalHeader
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
class PurchaseTax extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal:false,
            filterName:"",
            addedTax:{},
            balance_Tax:{},
            cur_date:"",
            current_month:"",
            total_tax:0,
            error_text:"",
        }
    }
    
    componentDidMount(){
            this.getTaxList()
    }

    getTaxList=(date)=>{
        if(_.isEmpty(date)){
            date=this.props.fetch_month
        }

        if(!_.isEmpty(date)){
        this.props.distributer(date,"TaxList").then(response => {
            if(response['status']===200){
              let Tax=response['data']    
              this.setState({currentList:Tax,TaxList:Tax},()=>{
                  this.calculateMonthly(Tax)
              })
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        }else{
            this.generateMonth(moment().format('YYYY-MM'))
        }
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    
    handleChange=(e)=>{
        let { addedTax } = { ...this.state }
            addedTax[e.target.name] = e.target.value       
            this.setState({ addedTax })
    }


    editTax=()=>{
        let {addedTax,current_month}={...this.state}
        let valid=this.validateEntry(addedTax)
          if(valid['result']){
            this.props.distributer(addedTax,"editPurchaseTax").then(response => {
                if(response['status']===200){ 
                    this.setState({addedTax:{},modal:false,error_text:""})
                    this.getTaxList(current_month)
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

    validateEntry=(entry)=>{
        let error_text=""
        if(!("billno" in entry) || entry['billno']===""){
            error_text="Invalid Bill Number"
            return {"result":false,"error":error_text}
        }
       
        if(!("tax" in entry) || entry['tax']==="" || parseInt(entry['tax'])<0){
            error_text="Invalid Tax Amount"
            return {"result":false,"error":error_text}
        }
        this.setState({error_text:""})
        return {"result":true}
    }

    deleteTax=(item)=>{
        if(window.confirm('Are you sure?')){
            this.props.distributer(item,"deletePurchaseTax").then(response => {
                if(response['status']===200){
                    this.getTaxList(this.state.current_month)
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
        
    }

    
    handleFilterChange=(val)=>{
        let {currentList,TaxList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(TaxList, function(o) { return ((o['party'].toLowerCase()).includes(filterName.toLowerCase()) || (o['quality'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName},()=>{
            this.calculateMonthly(currentList)    

        })
    }

    calculateMonthly=(Tax)=>{
        let sum=_.sumBy(Tax,function(o) { return parseFloat(o.tax); })
        this.setState({total_tax:sum})
    }

    generateMonth=(date)=>{
        let cur_date=date
        date=date+"-01"
        let date_month=moment(date).format('MMMM')
        moment().format('YYYY-MM')
        let data={
            "start_date":moment(date).format("YYYY-MM")+'-01',
            "end_date":moment(date).format("YYYY-MM")+'-31',
            "month":date_month,
        }
        let currentMonth=moment().format("MMMM")
        if(date_month===currentMonth){
            data['end_date']=moment().format("YYYY-MM-DD")
        }
        this.setState({current_month:data,cur_date:cur_date},()=>{
            this.getTaxList(data)
        })
    }

    render() {
        let {currentList,modal,filterName,mode,addedTax,current_month,cur_date,total_tax,error_text}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                  <Card className="flex row col-lg-5 mt-2 mb-2 p-2">
                    <CardHeader className="bg-primary text-light font-weight-bold h5">
                        Purchase Tax Information<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.getPurchaseList(current_month)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-4 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                    
                    </CardHeader>
                    <CardBody className="col-lg-12">
                            <Label>Total Tax</Label>
                            <Input disabled value={parseInt(total_tax).toLocaleString('en-IN')}></Input>
                    </CardBody>
                </Card>
                    <Card className="col-lg-10 mt-4">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row  col-12">
                                    <div className="col-3">Date</div>
                                    <div className="col-2">Bill Number</div>
                                    <div className="col-3">Party</div>
                                    <div className="col-2">Tax Amount</div>
                                    <div className="col-2">Action</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-12"><Input autoComplete="OFF" placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                        {/* <span className="col-lg-6"><button className="btn  btn-sm btn-success" onClick={e=>this.setState({modal:true,mode:"add"})}><i className="fa fa-lg fa-plus m-2 c-pointer text-light"></i>New Tax</button></span> */}
                                   
                                </div>
                    {currentList && currentList.map((item,ind)=>
                                <div className="row m-1  border p-3" key={ind}>
                                    <div className="col-3">{ind+1+") "}{item['date']}</div>
                                    
                                    <div className="col-2">{item['billno']}</div>
                                    <div className="col-3">{item['party']}</div>
                                    <div className="col-2">{parseInt(item['tax']).toLocaleString('en-IN')}</div>
    
                                    <div className="col-2">
                                         <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.setState({addedTax:Object.assign({},item),modal:true,mode:"edit"})}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteTax(item)}></i>
                                        </div>
                                </div>
                    )}
                    {currentList && currentList.length<1 && <div className="text-danger  d-flex justify-content-center p-3 ">
                                    <i className="fa fa-lg fa-exclamation-circle  mr-1"></i> <span className="">No tax to show</span>
                     </div>}
                    </CardBody>
                    </Card>   

                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <ModalHeader className=" h4 text-light bg-info">
                    <span className="col-10 h4 text-light bg-info">{mode==="add"?"New":"Edit"} Tax</span>
                    </ModalHeader>
                    <ModalBody>
                                <div className="flex row  p-3 text-primary">
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Name:</div>
                                            <div className="col-lg-6 row"><Input disabled value={addedTax['party'] || ""} name="party" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Bill  Number:</div>
                                            <div className="col-lg-6 row"><Input value={addedTax['billno'] || ""} name="billno" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Date:</div>
                                            <div className="col-lg-6 row"><Input type="date" value={addedTax['date'] || ""} name="date" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Tax Amount:</div>
                                            <div className="col-lg-6 row"><Input type="number" value={addedTax['tax'] || ""} name="tax" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-lg-12 d-flex justify-content-center p-2">
                                        {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                                    </div>

                                </div>
                            
                          
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-success" onClick={e=> (this.editTax())}>Save</button>{' '}
                        <button className="btn btn-danger" onClick={e=>this.setState({addedTax:{},modal:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>   

                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month
        

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseTax));