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
            userPin:"",
            loading:false,
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
        let {userPin}={...this.state}
        let fd=new FormData()
        if(userPin!==""){
        this.setState({loading:true})
        fd.append('userId',item['userId'])
        fd.append('invoice',item['InvoiceNumber'])
        fd.append('encryptKey',item['encryptKey'])
        fd.append('userPIN',userPin)
        this.props.distributer(fd,"getImage").then(response => {
            if(response['status']===200){
                    this.setState({currentImage:response['data']})
                    var imgtag = document.getElementById("image");
                    this.setState({loading:false})
                    imgtag.src=pythonUrl+"/Image/"+response['data']
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            })
        }else{
            this.toasterHandler("error", "Invalid PIN")

        }
    }

    close=()=>{
        var imgtag = document.getElementById("image");
        imgtag.src=""
        this.props.close()
    }

    render() {
        
        let {userPin,loading}={...this.state}
        let {bill_Data}={...this.props}
        return (
            <div className="row d-flex justify-content-center positionAbsolute col-lg-12">
                 <Card className="col-lg-8 mt-5 text-light" >
                                <CardHeader className="text-light  h1 text-center border-bottom">
                                    Invoice Details
                                    <button className="btn btn-sm btn-danger float-right" onClick={e=>this.close()}>Close</button>
                                </CardHeader>
                                <CardBody className="mt-3 row">
                                      {!_.isEmpty(bill_Data) && Object.keys(bill_Data).map((key,ind)=>
                                            (key!=="encryptKey" && key!=="userId" && key!=="pin") &&<div key={key} className="col-lg-3">
                                                <Label>{key}</Label>
                                                <Input value={bill_Data[key]} disabled></Input>
                                            </div>
                                      )}
                                        <div className="row d-flex justify-content-center m-3 col-lg-12 border-secondary border-top border-bottom p-3">
                                            <div  className="col-lg-3">   
                                                <Input value={userPin}  placeholder="Enter PIN ..." pattern="[0-9]*" inputmode="numeric" type="number" onChange={e=>this.setState({userPin:e.target.value})}></Input>
                                            </div>
                                            <div  className="col-lg-3">
                                                <button className="btn btn-primary btn-sm" onClick={e=>this.getImage(bill_Data)} disabled={loading}>{loading?<div className="spinner-border text-light spinner-border-sm" role="status"></div> :"View Invoice"}</button>
                                            </div>
                                            
                                        </div>
                                        <Label>Invoice</Label>
                                        <div className="flex">
                                        <img id="image" ></img>
                                        </div>
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