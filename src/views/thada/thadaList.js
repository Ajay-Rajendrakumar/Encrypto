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
import moment from "moment";


class ThadaListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thadaList:[],
            prop_thadaList:[],
            modal:false,
            thadaInfo:{},
            current_month:moment().format("YYYY-MM"),
            monthly_data:{},
            sortList:{
                'unit':false,
                'thada':false,
                'date':false,

            }
        }
    }
    
    componentDidUpdate(){
        let {prop_thadaList}={...this.state}
        if(prop_thadaList!==this.props.thadaList){
            this.setState({prop_thadaList:this.props.thadaList },()=>{
                 this.setState({thadaList:this.props.thadaList ,thadaListFilter:this.props.thadaList })
                 this.calculate(this.props.thadaList)
            })
        }
    }

    componentDidMount(){
        let {prop_thadaList}={...this.state}
        this.setState({thadaList:prop_thadaList,thadaListFilter:prop_thadaList},()=>{
            this.calculate(this.props.thadaList)
        })
        this.generateMonth(moment().format('YYYY-MM'))

    }
    
    getThadaInfo=(thada)=>{
        this.props.distributer(thada,"thadaInfo").then(response => {
            if(response['status']===200){
                let data=_.filter(response['data'], function(val) { return val['weight']!==null; });
                let obj={
                    "thada":thada,
                    "combination":data
                }
                this.setState({thadaInfo:obj,modal:true}) 
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
        let {thadaListFilter,thadaList,filterName}={...this.state}
        filterName=val || ""
        thadaList =_.filter(thadaListFilter, function(word) { return word['unit'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['thada'].toLowerCase().includes(filterName.toLocaleLowerCase()) || word['date'].toLowerCase().includes(filterName.toLocaleLowerCase()) }); 
        this.setState({thadaList,filterName})
    }
  

    deleteThada=(item)=>{
        if(window.confirm("Are you sure?")){
            this.props.distributer(item,"deleteThada").then(response => {
                if(response['status']===200){
                    this.toasterHandler("success",response['data'])
                    this.props.updateThadaList(this.state.current_month)
                }else{ 
                this.toasterHandler("error", response['msg'])
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
    }

    sorticon=(item)=>{
        return (
            <i className="fa fa-sort ml-2 c-pointer" aria-hidden="true" onClick={e=>this.handleSort(item)}></i>
        )
    }
    handleSort=(item)=>{
        let {thadaListFilter,thadaList,filterName,sortList}={...this.state}
        filterName=""
        thadaList =_.sortBy(thadaListFilter, [function(o) { return o[item]; }]);
        if(!sortList[item]){
            thadaList=thadaList.reverse()
            
        }
        sortList[item]=!sortList[item]
        this.setState({thadaList,filterName})
    }

    calculate=(list)=>{
        let total_weight=0
        let total_cost=0
        list && list.forEach((val,ind)=>{
            total_weight=total_weight+parseFloat(val['weight'])
            total_cost=total_cost+parseFloat(val['rate'])
        })
        let obj={
            "Total Weight":total_weight,
            "Total Cost":total_cost
        }
        this.setState({monthly_data:obj})
    }
    generateMonth=(date)=>{
        let cur_date=date
        date=date+"-01"
        let date_month=moment(date).format('MMMM')
    
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
                this.props.updateThadaList(data)
        })
        

    }
    render() {
        let {filterName,thadaList,thadaInfo,modal,current_month,monthly_data,cur_date}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                 <Card className="flex row col-lg-5 p-2">
                    <CardHeader className="bg-primary text-light font-weight-bold h5">
                        Thada Information<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.props.updateThadaList(current_month)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-5 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                    
                    </CardHeader>
                    <CardBody className="col-12 row d-flex justify-content-center">
                    {monthly_data && Object.keys(monthly_data).map((key,ind)=>
                        <div className="flex col-lg-5" key={ind}>
                                <Label className="text-primary">{this.getName(key)+":"}</Label>
                                <Input disabled value={parseInt(monthly_data[key]).toLocaleString('en-IN')}></Input>
                      
                        </div>
                    )}
                    </CardBody>
                </Card>
                    <Card className="col-lg-8 mt-3">
                        <CardHeader className="bg-primary h5 text-light m-2">
                        <div className="row m-1 text-center">
                                    <div className="col-1">Sno</div>
                                    <div className="col-2">Unit{this.sorticon("unit")}</div>
                                    <div className="col-2">Date{this.sorticon("date")}</div>
                                    <div className="col-2">Thada{this.sorticon("thada")}</div>
                                    <div className="col-2">Total Weight</div>
                                    <div className="col-2">Total Cost</div>
                                   
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                                </div>
                    {thadaList && thadaList.map((item,ind)=>
                                <div className="row m-1  border p-3 text-center" key={ind}>
                                    <div className="col-1">{ind+1}</div>
                                    <div className="col-2">{this.getName(item['unit'])}</div>
                                    <div className="col-2">{item['date']}</div>
                                    <div className="col-2">{this.getName(item['thada'])}</div>
                                    <div className="col-2">{parseFloat(item['weight']).toLocaleString('en-IN')  || '-'}</div>
                                    <div className="col-2">{parseFloat(item['rate']).toLocaleString('en-IN') || '-'}</div>
                                    <div className="col-1">
                                        <i className="fa fa-lg fa-eye c-pointer text-primary mr-2" onClick={e=>this.getThadaInfo(item)}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteThada(item)}></i>
                            
                                        </div>
                                </div>
                    )}
                    </CardBody>
                    </Card>
                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <div className="flex m-2 row p-2">
                    <span className="col-10 h4">Thada Information</span>
                    </div>
                    <ModalBody>
                          <div className="flex row">
                              <hr></hr>
                                    <div className="row flex col-12">   
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Date</Label><Input   value={thadaInfo && thadaInfo['thada'] && thadaInfo['thada']['date']} disabled></Input></div>
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Thada</Label><Input   value={thadaInfo && thadaInfo['thada'] && this.getName(thadaInfo['thada']['unit'])} disabled></Input></div>
                                        <div className="col-lg-4 text-info font-weight-bold"><Label>Unit</Label><Input   value={thadaInfo && thadaInfo['thada'] && this.getName(thadaInfo['thada']['thada'])} disabled></Input></div>
                                    </div>
                                <div className="m-1 p-1">
                                    <hr></hr>
                              {thadaInfo && thadaInfo['combination'] && thadaInfo['combination'].map((item,val)=>     
                                <div key={val} className="flex row m-1">
                                        <div className="col-lg-3"> <span className="font-weight-bold">{(val+1) +")  "+ item['name']} </span>   <span>{"["+((parseFloat(item['weight'])/thadaInfo['thada']['weight'])*100).toFixed(2) +"% ]"}</span></div>
                                        <div className="col-lg-2"><Input placeholder="Weight"  type="number"  value={item['weight']} disabled /></div>
                                        <div className="col-lg-1">{" * "}</div>
                                        <div className="col-lg-2"><Input placeholder="rate"  type="number" value={item["rate"]} disabled/></div>
                                        <div className="col-lg-1">{" = "}</div>
                                        <div className="col-lg-2"><Input placeholder="total"  type="number" value={parseFloat(item['weight'])*parseFloat(item['rate'])} disabled/></div>
                                    </div>
                              )}
                                <div className="row flex m-1 ">
                                
                                    <div className="col-lg-3 text-info font-weight-bold">Cummulative: {" "}<span className="font-weight-bold text-danger">Weight</span></div>
                                    <div className="col-lg-2"><Input type="number" value={thadaInfo && thadaInfo['thada'] && thadaInfo['thada']['weight']} className="border-warning"disabled/></div>
                                    <div className="col-lg-1 font-weight-bold"></div>
                                    <div className="col-lg-2"></div>
                                    <div className="col-lg-1 text-danger font-weight-bold">Cost</div>
                                    <div className="col-lg-2"><Input type="number" value={thadaInfo && thadaInfo['thada'] && thadaInfo['thada']['rate']} className="border-warning" disabled/></div>
                                </div>
                                <div className="d-flex justify-content-center m-2 p-2">
                                        <div className="col-lg-3 font-weight-bold h5 p-2"> Average Cost</div>
                                        <div className="col-lg-2"><Input type="number" value={thadaInfo && thadaInfo['thada'] && (thadaInfo['thada']['rate']/thadaInfo['thada']['weight']).toFixed(3)} className="border-warning"disabled/></div>
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
        thada_list: state.Reducer.thada_list

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
   
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThadaListComponent));