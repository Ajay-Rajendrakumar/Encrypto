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
class Thada extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal:false,
            editedMaterial:{},
            filterName:"",
            addedMaterial:{},
            error_text:"",
        }
    }
    
    componentDidMount(){
        if(this.props.material_list.length>0){
            this.setState({currentList:this.props.material_list,materialList:this.props.material_list})
        }else{
            this.getMaterial()
        }
      
    }

    getMaterial=()=>{
        this.props.distributer({},"materialList").then(response => {
            if(response['status']===200){
              let material=response['data']    
              this.setState({currentList:material,materialList:material})
              this.props.dataStoreSetter(response['data'],"MATERIAL_LIST")

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
        let { editedMaterial,mode,addedMaterial } = { ...this.state }
        if(mode==="add"){
            addedMaterial[e.target.name] = e.target.value       
            this.setState({ addedMaterial })
        }else{
            editedMaterial[e.target.name] = e.target.value       
            this.setState({ editedMaterial })
        }
    }

 

    upload=()=>{
        let {addedMaterial}={...this.state}
        let valid=this.validateEntry(addedMaterial)
        if(valid['result']){
            this.props.distributer(this.setParameter(),"uploadMaterial").then(response => {
                console.log(response,response['data'])
                if(response['status']===200){
                this.getMaterial()
                this.setState({editedMaterial:{},modal:false})
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

    validateEntry=(material)=>{
        let error_text=""

        if(!("symbol" in material) || material['symbol']===""){
            error_text="Invalid Material Symbol"
            return {"result":false,"error":error_text}
        }

        if(!("name" in material) || material['name']===""){
            error_text="Invalid Material Name"
            return {"result":false,"error":error_text}
        }
        if(!("rate" in material) || material['rate']==="" || material['rate']<0){
            error_text="Invalid rate"
            return {"result":false,"error":error_text}
        }    
        this.setState({error_text:""})
        return {"result":true}
    }

    editMaterial=()=>{
        let {editedMaterial}={...this.state}
        let valid=this.validateEntry(editedMaterial)
        if(valid['result']){
            this.props.distributer(editedMaterial,"editMaterial").then(response => {
                if(response['status']===200){
                    this.setState({addedMaterial:{},modal:false})
                    this.getMaterial()
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
    deleteMaterial=(item)=>{
        if(window.confirm("Are you sure?")){
            this.props.distributer(item,"deleteMaterial").then(response => {
                if(response['status']===200){
                    this.getMaterial()
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
        
    }

    setParameter=()=>{
        let {addedMaterial}={...this.state}
        let obj={
            material:addedMaterial['symbol'],
            name:addedMaterial['name'],
            rate:Math.abs(addedMaterial['rate']),
        }
        // Object.keys(materialList).map((item,ind)=>{
        //     let obj={
        //         material:item,
        //         name:materialList[item],
        //         rate:rateList[item]
        //     }
        //     fd[ind]=obj
        // })
        let fd={
            "1":obj
        }
        console.log(fd)
        return fd
    }
    handleFilterChange=(val)=>{
        let {currentList,materialList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(materialList, function(o) { return ((o['name'].toLowerCase()).includes(filterName.toLowerCase()) || (o['symbol'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName})
    }
    render() {
        let {currentList,modal,editedMaterial,filterName,mode,addedMaterial,error_text}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
                    <Card className="col-lg-8">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row m-1">
                                    <div className="col-6">Name</div>
                                    <div className="col-2">Material</div>
                                    <div className="col-2">Rate</div>
                                    <div className="col-2">Actions</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                        <span className="col-lg-6"><button className="btn  btn-sm btn-success" onClick={e=>this.setState({modal:true,mode:"add"})}><i className="fa fa-lg fa-plus m-2 c-pointer text-light"></i>New Material</button></span>
                                   
                                </div>
                    {currentList && currentList.map((item,ind)=>
                                <div className="row m-1  border p-3" key={ind}>
                                    <div className="col-6">{ind+1+") "}{item['name']}</div>
                                    <div className="col-2">{item['symbol']}</div>
                                    <div className="col-2">{item['rate']}</div>
                                    <div className="col-2">
                                        <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.setState({editedMaterial:item,modal:true,mode:"edit"})}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteMaterial(item)}></i>
                                        </div>
                                </div>
                    )}
                    </CardBody>
                    </Card>   

                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <ModalHeader className=" h4 text-light bg-info">
                    <span >{mode==="add"?"New":"Edit"} Material</span>
                    </ModalHeader>
                    <ModalBody>
                        {mode==="add"?
                                <div className="flex row m-4  p-3">
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Name:</div>
                                            <div className="col-lg-6 row"><Input value={addedMaterial['name'] || ""} name="name" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Material:</div>
                                            <div className="col-lg-6 row"><Input value={addedMaterial['symbol'] || ""} name="symbol" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Rate:</div>
                                            <div className="col-lg-6 row"><Input type="number" value={addedMaterial['rate'] || ""} name="rate" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>

                                </div>
                                :
                                <div className="flex row m-4">
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold text-primary">Name:</div>
                                            <div className="col-lg-6 row"><Input value={editedMaterial['name']} name="name" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold text-primary">Material:</div>
                                            <div className="col-lg-6 row"><Input  disabled value={editedMaterial['symbol']} name="symbol" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold text-primary">Rate:</div>
                                            <div className="col-lg-6 row"><Input type="number" value={editedMaterial['rate']} name="rate" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
  
                                </div>
                          }
                    </ModalBody>
                    <ModalFooter>
                        <div className="col-lg-7 m-2 d-flex justify-content-center">
                                        {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                        </div>
                        <button className="btn btn-success" onClick={e=> 
                                            
                                            mode==="add"?
                                                (this.upload())
                                                :
                                                (this.editMaterial())

                                            
                                            
                                            }>Save</button>{' '}
                        <button className="btn btn-danger" onClick={e=>this.setState({editedMaterial:{},modal:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>   
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        material_list: state.Reducer.material_list,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Thada));