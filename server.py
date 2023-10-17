from flask import Flask
from flask_socketio import SocketIO

# Criando Servidor
app = Flask(__name__)
socketio = SocketIO(app)