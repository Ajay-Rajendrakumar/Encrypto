import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/thada.css'
import * as basic from "../../store/actions/basic.action.js";
import {
    Input,Modal,ModalBody,ModalFooter, ModalHeader
  } from "reactstrap";
  import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import _ from 'lodash';
import moment from 'moment';

class MonthComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            monthList:['apr','may','jun','jul','aug','sep','oct','nov','dec','jan','feb','mar'],
            edit_mode:true,
        }
    }
    
    componentDidMount(){
    }
    calculate=()=>{
        let {modalData}={...this.props}
        let {calculate_month}={...this.state}
        if(!_.isEmpty(modalData)){
        let party={
            party:modalData['party'],
            id:modalData['partyId'],
            type:modalData['type'],
        }
        let month=this.generateMonth(moment().month(this.getName(calculate_month)).format("YYYY-MM"))
        this.getSalesPartyBalance(month,party)
        }
      
    }
    generateMonth=(date)=>{
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
        return data
    }

    getSalesPartyBalance=(month,party)=>{ 
        let obj={
            'date':month,
            'party':party
        }
        let api="getSalesPartyBalanceAmount"
        console.log(party)
        if(party['type']==="purchase"){
            api="getPurchasePartyBalanceAmount"
        }
        this.props.distributer(obj,api).then(response => {
            if(response['status']===200){
                    console.log(response)
                    this.setPartyBalance(response['data'])
            }else{ 
              this.toasterHandler("error", response['msg'])
            }
          }).catch((err)=>{
            this.toasterHandler("error", err)
          })
    }
      
    setPartyBalance=(balance)=>{
        let {calculate_month,monthList}={...this.state}
        let {modalData}={...this.props}
        let month=calculate_month
        let index=monthList.indexOf(calculate_month)
        if(month==="apr"){
            modalData['balance'][month]=parseFloat(modalData['opening'])+parseFloat(balance['balance'])
        }else{
            modalData['balance'][month]=parseFloat(modalData['balance'][monthList[index-1]])+parseFloat(balance['balance'])
        }
        this.setState({modalData})
    }
    handleChange=(e,type)=>{
        let { modalData } = { ...this.props }
        if(type==="balance"){
            modalData['balance'][e.target.name] = e.target.value   
        }else{
            modalData[e.target.name] = e.target.value   
        }    
        this.setState({ modalData })
    }

    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    Update=()=>{
        let {modalData}={...this.props}
        let mon=[]
        let bal=[]
        console.log(modalData)
        Object.keys(modalData['balance']).forEach((val,ind)=>{
            mon.push(val)
            bal.push(modalData['balance'][val])
        })
        modalData['monthList']=mon
        modalData['BalanceList']=bal
        this.props.distributer(modalData,"uploadBalance").then(response => {
            if(response['status']===200){
               
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }

    printAmount=(val)=>{
        let {edit_mode}={...this.state}
        if(edit_mode){
            val=parseInt(val).toLocaleString('en-IN')
        }
        return val
    }
    
 
    render() {
        let {modalData,modal}={...this.props}
        let {monthList,edit_mode}={...this.state}
        return (

              <Modal className="modal-width" isOpen={modal} size="lg" >
                    <ModalHeader className=" h4 text-light bg-info ">
                    <span className="col-10 h4 text-light bg-info">{modalData && modalData['party']}</span>
                    <button className={"btn  text-light"+(edit_mode?" bg-primary":" bg-success")} onClick={e=>this.setState({edit_mode:!edit_mode})}>{edit_mode?"Edit":"View"}</button>
                    </ModalHeader>
                    <ModalBody>
                    {!_.isEmpty(modalData) && 
                        <div className="flex row">
                                <div className="col-lg-12 d-flex justify-content-center mb-3">
                                        <div className="col-lg-5">
                                            <label>Opening (April)</label>
                                            <Input value={this.printAmount(modalData['opening'])} name="opening" onChange={e=>this.handleChange(e,"normal")} disabled={edit_mode}></Input>
                                        </div>
                                        <div className="col-lg-5">
                                            <label>Party Type</label>
                                            <Input value={this.getName(modalData['type'])} disabled></Input>
                                        </div>
                                </div>
                                <div className="col-lg-12 d-flex justify-content-center row">
                                {!_.isEmpty(modalData['balance']) && monthList.map((month,ind)=>
                                       month in modalData['balance'] &&
                                       <div className="col-lg-10 d-flex justify-content-center row m-1" key={ind}>
                                            <span className="col-lg-2 p-2 font-weight-bold">{moment().month(this.getName(month)).format("MMMM")}</span>
                                            <Input className="col-lg-5" value={this.printAmount(modalData['balance'][month] || 0)} name={month} disabled={edit_mode} onChange={e=>this.handleChange(e,"balance")}></Input>
                                        </div>
                                )}
                               </div>
                        </div>
                    }
                    </ModalBody>
                    <ModalFooter className="row flex">
                        <div className="col-lg-5 row">
                                <Input type="select" onChange={e=>this.setState({calculate_month:e.target.value})} className="col-lg-6 mr-2">
                                <option value=""></option>
                                    
                                    {modalData && !_.isEmpty(modalData) && monthList.map((month,ind)=>
                                       month in modalData['balance'] &&
                                        <option key={ind} value={month}>{moment().month(this.getName(month)).format("MMMM")}</option>
                                    )}
                                </Input>
                                <button className="btn btn-success" onClick={e=>this.calculate() }>Calculate</button>{' '}

                        </div>
                        <div className="col-lg-5">
                        <button className="btn btn-success" onClick={e=>this.Update()}>Update</button>{' '}
                        <button className="btn btn-danger" onClick={e=>(this.setState({edit_mode:true},()=>this.props.onClose()))}>Cancel</button>
                        </div>
                    </ModalFooter>
                 </Modal>   
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MonthComponent));