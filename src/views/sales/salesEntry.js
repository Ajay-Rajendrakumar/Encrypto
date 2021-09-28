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
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
class SalesEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            currentDate:moment().format("YYYY-MM-DD"),
            party_list:[],
            rateList:{},
            tear_list:['Vinayaka Tex','Vinayaka Mills','varsidhi'],
            sales_list:[],
            currentParty:{
    
            },
            baleReturn:false,
            multipleSales:false,
            entryEnabled:true,
            error_text:"",
        }
    }
    
    
    componentDidMount(){
        document.getElementById("SalesDiv").addEventListener("keydown", (e) =>this.checkKey(e))
        let {sales_party,salesPage_state}={...this.props}
        let {party_list,rateList}={...this.state}
        if(_.isEmpty(salesPage_state)){
        if(sales_party.length>0){
            sales_party.forEach((obj,ind)=>{
                party_list.push({
                    name:obj['party'],
                    id:obj['id']
                })
                rateList[obj['party']]=obj['rate']
            }) 
            this.setState({party_list,rateList})
        }else{
            this.getSalesParty()
        }
        }else{
            this.setState(salesPage_state)
        }
    }
    componentWillUnmount(){
        document.getElementById("SalesDiv").removeEventListener("keydown", (e) =>this.checkKey(e))
        this.props.dataStoreSetter(this.state,"SALES_PAGE_STATE")
    }
    checkKey=(e)=> {
        let {currentDate,entryEnabled}={...this.state}
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
        }else if (e.key === 'Shift' && entryEnabled) {
            this.autoFill()
            this.set_Entry_timer()
        }else if (e.key === 'Enter' && entryEnabled) {
            this.handleSalesAdd()
            document.getElementById("billno").focus();
            this.set_Entry_timer()
        }
        this.setState({currentDate})
    }
    set_Entry_timer=()=>{
        this.setState({entryEnabled:false})
        setTimeout(() => {
            this.setState({entryEnabled:true})
          }, 2000)
    }
    getSalesParty=()=>{
        this.props.distributer({},"salesPartyList").then(response => {
            if(response['status']===200){
                let {party_list,rateList}={...this.state}
                let party=response['data']    
                party.forEach((obj,ind)=>{
                    party_list.push({
                        name:obj['party'],
                        id:obj['id']
                    })
                    rateList[obj['party']]=obj['rate']
                }) 
                this.setState({party_list,rateList})
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
    
    handleFilterChange=(val)=>{
        let {currentList,materialList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(materialList, function(o) { return ((o['name'].toLowerCase()).includes(filterName.toLowerCase()) || (o['symbol'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName})
    }

    handlePartyInput=(e)=>{
        let {currentParty,currentDate,baleReturn}={...this.state}
        currentParty['date']=currentDate
        currentParty['return']=baleReturn?"1":"0"
        currentParty[e.target.name]=e.target.value
        if(currentParty['party']){
            currentParty=this.calculate(currentParty['weight']||0,false)
        }
        this.setState({currentParty})
    }
    autoFill=()=>{
        let {currentParty}={...this.state}
        if(currentParty['party']){
            currentParty=this.calculate(currentParty['weight']||0,true)
        }
        this.setState({currentParty})
    }
    calculate=(weight,autoFill)=>{
        let {currentParty,tear_list,rateList,multipleSales}={...this.state}
        if(tear_list.includes(currentParty['party']) && autoFill){
            currentParty['weight']=Math.floor(currentParty['weight']-(currentParty['bale']/2))
        }
        if(autoFill && !multipleSales && !currentParty['rate']){
            currentParty['rate']=parseFloat(rateList[currentParty['party']] || 0)
        }
        currentParty['amount']=parseFloat(currentParty['weight']*currentParty['rate']).toFixed(2)
        if(currentParty['party'] && currentParty['party'].toLowerCase().includes("vinayaka") && autoFill){
                currentParty['tax']=currentParty['tax']*2
        }else if(autoFill && !multipleSales){
            currentParty['tax']=parseFloat((weight*currentParty['rate'])*0.05).toFixed(2)
        }else if(multipleSales){
            currentParty['tax']=0
        }
        if(multipleSales){
            currentParty['total']=0
        }else{
            currentParty['total']=(parseFloat(currentParty['amount'])+parseFloat(currentParty['tax'])).toFixed(2)
        }
        return currentParty
    }
    handleSalesAdd=()=>{
        let {sales_list,currentParty,currentDate,baleReturn,party_list}={...this.state}
        currentParty['date']=currentDate
        currentParty['return']=baleReturn?"1":"0"
        currentParty=this.calculate((currentParty['weight']||0),false)
        let party=_.find(party_list, function(o) { return o['name'] === currentParty['party']; });
        currentParty['partyId']=((party && party['id']) || -1)
        let valid=this.props.validateEntry(currentParty)
        if(valid['result']){
            sales_list.push(currentParty)
            currentParty={}
            this.setState({sales_list,currentParty,error_text:""})
        }else{
            this.setState({error_text:valid['error']})
        }
    }

  
    uploadList=()=>{
        let {sales_list}={...this.state}
        if(sales_list && sales_list.length>0){
        this.props.distributer(sales_list,"uploadSales").then(response => {
            if(response['status']===200){
                this.toasterHandler("success",response['msg'])
                this.props.getSales()
                this.setState({sales_list:[]})
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        }
        
    }
    editSales=(val,ind)=>{
        let {currentParty,sales_list}={...this.state}
        Object.keys(val).forEach((key,ind)=>{
            currentParty[key]=val[key]
        })
        sales_list.splice(ind,1)
        this.setState({currentParty,sales_list})
    }
    deleteSales=(val,ind)=>{
        let {sales_list}={...this.state}
        sales_list.splice(ind,1)
        this.setState({sales_list})
    }

    multipleSales=()=>{
        let {currentParty,multipleSales,sales_list}={...this.state}
        if(!multipleSales && sales_list.length>=1){
            currentParty={...sales_list[sales_list.length-1]}
            currentParty['weight']=0
            currentParty['rate']=0
            currentParty['tax']=0
            currentParty['total']=0
            currentParty['amount']=0
        }else{
        currentParty={}
        }
        this.setState({currentParty,multipleSales:!multipleSales})
    }

    render() {
        let {currentDate,party_list,currentParty,sales_list,baleReturn,multipleSales,error_text}={...this.state}
        return (
            <div id="SalesDiv" className="flex d-flex justify-content-center row">
              <Card className="col-lg-12 p-2 mt-n4">
                  <CardHeader className={"text-light font-weight-bold h5"+(baleReturn?" bg-danger":" bg-info")}>
                     <div className="flex p-1">
                     <span className="p-1">{baleReturn?" Return Bale Entry":"Entry"}</span>
                     <div className="float-right">
                            <Input autocomplete="off" type="date"  value={currentDate} onChange={e=>this.setState({currentDate:e.target.value})} disabled={multipleSales}/>
                        </div>
                        <div className="float-right mr-5">
                            <button className={"text-light btn font-weight-bold"+(baleReturn?" bg-info":" bg-danger")} onClick={e=>this.setState({baleReturn:!baleReturn})}>{!baleReturn?" Bale Return":" Sales"}</button>
                           
                        </div>
                        <div className="float-right mr-5">
                            <button className={"text-light btn font-weight-bold"+(!multipleSales?" bg-primary":" bg-dark")} onClick={e=>this.multipleSales()}>
                            <i className={"fa mr-2 "+(multipleSales?"fa-users":"fa-user")} aria-hidden="true"></i>
                            {multipleSales?" Multiple Quality Bales":" Single Quality Bales"}</button>
                           
                        </div>
                    </div> 
                    </CardHeader>
                  <CardBody className="row d-flex justify-content-center">
                  <div className="col-lg-1">
                            <Label className="text-primary">Bill Number</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['billno']) || "")}  name="billno"  id="billno" onChange={e=>this.handlePartyInput(e)} disabled={multipleSales}/>
                        </div>
                        <div className="col-lg-2">
                        <Label className="text-primary">Party</Label> 
                        <Input autocomplete="off" type="select" name="party" id="unit" value={((currentParty && currentParty['party']) || " ")} disabled={multipleSales} onChange={e=>this.handlePartyInput(e)}>
                        <option >{" "}</option>
                        {party_list.map((party,ind)=>
                            <option key={ind}>{(party['name'])}</option>
                        )}
                    </Input>
                        </div>
                        <div className="col-lg-1">
                            <Label className="text-primary">Bale</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['bale']) || "")}  name="bale" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-1">
                            <Label className="text-primary">Weight</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['weight']) || "")} name="weight" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-1">
                            <Label className="text-primary">Rate</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['rate']) || "")}  name="rate"  onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-2">
                            <Label className="text-primary">Amount</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['amount']) || "")} onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-2">
                            <Label className="text-primary">Tax (2.5% SGST + 2.5% CGST)</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['tax']) || "")} disabled={multipleSales} name="tax" onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                        <div className="col-lg-2">
                            <Label className="text-primary">Total</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['total']) || "")}  disabled={multipleSales}  onChange={e=>this.handlePartyInput(e)}/>
                        </div>
                      
                        
                  </CardBody>
                  <CardFooter className="row m-2">
                        <div className="col-lg-6 d-flex justify-content-center">
                            {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                        </div>
                        <div className="col-lg-6">

                            <button className="btn btn-danger float-right" onClick={e=>this.setState({currentParty:{}})}>Clear</button>
                            <button className="btn   btn-primary float-right mr-2" onClick={e=>{this.handleSalesAdd()}}>Add</button>
                            <button className="btn btn  btn-info float-right mr-2" onClick={e=>{this.autoFill()}}><i className="fa fa-calculator mr-3" aria-hidden="true"></i>AutoFill</button>
                        </div>
                        </CardFooter>
              </Card>
              <div className=" d-flex justify-content-center row col-lg-12 m-2">
                  <hr></hr>
                  <Card className="col-lg-12 h6">
                      <CardHeader>
                 {sales_list && <div className="flex row bg-info font-weight-bold h6 text-light p-3 m-1">
                               <div className="col-lg-1">Date</div>
                               <div className="col-lg-1">Bill Number</div>
                               <div className="col-lg-2">Party</div>
                               <div className="col-lg-1">Bale</div>
                               <div className="col-lg-1">Weight</div>
                               <div className="col-lg-1">Rate</div>
                               <div className="col-lg-1">Amount</div>
                               <div className="col-lg-1">Tax</div>
                               <div className="col-lg-2">Total</div>
                               <div className="col-lg-1">Actions</div>
                            </div>}
                            </CardHeader>
                            <CardBody>
                    {sales_list && (sales_list).map((val,ind)=>
                           <div key={ind} className={"flex row border m-1 p-3"+(val['return']==='1'?" border border-danger":" ")}>
                               <div className="col-lg-1">{val['date']}</div>
                               <div className="col-lg-1">{val['billno']}</div>
                               <div className="col-lg-2">{val['party']}</div>
                               <div className="col-lg-1">{val['bale']}</div>
                               <div className="col-lg-1">{val['weight']}</div>
                               <div className="col-lg-1">{val['rate']}</div>
                               <div className="col-lg-1">{val['amount']}</div>
                               <div className="col-lg-1">{val['tax']}</div>
                               <div className="col-lg-2">{val['total']}</div>
                               <div className="col-1">
                                        <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.editSales(val,ind)}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteSales(val,ind)}></i>
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
        sales_party: state.Reducer.sales_party,
        salesPage_state: state.Reducer.salesPage_state,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
   
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SalesEntry));