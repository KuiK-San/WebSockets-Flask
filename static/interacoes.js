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


document.querySelector('#dispositivos').addEventListener('change', () =>{
    document.querySelector('#datas').innerHTML = '<option selected disabled>Selecione uma data</option>'
    document.querySelector('#datas').innerHTML += '<option value="hoje">Hoje</option>'
    $.ajax({
        url: '/api/pega_dias?serial=' + document.querySelector('#dispositivos').value,
        method: 'GET',
        success: (data) => {
            console.log(data)
            document.querySelector('#datas').style.display = 'inline-block'
            for(let dia in data){
                let option = document.createElement('option')
                option.innerText = data[dia]
                option.value = `rota_${data[dia]}`
                document.querySelector('#datas').appendChild(option)
            }
        },
        error: () =>{
            console.log('marcelo')
        }
    })
})
