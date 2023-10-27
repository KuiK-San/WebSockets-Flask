let allcoords = [];
var markersArray = [];
var i = 0;
/*var socket = io.connect("http://" + document.domain + ":" + location.port); */
/* let coordsElement = document.querySelector("#coord"); */
let routeCoordinates = [];
var initialRouteSet;
var totalPts = 0

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
    totalPts = 0
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
                // console.log(point)

                const marker = new mapboxgl.Marker({
                    element: createMaker('default', totalPts++)
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

const atualizarPT = (message) => {
    if (lat != null && lon != null) {
        // console.log('criador de posição')
        const ultimaPos = new mapboxgl.Marker({
            element: createMaker('default', totalPts++)
        }).setLngLat([lon, lat]);
        if (pontos) {
            ultimaPos.addTo(map);
        }
        markersArray.push(ultimaPos);
    }
    // console.log(message)
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
        totalPts = 0
        marker.remove()
        marker = null
        for (const marcador of markersArray) {
            marcador.remove();
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
        document.querySelector('#prec').classList.add('d-none')
        document.querySelector('#loca').classList.add('d-none')
    });
    //console.log(routeCoordinates);

    document.querySelector(
        "#acc"
    ).innerHTML = `Precisão de ${message.precisao} metros`;
    document.querySelector("#acc").style.display = `inline`;

    excludeAlert()
        document.querySelector('#prec').classList.remove('d-none')
        document.querySelector('#loca').classList.remove('d-none')
        document.querySelector('#circuloAtual').classList.add('pulsating-circle')
        let precisao = document.querySelector('#acc')
        precisao.innerHTML = `Margem de erro: <span class="text-end">${message.precisao} metros</span>`
        
        let localidade = document.querySelector('#loc')
        
        fetch(`/api/pega_rua?lat=${message.lat}&lon=${message.lon}&format=json`)
        .then((res) => {
            if(!res.ok){
                localidade.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
                throw new Error('Não foi possivel acessar a API')
                
            }
            return res.json()
        })
        .then((data) => {
            if('road' in data.address){
                let endereco = data.address.road
                localidade.style.display = 'inline'
                
                localidade.innerHTML = '<span class="fw-bolder">Endereço: </span>' + endereco
            }else{
                localidade.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
                
            }
        })
        .catch(e => {
            end.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
            console.error(e)
        })
}

function createMaker(type="location", pts=0) {
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
        container.setAttribute('data-bs-toggle','modal')
        container.setAttribute('data-bs-target','#pop-up')
        container.setAttribute('data-point', pts)
        container.onclick = () => {
            
        }

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

var counter = 1
setInterval(()=>{
    let executar = document.querySelector('#datas').value
    if(executar == 'Selecione uma data'){
        return
    }
    if(document.querySelector('#datas').value != null){
        // console.log(routeCoordinates.length)
        if(document.querySelector('#datas').value != `rota_${getDate()}`){
            return
        }
        $.ajax({
        url: `/api/pegar_pontos_a_partir?ultimoPt=${routeCoordinates.length - 1}&rota=${document.querySelector('#datas').value}&serial=${document.querySelector('#dispositivos').value}`,
        method: 'GET',
        success: (data) => {
            if(!data.ok){
                if(counter == 0 ){
                    return
                }
                // console.log(counter)
                counter++
                if(counter > 12){
                    const off = new Event('off')
                    document.dispatchEvent(off)
                    counter = 0
                }
                return
            }
            counter = 1
            let pts = Object.keys(data)
            pts.pop('ok')
            for (let i = 0; i < pts.length; i++) {
                let message = {
                    'lat': data[pts[i]]['lat'], 
                    'lon': data[pts[i]]['lon'],
                    'horario': data[pts[i]]['horario_s'], 
                    'serial': document.querySelector('#dispositivos').value, 
                    'precisao': data[pts[i]]['precisao']
                }
                atualizarPT(message)
            }
        }
    })}
}, 5000)