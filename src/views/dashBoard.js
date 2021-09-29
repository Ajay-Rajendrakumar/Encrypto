import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Card,CardFooter,CardBody,CardHeader,
    Label,
   Input,Modal,ModalBody,ModalFooter
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../store/actions/basic.action.js";
import moment from "moment";
import Bill from './bill_component.js'
import BillView from './bill_view.js';
import { pythonUrl } from '../config.js';
import bill_view from './bill_view.js';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bill_component:false,
            currentList:[],
            loading:false,
            bill_view:false,
            bill_Data:{},
        }
    }
    
   
    componentDidMount(){

        this.InvoiceList()
        
    }
    InvoiceList=()=>{
        let {user_data}={...this.props}
        let fd=new FormData()
        fd.append('userId',user_data['userId'])
        this.setState({loading:true})
        this.props.distributer(fd,"invoiceList").then(response => {
            if(response['status']===200){
                    this.setState({currentList:response['data'],loading:false})
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
        this.setState({error_text:""})
    }
 
    deleteInvoice=(item)=>{
        let fd=new FormData()
        fd.append('userId',item['userId'])
        fd.append('invoice',item['InvoiceNumber'])
        if(window.confirm("Are you sure?")){
        this.props.distributer(fd,"deleteInvoice").then(response => {
            if(response['status']===200){
                    this.toasterHandler('success',response['data'])
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
        }
    }


    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        this.setState({loading:false})
    }
    render() {
        let {bill_component,currentList,loading,bill_view,bill_Data}={...this.state}
       
        return (
            <div className="flex row">
                <div className="col-lg-12 p-3">
                    <button className="btn btn-sm btn-primary float-right" onClick={e=>this.setState({bill_component:true})}><i className="fa fa-plus mr-2    ">New Invoice</i></button>
                    <div className="col-lg-12 d-flex justify-content-center">
                    {bill_component &&
                        <div className="col-lg-12 positionAbsolute">    
                            <Bill close={e=>this.setState({bill_component:false})} ></Bill>
                        </div>}
                        {bill_view &&
                        <div className="col-lg-12 positionAbsolute">    
                            <BillView close={e=>this.setState({bill_view:false})} bill_Data={bill_Data}></BillView>
                        </div>
                        }
                    <Card className="col-lg-8 h6 mt-4">
                      <CardHeader>
                            {<div className="flex row bg-info font-weight-bold h6 text-light p-3">
                                        <div className="col-lg-1" onClick={e=>this.InvoiceList()}>Sno</div>
                                        <div className="col-lg-2">Bill Date</div>
                                        <div className="col-lg-2">Invoice Number</div>
                                        <div className="col-lg-3">Company </div>
                                        <div className="col-lg-2">Estimater Delivery </div>
                                        <div className="col-lg-2">Actions </div>
                                        </div>}
                            </CardHeader>      
                            <CardBody className="row flex">
                            {/* {<div className="row m-1  border p-3">
                                <span className="col-lg-12"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>     
                            </div>} */}
                            {currentList && currentList.map((item,ind)=>

                                        <div  className="row m-1 p-3 d-flex col-lg-12">
                                        <div className="col-lg-1">{ind+1}</div>
                                        <div className="col-lg-2">{item['BillDate']}</div>
                                        <div className="col-lg-2">{item['InvoiceNumber']}</div>
                                        <div className="col-lg-3">{item['Company']}</div>
                                        <div className="col-lg-2">{item['EstimatedDelivery']}</div>
                                        <div className="col-lg-2">
                                                <i className="fa fa-eye text-light mr-2 c-pointer" onClick={e=>this.setState({bill_Data:item,bill_view:true})}></i>
                                                <i className="fa fa-trash text-danger c-pointer" onClick={e=>this.deleteInvoice(item)}></i>
                                        </div>
                                        </div>
                                )}
                                <div className="d-flex justify-content-center col-lg-12">
                                            {loading?         
                                                <div className="spinner-border text-light" role="status"></div>
                                                :   
                                                currentList && currentList.length<=0 && <span className="text-danger"><i className="fa fa-exclamation-circle mr-1"></i>No Invoices Found!</span>}
                                        </div>
                             </CardBody>             
                    </Card>
                    </div> 
                    <img id="image"></img>
                </div>
               
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user_data: state.Reducer.user_data,
      
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));