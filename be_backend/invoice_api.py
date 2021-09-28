from flask import Blueprint
from flask import request,jsonify
import os
import tempfile
from firebase_connector  import *


invoice_api = Blueprint('invoice_api', __name__)

INVOICE_TABLE="invoice_info"

@invoice_api.route('/uploadInvoice',methods = ['POST', 'GET'])
def uploadInvoice():
    company=request.form['company']
    invoice=request.form['invoice']
    date=request.form['date']
    estimate=request.form['estimate']
    userId=request.form['userId']
    res={}
    res[invoice]={
        "Company":company,
        "Invoice Number":invoice,
        "Bill Date":date,
        "Estimated Delivery":estimate,
        "userId":userId,
    }
    picture = request.files["image"]
    error=""
    try:
        storage=getStorage()  
        db=getConnection()
        doc_ref = db.collection(INVOICE_TABLE).document(userId)
        doc_ref.set(res,merge=True)
        fileName="BE/"+(userId)+"/"+str(invoice)+".png"
        print(fileName)
        storage.child(fileName).put(picture)
      
    except Exception as e:
        error=e
    if not error:
        output_json={"msg":"Invoice Added Successfully","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)



@invoice_api.route('/invoiceList',methods = ['POST', 'GET'])
def invoiceList():
    userId=request.form['userId']
    error=""
    try:
        db=getConnection()
        doc_ref = db.collection(INVOICE_TABLE).document(userId).get()
        result=[]
        invoices=doc_ref.to_dict()
        for invoice in (invoices).keys():
            result.append(invoices[invoice])
    except Exception as e:
        error=e
    if not error:
        output_json={"data":result,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)
