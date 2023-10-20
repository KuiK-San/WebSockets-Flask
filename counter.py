import time
from conexao import collection
from server import socketio
import datetime
from flask import jsonify
import math

def contador():
    data_e_hora_atuais = datetime.datetime.now()
    horario = data_e_hora_atuais.strftime("%H:%M:%S %d/%m/%Y")
    dia = data_e_hora_atuais.strftime("%d/%m/%Y")

    limite = 60

    while True:
        for documento in collection.find():
            ultima_att = documento['ultima_att']
            tempo = time.time() - ultima_att
            if tempo > limite:
                # print('teste')
                socketio.emit('off', {'serial': str(documento['serial'])})
                # Salvar no Banco de dados
                if f'rota_{dia}' in documento['rotas']:
                    ultimoPonto = len(documento['rotas'][f'rota_{dia}']) - 1

                    if 'ociosidade' in documento and f'rota_{dia}': # Se tiver rota e ociosidade
                        collection.update_one({'_id': documento['_id']}, {"$set": {f'ociosidade.rota_{dia}.{ultimoPonto}': f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} })

                    elif 'ociosidade' in documento: # Se não tiver rota mas tiver ociosidade
                        collection.update_one({'_id': documento['_id']}, {"$set": {f'ociosidade.rota_{dia}': {str(ultimoPonto): f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} }})

                    else: # Se não tiver nenhum dos dois
                        collection.update_one({'_id': documento['_id']}, {"$set": {'ociosidade': {f'rota_{dia}':{str(ultimoPonto): f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} }}})


        time.sleep(60)

def calcular_distancia_geografica(lat1, lat2, lon1, lon2):

    raio_terra_metros = 6371000

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distancia = raio_terra_metros * c
    return distancia

if __name__ == '__main__':
    contador()