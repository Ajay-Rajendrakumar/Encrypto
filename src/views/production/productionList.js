import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Label,Input,Modal,ModalHeader,ModalBody,ModalFooter,CardFooter, Card, CardHeader, CardBody
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';

class ProductionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            sortList:{
                date:false,
                unit:false,
                dayshift:false,
                nightshift:false,
                day_bale:false,
                night_bale:false,
                totalweight:false,
                totalbale:false,
            },
            currentDate:"",
            production_Filter:[],
            prop_production_List:[],
            props_month_sales:[],
            cur_date:"",
            current_month:"",
            error_text:"",
        }
    }
    
    componentDidMount(){
        let {prop_production_List}={...this.state}
        this.setState({production_List:prop_production_List,production_Filter:prop_production_List})
        if(prop_production_List.length>0){
            this.calculate(prop_production_List)
        }else{
            this.generateMonth(moment().format('YYYY-MM'))
        }
    }
    componentDidUpdate(){
        let {prop_production_List}={...this.state}
          if(prop_production_List!==this.props.production_List){
            this.setState({prop_production_List:this.props.production_List },()=>{
                this.setState({production_List:this.props.production_List ,production_Filter:this.props.production_List })
                this.calculate(this.props.production_List)
            })
        }
  
    }
    calculate=(list)=>{
        let ds_bale=0
        let ds_weight=0
        let ns_bale=0
        let ns_weight=0
        let date=""
        _.sortBy(list,"date").forEach((val)=>{
            ds_bale=ds_bale+parseFloat(val["dayshift"])
            ns_bale=ns_bale+parseFloat(val["nightshift"])
            ds_weight=ds_weight+parseFloat(val["dayweight"])
            ns_weight=ns_weight+parseFloat(val["nightweight"])
            date=val["date"]
        })
        let obj={
            date:date,
            ds_bale:ds_bale,
            ns_bale:ns_bale,
            ds_weight:(ds_weight).toFixed(2),
            ns_weight:(ns_weight).toFixed(2),
            total_production:(ds_weight+ns_weight).toFixed(2)
        }
        this.setState({prod_cummulative:obj})
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    generateMonth=(date)=>{
        let cur_date=date
        date=date+"-01"
        let date_month=moment(date).format('MMMM')
        moment().format('YYYY-MM')
        let data={
            "start_date":moment(date).format("YYYY-MM")+'-01',
            "end_date":moment(date).format("YYYY-MM")+'-31',
            "month":date_month,
        }
        let currentMonth=moment().format("MMMM")
        if(date_month===currentMonth){
            data['end_date']=moment().format("YYYY-MM-DD")
        }
        this.setState({current_month:data,cur_date:cur_date},()=>{
            this.props.getProduction(data)
        })
        

    }
    handleFilterChange=(val)=>{
        let {production_Filter,production_List,filterName}={...this.state}
        filterName=val || ""
        production_List=_.filter(production_Filter, function(o) { 
                return (
                    (o['date']).includes(filterName) || 
                    (o['unit'].toLowerCase()).includes(filterName.toLowerCase()) || 
                    (o['dayshift']).includes(filterName) || 
                    (o['nightshift']).includes(filterName) || 
                    (o['dayweight']).includes(filterName) || 
                    (o['nightweight']).includes(filterName) ||
                    (o['totalweight'].includes(filterName)) ||
                    (o['totalbale'].includes(filterName))
                    ) 
                     });
        this.setState({production_List,filterName})
    }
    sorticon=(item)=>{
        return (
            <i className="fa fa-sort ml-2 c-pointer" aria-hidden="true" onClick={e=>this.handleSort(item)}></i>
        )
    }
    handleSort=(item)=>{
        let {production_Filter,production_List,filterName,sortList}={...this.state}
        production_List=_.sortBy(production_Filter, [function(o) { return o[item]; }]);
        if(!sortList[item]){
            production_List=production_List.reverse()
            
        }
        sortList[item]=!sortList[item]
        this.setState({production_List,filterName})
    }
  
    editProduction=(val,ind)=>{
        let {currentProduction,currentDate}={...this.state}
        currentProduction={...val}
        currentDate=currentProduction['date']
        this.setState({currentProduction,currentDate,modal:true})
    }
    edit=()=>{
        let {currentProduction,currentDate,current_month}={...this.state}
        currentProduction['date']=currentDate
        let valid=this.props.validateEntry(currentProduction)
        if(valid['result']){
            this.props.distributer(currentProduction,"editProduction").then(response => {
                if(response['status']===200){
                    this.setState({currentProduction:{},modal:false,error_text:""})
                    this.props.getProduction(current_month)
                }else{ 
                this.toasterHandler("error", (response['msg'] || "Cant reach the server"))
                }
            }).catch((err)=>{
                this.toasterHandler("error", err || "Cant reach the server")
            })
        }else{
            this.setState({error_text:valid['error']})
        }   
        
    }
    deleteProduction=(val,ind)=>{
        let {current_month}={...this.state}
        if(window.confirm("Are you sure?")){
        this.props.distributer(val,"deleteProduction").then(response => {
            if(response['status']===200){
                this.props.getProduction(current_month)
            }else{ 
              this.toasterHandler("error",(response['msg'] || "Cant reach the server"))
            }
          }).catch((err)=>{
              console.log("here",err)
            this.toasterHandler("error", err || "Cant reach the server")
          })
        }
        
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    handleInputChange=(e)=>{
        let {currentProduction}={...this.state}
        currentProduction[e.target.name]=e.target.value
        if((e.target.name).includes('weight')){
            currentProduction['totalweight']=parseFloat(currentProduction['dayweight'])+parseFloat(currentProduction["nightweight"])
        }else if((e.target.name).includes('shift')){
            currentProduction['totalbale']=parseFloat(currentProduction['dayshift'])+parseFloat(currentProduction["nightshift"])
        }
        this.setState({currentProduction})

    }

    toLocale=(val)=>{
        return parseFloat(val).toLocaleString('en-IN')
    }
    render() {
        let {production_List,filterName,currentProduction,modal,currentDate,prod_cummulative,cur_date,current_month,error_text}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                    <Card className="flex row col-lg-8 p-2">
                    <CardHeader className="bg-primary text-light font-weight-bold h5">
                        Production Information<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.props.getProduction(current_month)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-3 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                    </CardHeader>
                    <CardBody className="col-12 row">
                    {prod_cummulative && Object.keys(prod_cummulative).map((key,ind)=>
                        <div className="flex col-lg-2" key={ind}>
                                <Label className="text-primary">{this.getName(key)+":"}</Label>
                                <Input disabled value={(key!=="date"?this.toLocale(prod_cummulative[key]):prod_cummulative[key])}></Input>
                        </div>
                    )}
                    </CardBody>
                </Card>
                   <Card className="col-lg-12 h6 mt-4">
                      <CardHeader>
                 {<div className="flex row bg-info font-weight-bold h6 text-light p-3 m-1">
                               <div className="col-lg-1">Date {this.sorticon("date")}</div>
                               <div className="col-lg-2">Unit {this.sorticon("unit")}</div>
                               <div className="col-lg-1">DS Bale {this.sorticon("dayshift")}</div>
                               <div className="col-lg-2">DS Weight {this.sorticon("dayweight")}</div>
                               <div className="col-lg-1">NS Bale {this.sorticon("nightshift")}</div>
                               <div className="col-lg-2">NS Weight  {this.sorticon("nightweight")}</div>
                               <div className="col-lg-1">Total Bales {this.sorticon("totalbale")}</div>
                               <div className="col-lg-1">Total Weight {this.sorticon("totalweight")}</div>
                               <div className="col-lg-1">Actions</div>
                            </div>}
                            </CardHeader>
                            <div className="row m-1  border p-3">
                                <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
               
                            </div>
                            <CardBody>
                            {production_List && (production_List).map((val,ind)=>
                           <div  key={ind}  className={"flex row border m-1 p-3 "+(val['return']==='1'?" bg-danger text-light":"")}>
                               <div className="col-lg-1">{val['date']}</div>
                               <div className="col-lg-2">{this.getName(val['unit'])}</div>
                               <div className="col-lg-1">{val['dayshift']}</div>
                               <div className="col-lg-2">{this.toLocale(val['dayweight'])}</div>
                               <div className="col-lg-1">{val['nightshift']}</div>
                               <div className="col-lg-2">{this.toLocale(val['nightweight'])}</div>
                               <div className="col-lg-1">{val['totalbale']}</div>
                               <div className="col-lg-1">{this.toLocale(val['totalweight'])}</div>

                               <div className="col-1">
                                        <i className={"fa fa-lg fa-pencil c-pointer mr-2  text-success"} onClick={e=>this.editProduction(val,ind)}></i>
                                        <i className={"fa fa-lg fa-trash c-pointer  text-danger"} onClick={e=>this.deleteProduction(val,ind)}></i>
                                </div>
                            </div>
                    )}
                    {production_List && production_List.length<1 && <div className="text-danger  d-flex justify-content-center p-1">
                                    <i className="fa fa-lg fa-exclamation-circle  mr-1"></i> <span className="">No production to show</span>
                     </div>}
                    </CardBody>
                    <CardFooter>
                  
                    </CardFooter>
                    
                    </Card>

                <Modal className="modal-width" isOpen={modal} size="lg">
                    <ModalHeader className="text-light bg-info font-weight-bold">
                     <div className="flex">
                         <span>Edit Production</span> 
                    </div> 
                    </ModalHeader>
                <ModalBody className="row d-flex justify-content-center">
                <div className="col-lg-12 m-2">
                    <Input type="date"  value={currentDate} onChange={e=>this.setState({currentDate:e.target.value})}/>
                </div>
                <div className="col-lg-12 m-2">
                <Input type="select" name="unit" value={((currentProduction && currentProduction['unit']) || " ")} onChange={e=>this.handleInputChange(e)}>
                        <option >{" "}</option>
                        {this.props.unit_list && this.props.unit_list.map((unit,ind)=>
                            <option key={ind} value={unit}>{this.getName(unit)}</option>
                        )}
                    </Input>
                    </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary">Day Shift Bale</Label> 
                    <Input type="text" name="dayshift" value={((currentProduction && currentProduction['dayshift']) || " ")} onChange={e=>this.handleInputChange(e)}></Input>
                </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary">Day Shift Weight</Label>
                    <Input value={((currentProduction && currentProduction['dayweight']) || "")}  name="dayweight" onChange={e=>this.handleInputChange(e)}/>
                </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary">Night Shift Bale</Label> 
                    <Input type="text" name="nightshift" value={((currentProduction && currentProduction['nightshift']) || " ")} onChange={e=>this.handleInputChange(e)}></Input>
                </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary">Nigth Shift Weight</Label>
                    <Input value={((currentProduction && currentProduction['nightweight']) || "")}  name="nightweight" onChange={e=>this.handleInputChange(e)}/>
                </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary" >Total Bales</Label> 
                    <Input type="text" disabled name="totalbale" value={((currentProduction && currentProduction['totalbale']) || " ")} onChange={e=>this.handleInputChange(e)}></Input>
                </div>
                <div className="col-lg-5 m-2">
                    <Label className="text-primary">Total Weight</Label>
                    <Input disabled value={((currentProduction && currentProduction['totalweight'] )|| "")}  name="totalweight" onChange={e=>this.handleInputChange(e)}/>
                </div>
                    
                </ModalBody>
                <ModalFooter className="row m-2">
                        <div className="col-lg-12 d-flex justify-content-center">
                            {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                        </div>
                        <div className="col-12">
                            <button className="btn btn-danger float-right" onClick={e=>this.setState({currentProduction:{},modal:false})}>Close</button>
                            <button className="btn   btn-success float-right mr-2" onClick={e=>{this.edit()}}>Save</button>
                        </div>
                </ModalFooter>
              </Modal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        production_list: state.Reducer.production_list,
        fetch_month:state.Reducer.fetch_month

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductionList));