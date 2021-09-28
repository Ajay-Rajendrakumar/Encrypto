import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/purchase.css'
import {
    Card,
    CardBody,
    CardHeader,
   Input,CardFooter,Label
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";

class PurchaseEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitList:["Anaipudur","Thottam"],
            materialList:{},
            rateList:{},
            purchase_party_list:[],
            filterName:"",
            currentParty:{},
            currentUnit:"Anaipudur",
            currentDate:moment().format("YYYY-MM-DD"),
            suggetionList:[],
            current_suggestion:[],
            current_purchase:[],
            total_rate:0,
            total_weight:0,
            purchase_list:[],
            mode:false,
            error_text:"",
        }
    }
    
    componentDidMount(){
        if(this.props.material_list.length<=0){
            this.getMaterialList()
        }else{
            this.dataFeeder(this.props.material_list)  
        }
        if(this.props.purchase_party.length>0){
            this.setState({purchase_party_list:this.props.purchase_party,currentParty:this.props.purchase_party[0]})
        }else{
            this.getPartyList()
        }   
        // if(this.props.unit_list.length>0){
        //     this.setState({unit_list:this.props.unit_list})
        // }else{
        //     this.getUnitList()
        // }   
    }
 
    getUnitList=()=>{
        this.props.distributer({},"unitList").then(response => {
            if(response['status']===200){
              this.setState({unitList:response['data'] })
              this.props.dataStoreSetter(response['data'],"UNIT_LIST")
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }
    getMaterialList=()=>{
        this.props.distributer({},"materialList").then(response => {
            if(response['status']===200){
                this.props.dataStoreSetter(response['data'],"MATERIAL_LIST")         
                this.dataFeeder(response['data'])          
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }
   
    getPartyList=()=>{
        this.props.distributer({},"purchasePartyList").then(response => {
            if(response['status']===200){
            let party=response['data']    
            this.setState({purchase_party_list:party,currentParty:party[0]})
            this.props.dataStoreSetter(response['data'],"PURCHASE_PARTY")
            }else{ 
            this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
        }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
        })
    }
    dataFeeder=(material)=>{
        let materialObj={}
        let rateObj={}  
        let suggest=[]
        material && material.forEach((item,val)=>{
            suggest.push({"name":item['name'],"symbol":item['symbol'],"rate":item['rate']})
            materialObj[item['symbol']]=item['name']
            rateObj[item['symbol']]=item['rate']
        })

        this.setState({materialList:materialObj,rateList:rateObj,suggetionList:suggest.slice(),suggetion_filter:suggest.slice()})
    }
    suggestion=(name)=>{
        let {current_suggestion,suggetion_filter}={...this.state}
        current_suggestion=_.filter(suggetion_filter, function(o) { return (o['name'].toLowerCase()).includes(name.toLowerCase()) || (o['symbol'].toLowerCase()).includes(name.toLowerCase()) });
        this.setState({current_suggestion})
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
        if(e.target.name==="material"){
            this.suggestion(e.target.value)
        }else  if(e.target.name==="party"){
                let {purchase_party_list}={...this.state}

            this.setState({currentParty:purchase_party_list[e.target.value]})
        }
    }

  

    handleWeightChange=(ind,e)=>{
        let {current_purchase}={...this.state}
        current_purchase[ind]["weight"]=Math.abs(e.target.value)
        current_purchase[ind]["totalRate"]=(parseFloat(Math.abs(e.target.value)))*parseFloat(current_purchase[ind]["rate"])
        this.setState({current_purchase},()=>{
            this.calculate()
        })
    }
    handleRateChange=(ind,e)=>{
        let {current_purchase}={...this.state}
        current_purchase[ind]["rate"]=Math.abs(e.target.value)
        current_purchase[ind]["totalRate"]=(parseFloat(Math.abs(e.target.value)))*parseFloat(current_purchase[ind]["weight"])
        this.setState({current_purchase},()=>{
            this.calculate()
        })
    }

    calculate=()=>{
        let {current_purchase,total_weight,total_rate}={...this.state}
        total_weight=0
        total_rate=0
        current_purchase && current_purchase.forEach((val,ind)=>{
            total_weight=total_weight+parseFloat(val['weight'])
            total_rate=total_rate+parseFloat(val['totalRate'])
        })
        this.setState({total_weight,total_rate,error_text:""})
    }
  


    upload=()=>{
        let {purchase_list,mode}={...this.state}
        let api="uploadPurchase"
        if(mode){
             api="uploadPartySales"
        }
        if(purchase_list.length>0){
            this.props.distributer(purchase_list,api).then(response => {
                if(response['status']===200){
                    this.setState({purchase_list:[]})
                    this.toasterHandler("success",response['data'])
                
                }else{ 
                this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
        
    }

  

    handleModalChangeData=(e)=>{
        let {modalData}={...this.state}
        modalData[e.target.name]=e.target.value
        this.setState({modalData})
    }
    AddPurchase=()=>{
        let {suggetion_filter,suggetionList,current_purchase,purchase_list,currentParty,currentUnit,currentDate,total_weight,total_rate}={...this.state}
        let obj={
            unit:currentUnit,
            party:currentParty['party'],
            partyId:currentParty['id'],
            date:currentDate,
            material:current_purchase,
            weight: total_weight ? Number(total_weight).toFixed(2) : 0 ,
            rate:   total_weight ? Number(total_rate).toFixed(2) : 0
        }
        if(current_purchase.length>0 && currentParty!==""){
            purchase_list.push(obj)
            suggetion_filter=suggetionList.slice()
            this.setState({purchase_list,suggetion_filter,current_purchase:[],total_rate:0,total_weight:0,error_text:""})
        }else{
            this.setState({error_text:"No Entries Identified"})
        }
    }
    addMaterial=(name)=>{
        let {current_purchase,suggetion_filter}={...this.state}
        let ind=_.findIndex(suggetion_filter,name)
        suggetion_filter.splice(ind,1)
        let obj={
            name:name['name'],
            rate:name['rate'],
            symbol:name['symbol'],
            weight:0,
            totalRate:0,
        }
        if(current_purchase){      
            current_purchase.push(obj)
        }else{
            current_purchase=[obj]
        }
        document.getElementById('material').value=""
        this.setState({current_purchase,suggetion_filter,current_suggestion:[],error_text:""})       
    }

    removeItem=(ind)=>{
        let {current_purchase,suggetion_filter}={...this.state}
        let item=current_purchase[ind]
        suggetion_filter.push({"name":item['name'],"symbol":item['symbol'],"rate":item['rate']})
        current_purchase.splice(ind,1)
        this.setState({current_purchase,suggetion_filter,current_suggestion:[]},()=>{
            this.calculate()
        })       
    }

    deletePurchase=(pur,val)=>{
        let {purchase_list}={...this.state}
        purchase_list.splice(val,1)
        this.setState({purchase_list})       

    }

    editPurchase=(purchase,val)=>{
        let {current_purchase,purchase_list,currentParty,currentUnit,currentDate,total_weight,total_rate,suggetionList,suggetion_filter}={...this.state}
        currentUnit=purchase['unit']
        currentParty={
            name:purchase['party'],
            id:purchase['partyId']
        }
        currentDate=purchase['date']
        current_purchase=purchase['material']
        total_weight=purchase['weight']
        total_rate=purchase['rate']
        purchase_list.splice(val,1)
        suggetion_filter=suggetionList.slice()
        this.setState({current_purchase,purchase_list,currentParty,currentUnit,currentDate,total_weight,total_rate,suggetion_filter})
    }
    render() {
        let {purchase_party_list,currentDate,unitList,current_suggestion,currentParty,currentUnit,current_purchase,total_rate,total_weight,purchase_list,mode,error_text}={...this.state}
        return (
            <div className="flex">
              <Card className="d-flex justify-content-center ">
                <CardHeader className={"p-1 m-2 row d-flex justify-content-center"+(!mode?" bg-primary":" bg-danger")} >
                    <Input type="select" name="party" className="col-lg-2 m-2" value={currentParty['partyId']} onChange={(e=>this.handleChange(e))}>
                        {purchase_party_list && (purchase_party_list).map((val,ind)=>
                            <option key={ind}  value={ind}>{val['party']}</option>
                        )}
                    </Input>
        
                    <Input type="select" name="unit" className="col-lg-2 m-2" value={currentUnit} onChange={e=>this.setState({currentUnit:e.target.value})}>
                        {unitList && unitList.map((val,ind)=>
                            <option key={ind}>{val}</option>
                        )}
                    </Input>
                    <Input type="date" className="col-lg-2 m-2" value={currentDate}  onChange={e=>this.setState({currentDate:e.target.value})}></Input>
                    <button className="btn btn-sm btn-primary border-light  m-2 " onClick={e=>this.AddPurchase()}>Add {mode?" Sales ":" Purchase "}</button>
                    <button className="btn btn-sm btn-danger border-light m-2 " onClick={e=>this.setState({current_purchase:[],total_rate:0,total_weight:0})}>Delete</button>
                    <button className={"btn btn-sm float-right border-light  m-2 "+(mode?" btn-dark":" btn-success")} onClick={e=>this.setState({current_purchase:[],total_rate:0,total_weight:0,mode:!mode})} disabled={purchase_list.length>0}>{mode?" Sales Mode":" Purchase Mode"}</button>
                </CardHeader>
                <CardBody>
                <div className="flex  col-lg-12">
                    <Input type={"text"} autoComplete="off" name={"material"} id="material" className={"col-lg-12 m-2"} placeholder="Enter Material name..."  onChange={e=>this.handleChange(e)}></Input>
                    <div className="scrollmenu">
                        {current_suggestion && current_suggestion.map((name,ind)=>
                            <div onClick={e=>this.addMaterial(name)}>{name['name']}</div>
                        )}
                    </div>
                    <hr></hr>
                    <div className="col-lg-12 row">
                            {current_purchase  && current_purchase.map((item,ind)=>
                                <div key={ind} className="flex row m-1 col-lg-12" >
                                <div className="col-lg-3 row"><span className="col-lg-10">{(ind+1)+") "+ item['name'] + " ("+item['symbol']+") "}</span><span className="col-lg-1"> <button className="btn btn-sm btn-danger " onClick={e=>this.removeItem(ind)}><i className="fa fa-trash fa-lg "></i></button></span></div>
                                <div className="col-lg-2"><Input placeholder="Weight"  type="number" value={item['weight']} onChange={e=>this.handleWeightChange(ind,e)} /></div>
                                <div className="col-lg-1">{" * "}</div>
                                <div className="col-lg-2"><Input placeholder="rate"  type="number" value={item['rate']} onChange={e=>this.handleRateChange(ind,e)}/></div>
                                <div className="col-lg-1">{" = "}</div>
                                <div className="col-lg-2"><Input placeholder="total"  type="number" value={item["totalRate"]} disabled/></div>
                            </div>
                            )}

                    </div>
                </div>
              

                </CardBody>
                <CardFooter>
                    <div className="d-flex justify-content-center row">
                        <div className="col-lg-4">
                            <Label>Total Weight</Label>
                            <Input disabled value={total_weight}></Input>
                        </div>
                        <div className="col-lg-4">
                            <Label>Total Rate</Label>
                            <Input  type="number" value={total_rate} onChange={e=>this.setState({total_rate:e.target.value})}></Input>
                        </div>
                    </div>
                    <div className="col-lg-12 m-2 d-flex justify-content-center">
                                        {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                                    </div>
                </CardFooter>
                <hr ></hr>
              </Card>
              <Card className="m-4">
                  <CardHeader className=" bg-info text-light h5">
                  <div className="flex  m-1   row">
                                <div className="col-lg-2">{"Date"}</div>
                                <div className="col-lg-2">{"Party"}</div>
                                <div className="col-lg-2">{"Unit"}</div>
                                <div className="col-lg-2">{"Weight"}</div>
                                <div className="col-lg-2">{"Rate"}</div>
                                <div className="col-lg-1">{"Actions"}</div>
                        </div>
                  </CardHeader>
                  <CardBody>
                  {purchase_list && purchase_list.map((purchase,val)=>
                        <div className="flex p-4 m-1  border row">
                                <div className="col-lg-2">{purchase['date']}</div>
                                <div className="col-lg-2">{purchase['party']}</div>
                                <div className="col-lg-2">{purchase['unit']}</div>
                                <div className="col-lg-2">{parseInt(purchase['weight']).toLocaleString('en-IN')}</div>
                                <div className="col-lg-2">{parseInt(purchase['rate']).toLocaleString('en-IN')}</div>
                                <div className="col-lg-1">
                                        <i className={"fa fa-lg fa-pencil c-pointer mr-2 text-success"} onClick={e=>this.editPurchase(purchase,val)}></i>
                                        <i className={"fa fa-lg fa-trash c-pointer  text-danger"} onClick={e=>this.deletePurchase(purchase,val)}></i>
                                </div>
                        </div>
                    
                  )}
                </CardBody>
                <CardFooter>
                    <div className="col-12">
                    <button className={"btn btn-sm font-weight-bold  btn-dark float-right"} onClick={e=>this.upload()}><i className="fa fal-lg fa-upload" aria-hidden="true"></i> Upload</button>
                    </div>
                </CardFooter>
                    
              </Card>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        material_list: state.Reducer.material_list,
        unit_list: state.Reducer.unit_list,
        purchase_party:state.Reducer.purchase_party
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseEntry));