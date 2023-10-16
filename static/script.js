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
    if(message.serial == document.querySelector('#dispositivos').value && document.querySelector('#datas').value == 'rota_' + getDate()){
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

        document.addEventListener('limparMapa', () => {
            routeCoordinates = [];
    
            if (marker) {
                marker.remove();
                marker = null;
            }
        
            map.getSource('route').setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            });
        });
    }
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

map.on('load', () => {
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

let allcoords = []

let markersArray = []; // Array para rastrear os marcadores

document.addEventListener('getRoute', () => {
    
    // Remova todos os marcadores do mapa
    for (const marker of markersArray) {
        marker.remove();
    }
    markersArray = []; // Limpe o array de marcadores

    map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: []
        }
    });

    $.ajax({
        url: '/api/pegar_rotas?rota=' + document.querySelector('#datas').value + '&serial=' + document.querySelector('#dispositivos').value,
        method: 'GET',
        success: (data) => {
            let coords = [];
            for (let point in data) {
                coords.push([data[point].lon, data[point].lat]);

                const marker = new mapboxgl.Marker({ color: 'red', scale: 0.5 })
                    .setLngLat([data[point].lon, data[point].lat]);
                markersArray.push(marker);

                marker.addTo(map);
            }
            allcoords.push(routeCoordinates)
            allcoords.push(coords)
            const geojsonData = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coords
                }
            }

            map.getSource('route').setData(geojsonData);

            const bounds = new mapboxgl.LngLatBounds();
            coords.forEach(coord => bounds.extend(coord));
            const center = bounds.getCenter();

            map.flyTo({
                center: center,
                zoom: 15
            });
        },
        error: () => {
            console.log('ERRO AO CAPTURAR ROTA');
        }
    });
});
