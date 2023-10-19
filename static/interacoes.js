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

const markers = document.querySelectorAll('#marcador')

markers.forEach((marker) => {
    marker.addEventListener('click', () => {
        console.log('marcelo')
    })
})