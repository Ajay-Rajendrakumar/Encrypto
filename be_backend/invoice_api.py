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

invoice_api = Blueprint('invoice_api', __name__)

INVOICE_TABLE="invoice_info"

iv=b'|\xe4)@\xd7\x8c\xa7\xb5i\x9c\x03#\xfek\x99\xf6'
key=b'|\xe4)@\xd7\x8c\xa7\xb5i\x9c\x03#\xfek\x99\xf6'

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
        # storage=getStorage()  
        # db=getConnection()
        # doc_ref = db.collection(INVOICE_TABLE).document(userId)
        # doc_ref.set(res,merge=True)
        # fileName="BE/"+(userId)+"/"+str(invoice)+".png"
        # print(fileName)
        # storage.child(fileName).put(picture)
        # key=os.urandom(16)
        
        Encrypter(picture,key)
        Decrypter(key)
        

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
    enc_file = open("Temp/samp.enc", "wb")
    enc_file.write(enc_data)
    enc_file.close()

def Decrypter(key):
    file_name="Temp/samp.enc"
    enc_file2 = open(file_name,"rb")
    enc_data2 = enc_file2.read()
    enc_file2.close()
    # os.remove(file_name)
    cfb_decipher = AES.new(key, AES.MODE_CFB, iv)
    plain_data = (cfb_decipher.decrypt(enc_data2))
    imageStream = io.BytesIO(plain_data)
    imageFile = PIL.Image.open(imageStream)
    imageFile=imageFile.convert('RGB')
    imageFile.save((file_name[:-8])+"1.jpg")

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

@invoice_api.route('/getImage',methods = ['POST', 'GET'])
def getImage():
    userId=request.form['userId']
    invoice=request.form['invoice']
    error=""
    try:
        fileName="BE/"+(userId)+"/"+str(invoice)+".png"
        storage=getStorage()  
        print(fileName)
        #url=storage.child(fileName).download("Temp/",str(invoice)+".png")

        url=storage.child(fileName).get_url(str(invoice)+".png")
    except Exception as e:
        error=e
    if not error:
        output_json={"data":url,"status":200}
    else:
        output_json={"msg":str(error),"status":400}
    return jsonify(output_json)
