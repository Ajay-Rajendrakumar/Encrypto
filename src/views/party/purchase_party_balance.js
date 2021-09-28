import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/balance_component.css'
import {
    Label,Input, Card, CardHeader, CardBody, CardFooter
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment';
import PDFComponent from '../pdf/PDFComponent';


class PurchasePartyBalance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_month:{},
            cur_date:"",
            current_aggregate:{},
            rejected_index:[],
        }
    }
    
    componentDidMount(){
          this.generateMonth(moment().format("YYYY-MM"))
        
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
            this.getPartyInfo()
        })

    }

    getPartyInfo=()=>{
        let obj={
            'date':this.state.current_month,
            'party':this.props.salesPartyInfo
        }
        this.props.distributer(obj,"getPurchasePartyBalance").then(response => {
            if(response['status']===200){
              let party=response['data']    
              party=_.sortBy(party, [function(o) { return o['date']; }])
              this.calculateAggregate(party)
              this.setState({currentList:party},()=>{
                  this.getEffectivebalance()
              })
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }
    getEffectivebalance=()=>{
        let {salesPartyInfo}={...this.props}
        let {current_month}={...this.state}
        let obj={
            "party":salesPartyInfo['party'],
            "partyId":salesPartyInfo['id'],
            "type":"purchase",
            "month":(current_month['month']).substring(0,3).toLowerCase(),
        }
        this.props.distributer(obj,"EffectiveBalance").then(response => {
            if(response['status']===200){
                this.setState({effective_balance:response['data']})
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
    
    handleChange=(e)=>{
        let { addedParty } = { ...this.state }
            addedParty[e.target.name] = e.target.value       
            this.setState({ addedParty })
    }

    calculateAggregate=(list)=>{
        let total_weight=0
        let total_amount=0
        let total_tax=0
        let credit_amount=0
        let debit_amount=0
        console.log(list)
        list && list.forEach((row,ind)=>{
            if(!this.state.rejected_index.includes(ind)){
                if(row['entry_type']==="purchase"){
                    if(row['sales']===1){
                        total_amount=total_amount-parseFloat(row['rate'])
                        total_weight=total_weight-parseFloat(row['weight'])
                    }else{
                        total_amount=total_amount+parseFloat(row['rate'])
                        total_weight=total_weight+parseFloat(row['weight'])
                    }
                    
                }else{
                    if(row['type']==="credit"){
                        credit_amount=credit_amount+parseFloat(row['amount'])
                    }else{
                        debit_amount=debit_amount+parseFloat(row['amount'])
                    }

                }
            }
        })
        let obj={
            total_weight:total_weight,
            total_amount:total_amount,
            credit_amount:credit_amount,
            debit_amount:debit_amount,
            effective:(total_amount-debit_amount+credit_amount)
        }
        this.setState({current_aggregate:obj})
    }

  
    
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    handle_rejection=(ind)=>{
        let {rejected_index,currentList}={...this.state}
        console.log(rejected_index.includes(ind))
        if(rejected_index.includes(ind)){
            let index=rejected_index.indexOf(ind)
            rejected_index.splice(index,1)
        }else{
            rejected_index.push(ind)
        }
        console.log(rejected_index)
        this.setState({rejected_index},()=>{
            this.calculateAggregate(currentList)
        })
    }
    render() {
        let {currentList,cur_date,current_aggregate,rejected_index,effective_balance,current_month}={...this.state}
        let {salesPartyInfo}={...this.props}

        return (
            <div className=" main_div flex d-flex justify-content-center p-5 ">
                  
                
                    <Card className="col-lg-10">
                        <CardHeader className="bg-primary h5 text-light m-2">
                            {salesPartyInfo['party']}
                            <button className="btn btn-sm btn-danger float-right" onClick={e=>this.props.handle_balance_component({})}><i className="fa fa-close mr-2"></i>Close</button>
                            <Input  className="col-lg-2 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                            <Input  type="text" className="col-lg-2 mr-2 float-right" value={((parseInt(effective_balance && effective_balance['balance']) || 0)+(parseInt(current_aggregate && current_aggregate['effective']) || 0)).toLocaleString('en-IN')} disabled/>
                            <PDFComponent data={currentList} date={current_month} partyInfo={salesPartyInfo} aggregate={current_aggregate} effective_balance={effective_balance} type="purchase"></PDFComponent>
                     
                        </CardHeader>
                        <CardBody className="h6 cardBody row">
                     
                             {currentList && currentList.length>0 ? 
                                 <div className="col-lg-12">
                                    {
                                        currentList.map((item,ind)=>
                                        item['entry_type']==="purchase"?
                                            <div  key={ind}  className={"flex row border m-1 p-3 "+(rejected_index.includes(ind) ? " bg-secondary text-light ": item['return']==='1'?" bg-danger text-light ":"")}>
                                            <div className="col-lg-2">{item['date']}</div>
                                            <div className="col-lg-1 font-weight-bold">BILL</div>
                                            <div className="col-lg-2">{item['unit']}</div>
                                            {/* <div className="col-lg-3">{item['party']}</div> */}
                                            {/* <div className="col-lg-1">{item['bale']}</div> */}
                                            <div className="col-lg-2">{parseInt(item['weight']).toLocaleString('en-IN')}</div>
                                            {/* <div className="col-lg-1">{item['rate']}</div> */}
                                            <div className="col-lg-4">{parseInt(item['rate']).toLocaleString('en-IN')}</div>
                                            <div className="col-lg-1">
                                                    <Input type="checkbox" className="p-1" onClick={e=>this.handle_rejection(ind)}></Input>

                                            </div>
                                        </div>
                                        :
                                            <div className={"row m-1  border p-3 "+(rejected_index.includes(ind) && " bg-secondary text-light")} key={ind}>
                                            <div className="col-lg-2">{item['date']}</div>   
                                            <div className="col-lg-1">{item['mode']}</div>
                                            {/* <div className="col-lg-3">{item['party']}</div> */}
                                            {/* <div className="col-lg-2">{item['transactionName']}</div> */}
                                            <div className="col-lg-4">
                                                <button className={"btn btn-sm "+(item['type']==="credit"?" btn-success":" btn-danger")}>{item['type']==="credit"?"Credit":"Debit"}</button>
                                            </div>
                                            <div className="col-lg-4">{parseInt(item['amount']).toLocaleString('en-IN')}</div>
                                            <div className="col-lg-1">
                                                    <Input type="checkbox" className="p-1" onClick={e=>this.handle_rejection(ind)}></Input>

                                            </div>
                                        </div>
                                        )}
                                </div>
                                :
                                <span className="col-lg-12 text-center text-danger h6"><i className="text-danger fa fa-exclamation-circle mr-1 fas fa-lg"></i>No Data to Show</span>
                    
                              }
            
                    </CardBody>
                    <CardFooter className="row d-flex justify-content-center">
                        {currentList && !_.isEmpty(current_aggregate) && Object.keys(current_aggregate).map((val,ind)=>
                            val!=="effective" && <div className="col-lg-2">
                                <Label className="text-primary">{this.getName(val)}</Label>
                                <Input disabled value={current_aggregate[val] && (current_aggregate[val]).toLocaleString('en-IN')}></Input>
                            </div>
                        )}
                    </CardFooter>
                    </Card>  

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchasePartyBalance));