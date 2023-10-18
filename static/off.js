var offline = document.querySelector('#offline')

socket.on('off', (data) => {
    if(document.querySelector('#dispositivos').value == data.serial ){
        offline.style.display = 'inline'
        document.querySelector('#circuloAtual').classList.remove('pulsating-circle')
    }
})
socket.on('message', (data) => {
    if(document.querySelector('#dispositivos').value == data.serial ){
        offline.style.display = 'none'
        document.querySelector('#circuloAtual').classList.add('pulsating-circle')
        
    }
})
document.addEventListener('verificarAtv', () => {
    $.ajax({
        
        url: `/api/pega_atv?serial=${document.querySelector('#dispositivos').value}`,
        method: 'GET',
        success: (data) => {
            offline.style.display = 'inline'
            offline.innerText = `O usuario está offline no momento. Ultima Atividade há ${data.atividade}`
        },
        error: () => {
            console.log('ERRO')
        }
    })
})