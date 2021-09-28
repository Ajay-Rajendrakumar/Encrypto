from flask import Blueprint
from flask import request,jsonify

from firebase_connector  import getConnection

login_api = Blueprint('login_api', __name__)

USER_TABLE="user_info"

@login_api.route('/userLogin',methods = ['POST', 'GET'])
def userLogin():
    param_user = request.get_json()
    error=""
    try:
        db=getConnection()
        user_info = db.collection(USER_TABLE).where('name', '==', param_user['username']).where('password', '==', param_user['password']).get()
        data={}
        if len(user_info)!=0:
            for document in user_info:
                data['userId']=document.id
                data['user']=document.to_dict()
                break
        else:
            error="Invalid Credentials"
    except Exception as e:
        error=e
    if not error:
        output_json={"data":data,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

@login_api.route('/userSignin',methods = ['POST', 'GET'])
def userSignin():
    param_user = request.get_json()
    error=""
    user={}
    user['name']=param_user['username']
    user['password']=param_user['password']
    try:
        db=getConnection()
        user_info = db.collection(USER_TABLE).where('name', '==', param_user['username']).get()
        if len(user_info)==0:
            user_table = db.collection(USER_TABLE).document()
            user_table.set(user)
        else:
            error="User Already Exists"
    except Exception as e:
        error=e

    if not error:
        output_json={"msg":"Balance Updated Successfully","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)