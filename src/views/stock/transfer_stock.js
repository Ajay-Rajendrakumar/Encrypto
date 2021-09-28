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
   Input,CardFooter,Label,ModalFooter, CardLink,
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";
import EntryComponent from "./stockEntry.js"
class StockEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitList:["Anaipudur","Thottam"],
            materialList:{},
            rateList:{},
            stock_party_list:[],
            filterName:"",
            currentTransfer:{},
            currentDate:moment().format("YYYY-MM-DD"),
            suggetionList:[],
            current_suggestion:[],
            current_stock:[],
            total_rate:0,
            total_weight:0,
            stock_list:[],
            mode:false,
        }
    }
    
    componentDidMount(){
        let {currentTransfer,unitList}={...this.state}
        if(this.props.material_list.length<=0){
            this.getMaterialList()
        }else{
            this.dataFeeder(this.props.material_list)  
        }
        currentTransfer['from']=unitList[0]
        currentTransfer['to']=unitList[1]
        this.setState({currentTransfer})
        
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
        let {currentTransfer}={...this.state}   
        if(e.target.name==="material"){
            this.suggestion(e.target.value)
        }else if(e.target.name==="from" || (e.target.name==="to")){
                currentTransfer[e.target.name]=e.target.value
        }
        this.setState({currentTransfer})
    }

  

    handleWeightChange=(ind,e)=>{
        let {current_stock}={...this.state}
        current_stock[ind]["weight"]=e.target.value
        current_stock[ind]["totalRate"]=(parseFloat(e.target.value))*parseFloat(current_stock[ind]["rate"])
        this.setState({current_stock},()=>{
            this.calculate()
        })
    }
    handleRateChange=(ind,e)=>{
        let {current_stock}={...this.state}
        current_stock[ind]["rate"]=e.target.value
        current_stock[ind]["totalRate"]=(parseFloat(e.target.value))*parseFloat(current_stock[ind]["weight"])
        this.setState({current_stock},()=>{
            this.calculate()
        })
    }

    calculate=()=>{
        let {current_stock,total_weight,total_rate}={...this.state}
        total_weight=0
        total_rate=0
        current_stock && current_stock.map((val,ind)=>{
            total_weight=total_weight+parseFloat(val['weight'])
            total_rate=total_rate+parseFloat(val['totalRate'])
        })
        this.setState({total_weight,total_rate})
    }
  


    upload=()=>{
        let {stock_list,mode}={...this.state}
        let api="uploadTransferStock"
        this.props.distributer(stock_list,api).then(response => {
            if(response['status']===200){
                this.toasterHandler("success",response['data'])
               
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }

    AddStock=()=>{
        let {suggetion_filter,suggetionList,current_stock,stock_list,currentTransfer,currentDate,total_weight,total_rate}={...this.state}
        let obj={
            from:currentTransfer['from'],
            to:currentTransfer['to'],
            date:currentDate,
            material:current_stock,
            weight: total_weight ? Number(total_weight).toFixed(2) : 0 ,
            rate:   total_weight ? Number(total_rate).toFixed(2) : 0
        }
        if(currentTransfer['from']===currentTransfer['to']){
            this.toasterHandler("warning","Invalid Unit Selection")
        }else{
            stock_list.push(obj)
            console.log(stock_list)
            suggetion_filter=suggetionList.slice()
            this.setState({stock_list,suggetion_filter,current_stock:[],total_rate:0,total_weight:0})
        }
    }
    addMaterial=(name)=>{
        let {current_stock,suggetion_filter}={...this.state}
        let ind=_.findIndex(suggetion_filter,name)
        suggetion_filter.splice(ind,1)
        let obj={
            name:name['name'],
            rate:name['rate'],
            symbol:name['symbol'],
            weight:0,
            totalRate:0,
        }
        if(current_stock){      
            current_stock.push(obj)
        }else{
            current_stock=[obj]
        }
        document.getElementById('material').value=""
        this.setState({current_stock,suggetion_filter,current_suggestion:[]})       
    }

    removeItem=(ind)=>{
        let {current_stock,suggetion_filter}={...this.state}
        let item=current_stock[ind]
        suggetion_filter.push({"name":item['name'],"symbol":item['symbol'],"rate":item['rate']})
        current_stock.splice(ind,1)
        this.setState({current_stock,suggetion_filter,current_suggestion:[]})       
    }

    deleteStock=(pur,val)=>{
        let {stock_list}={...this.state}
        stock_list.splice(val,1)
        this.setState({stock_list})       

    }

    editStock=(stock,val)=>{

        let {current_stock,stock_list,currentTransfer,currentUnit,currentDate,total_weight,total_rate,suggetionList,suggetion_filter}={...this.state}
        let obj={
            from:currentTransfer['from'],
            to:currentTransfer['to'],
            date:currentDate,
            material:current_stock,
            weight:(total_weight).toFixed(2),
            rate:(total_rate).toFixed(2)
        }
        currentUnit=stock['unit']
        currentTransfer={
            from:stock['from'],
            to:stock['to']
        }
        currentDate=stock['date']
        current_stock=stock['material']
        total_weight=stock['weight']
        total_rate=stock['rate']
        stock_list.splice(val,1)
        suggetion_filter=suggetionList.slice()
        this.setState({current_stock,stock_list,currentTransfer,currentUnit,currentDate,total_weight,total_rate})
    }
    render() {
        let {stock_party_list,currentDate,unitList,current_suggestion,currentTransfer,currentUnit,current_stock,total_rate,total_weight,stock_list,mode}={...this.state}
        return (
            <div className="d-flex justify-content-center row">
                {mode?
                    <EntryComponent changeMod={e=>this.setState({mode:!mode})}></EntryComponent>
                :
                <div className="flex  d-flex justify-content-center col-lg-12 row ">      
                <Card className="d-flex justify-content-center p-4 col-lg-10">
                    <CardHeader className={" row d-flex justify-content-center bg-primary"} >
                        <Input type="select" name="from" className="col-lg-2 m-2" value={currentTransfer['from']} onChange={(e=>this.handleChange(e))}>
                            {unitList && unitList.map((val,ind)=>
                                <option key={ind}>{val}</option>
                            )}
                        </Input>
                        <i className="fa text-light fa-2x  ml-2 mr-2 m-2 fa-arrow-circle-right" aria-hidden="true"></i>
                        <Input type="select" name="to" className="col-lg-2 m-2" value={currentTransfer['to']} onChange={(e=>this.handleChange(e))}>
                            {unitList && unitList.map((val,ind)=>
                                <option key={ind}>{val}</option>
                            )}
                        </Input>
                        <Input type="date" className="col-lg-2 m-2" value={currentDate}  onChange={e=>this.setState({currentDate:e.target.value})}></Input>
                        <button className="btn btn-sm btn-primary border-light font-weight-bold m-2 " onClick={e=>this.AddStock()}>Add {" Stock "}</button>
                        <button className="btn btn-sm btn-danger border-light font-weight-bold m-2 " onClick={e=>this.setState({current_stock:[],total_rate:0,total_weight:0})}>Delete</button>
                        <button className="btn btn-sm btn-dark border-light font-weight-bold m-2 " onClick={e=>this.setState({mode:!mode})}>Stock Entry</button>
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
                                {current_stock  && current_stock.map((item,ind)=>
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
                    </CardFooter>
                    <hr ></hr>
                </Card>
                <Card className="m-4 col-lg-12 p-2">
                    <CardHeader className=" bg-info text-light h5">
                    <div className="flex  m-1   row">
                                    <div className="col-lg-2">{"Date"}</div>
                                    <div className="col-lg-2">{"From"}</div>
                                    <div className="col-lg-2">{"To"}</div>
                                    <div className="col-lg-2">{"Weight"}</div>
                                    <div className="col-lg-2">{"Rate"}</div>
                                    <div className="col-lg-1">{"Actions"}</div>
                            </div>
                    </CardHeader>
                    <CardBody>
                    {stock_list && stock_list.map((stock,val)=>
                            <div className="flex p-4 m-1  border row">
                                    <div className="col-lg-2">{stock['date']}</div>
                                    <div className="col-lg-2">{stock['from']}</div>
                                    <div className="col-lg-2">{stock['to']}</div>
                                    <div className="col-lg-2">{stock['weight']}</div>
                                    <div className="col-lg-2">{stock['rate']}</div>
                                    <div className="col-lg-1">
                                            <i className={"fa fa-lg fa-pencil c-pointer mr-2 text-success"} onClick={e=>this.editStock(stock,val)}></i>
                                            <i className={"fa fa-lg fa-trash c-pointer  text-danger"} onClick={e=>this.deleteStock(stock,val)}></i>
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
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        material_list: state.Reducer.material_list,
        unit_list: state.Reducer.unit_list,
        stock_party:state.Reducer.stock_party
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StockEntry));