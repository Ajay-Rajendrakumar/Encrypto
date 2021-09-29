from flask import Flask
from flask_cors import CORS, cross_origin

from login_api import login_api
from invoice_api import invoice_api
from user_api import user_api
from share_api import share_api

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

app.register_blueprint(login_api)
app.register_blueprint(invoice_api)
app.register_blueprint(user_api)
app.register_blueprint(share_api)
