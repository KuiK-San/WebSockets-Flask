socket.on('off', (data) => {
    if(document.querySelector('#dispositivos').value == data.serial ){
        document.querySelector('#offline').style.display = 'inline'
        
    }
})
socket.on('message', (data) => {
    if(document.querySelector('#dispositivos').value == data.serial ){
        document.querySelector('#offline').style.display = 'none'
        
    }
})
document.addEventListener('verificarAtv', () => {
    $.ajax({
        url: `/api/pega_atv&serial=${document.querySelector('#disposivo').value}`,
        method: 'GET',
        success: (data) => {
            
        },
        error: () => {
            console.log('ERRO')
        }
    })
})