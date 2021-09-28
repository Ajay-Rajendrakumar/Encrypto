import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Card,CardHeader,CardBody,CardFooter,Label,Input
  } from "reactstrap";
import * as basic from "../store/actions/basic.action.js";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSection:"login",
            userData:{},
            error_text:"",
            loading:false,
        }
    }
    
    componentDidMount(){
   
    }
  
    ChangeSection=()=>{
        let {currentSection}={...this.state}
        if(currentSection==="login"){
            currentSection="signin"
        }else{
            currentSection="login"
        }
        this.setState({currentSection,userData:{}})
    }

    handleInputChange=(e)=>{
        let {userData}={...this.state}
            userData[e.target.name]=e.target.value
        this.setState({userData})

    }
   
    handleLogin=()=>{
        let {userData,currentSection}={...this.state}
        let valid = this.validUserDate()
        if(valid['valid']){
            this.setState({loading:true})
            this.props.distributer(userData,currentSection).then(response => {
                if(response['status']===200){
                    this.props.dataStoreSetter(response['data'],"USER_DATA")
                    this.setState({loading:false},()=>{
                        this.props.history.push("/dashboard");
                    })
                }else{ 
                  this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
              }).catch((err)=>{
                this.toasterHandler("error", err)
              })
            this.setState({error_text:""})
        }else{
            this.setState({error_text:valid['msg']})
        }
    }
    validUserDate=()=>{
        let {userData,currentSection}={...this.state}
        let error_text=""

        if( !("username" in userData) || userData['username']===""){
            error_text="Invalid Username!"
        }else if( !("password" in userData) ||userData['password']===""){
            error_text="Invalid Username!"
        }else if(currentSection==="signin" && (!("repassword" in userData) ||   userData['repassword']==="" || userData['repassword']!==userData['password'])){
            error_text="Password Mismatch!"
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
        let {currentSection,userData,error_text,loading}={...this.state}
        return (
            <div>
                <div className="flex col-12">
                    <div className="row d-flex justify-content-center p-5">
                       <Card className="col-lg-4 mt-5 text-light">
                                <CardHeader className="text-info h1 text-center">
                                        {currentSection==="login"?"Login":"Sign in"}
                                </CardHeader>
                                <CardBody>
                                        <div className="row d-flex justify-content-center mt-n3">
                                            <div className="col-lg-10 m-2 p-2">
                                                <Label>Username</Label>
                                                <Input type="text" value={(userData['username'] || "")} name="username" onChange={e=>this.handleInputChange(e)}></Input>
                                            </div>
                                            <div className="col-lg-10 m-2 p-2">
                                                <Label>Password</Label>
                                                <Input type="password" value={(userData['password'] || "")}  name="password" onChange={e=>this.handleInputChange(e)}></Input>
                                            </div>
                                            {currentSection!=="login" && 
                                                <div className="col-lg-10 m-2 p-2">
                                                <Label>ReEnter Password </Label>
                                                <Input type="password" value={(userData['repassword'] || "")} name="repassword" onChange={e=>this.handleInputChange(e)}></Input>
                                                </div>
                                            }

                                        </div>
                                        <div className="d-flex justify-content-center col-lg-12">
                                            {error_text!=="" && <span className="text-danger"><i className="fa fa-exclamation-circle mr-1"></i>{error_text}</span>}
                                        </div>
                                </CardBody>
                                <CardFooter className="row flex d-flex justify-content-center">
                                    <span className="col-lg-12 row flex d-flex justify-content-center">
                                        <button className="btn btn-info  btn-lg h4 col-lg-6" onClick={e=>this.handleLogin()} disabled={loading}>
                                            {!loading?           
                                                currentSection==="login"?"Login":"Create Account"
                                            :
                                                <div className="spinner-border text-light" role="status"></div>
                                            }
                                        
                                        </button>
                                    </span>
                                    <button className="btn btn-sm btn-dark float-right" disabled={loading} onClick={e=>this.ChangeSection()}>
                                                <i className="fa fa-user mr-1"></i>
                                                {currentSection!=="login"?
                                                "Login"
                                                :
                                                "SignIn"}
                                    </button>
                                
                                </CardFooter>

                       </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month,


    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));