import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';   
// import '../../styles/Purchase.css'
import {
    CardFooter,
    Label,
   Input, Card, CardHeader, CardBody
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
class PurchaseTax extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterName:"",
            currentDate:moment().format("YYYY-MM-DD"),
            party_list:[],
            purchase_list:[],
            mode:true,
            currentParty:{
    
            },
        }
    }
    
    
    componentDidMount(){
        document.getElementById('PurchaseTaxDiv').addEventListener("keydown", (e) =>this.checkKey(e))       
        this.getPurchaseParty()
    
    }
    componentWillUnmount(){
        document.getElementById("PurchaseTaxDiv").removeEventListener("keydown", (e) =>this.checkKey(e))
        this.props.dataStoreSetter(this.state,"SALES_PAGE_STATE")
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
        }else if (e.key === 'Shift') {
            this.autoFill()
        }
        this.setState({currentDate})
    }
    getPurchaseParty=()=>{
        this.props.distributer({},"purchasePartyList").then(response => {
            if(response['status']===200){
                let {party_list}={...this.state}
                let party=response['data']    
                party.forEach((obj,ind)=>{
                    party_list.push({
                        name:obj['party'],
                        id:obj['id']
                    })
                }) 

                this.setState({party_list})
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
        let {currentParty}={...this.state}
        currentParty[e.target.name]=e.target.value
        this.setState({currentParty})
    }
    autoFill=()=>{
        let {currentParty}={...this.state}
        if(currentParty['party']){
            currentParty=this.calculate()
        }
        this.setState({currentParty})
    }
    calculate=()=>{
        let {currentParty,mode}={...this.state}
        if(mode){
            currentParty['tax']=currentParty['tax']*2
        }else{
            currentParty['amount']=parseFloat(currentParty['weight'])+parseFloat(currentParty['rate'])
        }    
        return currentParty
    }
    handlePurchaseAdd=()=>{
        let {purchase_list,currentParty,currentDate,party_list}={...this.state}
        currentParty['date']=currentDate
        let party=_.find(party_list, function(o) { return o['name'] === currentParty['party']; });
        currentParty['partyId']=party['id']
        purchase_list.push(currentParty)
        currentParty={}
        this.setState({purchase_list,currentParty},()=>{
        })
    }
    uploadList=()=>{
        let {purchase_list,mode}={...this.state}
        console.log(purchase_list,mode)
        let api="uploadPartySalesWithoutMaterial"
        if(mode){
            api="uploadPurchaseTax"
        }
        if(purchase_list.length>0){
            this.props.distributer(purchase_list,api).then(response => {
                if(response['status']===200){
                    this.toasterHandler("success",response['msg'])
                    this.setState({purchase_list:[]})
                }else{ 
                this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
        
    }
    editPurchase=(val,ind)=>{
        let {currentParty,purchase_list}={...this.state}
        Object.keys(val).forEach((key,ind)=>{
            currentParty[key]=val[key]
        })
        purchase_list.splice(ind,1)
        this.setState({currentParty,purchase_list})
    }
    deletePurchase=(val,ind)=>{
        let {purchase_list}={...this.state}
        purchase_list.splice(ind,1)
        this.setState({purchase_list})
    }


    render() {
        let {currentDate,party_list,currentParty,purchase_list,mode}={...this.state}
        return (
            <div id="PurchaseTaxDiv"className="flex d-flex justify-content-center row">
              <Card className="col-lg-12 p-2 mt-n4">
                  <CardHeader className={"text-light font-weight-bold h5 bg-info"}>
                     <div className="flex p-1">
                     <span className="p-1">{mode?"Purchase Tax Entry":"Sales Entry"}</span>
                     <div className="float-right">
                            <Input autocomplete="off" type="date"  value={currentDate} onChange={e=>this.setState({currentDate:e.target.value})} />
                        </div>
                        {/* <button className={"btn m-1 font-weight-bold float-right"+(mode?" btn-success":" btn-danger")} onClick={e=>this.setState({mode:!mode})} disabled={purchase_list && purchase_list.length>0}> {mode?"Tax Entry Mode":"Sales Entry Mode"}</button> */}
                    </div> 
                    </CardHeader>
                  <CardBody className="row d-flex justify-content-center">
                        {mode && <div className="col-lg-1">
                            <Label className="text-primary">Bill Number</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['billno']) || "")}  name="billno"  id="billno" onChange={e=>this.handlePartyInput(e)}/>
                        </div>}
                        <div className="col-lg-2">
                            <Label className="text-primary">Party</Label> 
                            <Input autocomplete="off" type="select" name="party" id="unit" value={((currentParty && currentParty['party']) || " ")}  onChange={e=>this.handlePartyInput(e)}>
                            <option >{" "}</option>
                            {party_list.map((party,ind)=>
                                <option key={ind}>{(party['name'])}</option>
                            )}
                            </Input>
                        </div>
                       
                        {!mode &&
                        <div className="col-lg-2">
                            <Label className="text-primary">Weight</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['weight']) || "")}  name="weight" onChange={e=>this.handlePartyInput(e)}/>
                        </div>}
                       { !mode &&<div className="col-lg-2">
                            <Label className="text-primary">Rate</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['rate']) || "")}  name="rate"  onChange={e=>this.handlePartyInput(e)}/>
                        </div>}

                        {!mode &&<div className="col-lg-2">
                            <Label className="text-primary">Amount</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['amount']) || "")} name="amount" onChange={e=>this.handlePartyInput(e)}/>
                        </div>}
                       
                  
                        {mode && <div className="col-lg-2">
                            <Label className="text-primary">Tax</Label>
                            <Input autocomplete="off" value={((currentParty && currentParty['tax']) || "")} name="tax" onChange={e=>this.handlePartyInput(e)}/>
                        </div>}
                      
                        
                  </CardBody>
                  <CardFooter className="row m-2">
                        <div className="col-12">
                            <button className="btn btn-danger float-right" onClick={e=>this.setState({currentParty:{}})}>Clear</button>
                            <button className="btn   btn-primary float-right mr-2" onClick={e=>{this.handlePurchaseAdd()}}>Add</button>
                            {/* <button className="btn btn  btn-info float-right mr-2" onClick={e=>{this.autoFill()}}><i className="fa fa-calculator mr-3" aria-hidden="true"></i>AutoFill</button> */}
                        </div>
                        </CardFooter>
              </Card>
              <div className=" d-flex justify-content-center row col-lg-12 m-2">
                  <hr></hr>
                  <Card className="col-lg-12 h6">
                      <CardHeader>
                        {purchase_list && 
                            mode ?
                            <div className="flex row bg-info font-weight-bold h6 text-light p-3 m-1">
                               <div className="col-lg-2">Date</div>
                               <div className="col-lg-2">Bill</div>
                               <div className="col-lg-2">Party</div>
                               <div className="col-lg-2">Tax Amount</div>                          
                               <div className="col-lg-2">Actions</div>                          
                            </div>
                            :
                            <div className="flex row bg-info font-weight-bold h6 text-light p-3 m-1">
                               <div className="col-lg-1">Date</div>  
                               <div className="col-lg-2">Party</div>
                               <div className="col-lg-1">Weight</div>                          
                               <div className="col-lg-1">Rate</div>                          
                               <div className="col-lg-1">Amount</div>    
                               <div className="col-lg-2">Actions</div>                          
                            </div>
                            }
                            </CardHeader>
                            <CardBody>
                    {purchase_list && (purchase_list).map((val,ind)=>
                          
                            mode ?
                                <div key={ind} className={"flex row border m-1 p-3"}>
                                <div className="col-lg-2">{val['date']}</div>                     
                                <div className="col-lg-2">{val['billno']}</div>                     
                                <div className="col-lg-2">{val['party']}</div>     
                                <div className="col-lg-2">{parseInt(val['tax']).toLocaleString('en-IN')}</div>         
                                <div className="col-lg-2">
                                            <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.editPurchase(val,ind)}></i>
                                            <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deletePurchase(val,ind)}></i>
                                    </div>
                                </div>
                            :
                                <div key={ind} className={"flex row border m-1 p-3"}>
                                <div className="col-lg-1">{val['date']}</div>                     
                                <div className="col-lg-2">{val['party']}</div>     
                                <div className="col-lg-1">{val['material']}</div>         
                                <div className="col-lg-1">{val['weight']}</div>         
                                <div className="col-lg-1">{val['rate']}</div>         
                                <div className="col-lg-1">{val['amount']}</div>         
                                <div className="col-lg-2">
                                            <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.editPurchase(val,ind)}></i>
                                            <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deletePurchase(val,ind)}></i>
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
        purchase_party: state.Reducer.purchase_party,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
   
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseTax));