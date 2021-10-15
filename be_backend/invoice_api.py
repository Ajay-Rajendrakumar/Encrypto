import base64
from flask import Blueprint
from flask import request,jsonify
import os
import tempfile
from firebase_connector  import *
from Crypto.Cipher import AES
import io
from PIL import Image
import urllib
from tkinter import *
import os
import PIL
from base64 import b64decode, b64encode
from flask import send_from_directory
from Crypto.Cipher import AES

invoice_api = Blueprint('invoice_api', __name__)

INVOICE_TABLE="invoice_info"

iv=b'|\xe4)@\xd7\x8c\xa7\xb5i\x9c\x03#\xfek\x99\xf6'

@invoice_api.route('/uploadInvoice',methods = ['POST', 'GET'])
def uploadInvoice():
    company=request.form['company']
    invoice=request.form['invoice']
    date=request.form['date']
    estimate=request.form['estimate']
    userId=request.form['userId']
    pin=request.form['key']
    key=os.urandom(16)
    res={}
 
    res[invoice]={
        "Company":company,
        "InvoiceNumber":invoice,
        "BillDate":date,
        "EstimatedDelivery":estimate,
        "userId":userId,
        "pin":(int(invoice)*int(pin)),
        "encryptKey":b64encode(key).decode('utf-8')
    }
    picture = request.files["image"]
    error=""
    try:
        storage=getStorage()  
        db=getConnection()
        doc_ref = db.collection(INVOICE_TABLE).document(userId)
        doc_ref.set(res,merge=True)

        file_data=Encrypter(picture,key)
        fileName="BE/"+(userId)+"/"+str(invoice)+".enc"

        storage.child(fileName).put(file_data)

        

    except Exception as e:
        error=e
    if not error:
        output_json={"msg":"Invoice Added Successfully","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

def Encrypter(input_file,key):
    input_data = input_file.read()
    cfb_cipher = AES.new(key, AES.MODE_CFB, iv)
    enc_data = cfb_cipher.encrypt(input_data)    
    # enc_file = open("Temp/samp.enc", "wb")
    # enc_file.write(enc_data)
    # enc_file.close()
    return enc_data


@invoice_api.route('/invoiceList',methods = ['POST', 'GET'])
def invoiceList():
    userId=request.form['userId']
    error=""
    try:
        db=getConnection()
        doc_ref = db.collection(INVOICE_TABLE).document(userId).get()
        result=[]
        invoices=doc_ref.to_dict()
        if invoices is not None:
            for invoice in (invoices).keys():
                result.append(invoices[invoice])

    except Exception as e:
        error=e
    if not error:
        output_json={"data":result,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)

@invoice_api.route('/getImage',methods = ['POST', 'GET'])
def getImage():
    userId=request.form['userId']
    invoice=request.form['invoice']
    pin=request.form['userPIN']
    given_key=request.form['encryptKey']
    error=""
    file=""
    try:
        db=getConnection()
        doc_ref = db.collection(INVOICE_TABLE).document(userId).get()
        invoices=doc_ref.to_dict()
        if invoices is not None:
            if invoice in invoices:
                given_PIN=int(invoice)*int(pin)
                if given_PIN != invoices[invoice]['pin']:
                    error="Cannot Access the Invoice, Invalid PIN"
                else:
                    fileName="BE/"+(userId)+"/"+str(invoice)+".enc"
                    storage=getStorage()  
                    print(fileName,"Temp/"+str(userId)+".enc")
                    storage.child(fileName).download("","Temp/"+str(userId)+".enc")  
                    key=b64decode(given_key)
                    file=Decrypter(str(userId)+".enc",key,userId)   
                    # url=storage.child(fileName).get_url(str(invoice)+".png")
    except Exception as e:
        error=e
    if not error:
        output_json={"data":file,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)


@invoice_api.route('/deleteInvoice',methods = ['POST', 'GET'])
def deleteInvoice():
    userId=request.form['userId']
    invoice=request.form['invoice']
    error=""
    try:
        db=getConnection()
        db.collection(INVOICE_TABLE).where('InvoiceNumber', '==', invoice).delete()
    except Exception as e:
        error=e
    if not error:
        output_json={"data":"Delete Successful","status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)


def Decrypter(filename,key,userId):
    file_name="Temp/"+filename
    enc_file2 = open(file_name,"rb")
    enc_data2 = enc_file2.read()
    enc_file2.close()
    # os.remove(file_name)
    cfb_decipher = AES.new(key, AES.MODE_CFB, iv)
    plain_data = (cfb_decipher.decrypt(enc_data2))
    imageStream = io.BytesIO(plain_data)
    imageFile = PIL.Image.open(imageStream)
    imageFile=imageFile.convert('RGB')
    saved_file=userId+".jpg"
    imageFile.save("Temp/"+saved_file)
    return saved_file

@invoice_api.route('/Image/<path:filename>',methods = ['POST', 'GET'])  
def send_Img_file(filename):  
      return send_from_directory("Temp/", filename)