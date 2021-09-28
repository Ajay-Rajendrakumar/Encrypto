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


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bill_component:false,
            currentList:[],
        }
    }
    
   
    componentDidMount(){
        // let {user_data}={...this.props}
        this.InvoiceList()
        
    }
    InvoiceList=()=>{
        let {user_data}={...this.props}
        let fd=new FormData()
        fd.append('userId',user_data['userId'])
        this.setState({loading:true})
        this.props.distributer(fd,"invoiceList").then(response => {
            if(response['status']===200){
                    this.setState({currentList:response['data']})
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
    render() {
        let {bill_component,currentList}={...this.state}
       
        return (
            <div className="flex row">
                <div className="col-lg-12 p-3">
                    <button className="btn btn-sm btn-primary float-right" onClick={e=>this.setState({bill_component:true})}><i className="fa fa-plus mr-2    ">New Invoice</i></button>
                    <div className="col-lg-12 d-flex justify-content-center">
                    {bill_component &&
                 <div className="col-lg-12 positionAbsolute">    
                        <Bill close={e=>this.setState({bill_component:false})} ></Bill>
                </div>}
                    <Card className="col-lg-8 h6 mt-4">
                      <CardHeader>
                            {<div className="flex row bg-info font-weight-bold h6 text-light p-3">
                                        <div className="col-lg-2">Sno</div>
                                        <div className="col-lg-2">Bill Date</div>
                                        <div className="col-lg-2">Invoice Number</div>
                                        <div className="col-lg-3">Company </div>
                                        <div className="col-lg-3">Estimater Delivery </div>
                                        </div>}
                            </CardHeader>      
                            <CardBody className="row flex">
                            {/* {<div className="row m-1  border p-3">
                                <span className="col-lg-12"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>     
                            </div>} */}
                            {currentList && currentList.map((item,ind)=>

                                        <div  className="row d-flex col-lg-12">
                                        <div className="col-lg-2">{ind+1}</div>
                                        <div className="col-lg-2">{item['Bill Date']}</div>
                                        <div className="col-lg-2">{item['Invoice Number']}</div>
                                        <div className="col-lg-3">{item['Company']}</div>
                                        <div className="col-lg-3">{item['Estimated Delivery']}</div>
                                        </div>
                                )}
                             </CardBody>             
                    </Card>
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