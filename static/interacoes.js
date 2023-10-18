const limparMapa = new Event('limparMapa')
const getRoute = new Event('getRoute')
const verificarAtividade = new Event('verificarAtv')

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
})

document.querySelector('#datas').addEventListener('change', () => {
    document.dispatchEvent(verificarAtividade)
    document.dispatchEvent(getRoute)
    document.dispatchEvent(limparMapa)
})
