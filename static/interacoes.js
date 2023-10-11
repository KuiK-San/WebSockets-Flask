$(document).ready(() => {
    $.ajax({
        url: '/api/pega_disp',
        method: 'GET',
        success: (data) => {
            var variavel = data
            for(let chave in variavel){
                let opcao = document.createElement('option')
                opcao.innerText = chave
                opcao.value = variavel[chave]
                document.querySelector('#dispositivos').appendChild(opcao)
            }
        },
        error: () => {
            console.log('ERRO')
        }
    })
})


document.querySelector('#dispositivos').addEventListener('change', () =>{
    $.ajax({
        url: '/api/pega_horarios?serial=' + document.querySelector('#dispositivos').value,
        method: 'GET',
        success: (data) => {
            console.log('sucesso')
        },
        error: () =>{
            console.log('marcelo')
        }
    })
})
