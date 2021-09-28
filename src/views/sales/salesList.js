import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Label,Input,Modal,ModalHeader,ModalBody,ModalFooter, Card, CardHeader, CardBody
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import sales from '.';
import moment from 'moment';
class SalesList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            sortList:{
                date:false,
                party:false,
                weight:false,
                rate:false,
                tax:false,
                total:false,
                billno:false,
            },
            currentDate:"",
            monthly_data:{},
            prop_sales_List:[],
            props_month_sales:[],
            current_month:"",
            cur_date:"",
            error_text:"",
            
        }
    }
    
    componentDidMount(){
        let {sales_list}={...this.props}
        this.setState({sales_List:sales_list['list'],sales:sales_list['list'],cur_date:sales_list['month']})
        if(sales_list.length>0){
            this.calculateMonthly(sales_list['list'])
        }else{
            this.generateMonth(moment().format('YYYY-MM'))
        }
       
    }
    componentDidUpdate(){
        let {prop_sales_List}={...this.state}
          if(prop_sales_List!==this.props.sales_List && this.props.sales_List){    
            this.setState({prop_sales_List:this.props.sales_List },()=>{
                this.setState({sales_List:this.props.sales_List['list'] ,sales:this.props.sales_List['list'],cur_date:this.props.sales_List['month']  })
                this.calculateMonthly(this.props.sales_List['list'])
            })
        }
  
    }
    calculateMonthly=(sale)=>{
        console.log(sale)
        if(sales.length>0){
            let total_weight=0
            let total_cost=0
            let total_tax=0
            let total_bale=0
            let avg_rate=0
            sale && sale.forEach((bill,index)=>{
                if(bill['return']!=='1'){
                    total_weight=total_weight+ parseFloat(bill['weight'])
                    total_cost=total_cost+ parseFloat(bill['amount'])
                    total_bale=total_bale+parseFloat(bill['bale'])
                    total_tax=total_tax+parseFloat(bill['tax'])
                }else{
                    total_weight=total_weight- parseFloat(bill['weight'])
                    total_cost=total_cost- parseFloat(bill['amount'])
                    total_bale=total_bale-parseFloat(bill['bale'])
                    total_tax=total_tax-parseFloat(bill['tax'])
                }
            })
            avg_rate=(total_cost/total_weight).toFixed(2)
            let obj={
                total_weight:total_weight.toLocaleString('en-IN'),
                total_cost:total_cost.toLocaleString('en-IN'),
                total_tax:total_tax.toLocaleString('en-IN'),
                total_bale:total_bale,
                avg_rate:avg_rate,
                Loads: ((sale && sale.length) || 0),
            }
            this.setState({monthly_data:obj})
        }
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    
    handleFilterChange=(val)=>{
        let {sales,sales_List,filterName}={...this.state}
        filterName=val || ""
        sales_List=_.filter(sales, function(o) { 
                return (
                    (o['date']).includes(filterName) || 
                    (o['billno']).includes(filterName) || 
                    (o['party'].toLowerCase()).includes(filterName.toLowerCase()) || 
                    (o['bale']).includes(filterName) || 
                    (o['weight']).includes(filterName) || 
                    (o['rate']).includes(filterName) || 
                    (o['amount']).includes(filterName) ||
                    (o['tax'].includes(filterName)) ||
                    (o['total'].includes(filterName))
                    ) 
                     });
        this.calculateMonthly(sales_List)
        this.setState({sales_List,filterName})
    }
    sorticon=(item)=>{
        return (
            <i className="fa fa-sort ml-2 c-pointer" aria-hidden="true" onClick={e=>this.handleSort(item)}></i>
        )
    }
    handleSort=(item)=>{
        let {sales,sales_List,filterName,sortList}={...this.state}
        sales_List=_.sortBy(sales, [function(o) { return o[item]; }]);
        if(!sortList[item]){
            sales_List=sales_List.reverse()
            
        }
        sortList[item]=!sortList[item]
        this.setState({sales_List,filterName})
    }
    handlePartyInput=(e)=>{
        let {currentParty,currentDate}={...this.state}
        currentParty['date']=currentDate
        currentParty[e.target.name]=e.target.value
        if(e.target.name!=="tax"){
            currentParty=this.calculate(currentParty['weight']||0)
        }else{
            currentParty['total']=(parseFloat(currentParty['amount'])+parseFloat(currentParty['tax'])).toFixed(2)
        }
        this.setState({currentParty})
    }

    calculate=(weight)=>{
        let {currentParty}={...this.state}
        currentParty['rate']=parseFloat(currentParty['rate'] || 0)
        currentParty['amount']=parseFloat(currentParty['weight']*currentParty['rate']).toFixed(2)
        if(!currentParty['party'].toLowerCase().includes("vinayaka")){
            currentParty['tax']=parseFloat((weight*currentParty['rate'])*0.05).toFixed(2)
        }
        currentParty['total']=(parseFloat(currentParty['amount'])+parseFloat(currentParty['tax'])).toFixed(2)
        return currentParty
    }
    editSales=(val,ind)=>{
        let {currentParty,currentDate}={...this.state}
        currentParty={...val}
        currentDate=currentParty['date']
        this.setState({currentParty,currentDate,modal:true})
    }
    edit=()=>{
        let {currentParty,currentDate,current_month}={...this.state}
        currentParty['date']=currentDate
        let valid=this.props.validateEntry(currentParty)
        if(valid['result']){
            this.props.distributer(currentParty,"editSales").then(response => {
                if(response['status']===200){
                    this.setState({currentParty:{},modal:false,error_text:""})
                    this.props.getSales(current_month)
                }else{ 
                  this.toasterHandler("error", (response['msg'] || "Cant reach the server"))
                }
              }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
              })
        }else{
            this.setState({error_text:valid['error']})
        }    
    }
  
    deleteSales=(val,ind)=>{
        let {current_month}={...this.state}
        if(window.confirm("Are you sure?")){
        this.props.distributer(val,"deleteSales").then(response => {
            if(response['status']===200){
                this.props.getSales(current_month)
            }else{ 
              this.toasterHandler("error",( response['msg'] || "Cant reach the server"))
            }
          }).catch((err)=>{
            this.toasterHandler("error", err)
          })
        }
        
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
            this.props.getSales(data)
        })
        

    }

    render() {
        let {sales_List,filterName,currentParty,modal,currentDate,monthly_data,cur_date,current_month,error_text}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                <Card className="flex row col-lg-9 p-2">
                    <CardHeader className="bg-primary text-light font-weight-bold h5">
                        Sales Information<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.props.getSales(current_month)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-3 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                    
                    </CardHeader>
                    <CardBody className="col-12 row">
                    {monthly_data && Object.keys(monthly_data).map((key,ind)=>
                        <div className="flex col-lg-2" key={ind}>
                                <Label className="text-primary">{this.getName(key)+":"}</Label>
                                <Input disabled value={monthly_data[key]}></Input>
                      
                        </div>
                    )}
                    </CardBody>
                </Card>
                   <Card className="col-lg-12 h6 mt-4">
                      <CardHeader>
                            {sales_List && <div className="flex row bg-info font-weight-bold h6 text-light p-3 m-0">
                                        <div className="col-lg-1">Date {this.sorticon("date")}</div>
                                        <div className="col-lg-1">Bill No {this.sorticon("billno")}</div>
                                        <div className="col-lg-2">Party {this.sorticon("party")}</div>
                                        <div className="col-lg-1">Bale </div>
                                        <div className="col-lg-1">Weight{this.sorticon("weight")}</div>
                                        <div className="col-lg-1">Rate{this.sorticon("rate")}</div>
                                        <div className="col-lg-1">Amount</div>
                                        <div className="col-lg-1">Tax{this.sorticon("tax")}</div>
                                        <div className="col-lg-2">Total{this.sorticon("total")}</div>
                                        <div className="col-lg-1">Actions</div>
                                        </div>}
                            </CardHeader>      
                            <CardBody>
                            {<div className="row m-1  border p-3">
                                <span className="col-lg-12"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>     
                            </div>}
                            {sales_List && sales_List.length>0 ?
                            
                                (sales_List).map((val,ind)=>
                                <div  key={ind}  className={"flex row border m-1 p-3 "+(val['return']==='1'?" bg-danger text-light":"")}>
                                    <div className="col-lg-1">{val['date']}</div>
                                    <div className="col-lg-1">{val['billno']}</div>
                                    <div className="col-lg-2">{val['party']}</div>
                                    <div className="col-lg-1">{val['bale']}</div>
                                    <div className="col-lg-1">{val['weight']}</div>
                                    <div className="col-lg-1">{val['rate']}</div>
                                    <div className="col-lg-1">{parseInt(val['amount']).toLocaleString('en-IN')}</div>
                                    <div className="col-lg-1">{parseInt(val['tax']).toLocaleString('en-IN')}</div>
                                    <div className="col-lg-2">{parseInt(val['total']).toLocaleString('en-IN')}</div>
                                    <div className="col-1">
                                                <i className={"fa fa-lg fa-pencil c-pointer mr-2 "+(val['return']==='1'?"  text-light":" text-success")} onClick={e=>this.editSales(val,ind)}></i>
                                                <i className={"fa fa-lg fa-trash c-pointer "+(val['return']==='1'?"  text-light":" text-danger")} onClick={e=>this.deleteSales(val,ind)}></i>
                                        </div>
                                    </div>
                                ):
                                <div className="text-danger  d-flex justify-content-center ">
                                    <i className="fa fa-lg fa-exclamation-circle  mr-1"></i> <span className="">No sales to show</span>
                                </div>
                                }
                             </CardBody>             
                    </Card>

                    <Modal className="modal-width" isOpen={modal} size="lg">
                  <ModalHeader className="text-light bg-info font-weight-bold">
                     <div className="flex">
                     <span>Edit</span>
                     
                    </div> 
                    </ModalHeader>
                  <ModalBody className="row d-flex justify-content-center">
                  <div className="col-lg-12 m-2">
                            <Input type="date"  value={currentDate} onChange={e=>this.setState({currentDate:e.target.value})}/>
                    </div>
                  <div className="col-lg-12 m-2">
                            <Label className="text-primary">Bill Number</Label>
                            <Input value={((currentParty && currentParty['billno']) || "")}  name="billno" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-12 m-2">
                        <Label className="text-primary">Party</Label> 
                        <Input type="text" name="party" id="unit" value={((currentParty && currentParty['party']) || " ")} disabled onChange={e=>this.handlePartyInput(e)}>
                      
                    </Input>
                        </div>
                        <div className="col-lg-3 m-2">
                            <Label className="text-primary">Bale</Label>
                            <Input value={((currentParty && currentParty['bale'] )|| "")}  name="bale" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-3 m-2">
                            <Label className="text-primary">Weight</Label>
                            <Input value={((currentParty && currentParty['weight']) || "")} name="weight" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-3 m-2">
                            <Label className="text-primary">Rate</Label>
                            <Input value={((currentParty && currentParty['rate']) || "")}  name="rate"  onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-5 m-2">
                            <Label className="text-primary">Amount</Label>
                            <Input value={((currentParty && currentParty['amount']) || "")} disabled/>
                        </div>
                        <div className="col-lg-5 m-2">
                            <Label className="text-primary">Tax (2.5% SGST + 2.5% CGST)</Label>
                            <Input value={((currentParty && currentParty['tax']) || "")} name="tax" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-12 m-2">
                            <Label className="text-primary">Total</Label>
                            <Input value={((currentParty && currentParty['total']) || "")}    disabled/>
                        </div>
                      
                        
                  </ModalBody>
                  <ModalFooter className="row m-2">
                        <div className="col-lg-12 d-flex justify-content-center">
                            {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                        </div>
                        <div className="col-12">
                            <button className="btn btn-danger float-right" onClick={e=>this.setState({currentParty:{},modal:false})}>Close</button>
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
        sales_list: state.Reducer.sales_list,
        sales_party: state.Reducer.sales_party,
        fetch_month:state.Reducer.fetch_month,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SalesList));