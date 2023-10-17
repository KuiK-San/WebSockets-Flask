from flask import request, render_template, jsonify
from urllib.parse import parse_qs
from datetime import datetime
from conexao import collection
import threading
import counter
import time
from server import app, socketio

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

    doc = collection.find_one({'serial': serial})

    for rota in doc['rotas']:
        for point in doc['rotas'][rota]:
            if doc['rotas'][rota][point]['horario_a'] == str(data['time'][0]):
                print('fora!')
                return jsonify({"status": "Já salvo no servidor"})
        
    if not collection.find_one({'serial': serial}): # Caso não exista nenhum documento com a serial requisitada
        document = {
            'serial': str(data['ser'][0]),
            'perfil': data['profile'][0],
            'ultima_att': time.time(),
            'rotas': {
                f'rota_{dia}': {
                    str(0):{
                        'lat': float(lat),
                        'lon': float(lon),
                        'precisao': round(float(data['acc'][0]), 3),
                        'horario_s': str(horario),
                        'horario_a': data['time'][0],
                        'provedor': data['prov'][0]
                    }
                }
            }
        }

        collection.insert_one(document)

    elif collection.find_one({'serial': serial}) and not f'rota_{dia}' in  collection.find_one({'serial': serial})['rotas']: # Caso exista o documento, mas não exista a rota
        doc = collection.find_one({'serial': serial})
        collection.update_one({'serial': serial}, {"$set": {
            f"rotas.rota_{dia}.{str(0)}": {
                'lat': float(lat),
                'lon': float(lon),
                'precisao': round(float(data['acc'][0]), 3),
                'horario_s': str(horario),
                'horario_a': data['time'][0],
                'provedor': data['prov'][0]
            },
            'ultima_att': time.time()
            }})

    else: # Caso exista o documento e a rota
        doc = collection.find_one({'serial': serial})
        quantidade = len(doc['rotas'][f'rota_{dia}'])
        collection.update_one({'serial': serial}, {"$set": {
            f"rotas.rota_{dia}.{str(quantidade)}": {
                'lat': float(lat),
                'lon': float(lon),
                'precisao': round(float(data['acc'][0]), 3),
                'horario_s': str(horario),
                'horario_a': data['time'][0],
                'provedor': data['prov'][0]
            },
            'ultima_att': time.time()
        }})

    socketio.emit('message', {'lat': lat, 'lon': lon, 'horario': horario, 'serial': serial})
    

    return jsonify({"status": "200"})

""" ------------------------------------------------------------- API ------------------------------------------------------------- """

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
    
# Envia última atividade do usuario
@app.route('/api/pega_atv', methods=['GET'])
def pega_atv():
    serial = request.args.get('serial')
    doc = collection.find_one({'serial': serial})

    return jsonify({'atividade': doc['ultima_att']})

if __name__ == "__main__":
    contador_thread = threading.Thread(target=counter.contador, daemon=True).start()
    socketio.run(app, host='0.0.0.0', debug=True)