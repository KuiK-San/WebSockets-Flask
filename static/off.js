// var offline = document.querySelector('#offline')
const remover = new Event('remover')
const alertPlaceholder = document.getElementById('offline')
var intervalo

const makeAlert = (message, type) => { // Função para excluir alerta atual (se exibido) e adicionar um com a nova mensagem
    let alerta = document.querySelector('#alerta')
    if(alerta){
        if(alerta.classList.contains(`alert-${type}`)){
            alerta.innerHTML =  `<div>${message}</div>`
            return
        }
    }
    const wrapper = document.createElement('div')
    
    if(type === 'warning'){
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" id="alerta" role="alert">`,
            `   <div>${message}</div>`,
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')
    }else{
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" id="alerta" role="alert">`,
            `   <div>${message}</div>`,
            '</div>'
        ].join('')
    }
    alertPlaceholder.innerHTML = ''
    alertPlaceholder.append(wrapper)
}
const excludeAlert = () => { // Função que exclui alerta atual
    alertPlaceholder.innerHTML = ''
}
const getAtt = (serial, type) => { // função que pega a ultima atividade do usuario e cria um alerta
    $.ajax({
            
        url: `/api/pega_atv?serial=${serial}`,
        method: 'GET',
        success: (data) => {
            const horario = new Event('horas')
            makeAlert(`Última atualização do usúario há <span id="horario">${data.atividade}</span>`, type)
            document.dispatchEvent(horario)
        },
        error: () => {
            console.log('ERRO')
        }
    })
}
const excludeAtt = () => { // Função que exclui a precisão da página
    document.querySelector('#acc').innerHTML = ''
    document.querySelector('#prec').classList.add('d-none')
    document.querySelector('#loca').classList.add('d-none')

}
document.addEventListener('off', () => { // Função quando recebe que o usuario está offline
    getAtt(document.querySelector('#dispositivos').value, 'danger')
    excludeAtt()
    let circulo = document.querySelector('#circuloAtual')
    if(circulo != null){
        circulo.classList.remove('pulsating-circle')
    }
})
/* socket.on('message', (message) => { // Função que recebe que o usuario atualizou
    if(document.querySelector('#dispositivos').value == message.serial && document.querySelector('#datas').value == `rota_${getDate()}`){
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
}) */
document.addEventListener('verificarAtv', () => { // Função que para verificar a ultima atulização do usuario e cria um alert
    if(document.querySelector('#datas').value == 'rota_' + getDate()){
        getAtt(document.querySelector('#dispositivos').value, 'warning')
    }
    else{
        excludeAlert()
    }
})
document.querySelector('#dispositivos').addEventListener('change', () => { // Função que exclui os alertas quando o usuario muda o dispositivo selecionado
    excludeAlert()
} )

document.addEventListener('horas', () => {
    if(intervalo){
        clearInterval(intervalo)
    }
    let horario = document.querySelector('#horario').textContent
    
    const [horas, minutos, segundos] = horario.split(':').map(Number)
    
    const dataAtual = new Date()
    dataAtual.setHours(horas)
    dataAtual.setMinutes(minutos)
    dataAtual.setSeconds(segundos)
    
    intervalo = setInterval(()=>{
        let horario = document.querySelector('#horario')
        if(horario){
            dataAtual.setSeconds(dataAtual.getSeconds() + 1)
            document.querySelector('#horario').innerHTML = dataAtual.toLocaleTimeString()
        }
    }, 1000)
    
})