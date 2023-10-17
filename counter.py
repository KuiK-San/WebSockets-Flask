import time
from conexao import collection
from server import socketio
import datetime
from flask import jsonify

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
                ultimoPonto = len(documento['rotas'][f'rota_{dia}']) - 1

                if 'ociosidade' in documento and f'rota_{dia}': # Se tiver rota e ociosidade
                    collection.update_one({'_id': documento['_id']}, {"$set": {f'ociosidade.rota_{dia}.{ultimoPonto}': f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} })

                elif 'ociosidade' in documento: # Se não tiver rota mas tiver ociosidade
                    collection.update_one({'_id': documento['_id']}, {"$set": {f'ociosidade.rota_{dia}': {str(ultimoPonto): f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} }})

                else: # Se não tiver nenhum dos dois
                    collection.update_one({'_id': documento['_id']}, {"$set": {'ociosidade': {f'rota_{dia}':{str(ultimoPonto): f'{time.strftime("%H:%M:%S", time.gmtime(tempo))}'} }}})


        time.sleep(10)

if __name__ == '__main__':
    # contador()
    serial = '2c3dbeb3db2d6b30'

    doc = collection.find_one({'serial': serial})

    for rota in doc['rotas']:
        for point in doc['rotas'][rota]:
            print(doc['rotas'][rota][point]['horario_a'])
                
    