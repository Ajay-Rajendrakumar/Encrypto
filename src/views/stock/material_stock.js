import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/purchase.css'
import {
    FormGroup,
    Label,
   Input,Modal,ModalBody,ModalFooter, Card, CardHeader, CardBody, CardFooter
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";

class MaterialStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentList:[],
            currentUpdatedList:[],
            suggetion_filter:[],
            suggetionList:[],
            current_suggestion:[],
            avail_material_list:{},
            aggregateValue:{},
        }
    }
    
    componentDidMount(){
            this.getMaterialList()
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
        material && material.forEach((item,val)=>{
            suggest.push({"name":item['name'],"symbol":item['symbol'],"rate":item['rate']})
            materialObj[item['symbol']]=item['name']
        })

        this.setState({materialList:materialObj,suggetionList:suggest.slice(),suggetion_filter:suggest.slice()})
    }
    getstockList=(material)=>{
        let {avail_material_list}={...this.state}
        let obj=this.props.fetch_month
        if(!_.isEmpty(obj)){
        obj['material']=material
        this.props.distributer(obj,"stockInfo").then(response => {
            if(response['status']===200){
              let stock=response['data']   
              avail_material_list[material]=stock
              this.calculateAggregate(stock) 
              this.setState({currentList:stock,stockList:stock,avail_material_list})

            //   this.props.dataStoreSetter(response['data'],"SALES_stock")
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        }
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
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


 
    
    handleFilterChange=(val)=>{
        let {currentList,stockList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(stockList, function(o) { return ((o['party'].toLowerCase()).includes(filterName.toLowerCase()) || (o['unit'].toLowerCase()).includes(filterName.toLowerCase()))   });
        this.calculateAggregate(currentList)
        this.setState({currentList,filterName})
    }

    getMaterialInfo=(material,symbol)=>{
        let {currentList,avail_material_list,suggetion_filter}={...this.state}
        let ind=_.findIndex(suggetion_filter,material)
        suggetion_filter.splice(ind,1)
        this.setState({suggetion_filter,current_suggestion:[]}) 
        if(symbol in avail_material_list){
            currentList=avail_material_list[material]
            this.calculateAggregate(currentList)
            this.setState({currentList})
        }else{
            this.getstockList(material['symbol'])
        }
    }

    calculateAggregate=(stock)=>{
        let  {aggregateValue,currentUpdatedList} = {...this.state}
        let unt=["Anaipudur","Thottam"]
        let obj={}
        unt.forEach((unit,ind)=>{
            obj[unit]={
                "list":[]
            }
        })
        stock.map((row,ind)=>{
            let unit="Thottam"
            if((row['unit'].toLowerCase()).includes("anaipudur")){
                    unit="Anaipudur"
            }
            if(row['type'] in obj[unit]){
                obj[unit][row['type']]=obj[unit][row['type']]+row['weight']
            }else{
                obj[unit][row['type']]=row['weight']
            }
            if(row['type']==="transfer"){
                unt.forEach((ut,ind)=>{
                    let side="add"
                    if(row['unit']!==ut){
                        side="minus"
                        "transfer" in obj[ut]?obj[ut]["transfer"]=obj[ut]["transfer"]-row["weight"] : obj[ut]["transfer"]=0-row["weight"] 
                    }
                    obj[ut]["list"].push({...row,"side":side})
                })
            }else{
                if(row['type']==="purchase"){row["side"]="add"}else{row["side"]="minus"}
                obj[unit]["list"].push(row) 
            } 
        })
        unt.forEach((unit,ind)=>{
            obj[unit]['stock']=(obj[unit]['purchase'] || 0)-(obj[unit]['thada'] || 0)-(obj[unit]['sales'] || 0)+(obj[unit]['transfer'] || 0)
        })
        aggregateValue=obj
        currentUpdatedList=obj
        console.log(obj)
        this.setState({aggregateValue,currentUpdatedList})
    }
    render() {
        let {currentList,filterName,current_suggestion,suggetion_filter,aggregateValue,avail_material_list,currentUpdatedList}={...this.state}
        return (
            <div className="flex row d-flex justify-content-center">
                  <div className="col-lg-6">

                    <Input type={"text"} autoComplete="off" name={"material"} id="material" className={"col-lg-12"} placeholder="Enter Material name..."  onChange={e=>this.handleChange(e)}></Input>
                    <div className="scrollmenu">
                        {current_suggestion && current_suggestion.map((name,ind)=>
                            <div onClick={e=>this.getMaterialInfo(name,name['symbol'])}>{name['name']}</div>
                        )}
                    </div>
                    </div>
             
                    <div className="flex row col-lg-12">
                    {currentUpdatedList && Object.keys(currentUpdatedList).map((unit,index)=>
                        <Card className="col-lg-6 p-2" key={index}>
                                <CardHeader className="bg-secondary font-weight-bold text-light text-center">{unit}</CardHeader>

                                <CardBody>
                                <div className="row m-1  border p-3 bg-info text-light">
                                        <div className="col-3">Date</div>     
                                        <div className="col-3">Party</div>
                                        <div className="col-3">Purchase</div>
                                        <div className="col-3">Thada/Sales</div>                    
                                     </div> 
                                {("list" in currentUpdatedList[unit]) && currentUpdatedList[unit]['list'].map((item,ind)=>
                                    <div className="row m-1  border p-3" key={ind}>
                                        <div className="col-3">{ind+1+") "}{item['date']}</div>     
                                        {/* <div className="col-2">{item['unit']}<button className="btn btn-sm disabled font-weight-bold">{(item['symbol']==="1"?"I":item['symbol']==="2"?"II":item['symbol']==="3"?"III":null)}</button></div> */}
                                        <div className="col-3">{this.getName(item['party'])}</div>
                                        <div className="col-3">
                                        {item['side']==="add"?item['weight']:null}
                                        {/* <button className={"btn-sm btn"+(item['type'].includes("purchase")?" btn-success":" btn-danger")}> {this.getName(item['type'])}</button> */}
                                        </div>
                                        <div className="col-3">{item['side']==="minus"?item['weight']:null}</div>                    
                                     </div> 

                                )}
                                </CardBody>
                                <CardFooter className="row">
                                {!_.isEmpty(currentUpdatedList[unit]) && Object.keys(currentUpdatedList[unit]).map((val,ind)=>
                                    val!="list" && <div className="col-lg-2">
                                        <Label className="text-primary">{this.getName(val)}</Label>
                                        <Input disabled value={currentUpdatedList[unit][val] && (currentUpdatedList[unit][val]).toLocaleString('en-IN')}></Input>
                                    </div>         
                                )}
                                </CardFooter>

                        </Card>
                    
                    )}
                    </div>
                    

                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month
        

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MaterialStock));