from Crypto.Cipher import AES
import io
import PIL.Image
from tkinter import *
import os


iv=os.urandom(16)
key=os.urandom(16)

print(iv)
# def Encrypter(file):
#     file_name="samp.jpg"
#     input_file = open(file_name,"rb")
#     input_data = input_file.read()
#     input_file.close()

#     cfb_cipher = AES.new(key, AES.MODE_CFB, iv)
#     enc_data = cfb_cipher.encrypt(input_data)
    
#     enc_file = open(file_name+".enc", "wb")
#     enc_file.write(enc_data)
#     enc_file.close()

# def Decrypter():
#     file_name="samp.jpg.enc"
#     enc_file2 = open(file_name,"rb")
#     enc_data2 = enc_file2.read()
#     enc_file2.close()

#     cfb_decipher = AES.new(key, AES.MODE_CFB, iv)
#     plain_data = (cfb_decipher.decrypt(enc_data2))

#     imageStream = io.BytesIO(plain_data)
#     imageFile = PIL.Image.open(imageStream)
#     imageFile.save((file_name[:-8])+"1.jpg")

# Encrypter()
# Decrypter()
        