let allcoords = [];
var markersArray = [];
var i = 0;
var socket = io.connect('http://' + document.domain + ":" + location.port);
let coordsElement = document.querySelector('#coord');
let routeCoordinates = [];
var initialRouteSet

// Inicializando o mapa
mapboxgl.accessToken = "pk.eyJ1IjoidGhlZ3VpNDAwMCIsImEiOiJjbGtqeXRnNWYwbjlrM2dvYXYxZXVwY2FjIn0.RSEC3oyLBXLiL9ybKmOEIQ";
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: -0.5
});

document.addEventListener('getRoute', () => { // Recebe Evento quando o usuario escolhe uma rota
    
    // Limpa todo o mapa
    initialRouteSet = false; 
    routeCoordinates = [];
    for (const marker of markersArray) {
        marker.remove();
    }
    markersArray = [];

    map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: []
        }
    });

    // Solicita rota escolhida pelo usuario ao servidor e plota no mapa 
    $.ajax({
        url: '/api/pegar_rotas?rota=' + document.querySelector('#datas').value + '&serial=' + document.querySelector('#dispositivos').value,
        method: 'GET',
        success: (data) => {
            const coordArray = Object.values(data);
            coordArray.sort((a, b) => new Date(a.horario_a) - new Date(b.horario_a));
            
            let coords = [];

            for (let point of coordArray) {
                coords.push([point.lon, point.lat]);

                const marker = new mapboxgl.Marker({ color: 'red', scale: 0.5 })
                    .setLngLat([point.lon, point.lat]);
                markersArray.push(marker);

                marker.addTo(map);
            }
            allcoords.push(coords);
            const geojsonData = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coords
                }
            };

            map.getSource('route').setData(geojsonData);

            const bounds = new mapboxgl.LngLatBounds();
            coords.forEach(coord => bounds.extend(coord));
            const center = bounds.getCenter();

            map.flyTo({
                center: center,
                zoom: 12
            });
            for(let i in allcoords[0]){
                routeCoordinates.push(allcoords[0][i])
                // console.log(allcoords[0][i])
            }
            // console.log(routeCoordinates)
        },
        error: () => {
            console.error('ERRO AO CAPTURAR ROTA');
        }
    });
});

// Cria o marcador de localização atual do usuario selecionado
var lat, lon; 
var marker;
var ultimaPos

socket.on('message', (message) => {
    if (message.serial == document.querySelector('#dispositivos').value && document.querySelector('#datas').value == 'rota_' + getDate()) {
        if(lat != null && lon != null){
            // console.log('criador de posição')
            const ultimaPos = new mapboxgl.Marker({ color: 'red', scale: 0.5 })
                        .setLngLat([lon, lat])
            ultimaPos.addTo(map)
            markersArray.push(ultimaPos)
        }
        lat = parseFloat(message.lat)
        lon = parseFloat(message.lon)
        
        routeCoordinates.push([message.lon, message.lat]);
        // document.querySelector('#coord').innerHTML = routeCoordinates.toString()

        if (!marker) {
            marker = new mapboxgl.Marker({
                element: createMaker()
            })
                .setLngLat([message.lon, message.lat])
                .addTo(map);

            map.flyTo({
                center: [message.lon, message.lat],
                zoom: 17
            });
        } else {
            marker.setLngLat([message.lon, message.lat]);
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
            initialRouteSet = false; 
            routeCoordinates = [];
            for (const marker of markersArray) {
                marker.remove();
            }
            markersArray = [];

            map.getSource('route').setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            });
        })
        //console.log(routeCoordinates);
    }
});

function createMaker(){
    
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

// Ao carregar o mapa cria camada da rota
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
