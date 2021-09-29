import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Card,CardFooter,CardBody,CardHeader,
    Label,
   Input,Modal,ModalBody,ModalFooter,ModalHeader
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
            modal:false,
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
        this.setState({loading:false,loading1:false})
    }

    shareBill=(item)=>{
        let {user_data}={...this.props}  
        this.setState({loading1:true})      
        this.props.distributer({'userId':user_data['userId']},"userList").then(response => {
            if(response['status']===200){
                    response=response['data']
                    this.setState({loading1:false,modal:true,ModalData:item,friends:response['friend']})

            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
    }
    share=()=>{
        let {user_data}={...this.props}  
        let {ModalData,selectedFriend,friends}={...this.state}  
        console.log(selectedFriend)
        let obj={
            'userId':user_data['userId'],
            "frdId":selectedFriend,
            "frdname":friends[selectedFriend],
            "name":user_data['user']['name'],
            "invoice":ModalData,
        }      
        this.props.distributer(obj,"shareInvoice").then(response => {
            if(response['status']===200){
                    this.toasterHandler("success",response['data'])

            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
    }
    render() {
        let {bill_component,currentList,loading,bill_view,bill_Data,modal,ModalData,friends,selectedFriend,loading1}={...this.state}
       
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
                      <CardHeader className="text-center">
                            <div className="h3 p-3">Invoice List<button className="btn btn-sm btn-secondary  mb-2 ml-3" onClick={e=>this.InvoiceList()}> <i className="fa fa-refresh"> </i> </button></div>
                            {<div className="flex row bg-info font-weight-bold h6 text-light p-3  ">
                                        <div className="col-lg-1" >Sno</div>
                                        <div className="col-lg-2">Bill Date</div>
                                        <div className="col-lg-2">Invoice Number</div>
                                        <div className="col-lg-2">Company </div>
                                        <div className="col-lg-3">Estimated Delivery </div>
                                        <div className="col-lg-2">Actions </div>
                                        </div>}
                            </CardHeader>      
                            <CardBody className="row flex">
                            {/* {<div className="row m-1  border p-3">
                                <span className="col-lg-12"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>     
                            </div>} */}
                            {currentList && currentList.map((item,ind)=>

                                        <div  className="row m-1 p-2 d-flex col-lg-12 text-center">
                                        <div className="col-lg-1">{ind+1}</div>
                                        <div className="col-lg-2">{item['BillDate']}</div>
                                        <div className="col-lg-2">{item['InvoiceNumber']}</div>
                                        <div className="col-lg-2">{item['Company']}</div>
                                        <div className="col-lg-3">{item['EstimatedDelivery']}</div>
                                        <div className="col-lg-2">
                                                <i className="fa fa-eye text-light mr-2 c-pointer" onClick={e=>this.setState({bill_Data:item,bill_view:true})}></i>
                                                {
                                                    !loading1?
                                                    <i className="fa fa-share text-success mr-2 c-pointer" onClick={e=>this.shareBill(item)}></i>
                                                    :
                                                    <div className=" spinner-border text-light spinner-border-sm mr-2 mt-n1" role="status"></div>
                                                }
                                                <i className="fa fa-trash text-danger c-pointer" onClick={e=>this.deleteInvoice(item)}></i>
                                        </div>
                                        </div>
                                )}
                                <div className="d-flex justify-content-center col-lg-12">
                                            {loading?         
                                                <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                                                :   
                                                currentList && currentList.length<=0 && <span className="text-danger"><i className="fa fa-exclamation-circle mr-1"></i>No Invoices Found!</span>}
                                        </div>
                             </CardBody>             
                    </Card>
                    <Modal isOpen={modal} size="lg" className="p-2">
                            <ModalHeader>Share Invoice</ModalHeader>
                            <ModalBody className=" flex      p-5">
                                {!_.isEmpty(ModalData) && Object.keys(ModalData).map((key,val)=>
                                        (key!=="encryptKey" && key!=="userId" && key!=="pin") &&
                                        <div key={key} className="col-lg-8 p-2">
                                            <Label>{key}</Label>
                                            <Input value={ModalData[key]} disabled></Input>
                                    </div>
                                )}
                                    <div className="col-lg-8 p-2">
                                            <Label>{"Share To"}</Label>
                                            <Input  type="select" onClick={e=>this.setState({selectedFriend:e.target.value})}>
                                                <option val={""}>{""}</option>    
                                                {friends && Object.keys(friends).map((key)=>
                                                    <option value={key}>{friends[key]}</option>
                                                )}
                                            </Input>
                                    </div>
                            </ModalBody>
                            <ModalFooter>
                                    <button className="btn btn-success" onClick={e=>this.share()}> Share</button>
                                    <button className="btn btn-danger" onClick={e=>this.setState({modal:false})}>Cancel</button>
                            </ModalFooter>
                    </Modal>
                    </div> 
                    
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