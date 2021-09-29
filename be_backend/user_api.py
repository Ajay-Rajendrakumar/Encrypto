from flask import Blueprint
from flask import request,jsonify

from firebase_connector  import getConnection

user_api = Blueprint('user_api', __name__)

USER_TABLE="user_info"
FRIEND_TABLE="friend_info"

@user_api.route('/userList',methods = ['POST', 'GET'])
def userList():
    param_user = request.get_json()
    error=""
    try:
        db=getConnection()
        user_info = db.collection(USER_TABLE).get()
        user_data={}
        if len(user_info)!=0:
            for document in user_info:
                if param_user['userId'] !=document.id:
                    user_data[document.id]=(document.to_dict())['name']
               
        friend_info = db.collection(FRIEND_TABLE).document(param_user['userId']).get()
        friend_data={}
                
        friend_list=friend_info.to_dict()
        if friend_list is not None:
            for friendid in (friend_list).keys():
                    friend_data[friendid]=(friend_list[friendid])['Name']
                    if friendid in user_data:
                        del user_data[friendid]
        res={}
        res['user']=user_data
        res['friend']=friend_data
    except Exception as e:
        error=e
    if not error:
        output_json={"data":res,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

@user_api.route('/addFriend',methods = ['POST', 'GET'])
def addFriend():
    param_user = request.get_json()
    error=""
    res={}
    res1={}
    try:
        db=getConnection()
        doc_ref = db.collection(FRIEND_TABLE).document(param_user["userId"])
        res[param_user['frdId']]={
        "Name":param_user['frdname']  
        }
        doc_ref.set(res,merge=True)
        doc_ref = db.collection(FRIEND_TABLE).document(param_user['frdId'])
        res1[param_user['userId']]={
        "Name":param_user['name']  
        }
        doc_ref.set(res1,merge=True)
    except Exception as e:
        error=e
    if not error:
        output_json={"data":"Friend Added Successfully","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

@user_api.route('/removeFriend',methods = ['POST', 'GET'])
def removeFriend():
    param_user = request.get_json()
    error=""
    res={}
    try:
        db=getConnection()
        doc_ref = db.collection(FRIEND_TABLE).document(param_user["userId"])
        doc_ref.doc(param_user["frdId"]).delete()
    except Exception as e:
        error=e
    if not error:
        output_json={"data":"Friend Added Successfully","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)