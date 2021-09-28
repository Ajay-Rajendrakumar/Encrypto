import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    CardFooter,
    Label,
   Input, Card, CardHeader, CardBody
  } from "reactstrap";
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
class ProductionEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            currentDate:moment().format("YYYY-MM-DD"),
            party_list:[],
            rateList:{},
            tear_list:['Vinayaka Tex','Vinayaka Mills','varsidhi'],
            production_List:[],
            currentProduction:{},
            inputObj:{
                "Day Shift Bale":"dayshift",
                "Day Shift Weight":"dayweight",
                "Night Shift Bale":"nightshift",
                "Night Shift Weight":"nightweight",
            },
            baleReturn:false,
            multipleSales:false,
            error_text:"",
        }
    }
    
    componentDidMount(){
        document.getElementById("ProductionDiv").addEventListener("keydown", (e) =>this.checkKey(e))
    }
    componentWillUnmount(){
        document.getElementById("ProductionDiv").removeEventListener("keydown", (e) =>this.checkKey(e))
    }
    checkKey=(e)=> {
        let {currentDate}={...this.state}
        e = e || window.event; 
        if (e.key === 'ArrowUp') {
            currentDate=moment(currentDate).subtract(1, 'month').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowDown') {
            currentDate=moment(currentDate).add(1, 'month').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowRight') {
            currentDate=moment(currentDate).add(1, 'days').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowLeft') {
            currentDate=moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD'); 
        }else  if (e.key === 'Enter') {
            this.handleProductionAdd()     
            document.getElementById('unit').focus()
        }
        this.setState({currentDate})
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    getParty=(party)=>{
        return party.toLowerCase().replace(/ /g, "_");
  
    }


    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }


    handleInputChange=(e)=>{
        let {currentProduction,currentDate}={...this.state}
        currentProduction[e.target.name]=e.target.value
        if((e.target.name).includes('unit')){
            currentProduction[e.target.name]=this.getParty(e.target.value)

        }else
        if((e.target.name).includes('weight')){
            currentProduction['totalweight']=parseFloat(currentProduction['dayweight'])+parseFloat(currentProduction["nightweight"])
        }else if((e.target.name).includes('shift')){
            currentProduction['totalbale']=parseFloat(currentProduction['dayshift'])+parseFloat(currentProduction["nightshift"])
        }
        this.setState({currentProduction})

    }
    
    handleProductionAdd=()=>{
        let {production_List,currentProduction,currentDate}={...this.state}
        currentProduction['date']=currentDate
        let valid=this.props.validateEntry(currentProduction)
        if(valid['result']){
            production_List.push(currentProduction)
            currentProduction={}
            this.setState({production_List,currentProduction,error_text:""})
        }else{
            this.setState({error_text:valid['error']})
        }   
        
    }
    uploadList=()=>{
        let {production_List}={...this.state}
        if(production_List.length>0){
            this.props.distributer(production_List,"uploadProduction").then(response => {
                if(response['status']===200){
                    this.toasterHandler("success",response['msg'])
                    this.props.getProduction()
                    this.setState({production_List:[]})
                }else{ 
                this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", err)
            })
        }
        
    }
    editProduction=(val,ind)=>{
        let {currentProduction,production_List}={...this.state}
        Object.keys(val).forEach((key,ind)=>{
            currentProduction[key]=val[key]
        })
        production_List.splice(((production_List.length-1)-ind),1)
        this.setState({currentProduction,production_List})
    }
    deleteProduction=(val,ind)=>{
        let {production_List}={...this.state}
        production_List.splice(((production_List.length-1)-ind),1)
        this.setState({production_List})
    }

    toLocale=(val)=>{
        return parseFloat(val).toLocaleString('en-IN')
    }
    render() {
        let {currentDate,inputObj,currentProduction,production_List,error_text}={...this.state}
        let {unit_list}={...this.props}
        return (
            <div id="ProductionDiv" className="flex d-flex justify-content-center row">
              <Card className="col-lg-12 p-2 mt-n4">
                  <CardHeader className={"text-light font-weight-bold h5  bg-info"}>
                     <div className="flex p-1">
                     <span className="p-1">{"Production Entry"}</span>
                        <div className="float-right">
                            <Input type="date"  value={currentDate} onChange={e=>this.setState({currentDate:e.target.value})} />
                        </div>
                    </div> 
                    </CardHeader>
                  <CardBody className="row col-lg-10 d-flex justify-content-center">
                        <div className="col-lg-2">
                        <Label className="text-primary">Unit</Label> 
                        <Input type="select" name="unit" id="unit" value={((currentProduction && currentProduction['unit']) || " ")} onChange={e=>this.handleInputChange(e)}>
                        <option >{" "}</option>
                        {unit_list.map((unit,ind)=>
                            <option key={ind} value={unit}>{this.getName(unit)}</option>
                        )}
                    </Input>
                        </div>
                      {inputObj && Object.keys(inputObj).map((key,ind)=>  
                            <div className="col-lg-2">
                            <Label className="text-primary">{key}</Label>
                            <Input value={((currentProduction && currentProduction[inputObj[key]]) || "")}  name={inputObj[key]} onChange={e=>this.handleInputChange(e)}/>
                            </div>
                        )}
                       
                      
                        
                  </CardBody>
                  <CardFooter className="row m-2">
                        <div className="col-lg-12 d-flex justify-content-center">
                            {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                        </div>
                        <div className="col-12">
                            <button className="btn btn-danger float-right" onClick={e=>this.setState({currentProduction:{}})}>Clear</button>
                            <button className="btn   btn-primary float-right mr-2" onClick={e=>{this.handleProductionAdd()}}>Add</button>
                           
                        </div>
                        </CardFooter>
              </Card>
              <div className=" d-flex justify-content-center row col-lg-12 m-2">
                  <hr></hr>
                  <Card className="col-lg-12 h6">
                      <CardHeader>
                 {production_List && <div className="flex row bg-info font-weight-bold h6 text-light p-3 m-1">
                                <div className="col-lg-1">Date</div>
                               <div className="col-lg-2">Unit</div>
                               <div className="col-lg-1">DS Bale</div>
                               <div className="col-lg-2">DS Weight</div>
                               <div className="col-lg-1">NS Bale</div>
                               <div className="col-lg-2">NS Weight</div>
                               <div className="col-lg-1">Total Bales</div>
                               <div className="col-lg-1">Total Weight</div>
                               <div className="col-lg-1">Actions</div>
                            </div>}
                            </CardHeader>
                            <CardBody>
                    {production_List && (production_List).slice(0).reverse().map((val,ind)=>
                           <div key={ind} className={"flex row border m-1 p-3 "}>
                                <div className="col-lg-1">{val['date']}</div>
                               <div className="col-lg-2">{this.getName(val['unit'])}</div>
                               <div className="col-lg-1">{val['dayshift']}</div>
                               <div className="col-lg-2">{this.toLocale(val['dayweight'])}</div>
                               <div className="col-lg-1">{val['nightshift']}</div>
                               <div className="col-lg-2">{this.toLocale(val['nightweight'])}</div>
                               <div className="col-lg-1">{val['totalbale']}</div>
                               <div className="col-lg-1">{this.toLocale(val['totalweight'])}</div>
                               <div className="col-1">
                                        <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.editProduction(val,ind)}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteProduction(val,ind)}></i>
                                </div>
                            </div>
                    )}
                    </CardBody>
                    <CardFooter>
                    <div className="col-12">
                    <button className={"btn btn-sm font-weight-bold  btn-dark float-right"} onClick={e=>this.uploadList()}><i className="fa fal-lg fa-upload" aria-hidden="true"></i> Upload</button>
                    </div>
                    </CardFooter>
                    
                    </Card>
                   
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        unit_list:state.Reducer.unit_list
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductionEntry));