from flask import Flask, request, render_template, jsonify
from flask import request
from flask_socketio import SocketIO
from urllib.parse import parse_qs
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/log", methods=['POST'])
def log():
    data = request.data
    dt_str = data.decode('utf-8')
    data = parse_qs(dt_str)
    lat = data['lat'][0]
    lon = data['lon'][0]
    data_e_hora_atuais = datetime.now()
    horario = data_e_hora_atuais.strftime("%H:%M:%S %d/%m/%Y")

    socketio.emit('message', {"lat":lat, "lon": lon,"horario": horario})

    return jsonify({"status": "200"})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', debug=True)