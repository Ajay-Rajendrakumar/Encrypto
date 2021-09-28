import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';

class PDFComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }


    pdfWriter=(title,list,final)=>{

        console.log(title,list,final)
        var doc = new jsPDF('p', 'pt');
        //Title
        doc.setFont("helvetica", "bold");
        doc.setTextColor("red");
        doc.setFontSize(20);
        doc.text("GURU COTTONS", 300, 25, null, null, "center");
        
        let title_head=[]
        let title_list=[]
        Object.keys(title).forEach((key,ind)=>{      
            title_head.push(key)
            title_list.push(title[key]) 
        })
        doc.autoTable({
            head: [title_head],
            body: [title_list],
            theme: 'grid',
            styles: {font: 'helvetica',fontStyle:'bold'}

          })


        let headers=list['head']
        let body_list=list['list']
        doc.autoTable({
            head: [headers],
            body: body_list,
          })

        let final_list=[]
        Object.keys(final).forEach((key,ind)=>{      
            final_list.push([key,final[key]]) 
        })

        doc.autoTable({
            body: final_list,
            theme: 'grid',
            styles: {font: 'helvetica',fontStyle:'bold'}
          })

        doc.save(title['Name']+"_"+title['Month']+".pdf");
    }
    
    createPDFcontent=()=>{
        if(window.confirm("Download the Balance sheet?")){
            let {data,date,aggregate,effective_balance,type}={...this.props}
            let title={
                "Name":effective_balance['party'],
                "Month":date['month'],
                "Date":date['start_date']+" to "+date['end_date']
            }
            let final={}
            aggregate && Object.keys(aggregate).forEach((key,val) => {
                if(key!=="effective"){
                            final[this.getName(key)]=parseInt(aggregate[key]).toLocaleString('en-IN')
                        }
                    else{
                        final['Opening Balance']=parseInt(effective_balance['balance']).toLocaleString('en-IN')
                        final['Effective Balance']=(parseInt(aggregate['effective'])).toLocaleString('en-IN')
                        final['Closing Balance']=(parseInt(effective_balance['balance'])+parseInt(aggregate['effective'])).toLocaleString('en-IN')
                    }
            });
            let content=[]
            if(type==="sales"){
                let list=[]
                content['head']=["Date","Bill/Payment","Bale","Weight","Rate","Amount","Tax","Total",'Payment'] 
                data.forEach((item,ind)=>{
                    let temp_list=[]
                    if(item['entry_type']==="sales"){
                            let bill=item['billno']+(item['return']==='1'?" (RETURN)":"")
                            temp_list=[item['date'],bill,item['bale'],parseInt(item['weight']).toLocaleString('en-IN'),item['rate'],parseInt(item['amount']).toLocaleString('en-IN'),parseInt(item['tax']).toLocaleString('en-IN')]
                            if(item['return']==='1'){
                                temp_list.push('')
                                temp_list.push(parseInt(item['total']).toLocaleString('en-IN'))
                            }else{
                                temp_list.push(parseInt(item['total']).toLocaleString('en-IN'))
                                temp_list.push('')
                            }
                    }
                    else{
                            temp_list=[item['date'],item['mode'],'','','','','','',parseInt(item['amount']).toLocaleString('en-IN')]
                    }
                    list.push(temp_list)
                })
                content['list']=list
            }else{
                let list=[]
                content['head']=["Date","Bill/Payment","Weight","Amount","Payment"] 
                data.forEach((item,ind)=>{
                    let temp_list=[]
                    if(item['entry_type']==="purchase"){
                            let bill="BILL"+(item['sales']===1?" (SALES)":"")
                            temp_list=[item['date'],bill,parseInt(item['weight']).toLocaleString('en-IN')]
                            if(item['sales']===1){
                                temp_list.push('')
                                temp_list.push(parseInt(item['rate']).toLocaleString('en-IN'))
                            }else{
                                temp_list.push(parseInt(item['rate']).toLocaleString('en-IN'))
                                temp_list.push('')
                            }
                    }
                    else{
                            temp_list=[item['date'],item['mode'],'','',parseInt(item['amount']).toLocaleString('en-IN')]
                    }
                    list.push(temp_list)
                })
                content['list']=list
            }
        this.pdfWriter(title,content,final)
        }    
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    render() {
        return (
            <div className="float-right mr-4">
                    <button className=" btn btn-success" onClick={e=>this.createPDFcontent()}><i className="fa fa-download mr-1"></i>Balance Sheet</button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {
 
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PDFComponent));