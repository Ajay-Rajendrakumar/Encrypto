from flask import Flask
from flask_cors import CORS, cross_origin

from login_api import login_api
from invoice_api import invoice_api

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

app.register_blueprint(login_api)
app.register_blueprint(invoice_api)
