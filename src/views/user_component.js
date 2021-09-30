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

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userList:[],
            friendList:[],
            type:true,
            currentList:{}
        }
    }
    
   
    componentDidMount(){

        this.userList()
        
    }
    userList=()=>{
        let {user_data}={...this.props}        
        this.setState({loading:true})
        this.props.distributer({'userId':user_data['userId']},"userList").then(response => {
            if(response['status']===200){
                    response=response['data']
                    this.setState({userList:response['user'],friendList:response['friend'],loading:false,currentList:response['user']})
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

    ChangeList=()=>{
        let {currentList,friendList,userList,type}={...this.state}
        if(type){
            currentList=friendList
        }else{
            currentList=userList
        }
        type=!type
        this.setState({currentList,type})
    }

    Friend=(id,name)=>{
        let {user_data}={...this.props}  
        console.log(user_data)
        let {type}={...this.state}
        console.log(type)
        let api="addFriend"
        if(!type){
            api="removeFriend"
        }
        let obj={
            'userId':user_data['userId'],
            "frdId":id,
            "frdname":name,
            "name":user_data['user']['name']
        }      
        this.props.distributer(obj,api).then(response => {
            if(response['status']===200){
                    this.toasterHandler("success","Friend Added Successfully")
                    this.userList()
            }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
            }).catch((err)=>{
            this.toasterHandler("error", err)
            }) 
    }
    render() {
        let {currentList,loading,type}={...this.state}
       
        return (
            <div className="flex row">
                <div className="col-lg-12 p-3">
                    <div className="col-lg-12 d-flex justify-content-center">
                    <Card className="col-lg-8 h6 mt-4">
                      <CardHeader className="text-center">
                            <div className="h3 p-3">{type?"Available Users ":"Friends "}
                            <button className="btn btn-sm btn-secondary  mb-2 ml-3" onClick={e=>this.userList()}> <i className="fa fa-refresh"> </i> </button>
                            <button className="btn btn-sm btn-primary  float-right mb-2 ml-3" onClick={e=>this.ChangeList()}> <i className="fa fa-arrow-h mr-1">Change List </i> </button>
                            </div>
                            {<div className="flex row bg-info font-weight-bold h6 text-light p-3  ">
                                        <div className="col-lg-1" >Sno</div>
                                        <div className="col-lg-6" >Name</div>
                                        <div className="col-lg-5" >Action</div>
                                        </div>}
                            </CardHeader>      
                            <CardBody className="row flex">
                            {/* {<div className="row m-1  border p-3">
                                <span className="col-lg-12"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>     
                            </div>} */}
                            {!_.isEmpty(currentList) && Object.keys(currentList).map((key,ind)=>

                                        <div  className="row m-1 p-2 d-flex col-lg-12 text-center">
                                        <div className="col-lg-1">{ind+1}</div>
                                        <div className="col-lg-6">{currentList[key]}</div>
                                        <div className="col-lg-5">
                                                <button className={"btn btn-sm "+(type?" btn-success":" btn-danger")}  disabled={!type} onClick={e=>this.Friend(key,currentList[key])}><i className={"fa "+(type?" fa-plus":"fa-minus")}></i> {type?"Add ":"Remove "} Friend</button>
                                        </div>
                                        </div>
                                )}
                                <div className="d-flex justify-content-center col-lg-12">
                                            {loading?         
                                                <div className="spinner-border text-light spinner-border-sm" role="status"></div>
                                                :   null
                                            }
                                        </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(User));