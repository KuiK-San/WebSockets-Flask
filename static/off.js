// var offline = document.querySelector('#offline')
const remover = new Event('remover')
const alertPlaceholder = document.getElementById('offline')

const makeAlert = (message, type) => { // Função para excluir alerta atual (se exibido) e adicionar um com a nova mensagem
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
            makeAlert(`Última atualização do usúario há ${data.atividade}`, type)
        },
        error: () => {
            console.log('ERRO')
        }
    })
}
const excludeAtt = () => { // Função que exclui a precisão da página
    document.querySelector('#acc').innerHTML = ''
    document.querySelector('#acc').style.display = 'none'
}
socket.on('off', (data) => { // Função quando recebe que o usuario está offline
    if(document.querySelector('#dispositivos').value == data.serial && document.querySelector('#datas').value == 'rota_' + getDate()){
        getAtt(document.querySelector('#dispositivos').value, 'danger')
        excludeAtt()
        let circulo = document.querySelector('#circuloAtual')
        if(circulo != null){
            circulo.classList.remove('pulsating-circle')
        }
    }else{
        excludeAlert()
    }
})
socket.on('message', (data) => { // Função que recebe que o usuario atualizou
    if(document.querySelector('#dispositivos').value == data.serial ){
        excludeAlert()
        document.querySelector('#circuloAtual').classList.add('pulsating-circle')
        let precisao = document.querySelector('#acc')
        precisao.style.display = 'inline'
        precisao.innerHTML = `Margem de erro: <span class="text-end">${data.precisao} metros</span>`
        
    }
})
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
