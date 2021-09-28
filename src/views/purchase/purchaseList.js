import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    CardBody,
    CardHeader,
   Input,Card,ModalBody,Modal,ModalFooter, Label
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
class PurchaseListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PurchaseList:[],
            prop_PurchaseList:[],
            modal:false,
            PurchaseInfo:{},
            mode:false,
            sortList:{
                'unit':false,
                'Purchase':false,
                'date':false,

            },
            current_month:"",
            cur_date:"",
            monthly_data:{},
        }
    }
    
    componentDidMount(){
       this.getPurchaseList()
    }
    getPurchaseList=(date)=>{
        if(_.isEmpty(date)){
            date=this.props.fetch_month
        }
        if(!_.isEmpty(date)){
            let api="purchaseList"
            if(this.state.mode){
                api="PartySalesList"
            }
            this.props.distributer(date,api).then(response => {
                if(response['status']===200){
                    this.setState({PurchaseList:response['data'],PurchaseListFilter:response['data'] },()=>{
                        this.calculateMonthly(response['data'])    
                    }) 
                }else{ 
                this.toasterHandler("error", response['msg'] || "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }else{
            this.generateMonth(moment().format('YYYY-MM'))
        }
    }

    calculateMonthly=(purchase)=>{
        let unitList=["Anaipudur","Thottam"]
        let final_obj={}
        let total_weight=0
        let total_rate=0
        if(purchase.length>0){
            unitList.forEach((unit,index) => {
                    let unitPurchase=_.filter(purchase, { 'unit': unit });
                    console.log(unitPurchase)
                    let obj={
                        "weight":0,
                        "rate":0,
                        "average":0,
                    }
                    unitPurchase.forEach((row,ind)=>{
                        obj['rate']=obj['rate']+parseInt(row['rate'])
                        obj['weight']=obj['weight']+parseInt(row['weight'])
                    })       
                     
                    obj['average']=parseFloat(obj['rate'])/parseFloat(obj['weight'])
                    final_obj[unit]=obj
                    total_weight=total_weight+obj['weight']
                    total_rate=total_rate+obj['rate']
                })
        }
            final_obj['Total']={
                "weight":total_weight,
                "rate":total_rate,
                "average":total_rate/total_weight,
            }
            this.setState({monthly_data:final_obj})
        }


    getPurchaseInfo=(Purchase)=>{
        this.props.distributer(Purchase,"PurchaseInfo").then(response => {
            if(response['status']===200){
                let data=_.filter(response['data'], function(val) { return val['weight']!==null; });
                let obj={
                    "Purchase":Purchase,
                    "combination":data
                }
                this.setState({PurchaseInfo:obj,modal:true}) 
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
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
    
    handleChange=(e)=>{
        let { formdata } = { ...this.state }
        formdata[e.target.name] = e.target.value       
        this.setState({ formdata })
    }
    handleFilterChange=(val)=>{
        let {PurchaseListFilter,PurchaseList,filterName}={...this.state}
        filterName=val || ""
        PurchaseList =_.filter(PurchaseListFilter, function(word) { return word['unit'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['party'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['date'].toLowerCase().includes(filterName.toLocaleLowerCase()) }); 
        this.setState({PurchaseList,filterName},()=>{
            this.calculateMonthly(PurchaseList)    

        })
    }
  

    deletePurchase=(item)=>{
        let api="deletePurchase"
        if(this.state.mode){
            api="deletePartypurchases"
        }
        if(window.confirm("Are you sure?")){
            this.props.distributer(item,api).then(response => {
                console.log(response,response['data'])
                if(response['status']===200){
                    this.toasterHandler("success",response['data'])
                    this.getPurchaseList(this.state.current_month)
                }else{ 
                this.toasterHandler("error", response['msg'])
                }
            }).catch((err)=>{
                this.toasterHandler("error", err)
            })
        }
        
    }

    sorticon=(item)=>{
        return (
            <i className="fa fa-sort ml-2 c-pointer" aria-hidden="true" onClick={e=>this.handleSort(item)}></i>
        )
    }
    handleSort=(item)=>{
        let {PurchaseListFilter,PurchaseList,filterName,sortList}={...this.state}
        filterName=""
        PurchaseList =_.sortBy(PurchaseListFilter, [function(o) { return o[item]; }]);
        if(!sortList[item]){
            PurchaseList=PurchaseList.reverse()
            
        }
        sortList[item]=!sortList[item]
        this.setState({PurchaseList,filterName})
    }
    changeMode=()=>{
        let {mode}={...this.state}
        this.setState({mode:!mode},()=>{
            this.getPurchaseList(this.state.current_month)
        })
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
            this.getPurchaseList(data)
        })
        

    }
    render() {
        let {filterName,PurchaseList,PurchaseInfo,modal,mode,monthly_data,cur_date,current_month}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                  <Card className="flex row col-lg-9 p-2">
                    <CardHeader className="bg-primary text-light font-weight-bold h5">
                        Purchase Information<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.getPurchaseList(current_month)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-3 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                    
                    </CardHeader>
                    <CardBody className="col-lg-12 row">
                    {monthly_data && Object.keys(monthly_data).map((unit,index)=>                
                        <div className={"flex mt-2 p-3 text-center "+(unit==="Total"?" col-lg-12":" col-lg-6")} key={index}>
                            <span className="h6  text-warning">{unit}</span>
                            <div className="col-lg-12 d-flex justify-content-center row mt-3">
                                {Object.keys(monthly_data[unit]).map((key,ind)=>
                                <div className="flex col-lg-4" key={ind}>
                                        <Label className="text-primary">{this.getName(key)+":"}</Label>
                                        <Input disabled value={parseInt(monthly_data[unit][key]).toLocaleString('en-IN')}></Input>
                            
                                </div>
                            )}
                            </div>
                        </div>
                    )}
                    </CardBody>
                </Card>
                    <Card className="col-lg-8 mt-3">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row m-1 text-center">
                                    <div className="col-2">Unit{this.sorticon("unit")}</div>
                                    <div className="col-2">Date{this.sorticon("date")}</div>
                                    <div className="col-2">Purchase{this.sorticon("party")}</div>
                                    <div className="col-2">Total Weight</div>
                                    <div className="col-2">Total Cost</div>
                                    <div className="col-2">Actions</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                        <div className="col-lg-6">
                           <button className={"btn float-right btn-sm"+(mode?" btn-primary":" btn-danger")} onClick={e=>this.changeMode()}>{mode?" Purchases":" Sales"}</button>        
                           </div>         
                                </div>
                    {PurchaseList && PurchaseList.map((item,ind)=>
                                <div className="row m-1  border p-3 text-center" key={ind}>
                                    <div className="col-2">{ind+1+") "}{this.getName(item['unit'])}</div>
                                    <div className="col-2">{item['date']}</div>
                                    <div className="col-2">{this.getName(item['party'])}</div>
                                    <div className="col-2">{item['weight'] || '-'}</div>
                                    <div className="col-2">{item['rate'] || '-'}</div>
                                    <div className="col-2">
                                        {item['weight']!=='0' && <i className="fa fa-lg fa-eye c-pointer text-primary mr-2" onClick={e=>this.getPurchaseInfo(item)}></i>}
                                        <i className="fa fa-lg fa-trash c-pointer text-danger ml-2" onClick={e=>this.deletePurchase(item)}></i>
                            
                                        </div>
                                </div>
                    )}
                    {PurchaseList && PurchaseList.length<1 && <div className="text-danger  d-flex justify-content-center p-3 ">
                                    <i className="fa fa-lg fa-exclamation-circle  mr-1"></i> <span className="">No purchase to show</span>
                     </div>}
                    </CardBody>
                    </Card>
                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <div className="flex m-2 row p-2">
                    <span className="col-10 h4">Purchase Information</span>
                    </div>
                    <ModalBody>
                          <div className="flex row">
                              <hr></hr>
                                    <div className="row flex col-12">   
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Date</Label><Input   value={PurchaseInfo && PurchaseInfo['Purchase'] && PurchaseInfo['Purchase']['date']} disabled></Input></div>
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Unit</Label><Input   value={PurchaseInfo && PurchaseInfo['Purchase'] && this.getName(PurchaseInfo['Purchase']['unit'])} disabled></Input></div>
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Party</Label><Input   value={PurchaseInfo && PurchaseInfo['Purchase'] && this.getName(PurchaseInfo['Purchase']['party'])} disabled></Input></div>
                                    </div>
                                <div className="m-1 p-1">
                                    <hr></hr>
                              {PurchaseInfo && PurchaseInfo['combination'] && PurchaseInfo['combination'].map((item,val)=>     
                                <div key={val} className="flex row m-1">
                                        <div className="col-lg-3"> <span className="font-weight-bold">{(val+1) +")  "+ item['name']} </span>   <span>{"["+((parseFloat(item['weight'])/PurchaseInfo['Purchase']['weight'])*100).toFixed(2) +"% ]"}</span></div>
                                        <div className="col-lg-2"><Input placeholder="Weight"  type="number"  value={item['weight']} disabled /></div>
                                        <div className="col-lg-1">{" * "}</div>
                                        <div className="col-lg-2"><Input placeholder="rate"  type="number" value={item["rate"]} disabled/></div>
                                        <div className="col-lg-1">{" = "}</div>
                                        <div className="col-lg-2"><Input placeholder="total"  type="number" value={parseFloat(item['weight'])*parseFloat(item['rate'])} disabled/></div>
                                    </div>
                              )}
                                <div className="row flex m-1 ">
                                
                                    <div className="col-lg-3 text-info font-weight-bold">Cummulative: {" "}<span className="font-weight-bold text-danger">Weight</span></div>
                                    <div className="col-lg-2"><Input type="number" value={PurchaseInfo && PurchaseInfo['Purchase'] && PurchaseInfo['Purchase']['weight']} className="border-warning"disabled/></div>
                                    <div className="col-lg-1 font-weight-bold"></div>
                                    <div className="col-lg-2"></div>
                                    <div className="col-lg-1 text-danger font-weight-bold">Cost</div>
                                    <div className="col-lg-2"><Input type="number" value={PurchaseInfo && PurchaseInfo['Purchase'] && PurchaseInfo['Purchase']['rate']} className="border-warning" disabled/></div>
                                </div>
                                <div className="d-flex justify-content-center m-2 p-2">
                                        <div className="col-lg-3 font-weight-bold h5 p-2"> Average Cost</div>
                                        <div className="col-lg-2"><Input type="number" value={PurchaseInfo && PurchaseInfo['Purchase'] && (PurchaseInfo['Purchase']['rate']/PurchaseInfo['Purchase']['weight']).toFixed(3)} className="border-warning"disabled/></div>
                                </div>
                            </div>
                          </div>
                    </ModalBody>
                    <ModalFooter>
                      <button className="btn btn-danger" onClick={e=>this.setState({modal:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        Purchase_list: state.Reducer.Purchase_list,
        fetch_month: state.Reducer.fetch_month

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
   
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseListComponent));