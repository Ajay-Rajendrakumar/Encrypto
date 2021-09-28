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
            thadaList:[],
            unitList:[],
            selectedUnits:[],
            selectedUnitList:[],
            date:"",
          
            month_cumulative:{},
            thada_month_cumulative:{},
          
        }
    }
      componentDidMount(){
        let {unitList,thadaList}={...this.state}
        let {fetch_month}={...this.props}

        this.setState({unitList,thadaList,date:fetch_month['start_date']})
        
    }
    
    componentDidUpdate(){
        let {thadaList,unitList,date}={...this.state}
        if(thadaList!==this.props.thadaList){
            this.setState({thadaList:this.props.thadaList },()=>{
            this.dateLooper(date)
            })
        }
        if(unitList!==this.props.unitList){
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
    
    handleChange=(e)=>{
        let { formdata } = { ...this.state }
        formdata[e.target.name] = e.target.value       
        this.setState({ formdata })
    }
    handleFilterChange=(val)=>{
        let {thadaListFilter,thadaList,filterName}={...this.state}
        filterName=val || ""
        thadaList =_.filter(thadaListFilter, function(word) { return word['unit'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['thada'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['date'].toLowerCase().includes(filterName.toLocaleLowerCase()) }); 
        this.setState({thadaList,filterName})
    }
    
    getUnitTotalThada=(date,selectedUnit)=>{
        let {thadaList}={...this.state}
        let date_wise_Thada=_.filter(thadaList, function(o) { return o['date']===date; });
        let array={}
        selectedUnit.forEach((unit,ind)=>{
            let unit_wise_Thada=_.filter(date_wise_Thada, function(o) { return o['unit']===unit; });
            let weight=0
            let cost=0
            unit_wise_Thada.forEach((val)=>{
                weight=weight+parseFloat(val["weight"])
                cost=cost+parseFloat(val["rate"])
            })
            let obj={
                name:unit,
                date:date,
                day:date.split('-')[2],
                weight:weight,
                cost:cost
            }
            array[unit]=(obj)

        })

        let day_weight_cummulative=0
        let day_cost_cummulative=0
        // Object.keys(array).forEach((units,ind)=>{
            selectedUnit.forEach((unit,ind)=>{
            day_weight_cummulative=array[unit]['weight']+day_weight_cummulative
            day_cost_cummulative=array[unit]['cost']+day_cost_cummulative
            })
        // })
        array['DayWeight']=day_weight_cummulative.toFixed(2)
        array['DayCost']=day_cost_cummulative.toFixed(2)
        return array

    }

    dateLooper=(today)=>{
        let {selectedUnits,month_cumulative,thada_month_cumulative}={...this.state}
        let given_month=moment(today).format('MM');
        let start_date=moment().format("YYYY-MM-DD").slice(0, -5) +String(given_month)+ '-01'
        let res={}
        selectedUnits.forEach((unit,ind)=>{
            let obj={
            month_weight_cummulative:0,
            month_cost_cummulative:0
            }
            month_cumulative[unit]=obj
        })
        let month_weight_cummulative=0
        let month_cost_cummulative=0
        for (var m = moment(start_date); m.isSameOrBefore(today); m.add(1, 'days')) {
            let date=m.format('YYYY-MM-DD')
            let data=this.getUnitTotalThada(date,selectedUnits)
            res[date.split('-')[2]]=data
           
            selectedUnits.forEach((unit,ind)=>{
                month_cumulative[unit]["month_weight_cummulative"]=data[unit]['weight']+month_cumulative[unit]["month_weight_cummulative"]
                month_weight_cummulative=month_weight_cummulative+data[unit]['weight']
                month_cumulative[unit]["month_cost_cummulative"]=data[unit]['cost']+month_cumulative[unit]["month_cost_cummulative"]
                month_cost_cummulative=month_cost_cummulative+data[unit]['cost']
                
            })
         
        }
        thada_month_cumulative={
            month_weight_cummulative:month_weight_cummulative,
            month_cost_cummulative:month_cost_cummulative
        }
        this.setState({monthly_Thada:res,month_cumulative,thada_month_cumulative})

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
        let {monthly_Thada,selectList,selectedUnits,selectedUnitList,date,month_cumulative,thada_month_cumulative}={...this.state}
        let {cur_Date}={...this.props}
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
                        <Input type="date" className="col-6" value={date}  min={cur_Date['start_date']} max={cur_Date['end_date']} onChange={e=>(this.setState({date:e.target.value},()=>this.dateLooper(e.target.value)))}></Input>
                    </div>
                    <div className="flex col-lg-12 m-2">
                        <Card className="p-1">
                            <CardBody className="row d-flex justify-content-center ">
                                {selectedUnits.map((unit,ind)=>
                                    <Card className="col-lg-5 m-2 p-1" key={ind}>
                                        <CardHeader className="bg-info text-warning  font-weight-bold">{this.getName(unit)}</CardHeader>
                                        <CardBody className="row d-flex justify-content-center">
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">Weight</Label>
                                                    <Input value={month_cumulative && month_cumulative[unit] && this.toLocale(month_cumulative[unit]['month_weight_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Label className="text-primary">Cost</Label>
                                                    <Input value={month_cumulative && month_cumulative[unit] && this.toLocale(month_cumulative[unit]['month_cost_cummulative'])} disabled/>
                                                </div>
                                                <div className="col-lg-8">
                                                    <Label className="text-primary">Average</Label>
                                                    <Input value={month_cumulative && month_cumulative[unit] && this.toLocale(month_cumulative[unit]['month_cost_cummulative']/month_cumulative[unit]['month_weight_cummulative'])} disabled/>
                                                </div>
                                        </CardBody>
                                    </Card>
                                )}
                                {thada_month_cumulative && <div className="row flex col-lg-12 p-2 bg-dark font-weight-bold m-1">
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Total Weight</Label>
                                        <Input value={thada_month_cumulative  && this.toLocale(thada_month_cumulative['month_weight_cummulative'])} disabled/>
                                    </div>
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Total Cost</Label>
                                        <Input value={thada_month_cumulative  && this.toLocale(thada_month_cumulative['month_cost_cummulative'])} disabled/>
                                    </div>
                                    <div className="col-lg-4 p-1">
                                        <Label className="text-light">Average</Label>
                                        <Input value={thada_month_cumulative && this.toLocale(thada_month_cumulative['month_cost_cummulative']/thada_month_cumulative['month_weight_cummulative'])} disabled/>
                                    </div>
                                </div>}
                           
                            </CardBody>
                        </Card>
                        <hr></hr>
                    </div>
                    
                    <div className="row d-flex justify-content-center col-12  bg-primary p-3 text-light font-weight-bold text-center" >
                    
                    <div className="col-1">Date</div>
                    {selectedUnits && selectedUnits.map((unit,index)=>          
                               
                               <div key={index} className="col-2 row">                              
                                <div className="col-6">{this.getName(unit)+" weight"}</div>
                                <div className="col-6">{this.getName(unit)+" cost"}</div>
                                </div>
                       )}
                    <div className="col-1">Total Weight</div>
                    <div className="col-2">Total Cost</div>
                    
                    </div>
                    {monthly_Thada && Object.keys(monthly_Thada).sort().map((date,index)=>
                            <div key={index} className="col-12 text-center  m-1 p-3">
                                <div className="row d-flex justify-content-center flex text-light">
                                        <div className="col-1">{[date]}</div>
                                        {selectedUnits && selectedUnits.map((unit,index)=>          
                                    
                                                <div key={index} className="col-2 row">                              
                                                <div className="col-6">{monthly_Thada[date][unit] && this.toLocale(monthly_Thada[date][unit]["weight"])}</div>
                                                <div className="col-6">{monthly_Thada[date][unit] && this.toLocale(monthly_Thada[date][unit]["cost"])}</div>
                                                </div>
                                        )}
                                        <div className="col-1">{this.toLocale(monthly_Thada[date]["DayWeight"])}</div>
                                        <div className="col-2">{this.toLocale(monthly_Thada[date]["DayCost"])}</div>
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