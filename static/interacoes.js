const limparMapa = new Event('limparMapa')
const getRoute = new Event('getRoute')
const verificarAtividade = new Event('verificarAtv')
const changePts = new Event('changePts')

/* ----------------------------- Criador de options ----------------------------- */
$(document).ready(() => {
    $.ajax({
        url: '/api/pega_disp',
        method: 'GET',
        success: (data) => {
            var variavel = data
            for(let chave in variavel){
                let option = document.createElement('option')
                option.innerText = chave
                option.value = variavel[chave]
                document.querySelector('#dispositivos').appendChild(option)
            }
        },
        error: () => {
            console.log('ERRO')
        }
    })
})

const getDate = () => {
    dia = new Date()
    return `${dia.getDate()}/${dia.getMonth() + 1}/${dia.getFullYear()}`
}

/* ----------------------------- Modificador quando mexe no dispositivo ----------------------------- */
document.querySelector('#dispositivos').addEventListener('change', () =>{

    document.querySelector('#datas').innerHTML = '<option selected disabled>Selecione uma data</option>'
    $.ajax({
        url: '/api/pega_dias?serial=' + document.querySelector('#dispositivos').value,
        method: 'GET',
        success: (data) => {
            document.querySelector('#datas').style.display = 'inline-block'
            for(let dia in data){
                let option = document.createElement('option')
                if(data[dia] == getDate()){
                    option.innerText = 'Hoje'
                    option.value = `rota_${getDate()}`
                }else{
                    option.innerText = data[dia]
                    option.value = `rota_${data[dia]}`
                }
                document.querySelector('#datas').appendChild(option)
            }
        },
        error: () =>{
            console.log('ERRO')
        }
    })
    document.dispatchEvent(limparMapa)
    document.querySelector('#changer').classList.add('d-none')
})

/* ----------------------------- disparador de eventos para quando mexe na data ----------------------------- */
document.querySelector('#datas').addEventListener('change', () => {
    document.dispatchEvent(verificarAtividade)
    document.dispatchEvent(getRoute)
    document.dispatchEvent(limparMapa)
    document.querySelector('#changer').classList.remove('d-none')
    
})

/* ----------------------------- Botões Para definir Se terá ou não os Pontos ----------------------------- */

document.querySelector('#pontos-on').addEventListener('click', () => {
    let pontosON = document.querySelector('#pontos-on')
    let pontosOFF = document.querySelector('#pontos-off')

    if(!pontosON.classList.contains('active')){
        pontosON.classList.toggle('active')
        pontosOFF.classList.toggle('active')
        
    }

    document.dispatchEvent(changePts)

})

document.querySelector('#pontos-off').addEventListener('click', () => {
    let pontosON = document.querySelector('#pontos-on')
    let pontosOFF = document.querySelector('#pontos-off')

    if(!pontosOFF.classList.contains('active')){
        pontosOFF.classList.toggle('active')
        pontosON.classList.toggle('active')
    }

    document.dispatchEvent(changePts)

})

/* ----------------------------- Eventos do Modal ----------------------------- */
const modal = document.getElementById('pop-up')
if (modal) {
    modal.addEventListener('show.bs.modal', event => {
        const marcador = event.relatedTarget
        let rota = document.querySelector('#datas').value
        let ponto = marcador.getAttribute('data-point')
        let serial = document.querySelector('#dispositivos').value

        document.querySelector('#modalTitle').innerHTML = `Informações do ponto ${Number(ponto)+1} na rota do dia ${rota.replace(/^rota_/, '')}`
        $.ajax({
            url: `api/pega_pt?serial=${serial}&rota=${rota}&ponto=${ponto}`,
            method: 'GET',
            success: (data) => {
                modal.querySelector('#modalBody').innerHTML = '<p id="end"><span class="fw-bolder">Buscando endereço...</span></p>'
                const create = (label, conteudo, type=false) =>{
                    if(type){
                        conteudo = new Date(conteudo)

                        conteudo.setUTCHours(conteudo.getUTCHours() - 3)

                        const horas = String(conteudo.getUTCHours()).padStart(2, '0');
                        const minutos = String(conteudo.getUTCMinutes()).padStart(2, '0');
                        const segundos = String(conteudo.getUTCSeconds()).padStart(2, '0');

                        conteudo = `${horas}:${minutos}:${segundos}`;

                    }
                    let p = document.createElement('p');
                    p.className = 'text-wrap'
                    let span = document.createElement('span')
                    span.className = 'fw-bolder'
                    span.innerHTML = label
                    p.appendChild(span)
                    p.innerHTML += conteudo
                    modal.querySelector('#modalBody').appendChild(p)

                }
                
                let end = document.querySelector('#end')
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lon}&format=json`)
                    .then((res) => {
                        if(!res.ok){
                            end.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
                            throw new Error('Não foi possivel acessar a API')
                            
                        }
                        return res.json()
                    })
                    .then((data) => {
                        if('road' in data.address){
                            let endereco = data.address.road
                            
                            end.innerHTML = '<span class="fw-bolder">Endereço: </span>' + endereco
                        }else{
                            end.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
                            
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        end.innerHTML = '<span class="fw-bolder">Endereço Não Encontrado</span>'
                    })
                
                
                create('Latitude: ', `${data.lat}`)
                create('Longitude: ', `${data.lon}`)
                create('Precisão: ', data.precisao)
                create('Horario: ', `${data.horario_a}`, true)
                create('Horario de envio: ', `${data.horario_s.replace(/ \d{2}\/\d{2}\/\d{4}/, '')}`)
                create('Provedor: ', data.provedor)
                

            },
            error: () => {

            }
        })

    })
}