from flask import Flask, request, render_template, jsonify
from flask import request
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/log", methods=['GET'])
def log():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    time = request.args.get('time')
    message = {'lat': lat, 'lon': lon, 'time': time}
    socketio.emit('teste', message)
    return jsonify({"status": "ok"})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', debug=True)