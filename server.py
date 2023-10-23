from flask import Flask
from flask_socketio import SocketIO
from flask_limiter import Limiter

# Criando Servidor
app = Flask(__name__)
socketio = SocketIO(app)
limiter = Limiter(
    app,
    storage_uri="memory://",
    application_limits=["1 per second"]
)