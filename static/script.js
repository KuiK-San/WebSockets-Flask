let allcoords = [];
var markersArray = [];
var i = 0;
var socket = io.connect("http://" + document.domain + ":" + location.port);
let coordsElement = document.querySelector("#coord");
let routeCoordinates = [];
var initialRouteSet;

// Inicializando o mapa
mapboxgl.accessToken =
    "pk.eyJ1IjoidGhlZ3VpNDAwMCIsImEiOiJjbGtqeXRnNWYwbjlrM2dvYXYxZXVwY2FjIn0.RSEC3oyLBXLiL9ybKmOEIQ";
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    zoom: -0.5,
});

document.addEventListener("getRoute", () => {
    // Recebe Evento quando o usuario escolhe uma rota

    // Limpa todo o mapa
    initialRouteSet = false;
    routeCoordinates = [];
    for (const marker of markersArray) {
        marker.remove();
    }
    markersArray = [];

    map.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: [],
        },
    });
    if(marker){
        marker.remove()
        marker = null
    }

    // Solicita rota escolhida pelo usuario ao servidor e plota no mapa
    $.ajax({
        url:
            "/api/pegar_rotas?rota=" +
            document.querySelector("#datas").value +
            "&serial=" +
            document.querySelector("#dispositivos").value,
        method: "GET",
        success: (data) => {
            const coordArray = Object.values(data);
            coordArray.sort(
                (a, b) => new Date(a.horario_a) - new Date(b.horario_a)
            );

            let coords = [];

            for (let point of coordArray) {
                coords.push([point.lon, point.lat]);

                const marker = new mapboxgl.Marker({
                    element: createMaker('default', point)
                }).setLngLat([point.lon, point.lat]);
                markersArray.push(marker);
                if (pontos) {
                    marker.addTo(map);
                }
            }
            allcoords.push(coords);
            const geojsonData = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: coords,
                },
            };

            map.getSource("route").setData(geojsonData);

            const bounds = new mapboxgl.LngLatBounds();
            coords.forEach((coord) => bounds.extend(coord));
            const center = bounds.getCenter();

            map.flyTo({
                center: center,
                zoom: 13,
            });
            for (let i in allcoords[0]) {
                routeCoordinates.push(allcoords[0][i]);
                // console.log(allcoords[0][i])
            }
            // console.log(routeCoordinates)
        },
        error: () => {
            console.error("ERRO AO CAPTURAR ROTA");
        },
    });
    allcoords = []
});

// Cria o marcador de localização atual do usuario selecionado
var lat, lon;
var marker;
var ultimaPos;

socket.on("message", (message) => {
    if (
        message.serial == document.querySelector("#dispositivos").value &&
        document.querySelector("#datas").value == "rota_" + getDate()
    ) {
        if (lat != null && lon != null) {
            // console.log('criador de posição')
            const ultimaPos = new mapboxgl.Marker({
                element: createMaker('default', {})
            }).setLngLat([lon, lat]);
            if (pontos) {
                ultimaPos.addTo(map);
            }
            markersArray.push(ultimaPos);
        }
        lat = parseFloat(message.lat);
        lon = parseFloat(message.lon);

        routeCoordinates.push([message.lon, message.lat]);
        // document.querySelector('#coord').innerHTML = routeCoordinates.toString()

        if (!marker) {
            marker = new mapboxgl.Marker({
                element: createMaker(),
            })
                .setLngLat([message.lon, message.lat])
                .addTo(map);

            map.flyTo({
                center: [message.lon, message.lat],
                zoom: 17,
            });
        } else {
            marker.setLngLat([message.lon, message.lat]);
            map.flyTo({
                center: [message.lon, message.lat],
            });
        }
        map.getSource("route").setData({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: routeCoordinates,
            },
        });

        document.addEventListener("limparMapa", () => {
            initialRouteSet = false;
            routeCoordinates = [];
            for (const marker of markersArray) {
                marker.remove();
            }
            markersArray = [];

            map.getSource("route").setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: [],
                },
            });
        });
        //console.log(routeCoordinates);

        document.querySelector(
            "#acc"
        ).innerHTML = `Precisão de ${message.precisao} metros`;
        document.querySelector("#acc").style.display = `inline`;
    }
});

function createMaker(type="location", data={}) {
    if(type === 'location'){
        let container = document.createElement("div");
        container.className = "marker-container";
    
        let pulsatingCircle = document.createElement("div");
        pulsatingCircle.className = "pulsating-circle";
        pulsatingCircle.id = "circuloAtual";
    
        let locationMarker = document.createElement("div");
        locationMarker.className = "custom-marker";
    
        container.appendChild(pulsatingCircle);
        container.appendChild(locationMarker);
    
        return container;

    }
    if(type === 'default'){
        let container = document.createElement('div')
        container.className = 'marker-container'
        container.className = 'marker'
        container.onclick = () => {
            console.log(data)
        }
        container.setAttribute('data-bs-toggle','modal')
        container.setAttribute('data-bs-target','#pop-up')
        
        return container
    }
}


// Ao carregar o mapa cria camada da rota
map.on("load", () => {
    map.addSource("route", {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [],
            },
        },
    });

    map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-opacity": 0.8,
            "line-color": "#888",
            "line-width": 8,
        },
    });
});

/* ----------------------------- Mudar para pontos ou apenas rota ----------------------------- */
var pontos = true;

document.addEventListener("changePts", () => {
    let pontosON = document.querySelector("#pontos-on");
    let pontosOFF = document.querySelector("#pontos-off");

    if (pontosON.classList.contains("active")) {
        if (!pontos) {
            // console.log('com pontos')
            for (marcador in markersArray) {
                markersArray[marcador].addTo(map);
            }
        }
        pontos = true;
    } else if (pontosOFF.classList.contains("active")) {
        if (pontos) {
            for (marcador in markersArray) {
                markersArray[marcador].remove();
            }
            // console.log('sem pontos')
        }
        pontos = false;
    }
});
