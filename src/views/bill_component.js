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


class Bill extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invoiceData:{},
            error_text:"",
            invoiceImage:"",
        }
    }
    
   
    componentDidMount(){
        let {invoiceData}={...this.state}
        invoiceData["date"]=moment().format('YYYY-MM-DD')
        invoiceData["estimate"]=moment().format('YYYY-MM-DD')
        this.setState({invoiceData})
        
    }
    handleInputChange=(e)=>{
        let {invoiceData}={...this.state}
        invoiceData[e.target.name]=e.target.value
        this.setState({invoiceData})

    }
    onImageChange = (event) => {
        let file=event.target.files[0]
        var selectedFile = event.target.files[0];
        var reader = new FileReader();
        this.setState({ selectedFile: file, fileName:file.name },()=>{
        var imgtag = document.getElementById("imageViewerDiv");
        reader.onload = function(event) {
            imgtag.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
        this.setState({ selectedFile: file,invoiceFile:true })});
    }
    deleteInvoice=()=>{
        let {selectedFile,invoiceFile}={...this.state}
        selectedFile=""
        invoiceFile=!invoiceFile
        var imgtag = document.getElementById("imageViewerDiv");
        imgtag.src=""
        this.setState({selectedFile,invoiceFile})
    }
    saveInvoice=()=>{
        let {selectedFile,invoiceData,fileName}={...this.state}
        let {user_data}={...this.props}
        let valid = this.validUserDate()
        let fd = new FormData()
        fd.append("image",selectedFile)
        Object.keys(invoiceData).forEach((key)=>{
            fd.append(key,invoiceData[key])
        })
        fd.append('userId',user_data['userId'])
        console.log(user_data)
        if(valid['valid']){
            this.setState({loading:true})
            this.props.distributer(fd,"uploadInvoice").then(response => {
                if(response['status']===200){
                        this.toasterHandler("success","Invoice Added Successfully")
                        this.setState({loading:false},()=>this.props.close())
                }else{ 
                  this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
              }).catch((err)=>{
                this.toasterHandler("error", err)
              })
            this.setState({error_text:""})
        }else{
            this.toasterHandler("error",valid['msg'])
        }
    }
    validUserDate=()=>{
        let {invoiceData}={...this.state}
        let error_text=""

        if( !("company" in invoiceData) || invoiceData['company']===""){
            error_text="Invalid Company!"
        }else if( !("invoice" in invoiceData) ||invoiceData['invoice']===""){
            error_text="Invalid Invoice Number!"
        }else if( !("key" in invoiceData) ||invoiceData['key']===""){
            error_text="Invalid PIN!"
        }else if( !("date" in invoiceData) ||invoiceData['date']===""){
            error_text="Invalid Date!"
        }else if( !("estimate" in invoiceData) ||invoiceData['estimate']===""){
            error_text="Invalid Estimate!"
        }

        if(error_text===""){
            return {"valid":true}
        }else{
            return {"valid":false,"msg":error_text}
        }
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        this.setState({loading:false})
    }

    render() {
        
        let {invoiceData,error_text,invoiceImage,invoiceFile,loading}={...this.state}
       
        return (
            <div className="row d-flex justify-content-center positionAbsolute col-lg-12">
                 <Card className="col-lg-8 mt-5 text-light" >
                                <CardHeader className="text-light  h1 text-center border-bottom">
                                Invoice Entry
                                </CardHeader>
                                <CardBody className="mt-3">
                                        <div className="row d-flex justify-content-center mt-n3">
                                            <div className="col-lg-2  p-2">
                                                <Label>Company</Label>
                                                <Input type="text" value={(invoiceData['company'] || "")} name="company" onChange={e=>this.handleInputChange(e)} autoComplete="off"></Input>
                                            </div>
                                            <div className="col-lg-2 p-2">
                                                <Label>Invoice Number</Label>
                                                <Input type="text" value={(invoiceData['invoice'] || "")}  name="invoice" onChange={e=>this.handleInputChange(e)} autoComplete="off"></Input>
                                            </div>
                                            <div className="col-lg-2 p-2">
                                                <Label>PIN</Label>
                                                <Input type="password" value={(invoiceData['key'] || "")}  name="key" onChange={e=>this.handleInputChange(e)} autoComplete="off"></Input>
                                            </div>
                                            <div className="col-lg-3  p-2">
                                                <Label>Invoice Date</Label>
                                                <Input type="date" value={(invoiceData['date'] || "")}  name="date" onChange={e=>this.handleInputChange(e)} autoComplete="off"></Input>
                                            </div>
                                            <div className="col-lg-3  p-2">
                                                <Label>Estimated Delivery</Label>
                                                <Input type="date" value={(invoiceData['estimate'] || "")}  name="estimate" onChange={e=>this.handleInputChange(e)} autoComplete="off"></Input>
                                            </div>
                                            <div className="col-lg-12  p-3"> 
                                                <button className="btn btn-success float-right btn-sm" onClick={e=>document.getElementById('upImage').click()} disabled={invoiceFile}><i className="fa fa-upload mr-2"></i>Upload Invoice</button>
                                                <input type="file" onChange={e=>this.onImageChange(e)} className="filetype" hidden id="upImage"/>
                                            </div>
                                            <div className="col-lg-12 row">
                                                {invoiceFile ?
                                                     <Label className="h4">Invoice <button className="btn-danger btn btn-sm" onClick={e=>this.deleteInvoice()}>Delete</button></Label>
                                                    :
                                                    <span className="text-danger col-lg-12 text-center p-3"><i className="fa fa-exclamation-circle mr-2"></i>No Invoice uploaded</span>
                                                    }
                                                <img id="imageViewerDiv" ></img>
                                            </div>

                                        </div>
                                        <div className="d-flex justify-content-center col-lg-12">
                                            {error_text!=="" && <span className="text-danger"><i className="fa fa-exclamation-circle mr-1"></i>{error_text}</span>}
                                        </div>
                                </CardBody>
                                <CardFooter className="border-top border-light">     
                                                <div className="float-right  p-2"> 
                                                    <button className="btn btn-danger" onClick={e=>this.props.close()} disabled={loading}>Close</button>
                                                </div>                
                                                <div className="float-right  p-2"> 
                                                   {!loading?
                                                    <button className="btn btn-primary" onClick={e=>this.saveInvoice()} disabled={!invoiceFile}> 
                                                        <i className="fa fa-save mr-2"></i>Upload
                                                    </button>
                                                   :
                                                    <button className="btn btn-primary" disabled={!invoiceFile}>
                                                        <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                                                    </button>
                                                    }
                                                </div>
                                                
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Bill));