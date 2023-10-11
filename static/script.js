var i = 0;
var socket = io.connect('http://' + document.domain + ":" + location.port);
let coords = document.querySelector('#coord');

mapboxgl.accessToken = "pk.eyJ1IjoidGhlZ3VpNDAwMCIsImEiOiJjbGtqeXRnNWYwbjlrM2dvYXYxZXVwY2FjIn0.RSEC3oyLBXLiL9ybKmOEIQ"
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: -0.5
});

var marker; 

var routeCoordinates = [];

socket.on('message', (message) => {
    if(message.serial == document.querySelector('#dispositivos').value){
        coords.innerHTML += `<span>lat: ${message.lat}, lon: ${message.lon}, horario: ${message.horario} <a target="_blank" href="https://www.google.com/maps/place/${message.lat},${message.lon}">link</a></span></br>`
        i++;
        document.querySelector('#count').innerHTML = i;

        routeCoordinates.push([message.lon, message.lat]);

        if (!marker) { 
            marker = new mapboxgl.Marker({
                element: createCustomMarker()
            })
            .setLngLat([message.lon, message.lat])
            .addTo(map);

            map.flyTo({
                center: [message.lon, message.lat],
                zoom: 17
            });
        }else{
            marker.setLngLat([message.lon, message.lat])
            map.flyTo({
                center: [message.lon, message.lat]
            });
        }
        
        map.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
            }
        });
    }
});

socket.on('data', (data) => {
    console.log(data)
});

function createCustomMarker() {
    var container = document.createElement('div');
    container.className = 'marker-container';

    var pulsatingCircle = document.createElement('div');
    pulsatingCircle.className = 'pulsating-circle';

    var locationMarker = document.createElement('div');
    locationMarker.className = 'custom-marker';

    container.appendChild(pulsatingCircle);
    container.appendChild(locationMarker);

    return container;
}

map.on('load', function () {
    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        }
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#888',
            'line-width': 8
        }
    });
});