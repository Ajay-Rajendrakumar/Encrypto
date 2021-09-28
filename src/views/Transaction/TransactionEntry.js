import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/transaction.css'
import {
   Input,Card, CardHeader, CardBody, CardFooter
  } from "reactstrap";
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import { ExcelRenderer} from 'react-excel-renderer';
import moment from 'moment';


// var stringSimilarity = require("string-similarity");

class Transaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transaction_list:[],
            final_list:{ 
                credit_list:[],
                debit_list:[],
                expense_list:[],
                delete_list:[],
            },
            final_list_sum:{
                expense_list:0,
                credit_list:0,
                debit_list:0,
                delete_list:0,
            },
            
            current_transaction:{},
            entry_type_manual:false,
            suggetionList:[],
            error_text:"",
            expense_suggestion:[
                {party:"Self",id:"0"},
                {party:"Shakeel Salary",id:"1"},
                {party:"Staff Salary",id:"2"},
                {party:"Weight Bridge",id:"3"},
                {party:"Petrol",id:"4"},
                {party:"Diesel",id:"5"},
                {party:"Tea Expense",id:"6"},
                {party:"Office Expense",id:"7"},
                {party:"Machinery Expense",id:"8"},
                {party:"Office Expense",id:"9"},
                {party:"EB",id:"10"},
                {party:"Commission",id:"11"},
                {party:"Bank Charge",id:"12"},
                {party:"Freight",id:"13"},
                {party:"Bale Pattu",id:"14"},
                {party:"Rent",id:"15"},
                {party:"PRS Cottons",id:"16"},
                ]
        }
    }
    
    componentDidMount(){
        document.getElementById("TransactionDiv").addEventListener("keydown", (e) =>this.checkKey(e))
      
        if(_.isEmpty(this.props.transactionPage_state)){
        let buttons=["Credit","Debit","Expense","Delete"]
        let color=["success","secondary","info","danger"]
        let transaction_option=[]
        buttons.forEach((element,ind)=>{
            let obj={
                "title":element,
                "color":color[ind]
            }
            transaction_option.push(obj)
        })

        this.setState({transaction_option:transaction_option})
        this.getData()
        this.changeMode()

        }else{

            this.setState(this.props.transactionPage_state)

        }
    }

    getData=()=>{
        if(this.props.sales_party.length>0){
            this.createSuggestionList(this.props.sales_party)
            this.setState({sales_party_list:this.props.sales_party})
        }else{
            this.getPartyList("salesParty")
        }
        if(this.props.purchase_party.length>0){
            this.createSuggestionList(this.props.purchase_party)      
            this.setState({purchase_party_list:this.props.purchase_party})
        }else{
            this.getPartyList("purchaseParty")
        }
        this.createSuggestionList(this.state.expense_suggestion)
    }

    componentWillUnmount(){
        document.getElementById("TransactionDiv").removeEventListener("keydown", (e) =>this.checkKey(e))
        this.props.dataStoreSetter({...this.state},"TRANSACTION_PAGE_STATE")


    }
    checkKey=(e)=> {
        let {current_transaction}={...this.state}
        e = e || window.event; 
        if (e.key === 'ArrowUp' && 'date' in current_transaction) {
            current_transaction['date']=moment(current_transaction['date']).subtract(1, 'month').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowDown'&& 'date' in current_transaction) {
            current_transaction['date']=moment(current_transaction['date']).add(1, 'month').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowRight'&& 'date' in current_transaction) {
            current_transaction['date']=moment(current_transaction['date']).add(1, 'days').format('YYYY-MM-DD'); 
        }
        else if (e.key === 'ArrowLeft'&& 'date' in current_transaction) {
            current_transaction['date']=moment(current_transaction['date']).subtract(1, 'days').format('YYYY-MM-DD'); 
        }else if (e.key === 'Enter') {
            document.getElementById("party").focus();
        }
        this.setState({current_transaction})
    }
    getPartyList=(type)=>{
        let api="salesPartyList"
        if(type==="purchaseParty"){
            api="purchasePartyList"
        }
        this.props.distributer({},api).then(response => {
            if(response['status']===200){
              if(type==="purchaseParty")
                    {
                        this.setState({purchase_party_list:response['data'] })
                        this.props.dataStoreSetter(response['data'],"PURCHASE_PARTY")
                    }else{
                        this.setState({sales_party_list:response['data'] })
                        this.props.dataStoreSetter(response['data'],"SALES_PARTY")
                    }
                this.createSuggestionList(response['data'] )
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }

    createSuggestionList=(list)=>{
        let {suggetionList}={...this.state}
        list && list.forEach((val)=>{
            let obj={
                name:val['party'],
                id:val['id'],
            }
            let exist=_.find(suggetionList, function(o) { return o['name'] === obj['name']; });
            _.isEmpty(exist) && suggetionList.push(obj)
        })
        this.setState({suggetionList})
    }


   

    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    handleTabChange=(tab)=>{
        let {currentTab}={...this.state}
        currentTab=tab
        this.setState({currentTab})

    }
    
    handleFilterChange=(val)=>{
        let {currentList,materialList,filterName}={...this.state}
        filterName=val || ""
        currentList=_.filter(materialList, function(o) { return ((o['name'].toLowerCase()).includes(filterName.toLowerCase()) || (o['symbol'].toLowerCase()).includes(filterName.toLowerCase()) || o['rate'].includes(filterName))  });
        this.setState({currentList,filterName})
    }





    fileHandler = (event) => {
        let fileObj = event.target.files[0];
        ExcelRenderer(fileObj, (err, resp) => {
          if(err){
            this.toasterHandler("danger",err)           
          }
          else{
            let array=[]
            let row=resp.rows
            let name_array=["date","transactionName","account","trans_date","debit_amount","credit_amount","total_balance"]
            row.forEach(column => {
                let obj={}
                if(this.isDate(column[0])){
                    name_array.forEach((val,ind)=>{
                        
                        obj[name_array[ind]]=column[ind]? column[ind] : '-'
                        if(ind===0){
                            obj[name_array[ind]]=column[ind]? this.getDate(column[ind]) : '-'         
                        }
                    })
                    console.log(obj)
                    if(!_.isEmpty(obj)){
                        obj["party"]=""
                        obj["partyId"]="-1"
                        obj["mode"]="RTGS"
                        array.push(obj)    
                    }                
                }
            });
            
                this.setState({transaction_list:array},()=>{
                    this.manualInitiator()
                })
          }
        });               
    
      } 
    isDate = (date)=> {
        date=this.getDate(String(date))
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
    }
    getDate=(date)=>{
        if(date){
            let new_Date=""
            let arr=String(date).split('/')
            if(arr.length>2){
                new_Date="20"+arr[2]+"-"+arr[1]+"-"+arr[0]
            }
            return new_Date
        }
    }
    manualInitiator=()=>{
        let {current_transaction,transaction_list}={...this.state}
        current_transaction=transaction_list[0]
        transaction_list.splice(0,1)
        this.setState({current_transaction,transaction_list})

    }
    manualEntryHandler=(title)=>{
        let {final_list,current_transaction,entry_type_manual}={...this.state}
        let valid=this.validateEntry(current_transaction)
        if(valid['result'] || title==="Delete"){
            switch(title) {
                case "Credit":
                    final_list["credit_list"].push(current_transaction)
                    this.calculateSum("credit_list")
                    break;
                case "Debit":
                    final_list["debit_list"].push(current_transaction)
                    this.calculateSum("debit_list")
                    break;
                case "Expense":
                    final_list["expense_list"].push(current_transaction)
                    this.calculateSum("expense_list")
                    break
                case "Delete":
                    final_list["delete_list"].push(current_transaction)
                    this.calculateSum("delete_list")
                    break
                default:
                    break
            }
            let obj={
                "date":current_transaction['date'],
                "mode":"CASH",
                "type":"debit"
                }
            if(entry_type_manual){
                this.setState({current_transaction:obj})
            }else{
                this.manualInitiator()
            }
            this.setState({final_list})
        }else{
            this.setState({error_text:valid['error']})
        }
    }
    validateEntry=(party)=>{
        let error_text=""
        if(!("transactionName" in party) && (!("type" in  party) ||  party['type']==="")){
            error_text="Invalid Type"
            return {"result":false,"error":error_text}
        }
        if(!("mode" in  party) ||  party['party']===""){
            error_text="Invalid  Name"
            return {"result":false,"error":error_text}
        }
        if(!("credit_amount" in  party || "debit_amount" in  party) && (!("amount" in  party) ||  party['amount']==="" || parseInt(party['amount'])<0)){
            error_text="Invalid Amount"
            return {"result":false,"error":error_text}
        }
        if(!("party" in  party) ||  party['party']==="" ){
            error_text="Invalid Party"
            return {"result":false,"error":error_text}
        }
        this.setState({error_text:""})
        return {"result":true}
    }
    calculateSum=(opt)=>{
        let {final_list_sum,final_list,entry_type_manual}={...this.state}
        if(!entry_type_manual){
            final_list_sum[opt]=_.sumBy(final_list[opt], function(o) { return o['credit_amount']==='-'?Number(o['debit_amount']):Number(o['credit_amount']) });
        }else{
            final_list_sum[opt]=_.sumBy(final_list[opt], function(o) { return Number(o['amount']) || 0; });

        }
      

        this.setState({final_list_sum})
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    getParty=(party)=>{
        return party.toLowerCase().replace(/ /g, "_");
  
    }
    handleListChange=(list,item,ind)=>{
        let {final_list,current_transaction,transaction_list,entry_type_manual}={...this.state}
        if(entry_type_manual){
           if( (current_transaction['party']!=="") && list!=="delete_list"){
               final_list["delete_list"].push(current_transaction)
           }
        }else{
            transaction_list.splice(0, 0, current_transaction)
        }
        current_transaction=item
        final_list[list].splice(ind,1)
        this.calculateSum(list)
        this.setState({final_list,current_transaction,transaction_list})
    }
    editAdditionalInfo=(e)=>{
        let {current_transaction}={...this.state}
        current_transaction[e.target.name]=e.target.value
        current_transaction["party"]=current_transaction['party'] || "Unidentified Party"
        current_transaction['partyId']=current_transaction['partyId'] || -1
        current_transaction['type']= current_transaction['type'] || (current_transaction['debit_amount']!=='-'?"debit":"credit")
        if(e.target.name==="party"){
            this.suggestion(e.target.value)
        }
        this.setState({current_transaction})
    }

    suggestion=(name)=>{
        let {current_suggestion,suggetionList}={...this.state}
        current_suggestion=_.filter(suggetionList, function(o) { return (o['name'].toLowerCase()).includes(name.toLowerCase()) });
        this.setState({current_suggestion})
    }
    setName=(name)=>{
        let {current_transaction}={...this.state}
        current_transaction["party"]=name['name']
        current_transaction['partyId']=name['id']
        this.setState({current_transaction,current_suggestion:[]})
    }

    uploadData=()=>{
        let {final_list,entry_type_manual,final_list_sum}={...this.state}

        let list={
            credit:final_list['credit_list'],
            debit:final_list['debit_list']
            }
            if(entry_type_manual){
                Object.keys(final_list).forEach((key,ind)=>{
                final_list[key].forEach((item,ind)=>{
                        let type=item['type']
                        item[type+"_amount"]=item['amount']
                        item['partyId']=item['partyId'] || -1
                        item['transactionName']=item['party'] || -1
                })
                })
            }
            console.log(final_list)

        if(final_list['credit_list'].length>0 || final_list['debit_list'].length>0){
            this.props.distributer(list,"uploadTransaction").then(response => {
                if(response['status']===200){
                    console.log("done")
                    final_list['credit_list']=[]
                    final_list['debit_list']=[]
                    final_list_sum={
                        credit_list:0,
                        debit_list:0,
                    }
                    this.setState({final_list,final_list_sum})
                }else{ 
                    this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
                    this.toasterHandler("error", "Cant reach the server")
            })
        }
        if(final_list['expense_list'].length>0){
            this.props.distributer(final_list['expense_list'],"uploadExpense").then(response => {
                if(response['status']===200){
                    final_list['expense_list']=[]
                    final_list_sum={
                        expense_list:0,
                        delete_list:0,
                    }
                    this.setState({final_list,final_list_sum})

                }else{ 
                this.toasterHandler("error", "Cant reach the server")
                }
            }).catch((err)=>{
                this.toasterHandler("error", "Cant reach the server")
            })
        }
    }
    changeMode=()=>{
        let {entry_type_manual,current_transaction}={...this.state}
        if(!entry_type_manual){
            current_transaction={"mode":"CASH","type":"debit","date":moment().format('YYYY-MM-DD') }
        }else{
            current_transaction={"mode":"RTGS"}
        }
        this.setState({entry_type_manual:!entry_type_manual,current_transaction})
    }

    deleteList=()=>{
        let {final_list,final_list_sum}={...this.state}
        final_list={
            expense_list:[],
            credit_list:[],
            debit_list:[],
            delete_list:[],
        }
        final_list_sum={
            expense_list:0,
            credit_list:0,
            debit_list:0,
            delete_list:0,
        }
        this.setState({final_list,final_list_sum})
    }
    render() {
        let {transaction_list,current_transaction,transaction_option,final_list,final_list_sum,entry_type_manual,current_suggestion,error_text}={...this.state}
        return (
            <div id="TransactionDiv">
                <input type="file" onChange={this.fileHandler.bind(this)} hidden  id="excelInput"/>
                <div className="flex col-lg-12 row">
                <hr></hr>     
                <div className="row flex col-lg-11">
                    {entry_type_manual ?
                    
                        <Card className="col-lg-12 p-1">
                            <CardHeader className="bg-primary text-light  h5 ">Transaction Manual Entry<button className="btn btn-sm  border  bg-primary text-light font-weight-bold  ml-2" onClick={e=>this.getData()}><i className="fas fa-refresh"></i> </button> </CardHeader>
                            <CardBody className="row d-flex justify-content-center">
                                <div className="col-lg-2 m-2">
                                <Input id="date" type={"date"} name={"date"} className={"col-lg-12"} placeholder={"Date"} value={((!_.isEmpty(current_transaction) && current_transaction["date"]) || "")} onChange={e=>this.editAdditionalInfo(e)}></Input>
                                <span className="col-12 mt-2 text-secondary ">{!_.isEmpty(current_transaction) && moment(current_transaction["date"]).format('dddd')  }</span>
                                </div>
                                <div className="flex  col-lg-4">
                                    <Input type={"text"} autoComplete="off" name={"party"} id="party" className={"col-lg-12 m-2"} placeholder={"Party"} value={((!_.isEmpty(current_transaction) && current_transaction["party"]) || "")} onChange={e=>this.editAdditionalInfo(e)}></Input>
                                    <div className="scrollmenu">
                                        {current_suggestion && current_suggestion.map((name,ind)=>
                                            <div onClick={e=>this.setName(name)}>{name['name']}</div>
                                        )}
                                    </div>
                                </div>
                                <Input type={"number"} name={"amount"} className={"col-lg-3 m-2"} placeholder={"Amount"} value={((!_.isEmpty(current_transaction) && current_transaction["amount"]) || "")} onChange={e=>this.editAdditionalInfo(e)}></Input>
                                <Input type={"select"} name={"mode"} className={"col-lg-1 m-2"} placeholder={"Mode"} value={((!_.isEmpty(current_transaction) && current_transaction["mode"]) || "")} onChange={e=>this.editAdditionalInfo(e)}>
                                   
                                    <option value="RTGS">RTGS</option>
                                    <option value="CASH">CASH</option>
                                </Input>
                                <Input type={"select"} name={"type"} className={"col-lg-1 m-2"} placeholder={"Type"} value={((!_.isEmpty(current_transaction) && current_transaction["type"]) || "")} onChange={e=>this.editAdditionalInfo(e)}>
                                    <option value="debit">Debit</option>
                                    <option value="credit">Credit</option>
                                </Input>
                                {!_.isEmpty(current_transaction) && <div className="col-lg-5 text-center">
                                    {transaction_option && transaction_option.map((btn,index)=>
                                        <button className={"btn col-lg-2 m-1  btn-"+(btn['color'])} key={index} onClick={e=>this.manualEntryHandler(btn['title'])}>{btn['title']}</button>
                                     )}  
                                </div> 
                                }
                            </CardBody>
                            <CardFooter>
                                <div className="col-lg-12 d-flex justify-content-center">
                                {error_text!=="" && <span className="text-danger h6 m-2"><i className="fa fa-exclamation-circle text-danger fa-lg p-1"></i>{error_text}</span>}
                                </div>
                            </CardFooter>
                        </Card>
                    :
                    current_transaction && 
                        <Card  className="col-lg-12 p-1">
                            <CardHeader className="bg-primary text-light h5 m-1 ">
                                {"Bank Transactions"}
                                <span className="float-right">{transaction_list && transaction_list.length>0 && transaction_list.length+" remains"}</span>
                                </CardHeader>
                            <CardBody  className="flex m-1 col-lg-12 row">
                                    <div className="col-lg-2 m-2">
                                    <div className="col-lg-12 p-1">{current_transaction['date']}</div>
                                    <span className="col-12 mt-2 text-secondary ">{(!_.isEmpty(current_transaction) && moment(current_transaction["date"]).format('dddd'))  }</span>
                                    </div>
                                    <div className="col-lg-6 p-1 font-weight-bold text-center">
                                             
                                        {current_transaction['transactionName'] &&
                                        <><button disabled className={"btn btn-sm text-light mr-2 "+(current_transaction['debit_amount']==='-'?" bg-success":" bg-danger")}>{current_transaction['debit_amount']==='-'?" Credit":" Debit"}</button> 
                                         {current_transaction['transactionName']}
                                         <div className="flex  col-lg-12">
                                            <Input type={"text"} autoComplete="off" name={"party"} className={"col-lg-12 m-2"} placeholder={"Party"} value={((!_.isEmpty(current_transaction) && current_transaction["party"]) || "")} onChange={e=>this.editAdditionalInfo(e)}></Input>
                                            <div className="scrollmenu">
                                                {current_suggestion && current_suggestion.map((name,ind)=>
                                                    <div onClick={e=>this.setName(name)}>{name['name']}</div>
                                                )}
                                            </div>
                                        </div>
                                        </>} 
                                        
                                    </div>
                                <div className="col-lg-1 p-1 text-center">{current_transaction['debit_amount']!=='-'?parseInt(current_transaction['debit_amount']).toLocaleString('en-IN'):parseInt(current_transaction['credit_amount']).toLocaleString('en-IN')}</div>      
                               { !_.isEmpty(current_transaction) && <div className="col-lg-12 text-center">{transaction_option && transaction_option.map((btn,index)=>
                                        <button className={"btn col-lg-1 m-1  btn-"+(btn['color'])} key={index} onClick={e=>this.manualEntryHandler(btn['title'])}>{btn['title']}</button>
                                )}                      
                                </div>}
                            </CardBody>
                        </Card>
                    }
                </div>
                <div className="float-right m-2 col-lg-1">
                    <button className="col-lg-12 m-1 btn btn-sm btn-primary" onClick={e=>this.changeMode()}>{!entry_type_manual?"Manual":"Excel Sheet"}</button>
                    {!entry_type_manual && <button className="col-lg-12 m-1 btn btn btn-info" onClick={e=>document.getElementById("excelInput").click()}><i className="fas fa-upload mr-1"></i>Excel</button>}
                    {<button className="col-lg-12 m-1 btn  btn-danger" onClick={e=>this.deleteList()}><i className="fa fa-trash mr-1"></i>Clear</button>}
                    <button className="col-lg-12 m-1 btn  btn-success" onClick={e=>this.uploadData()}><i className="fa fa-cloud-upload mr-1"></i>Upload</button>
        
                </div>
                <div className="flex row col-lg-12 mt-3 p-2">
                        {Object.keys(final_list).map((list,index)=>
                            <div className="col-lg-6 p-2 " key={index}>
                                <Card>
                                    <CardHeader className="bg-transaction-card text-center text-light font-weight-bold h6">{this.getName(list)}<span className="font-weight-bold">{" ["+parseInt(final_list_sum[list]).toLocaleString('en-IN')+"]"}</span></CardHeader>
                                    <CardBody className="list-container">
                                        {final_list[list] && final_list[list].map((item,ind)=>
                                                <Card key={ind} className="list-item mt-1 c-pointer" onClick={e=>this.handleListChange(list,item,ind)}>
                                                    <CardBody className="row col-lg-12 ">
                                                       
                                                            <div className="col-lg-3">{item['date']}</div>
                                                            <div className="col-lg-6">{item['transactionName'] || item['party']}</div>
                                                            <div className="col-lg-3">{!entry_type_manual?(item['debit_amount']!=='-'?parseInt(item['debit_amount']).toLocaleString('en-IN'):parseInt(item['credit_amount'])).toLocaleString('en-IN') : parseInt(item['amount']).toLocaleString('en-IN')}</div>
                                                     
                                                    </CardBody>
                                                </Card>
                                        )}
                                    </CardBody>
                            </Card>
                            </div>
                        )}

                </div>
            </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        sales_party: state.Reducer.sales_party,
        purchase_party: state.Reducer.purchase_party,
        fetch_month: state.Reducer.fetch_month,
        transactionPage_state: state.Reducer.transactionPage_state,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Transaction ));