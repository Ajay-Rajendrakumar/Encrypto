import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Card,CardFooter,CardBody,CardHeader,
    Label,
   Input,
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../store/actions/basic.action.js";
import moment from "moment";
import { pythonUrl } from '../config.js';

class BillView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invoiceData:{},
            error_text:"",
            invoiceImage:"",
        }
    }
    
   
    componentDidMount(){
        let {bill_Data}={...this.props}
        console.log(bill_Data)
        
    }
    handleInputChange=(e)=>{
        let {invoiceData}={...this.state}
        invoiceData[e.target.name]=e.target.value
        this.setState({invoiceData})

    }

       toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        this.setState({loading:false})
    }
    getImage=(item)=>{
        let fd=new FormData()
        fd.append('userId',item['userId'])
        fd.append('invoice',item['InvoiceNumber'])
        fd.append('encryptKey',item['encryptKey'])
        this.props.distributer(fd,"getImage").then(response => {
            if(response['status']===200){
                    this.setState({currentImage:response['data']})
                    var imgtag = document.getElementById("image");
                    imgtag.src=pythonUrl+"/Image/"+response['data']
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
        this.setState({error_text:""})
    }

    render() {
        
        let {invoiceData,error_text,invoiceImage,invoiceFile,loading}={...this.state}
        let {bill_Data}={...this.props}
        return (
            <div className="row d-flex justify-content-center positionAbsolute col-lg-12">
                 <Card className="col-lg-8 mt-5 text-light" >
                                <CardHeader className="text-light  h1 text-center border-bottom">
                                    Invoice Details
                                    <button className="btn btn-sm btn-danger float-right" onClick={e=>this.props.close()}>Close</button>
                                </CardHeader>
                                <CardBody className="mt-3 row">
                                      {!_.isEmpty(bill_Data) && Object.keys(bill_Data).map((key,ind)=>
                                            (key!=="encryptKey" && key!=="userId") &&<div key={key} className="col-lg-3">
                                                <Label>{key}</Label>
                                                <Input value={bill_Data[key]} disabled></Input>
                                            </div>
                                      )}
                                </CardBody>
                                <CardFooter className="border-top border-light">     
                                        
                                </CardFooter>
                </Card>
                    
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BillView));