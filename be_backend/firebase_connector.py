import os
from firebase_admin import credentials, firestore, initialize_app,storage
import pyrebase 
cred = credentials.Certificate("FB_key.json")
default_app = initialize_app(cred ,{
    'storageBucket': 'billencryptor.appspot.com'
})
db = firestore.client()
firebaseConfig = {
  "apiKey": "AIzaSyAv8KDEpHtefofUAdTxiVPGiIBHlY-a1BQ",
  "authDomain": "billencryptor.firebaseapp.com",
  "databaseURL": "https://billencryptor-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "billencryptor",
  "storageBucket": "billencryptor.appspot.com",
  "messagingSenderId": "824226648084",
  "appId": "1:824226648084:web:28be2e8a369e2757339701"
}

firebase=pyrebase.initialize_app(firebaseConfig)
def getConnection():
    return db

def getStorage():
    return firebase.storage()




#    todo_ref = db.collection('user_info')
# file_contents={
#     "id":"1",
#     "name":"Ajay",
#     "password":"543234"
# }
# id = file_contents['id']
# todo_ref.document(id).set(file_contents)

#todo = todo_ref.document("1").get()
#print(todo.to_dict())

#todo_ref.document(id).update(request.json)