from pymongo import MongoClient

# Conectando com o DB
client = MongoClient('localhost', 27017)
db = client['localizador']
collection = db['dispositivos']