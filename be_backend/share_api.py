from flask import Blueprint
from flask import request,jsonify
import random
import string
 
from firebase_connector  import getConnection

share_api = Blueprint('share_api', __name__)

SHARE_TABLE="share_info"

@share_api.route('/shareInvoice',methods = ['POST', 'GET'])
def shareInvoice():
    param_user = request.get_json()
    error=""
    res={}
    invoice=param_user['invoice']
    try:
        db=getConnection()
        random_val = ''.join([random.choice(string.ascii_letters+ string.digits) for n in range(8)])
        doc_ref = db.collection(SHARE_TABLE).document(param_user["userId"])
        res[random_val]={
        "Name":param_user['frdname'],
        "shareId":param_user['frdId'],
        "InvoiceNumber":invoice['InvoiceNumber'],
        "InvoiceUser":param_user['userId'],
        }
        doc_ref.set(res,merge=True)
        doc_ref = db.collection(SHARE_TABLE).document(param_user['frdId'])
        res[random_val]={
        "Name":param_user['frdname'],
        "shareId":param_user['frdId'],
        "InvoiceNumber":param_user['invoice'],
        "InvoiceUser":param_user['userId'],
        }
        doc_ref.set(res,merge=True)
    except Exception as e:
        error=e
    if not error:
        output_json={"data":"Share Successfull","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

@share_api.route('/shareList',methods = ['POST', 'GET'])
def shareList():
    param_user = request.get_json()
    error=""
    res={}
    try:
        db=getConnection()
        share_info = db.collection(SHARE_TABLE).document(param_user['userId']).get()
        share_data=[]       
        share_list=share_info.to_dict()
        if share_list is not None:
            for i in share_list.keys():
                share_data.append(share_list[i])

    except Exception as e:
        error=e
    if not error:
        output_json={"data":share_data,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)