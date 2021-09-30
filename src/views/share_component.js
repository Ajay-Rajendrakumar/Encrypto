import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Card,CardFooter,CardBody,CardHeader,
  } from "reactstrap";
import {Tab,Tabs} from "react-bootstrap";
import _ from 'lodash';
import * as basic from "../store/actions/basic.action.js";
import moment from "moment";
import BillView from './bill_view.js'
class Share extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selfShareList:[],
            receivedList:[],
            bill_view:false,
        }
    }
    
    componentDidMount(){
        this.shareList()      
    }
    shareList=()=>{
        let {user_data}={...this.props}        
        this.setState({loading:true})
        this.props.distributer({'userId':user_data['userId']},"shareList").then(response => {
            if(response['status']===200){
                    response=response['data']
                    // this.setState({currentList:response,loading:false})
                    console.log(response)
                    let self=_.filter(response, function(o) { return o['InvoiceUser']===user_data['userId']; });
                    let others=_.filter(response, function(o) { return o['InvoiceUser']!==user_data['userId']; });
                    console.log(self,others)
                    this.setState({selfShareList:self,receivedList:others,loading:false})
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
        this.setState({error_text:""})
    }


    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        this.setState({loading:false})
    }

    ShowBill=(item)=>{
        this.setState({bill_Data:item['InvoiceInfo'],bill_view:true})
    }

    render() {
        let {selfShareList,loading,receivedList,bill_view,bill_Data}={...this.state}
       
        return (
            <div className="flex row">
                {bill_view &&
                        <div className="col-lg-12 p-3 positionAbsolute">    
                            <BillView close={e=>this.setState({bill_view:false})} bill_Data={bill_Data}></BillView>
                        </div>
                        }
                <div className="col-lg-12 p-3">
                <Tabs defaultActiveKey={"self"} className=" d-flex justify-content-center p-3 h5 ">
                    <Tab eventKey="self" title="Invoices Shared">
                            <div className="col-lg-12 d-flex justify-content-center">
                            <Card className="col-lg-8 h6 mt-4">
                                <CardHeader className="text-center">
                                <div className="h3 p-3">Shared Invoices
                                    <button className="btn btn-sm btn-secondary  mb-2 ml-3" onClick={e=>this.shareList()}> <i className="fa fa-refresh"> </i> </button>
                                </div>
                                {<div className="flex row bg-info font-weight-bold h6 text-light p-3  ">
                                            <div className="col-lg-1" >Sno</div>
                                            <div className="col-lg-2">Bill Date</div>
                                            <div className="col-lg-2">Invoice Number</div>
                                            <div className="col-lg-2">Company </div>
                                            <div className="col-lg-3">Estimated Delivery </div>
                                            <div className="col-lg-2" >Shared To</div>
                                            </div>}
                                </CardHeader>      
                                <CardBody className="row flex">
                                    {(selfShareList) && (selfShareList).map((item,ind)=>
                                            <div  className="row m-1 p-2 d-flex col-lg-12 text-center">
                                                <div className="col-lg-1">{ind+1}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['BillDate']}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['InvoiceNumber']}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['Company']}</div>
                                                <div className="col-lg-3">{item['InvoiceInfo']['EstimatedDelivery']}</div>
                                                <div className="col-lg-2">{item['userName']}</div>
                                                
                                            </div>
                                    )}
                                    {loading &&  <div className="row col-lg-12 mb-2 d-flex justify-content-center text-danger">
                                        <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                                        </div>
                                    }
                                    {selfShareList && selfShareList.length<=0 && <div className="row col-lg-12 d-flex justify-content-center text-danger">
                                        <i className="text-danger fa fa-exclamation-circle  mr-2"></i>No Invoices Shared!
                                    </div>
                                    }
                                    
                                </CardBody>  
                                </Card>           
                            </div>
                    </Tab>
                    <Tab eventKey="recieved" title="Invoices Recieved"  >
                    <div className="col-lg-12 d-flex justify-content-center">
                            <Card className="col-lg-8 h6 mt-4">
                                <CardHeader className="text-center">
                                <div className="h3 p-3">Invoices Recieved
                                    <button className="btn btn-sm btn-secondary  mb-2 ml-3" onClick={e=>this.shareList()}> <i className="fa fa-refresh"> </i> </button>
                                </div>
                                {<div className="flex row bg-info font-weight-bold h6 text-light p-3  ">
                                            <div className="col-lg-1" >Sno</div>
                                            <div className="col-lg-2">Bill Date</div>
                                            <div className="col-lg-2">Invoice Number</div>
                                            <div className="col-lg-2">Company </div>
                                            <div className="col-lg-2">Estimated Delivery </div>
                                            <div className="col-lg-2" >From </div>
                                            <div className="col-lg-1" >Action</div>
                                      
                                            </div>}
                                </CardHeader>      
                                <CardBody className="row flex">
                                    {(receivedList) && (receivedList).map((item,ind)=>
                                            <div  className="row m-1 p-2 d-flex col-lg-12 text-center">
                                                <div className="col-lg-1">{ind+1}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['BillDate']}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['InvoiceNumber']}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['Company']}</div>
                                                <div className="col-lg-2">{item['InvoiceInfo']['EstimatedDelivery']}</div>
                                                <div className="col-lg-2">{item['userName']}</div>
                                                <div className="col-lg-1" > <i className="fa fa-eye text-light mr-2 c-pointer" onClick={e=>this.ShowBill(item)}></i></div>
                                      
                                            </div>
                                    )}
                                    {loading &&  <div className="row col-lg-12 mb-2 d-flex justify-content-center text-danger">
                                        <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                                        </div>
                                    }
                                    
                                    {receivedList && receivedList.length<=0 && <div className="row col-lg-12 d-flex justify-content-center text-danger">
                                        <i className="text-danger fa fa-exclamation-circle  mr-2"></i>No Invoices Recieved!
                                    </div>
                                    }
                                    
                                </CardBody>  
                                </Card>           
                            </div>
                    </Tab>                  
                </Tabs>
                  
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Share));