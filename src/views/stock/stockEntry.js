import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    Card,
    CardBody,
    CardHeader,
   Input,CardFooter,Label,ModalFooter, CardLink,
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";
import '../../styles/purchase.css'
class EntryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitList:["Anaipudur","Thottam"],
            materialList:{},
            stock_party_list:[],
            filterName:"",
            currentUnit:{},
            currentMonth:moment().format("YYYY-MM"),
            currentUnit:"Anaipudur",
            suggetionList:[],
            current_suggestion:[],
            current_stock:[],
            total_rate:0,
            total_weight:0,
            stock_list:[],
            mode:false,
            uploadList:[],
        }
    }
    
    componentDidMount(){
        let {unitList}={...this.state}
        if(this.props.material_list.length<=0){
            this.getMaterialList()
        }else{
            this.dataFeeder(this.props.material_list)  
        }        
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
        let suggest=[]
        let {uploadList}={...this.state}
        material && material.forEach((item,val)=>{
            suggest.push({"name":item['name'],"symbol":item['symbol'],"rate":item['rate']})
            materialObj[item['symbol']]=item['name']
            let obj={
                name:item['name'],
                symbol:item['symbol'],
                weight:0,
            }   
            uploadList.push(obj)
        })
        console.log(uploadList)
        this.setState({materialList:materialObj,suggetionList:[],suggetion_filter:suggest.slice(),uploadList})
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
        let {currentUnit}={...this.state}   
        if(e.target.name==="material"){
            this.suggestion(e.target.value)
        }else if(e.target.name==="unit"){
                currentUnit[e.target.name]=e.target.value
        }
        this.setState({currentUnit})
    }

  

    handleWeightChange=(ind,e)=>{
        let {current_stock}={...this.state}
        current_stock[ind]["weight"]=e.target.value
        this.setState({current_stock},()=>{
            this.calculate()
        })
    }
 

    calculate=()=>{
        let {current_stock,total_weight}={...this.state}
        total_weight=0
        current_stock && current_stock.map((val,ind)=>{
            total_weight=total_weight+parseFloat(val['weight'])
        })
        this.setState({total_weight})
    }
  


    upload=()=>{
        let {current_stock,mode,currentMonth,currentUnit,uploadList}={...this.state}
        let api="uploadMaterialStock"
        let obj={}        
        current_stock && current_stock.map((val,ind)=>{
        if(_.findIndex(uploadList,{"symbol":val['symbol']})===-1){         
            uploadList.push(val)
        }
        })     
        obj['month']=currentMonth
        obj['material']=uploadList
        obj['unit']=currentUnit
        obj['update']=moment().format("YYYY-MM-DD")     
        this.props.distributer(obj,api).then(response => {
            if(response['status']===200){
                this.toasterHandler("success",response['data'])
                this.setState({current_stock:[],total_weight:0})
               
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }

    addMaterial=(name)=>{
        let {current_stock,suggetion_filter,uploadList}={...this.state}
        let ind=_.findIndex(suggetion_filter,name)
        suggetion_filter.splice(ind,1)
        let index=_.findIndex(uploadList,{"symbol":name['symbol']})
        uploadList.splice(index,1)
        let obj={
            name:name['name'],
            symbol:name['symbol'],
            weight:0,
        }
        if(current_stock){      
            current_stock.push(obj)
        }else{
            current_stock=[obj]
        }
        document.getElementById('material').value=""
        this.setState({current_stock,suggetion_filter,current_suggestion:[],uploadList})       
    }

    removeItem=(ind)=>{
        let {current_stock,suggetion_filter,uploadList}={...this.state}
        let item=current_stock[ind]
        suggetion_filter.push({"name":item['name'],"symbol":item['symbol']})
        uploadList.push({"name":item['name'],"symbol":item['symbol']})
        current_stock.splice(ind,1)
        this.setState({current_stock,suggetion_filter,current_suggestion:[]})       
    }

    deleteStock=(pur,val)=>{
        let {stock_list}={...this.state}
        stock_list.splice(val,1)
        this.setState({stock_list})       

    }

   
    render() {
        let {currentMonth,unitList,current_suggestion,currentUnit,current_stock,total_rate,total_weight,stock_list,mode}={...this.state}
        return (
            <div className="flex row d-flex justify-content-center col-lg-11">      
                <Card className="d-flex justify-content-center p-4 col-lg-10">
                <CardHeader className={" row d-flex justify-content-center bg-primary"} >
                    <Input type="select" name="unit" className="col-lg-2 m-2" value={currentUnit['unit']} onChange={(e=>this.handleChange(e))}>
                        {unitList && unitList.map((val,ind)=>
                            <option key={ind}>{val}</option>
                        )}
                    </Input>
                   
                    <Input type="month" className="col-lg-2 m-2" value={currentMonth}  onChange={e=>(this.setState({currentMonth:e.target.value}),console.log(e.target.value))}></Input>
                    <button className="btn btn-sm btn-primary border-light font-weight-bold m-2 " onClick={e=>this.upload()}>Upload {" Stock "}</button>
                    <button className="btn btn-sm btn-danger border-light font-weight-bold m-2 " onClick={e=>this.setState({current_stock:[],total_rate:0,total_weight:0})}>Delete</button>
                    <button className="btn btn-sm btn-dark border-light font-weight-bold m-2 " onClick={e=>this.props.changeMod()}>Stock Transfer</button>
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
                                <div className="col-lg-6 row"><span className="col-lg-10">{(ind+1)+") "+ item['name'] + " ("+item['symbol']+") "}</span><span className="col-lg-1"> <button className="btn btn-sm btn-danger " onClick={e=>this.removeItem(ind)}><i className="fa fa-trash fa-lg "></i></button></span></div>
                                <div className="col-lg-3"><Input placeholder="Weight"  type="number" value={item['weight']} onChange={e=>this.handleWeightChange(ind,e)} /></div>
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
    
                    </div>
                </CardFooter>
                <hr ></hr>
              </Card>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        material_list: state.Reducer.material_list,
        unit_list: state.Reducer.unit_list,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EntryComponent));