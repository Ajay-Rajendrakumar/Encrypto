import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Label,
   Input,Modal,ModalBody,ModalFooter, Card, CardHeader, CardBody, ModalHeader
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import moment from 'moment'
class TransactionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal:false,
            editedMaterial:{},
            filterName:"",
            transaction_obj:{},
            transaction_mode:"transaction",
            aggregate_list:{},
            current_month:"",
            cur_date:"",
        }
    }
    
    componentDidMount(){
        this.generateMonth(moment().format('YYYY-MM'))
    }
    getTransaction=(load)=>{

        let {transaction_mode,currentList,TransactionFilterList,current_month}={...this.state}  
        let date=current_month
        if(load && ((transaction_mode==="transaction" && this.props.transaction_list.length>0) || (transaction_mode==="expense" && this.props.expense_list.length>0))){
            currentList=(transaction_mode==="transaction"?this.props.transaction_list:this.props.expense_list)
            TransactionFilterList=(transaction_mode==="transaction"?this.props.transaction_list:this.props.expense_list)
            this.setState({currentList,TransactionFilterList},()=>{
                this.calculateAggregate()
            })
        }else{
            if(_.isEmpty(date)){
                date=this.props.fetch_month
            }
            let api="TransactionList"
            if(transaction_mode==="expense"){
                api="ExpenseList"
            }
            if(!_.isEmpty(date)){
                this.props.distributer(date,api).then(response => {
                    if(response['status']===200){
                    let party=response['data']    
                    this.setState({currentList:party,TransactionFilterList:party},()=>{
                         this.calculateAggregate()
                        })
                    }else{ 
                    this.toasterHandler("error", response['msg'] || "Cant reach the server")
                    }
                }).catch((err)=>{
                    this.toasterHandler("error", "Cant reach the server")
                })
                }
         }
    }

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    
    handleChange=(e)=>{
        let { transaction_obj } = { ...this.state }
            transaction_obj[e.target.name] = e.target.value       
            this.setState({ transaction_obj })
    }

 

    upload=()=>{
        this.props.distributer([this.state.transaction_obj],"uploadTransaction").then(response => {
            if(response['status']===200){
                this.setState({transaction_obj:{},modal:false})
                this.getTransaction(false)
               
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }
    editTransaction=()=>{
        let {transaction_mode,transaction_obj}={...this.state}
        let api="editTransaction"
        if(transaction_mode==="expense"){
            api="editExpense"
        }
        this.props.distributer(transaction_obj,api).then(response => {
            if(response['status']===200){ 
                this.setState({transaction_obj:{},modal:false})
                this.getTransaction(false)
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }
    deleteTransaction=(item)=>{
        let {transaction_mode}={...this.state}
        let api="deleteTransaction"
        if(transaction_mode==="expense"){
            api="deleteExpense"
        }
        this.props.distributer(item,api).then(response => {
            if(response['status']===200){
                this.getTransaction(false)
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }

    
    handleFilterChange=(val)=>{
        let {currentList,TransactionFilterList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(TransactionFilterList, function(o) { return ((o['party'].toLowerCase()).includes(filterName.toLowerCase()) || (o['transactionName'].toLowerCase()).includes(filterName.toLowerCase()) || o['date'].includes(filterName)) || o['amount'].includes(filterName) || o['type'].includes(filterName) || o['mode'].includes(filterName)  });
        this.setState({currentList,filterName},()=>{
            this.calculateAggregate()
        })
    }
    getDate=(date)=>{
        if(date){
            let new_Date=""
            let arr=date.split('/')
            if(arr.length>2){
                new_Date=arr[2]+"-"+arr[1]+"-"+arr[0]
            }
            return new_Date
        }
    }
    changeMode=()=>{
        let {transaction_mode}={...this.state}
        if(transaction_mode==="transaction"){
            transaction_mode="expense"
        }else{
            transaction_mode="transaction"

        }
        this.setState({transaction_mode},()=>{
            this.getTransaction(false)
        })
    }
    calculateAggregate=()=>{
            let {currentList,aggregate_list}={...this.state}
            let total_credit=0
            let total_debit=0
            let total_credit_transaction=0
            let total_debit_transaction=0
            currentList && currentList.forEach(element => {
                if(element['type']==="credit"){
                    total_credit= total_credit + parseFloat(element['amount'])
                    total_credit_transaction=total_credit_transaction+1
                }else{
                    total_debit= total_debit + parseFloat(element['amount'])
                    total_debit_transaction=total_debit_transaction+1
                }
            });
              aggregate_list={
                total_credit:total_credit.toFixed(2),
                total_debit:total_debit.toFixed(2),
                total_credit_transaction:total_credit_transaction,
                total_debit_transaction:total_debit_transaction
            }
            this.setState({aggregate_list})
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    changeTable=()=>{
        let {transaction_obj}={...this.state}
        let vari=String(transaction_obj['type'])+"_amount"
            transaction_obj[vari]=transaction_obj['amount']
            this.props.distributer([transaction_obj],"uploadExpense").then(response => {
                if(response['status']===200){
                    this.setState({transaction_obj:{},modal:false})
                    this.deleteTransaction(transaction_obj)
                    this.getTransaction(false)
                    this.toasterHandler("success", "Edited Successfully")
                }else{ 
                this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
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
                this.getTransaction(false)
        })
        

    }

    render() {
        let {currentList,modal,transaction_mode,filterName,mode,transaction_obj,aggregate_list,cur_date}={...this.state}
        return (
            <div className="flex d-flex justify-content-center row">
                    <Card className="m-3 col-lg-8 p-2">
                        <CardHeader className="bg-primary text-light h5 ">Transaction Information
                        <button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.getTransaction(false)}><i className="fas fa-refresh"></i> </button>
                        <Input  className="col-lg-3 mr-2 float-right" type="month"  value={cur_date} onChange={e=>this.generateMonth(e.target.value)}/>
                        
                        </CardHeader>
                        <CardBody className="row flex col-lg-12  m-2">
                                {aggregate_list && Object.keys(aggregate_list).map((key,ind)=>
                                    <div  key={ind} className="col-lg-3 p-1">
                                    <Label className="text-primary">{this.getName(key)}</Label>
                                    <Input disabled value={parseInt(aggregate_list[key]).toLocaleString('en-IN')} className="m-2"></Input>
                                    </div>
                                )}
                        </CardBody>
                    </Card>
                    <Card className="col-lg-12">
                        <CardHeader className="bg-info h5 text-light m-2">
                        <div className="row  col-12">
                                    <div className="col-2">Date</div>
                                    <div className="col-4">Transaction Name</div>
                                    <div className="col-2">Party</div>
                                    <div className="col-1">Amount</div>
                                    <div className="col-1">Mode</div>
                                    <div className="col-2">Actions</div>
                                </div>
                        </CardHeader>
                        <CardBody className="h6">
                        <div className="row m-1  border p-3">

                        <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                        {/* <span className="col-lg-6"><button className="btn  btn-sm btn-success" onClick={e=>this.setState({modal:true,mode:"add"})}><i className="fa fa-lg fa-plus m-2 c-pointer text-light"></i>New Party</button></span> */}
                           <div className="col-lg-6">
                           <button className={"btn float-right btn-sm"+(transaction_mode==="transaction"?" btn-primary":" btn-danger")} onClick={e=>this.changeMode()}>{transaction_mode==="transaction"?" Transactions":" Expense"}</button>        
                           </div>
                    </div>
                    {currentList && currentList.map((item,ind)=>
                                <div className="row m-1  border p-3" key={ind}>
                                    <div className="col-2">{ind+1+") "}{item['date']}</div>
                                    
                                    <div className="col-4">{item['transactionName']}</div>
                                    <div className="col-2">{item['party']}</div>
                                    <div className="col-1">{parseInt(item['amount']).toLocaleString('en-IN')}</div>
                                    <div className="col-1">{item['mode']}</div>
                                    <div className="col-2">
                                        <i className="fa fa-lg fa-pencil c-pointer text-success mr-2" onClick={e=>this.setState({transaction_obj:item,modal:true,mode:"edit"})}></i>
                                        <i className="fa fa-lg fa-trash c-pointer text-danger" onClick={e=>this.deleteTransaction(item)}></i>
                                        <button className={"btn btn-sm float-right"+(item['type']==="credit"?" btn-success":" btn-danger")}>{item['type']==="credit"?"Credit":"Debit"}</button>
                                        </div>
                                </div>
                    )}
                    {currentList && currentList.length<1 && <div className="text-danger  d-flex justify-content-center p-3 ">
                                    <i className="fa fa-lg fa-exclamation-circle  mr-1"></i> <span className="">No transactions to show</span>
                     </div>}
                    </CardBody>
                    </Card>   

                    <Modal className="modal-width" isOpen={modal} size="lg" >
                    <ModalHeader className=" h4 text-light bg-info">
                    <span className="col-10 h4 text-light bg-info">{mode==="add"?"New":"Edit"} Transaction</span>
                    </ModalHeader>
                    <ModalBody>
                                <div className="flex row  p-3 text-primary">
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Date:</div>
                                            <div className="col-lg-6 row"><Input  type="date" value={(transaction_obj['date']) || ""} name="date" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Transaction Name:</div>
                                            <div className="col-lg-6 row"><Input disabled value={transaction_obj['transactionName'] || ""} name="transactionName" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Party:</div>
                                            <div className="col-lg-6 row"><Input type="text" value={transaction_obj['party'] || ""} name="party" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Amount:</div>
                                            <div className="col-lg-6 row"><Input type="text" value={transaction_obj['amount'] || ""} name="amount" onChange={e=>this.handleChange(e)}></Input></div>
                                    </div>
                                    <div className="col-12 row m-1">
                                            <div className="col-lg-6 font-weight-bold ">Transaction Type/Mode:</div>
                                            <div className="col-lg-6 row">
                                                    <Input  className="col-lg-6" type="select" value={transaction_obj['type'] || ""} name="type" onChange={e=>this.handleChange(e)}>
                                                            <option value="credit">Credit</option>
                                                            <option value="debit">Debit</option>

                                                    </Input>
                                                    <Input type="select" className="col-lg-6" value={transaction_obj['mode'] || ""} name="mode" onChange={e=>this.handleChange(e)}>
                                                            <option value="RTGS">RTGS</option>
                                                            <option value="CASH">CASH</option>

                                                    </Input>
                                            </div>
                                    </div>
                        

                                </div>
                            
                          
                    </ModalBody>
                    <ModalFooter>
                        {transaction_mode==="transaction" && <button className="btn btn-warning text-dark" onClick={e=>this.changeTable()}>Change to Expense</button>}
                        <button className="btn btn-success" onClick={e=> 
                                            
                                            mode==="add"?
                                                (this.upload())
                                                :
                                                (this.editTransaction())

                                            
                                            
                                            }>Save</button>{' '}
                        <button className="btn btn-danger" onClick={e=>this.setState({transaction_obj:{},modal:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>   
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fetch_month: state.Reducer.fetch_month,
        transaction_list: state.Reducer.transaction_list,
        expense_list: state.Reducer.expense_list,
        transactionPage_state: state.Reducer.transactionPage_state,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TransactionList));