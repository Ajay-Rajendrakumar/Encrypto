import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    CardBody,
    CardHeader,
   Input,Card, Label
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";
import Multiselect from 'multiselect-react-dropdown';
class MonthListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            production_List:[],
            unitList:[],
            selectedUnits:[],
            selectedUnitList:[],
            date:"",
          
            month_cumulative:{},
            production_month_cummulative:{},
          
        }
    }
      componentDidMount(){

    }
    
    componentDidUpdate(){
        let {production_List,unitList,date}={...this.state}
        if(production_List!==this.props.production_List){
            this.setState({production_List:this.props.production_List },()=>{
            this.dateLooper(date)
            })
        }
        if(this.props.unitList && unitList!==this.props.unitList){
            let list=[]
            this.props.unitList.forEach((unit,ind)=>{
                list.push({name: this.getName(unit), id: ind})
            })
            this.setState({unitList:this.props.unitList,selectList:list })
        }
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
    
 
    getUnitTotalProduction=(date,selectedUnit)=>{
        let {production_List}={...this.state}
        let date_wise_Production=_.filter(production_List, function(o) { return o['date']===date; });
        let array={}
        selectedUnit.forEach((unit,ind)=>{
            let unit_wise_Production=_.filter(date_wise_Production, function(o) { return (o['unit'])===(unit); });
      
            let ds_bale=0
            let ds_weight=0
            let ns_bale=0
            let ns_weight=0
            unit_wise_Production.forEach((val)=>{
                ds_bale=ds_bale+parseFloat(val["dayshift"])
                ns_bale=ns_bale+parseFloat(val["nightshift"])
                ds_weight=ds_weight+parseFloat(val["dayweight"])
                ns_weight=ns_weight+parseFloat(val["nightweight"])
                
            })
            let obj={
                name:unit,
                date:date,
                day:date.split('-')[2],
                ds_bale:ds_bale,
                ns_bale:ns_bale,
                ds_weight:ds_weight,
                ns_weight:ns_weight
            }
            array[unit]=(obj)

        })
 
        let day_weight_cummulative=0
        let day_bale_cummulative=0
        selectedUnit.forEach((unit,ind)=>{
            day_weight_cummulative=array[unit]['ds_bale']+array[unit]['ns_bale']+day_weight_cummulative
            day_bale_cummulative=array[unit]['ds_weight']+array[unit]['ns_weight']+day_bale_cummulative
        })
        array['DayWeight']=day_weight_cummulative.toFixed(2)
        array['DayBale']=day_bale_cummulative.toFixed(2)

        return array

    }

    dateLooper=(today)=>{
        let {selectedUnits,month_cumulative,production_month_cummulative}={...this.state}
        let given_month=moment(today).format('MM');
        let start_date=moment().format("YYYY-MM-DD").slice(0, -5) +String(given_month)+ '-01'
        let res={}
        selectedUnits.forEach((unit,ind)=>{
            let obj={
            day_bale_cummulative:0,
            day_weight_cummulative:0,
            night_bale_cummulative:0,
            night_weight_cummulative:0
            }
            month_cumulative[unit]=obj
        })
        let total_bale_cummulative=0
        let total_production_cummulative=0
        for (var m = moment(start_date); m.isSameOrBefore(today); m.add(1, 'days')) {
            let date=m.format('YYYY-MM-DD')
            let data=this.getUnitTotalProduction(date,selectedUnits)
            res[date.split('-')[2]]=data  
            selectedUnits.forEach((unit,ind)=>{
                month_cumulative[unit]["day_bale_cummulative"]=data[unit]['ds_bale']+month_cumulative[unit]["day_bale_cummulative"]
                month_cumulative[unit]["night_bale_cummulative"]=data[unit]['ns_bale']+month_cumulative[unit]["night_bale_cummulative"]
                total_bale_cummulative=total_bale_cummulative+data[unit]['ds_bale']+data[unit]['ns_bale']
                month_cumulative[unit]["day_weight_cummulative"]=data[unit]['ds_weight']+month_cumulative[unit]["day_weight_cummulative"]
                month_cumulative[unit]["night_weight_cummulative"]=data[unit]['ns_weight']+month_cumulative[unit]["night_weight_cummulative"]
                total_production_cummulative=total_production_cummulative+data[unit]['ds_weight']+data[unit]['ns_weight']        
            })
         
        }
        production_month_cummulative={
            total_bale_cummulative:total_bale_cummulative,
            total_production_cummulative:total_production_cummulative
        }
        this.setState({monthly_Production:res,month_cumulative,production_month_cummulative})

    }
    

    handleMultiSelect=(selectedList, selectedItem)=>{
        let {selectedUnits,selectedUnitList,date}={...this.state}
        selectedUnitList=selectedList
        selectedUnits.push(this.getParty(selectedItem['name']))

        this.setState({selectedUnits,selectedUnitList},()=>{
            this.dateLooper(date)
        })

    }
    handleMultRemove=(selectedList, selectedItem)=>{
        let {selectedUnits,selectedUnitList,date}={...this.state}
        selectedUnitList=selectedList
        selectedUnits.splice(selectedUnits.indexOf(this.getParty(selectedItem['name'])),1)
        this.setState({selectedUnits,selectedUnitList},()=>{
            this.dateLooper(date)
        })
    }
    toLocale=(val)=>{
        return parseInt(val).toLocaleString('en-IN')
    }
    render() {
        let {monthly_Production,selectList,selectedUnits,selectedUnitList,date,month_cumulative,production_month_cummulative}={...this.state}
        let {fetch_month}={...this.props}
        return (
            <div className="flex row d-flex justify-content-center m-1">
                    <div className=" col-12 row p-4 mt-n3">
                        <div className="col-6">
                        <Multiselect
                        options={selectList} 
                        selectedValues={selectedUnitList} 
                        onSelect={this.handleMultiSelect} 
                        onRemove={this.handleMultRemove} 
                        displayValue="name"
                        placeholder="Select Unit..."
                        className="form-control col-5"
                        />
                        </div>
                        <Input type="date" className="col-6" value={date}  min={fetch_month['start_date']} max={fetch_month['end_date']} onChange={e=>(this.setState({date:e.target.value},()=>this.dateLooper(e.target.value)))}></Input>
                    </div>
                    <div className="flex col-12 m-2">
                        <Card className="p-1">
                            <CardBody className="row d-flex justify-content-center ">
                                {selectedUnits.map((unit,ind)=>
                                    <Card className="col-lg-5 m-2 p-1 " key={ind}>
                                        <CardHeader className="bg-info font-weight-bold text-warning">{this.getName(unit)}</CardHeader>
                                        {
                                            month_cumulative && month_cumulative[unit] && 
                                            <CardBody className="row d-flex justify-content-center">
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">Dayshift</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['day_bale_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">Weight</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['day_weight_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">NightShift</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['night_bale_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">Weight</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['night_weight_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-4">
                                                    <Label className="text-primary">Total Bales</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['night_bale_cummulative']+month_cumulative[unit]['day_bale_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-4">
                                                    <Label className="text-primary">Total Weight</Label>
                                                    <Input value={this.toLocale(month_cumulative[unit]['night_weight_cummulative']+month_cumulative[unit]['day_weight_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-4">
                                                    <Label className="text-primary">Average Weight</Label>
                                                    <Input value={this.toLocale((month_cumulative[unit]['night_weight_cummulative']+month_cumulative[unit]['day_weight_cummulative'])/(month_cumulative[unit]['night_bale_cummulative']+month_cumulative[unit]['day_bale_cummulative']))} disabled/>
                                                </div>
                                        </CardBody>
                                        }
                                    </Card>
                                )}
                                {production_month_cummulative && <div className="row flex col-lg-12 p-2 bg-dark font-weight-bold m-1 ">
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Total Bale</Label>
                                        <Input value={this.toLocale(production_month_cummulative['total_bale_cummulative'])} disabled/>
                                    </div>
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Total Weight</Label>
                                        <Input value={this.toLocale(production_month_cummulative['total_production_cummulative'])} disabled/>
                                    </div>
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Average Bale Weight</Label>
                                        <Input value={this.toLocale(production_month_cummulative['total_production_cummulative']/production_month_cummulative['total_bale_cummulative'])} disabled/>
                                    </div>
                                </div>}
                           
                            </CardBody>
                        </Card>
                        <hr></hr>
                    </div>
                    
                    <div className="row d-flex justify-content-center col-12 bg-primary p-3 text-light font-weight-bold text-center" >
                    
                    <div className="col-1">Date</div>
                    {selectedUnits && selectedUnits.map((unit,index)=>          
                               
                               <div key={index} className="col-2 row">                              
                                <div className="col-6">{this.getName(unit)+" Bale"}</div>
                                <div className="col-6">{this.getName(unit)+" Weight"}</div>
                                </div>
                       )}
                    <div className="col-1">Total Bale</div>
                    <div className="col-2">Total Weight</div>
                    
                    </div>
                    {monthly_Production && Object.keys(monthly_Production).sort().map((date,index)=>
                            <div key={index} className="col-12  text-light text-center m-1 p-3">
                                <div className="row d-flex justify-content-center flex">
                                        <div className="col-1">{[date]}</div>
                                        {selectedUnits && selectedUnits.map((unit,index)=>          
                                    
                                                <div key={index} className="col-2 row">                              
                                                <div className="col-6">{(monthly_Production[date][unit] && this.toLocale(monthly_Production[date][unit]["ns_bale"]+monthly_Production[date][unit]["ds_bale"]))}</div>
                                                <div className="col-6">{(monthly_Production[date][unit] && this.toLocale(monthly_Production[date][unit]["ns_weight"]+monthly_Production[date][unit]["ds_weight"]))}</div>
                                                </div>
                                        )}
                                        <div className="col-1">{this.toLocale(monthly_Production[date]["DayWeight"])}</div>
                                        <div className="col-2">{this.toLocale(monthly_Production[date]["DayBale"])}</div>
                                </div>
                                
                            
                            </div>
                    )
                    }
                   
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month,

    };
}


function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MonthListComponent));