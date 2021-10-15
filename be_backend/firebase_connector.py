import os
from firebase_admin import credentials, firestore, initialize_app,storage
import pyrebase 
cred = credentials.Certificate("FB_key.json")
default_app = initialize_app(cred ,{
    'storageBucket': 'billencryptor.appspot.com'
})
db = firestore.client()
firebaseConfig = {

}

firebase=pyrebase.initialize_app(firebaseConfig)
def getConnection():
    return db

def getStorage():
    return firebase.storage()

