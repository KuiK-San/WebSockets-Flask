from flask import Flask, request, render_template, jsonify
from flask import request
from flask_socketio import SocketIO
from urllib.parse import parse_qs

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/log", methods=['POST'])
def log():
    data = request.data
    dt_str = data.decode('utf-8')
    data = parse_qs(dt_str)
    print(data)
    return jsonify({"status": "200"})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', debug=True)