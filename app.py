from flask import Flask, request, render_template, jsonify
from flask import request
from flask_socketio import SocketIO
from urllib.parse import parse_qs
from datetime import datetime
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['localizador']
collection = db['dispositivos']

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
    dia = data_e_hora_atuais.strftime("%d/%m/%Y")

    serial = data['ser'][0]
    if not collection.find_one({'serial': serial}):
        document = {
            'serial': str(data['ser'][0]),
            f'rota_{dia}': {
                str(0):{
                    'lat': float(lat),
                    'lon': float(lon) 
                }
            }
        }

        collection.insert_one(document)

    elif collection.find_one({'serial': serial}) and not f'rota_{dia}' in  collection.find_one({'serial': serial}):

        collection.update_one({'serial': serial}, {"$set": {f"rota_{dia}.{str(0)}": {
            'lat': float(lat),
            'lon': float(lon)
        }}})

    else:
        doc = collection.find_one({'serial': serial})
        quantidade = len(doc[f'rota_{dia}'])
        collection.update_one({'serial': serial}, {"$set": {f"rota_{dia}.{str(quantidade)}": {
            'lat': float(lat),
            'lon': float(lon)
        }}})

    socketio.emit('message', {"lat":lat, "lon": lon,"horario": horario})
    socketio.emit('data', data)

    return jsonify({"status": "200"})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', debug=True)