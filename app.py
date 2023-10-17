from flask import Flask, request, render_template, jsonify
from flask import request
from flask_socketio import SocketIO
from urllib.parse import parse_qs
from datetime import datetime
from pymongo import MongoClient

# Conectando com o DB
client = MongoClient('localhost', 27017)
db = client['localizador']
collection = db['dispositivos']

# Criando Servidor
app = Flask(__name__)
socketio = SocketIO(app)

# Rota padrão
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Rota para registro e envio de localização para o socket
@app.route("/log", methods=['POST'])
def log():
    data = request.data
    dt_str = data.decode('utf-8')
    data = parse_qs(dt_str)
    lat = round(float(data['lat'][0]), 6)
    lon = round(float(data['lon'][0]), 6)
    data_e_hora_atuais = datetime.now()
    horario = data_e_hora_atuais.strftime("%H:%M:%S %d/%m/%Y")
    dia = data_e_hora_atuais.strftime("%d/%m/%Y")

    serial = data['ser'][0]
    if not collection.find_one({'serial': serial}): # Caso não exista nenhum documento com a serial requisitada
        document = {
            'serial': str(data['ser'][0]),
            'perfil': data['profile'][0],
            'rotas': {
                f'rota_{dia}': {
                    str(0):{
                        'lat': float(lat),
                        'lon': float(lon),
                        'precisao': round(float(data['acc'][0]), 3),
                        'horario': str(horario)
                    }
                }
            }
        }

        collection.insert_one(document)

    elif collection.find_one({'serial': serial}) and not f'rota_{dia}' in  collection.find_one({'serial': serial})['rotas']: # Caso exista o documento, mas não exista a rota
        doc = collection.find_one({'serial': serial})
        collection.update_one({'serial': serial}, {"$set": {f"rotas.rota_{dia}.{str(0)}": {
            'lat': float(lat),
            'lon': float(lon),
            'precisao': round(float(data['acc'][0]), 3),
            'horario': str(horario)
        }}})

    else: # Caso exista o documento e a rota
        doc = collection.find_one({'serial': serial})
        quantidade = len(doc['rotas'][f'rota_{dia}'])
        collection.update_one({'serial': serial}, {"$set": {f"rotas.rota_{dia}.{str(quantidade)}": {
            'lat': float(lat),
            'lon': float(lon),
            'precisao': round(float(data['acc'][0]), 3),
            'horario': str(horario)
        }}})

    socketio.emit('message', {'lat': lat, 'lon': lon, 'horario': horario, 'serial': serial})

    return jsonify({"status": "200"})

# ------------------------------------------------------------- API -------------------------------------------------------------

# Rota para obter json com o nome dos dispositivos e a respectiva serial
@app.route('/api/pega_disp', methods=['GET'])
def pega_disp():
    doc = collection.find({})

    serials :dict = {}

    for document in doc:
        serials[f'{document["perfil"]}'] = document['serial']

    return jsonify(serials)

# Rota para obter json com os dias registrados pela serial requisitada
@app.route('/api/pega_dias', methods=['GET'])
def pega_dias():
    serial = request.args.get('serial')
    doc = collection.find_one({'serial': serial})

    datas :list = []

    for i, rota in enumerate(doc['rotas']):
        datas.append(str(rota.split('_')[1]))

    return jsonify(datas)

# Rota que envia json com as localizações de acordo com a rota e serial requisitada
@app.route('/api/pegar_rotas', methods=['GET'])
def pega_rota():
    rota = request.args.get('rota')
    serial = request.args.get('serial')


    doc = collection.find_one({'serial': serial})

    if doc and 'rotas' in doc and rota in doc['rotas']:
        rota_data = doc['rotas'][rota]
        return jsonify(rota_data)
    else:
        return jsonify({"error": "Rota não encontrada"})

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', debug=True)