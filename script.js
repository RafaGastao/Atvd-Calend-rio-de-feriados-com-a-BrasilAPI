// Atividade 1 - Calendário de feriados com a BrasilAPI
// Aluno(a): ________________________

const campoAno = document.getElementById('ano')
const tabela = document.getElementById('tabelaFeriados')
const mensagem = document.getElementById('mensagem')
const total = document.getElementById('total')
const proximo = document.getElementById('proximo')

const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Preenche o campo com o ano atual
campoAno.value = new Date().getFullYear()

function consultarFeriados() {
    const ano = campoAno.value
    tabela.innerHTML = ''
    mensagem.textContent = ''
    mensagem.className = ''
    total.textContent = ''
    proximo.textContent = ''

    if (!/^\d{4}$/.test(ano)) {
        mensagem.textContent = 'Digite um ano válido com quatro números.'
        mensagem.className = 'erro'
        return
    }

    mensagem.textContent = 'Consultando feriados...'

    fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error('Não foi possível consultar os feriados desse ano.')
            }
            return resposta.json()
        })
        .then(feriados => {
            mensagem.textContent = ''
            total.textContent = `Total de feriados em ${ano}: ${feriados.length}`

            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            let proximoFeriado = null
            let menorDiferenca = Infinity

            feriados.forEach(feriado => {
                const data = new Date(feriado.date + 'T12:00:00')
                const dataFormatada = data.toLocaleDateString('pt-BR')
                const diaDaSemana = data.getDay()
                const fimDeSemana = diaDaSemana === 0 || diaDaSemana === 6

                const linha = document.createElement('tr')
                if (fimDeSemana) {
                    linha.classList.add('fim-de-semana')
                }

                const colunaData = document.createElement('td')
                colunaData.textContent = dataFormatada
                const colunaDia = document.createElement('td')
                colunaDia.textContent = diasDaSemana[diaDaSemana]
                const colunaNome = document.createElement('td')
                colunaNome.textContent = feriado.name
                linha.append(colunaData, colunaDia, colunaNome)
                tabela.appendChild(linha)

                // Compara apenas as datas, sem depender do horário atual
                const dataHojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
                const dataFeriadoUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
                const diasRestantes = Math.round((dataFeriadoUTC - dataHojeUTC) / 86400000)

                if (diasRestantes >= 0 && diasRestantes < menorDiferenca) {
                    menorDiferenca = diasRestantes
                    proximoFeriado = feriado
                }
            })

            if (proximoFeriado) {
                const data = new Date(proximoFeriado.date + 'T12:00:00')
                const quando = menorDiferenca === 0 ? 'É hoje!' : `Faltam ${menorDiferenca} dia(s).`
                proximo.textContent = `Próximo feriado: ${proximoFeriado.name} (${data.toLocaleDateString('pt-BR')}). ${quando}`
            } else {
                proximo.textContent = 'Não há feriados restantes neste ano consultado.'
            }
        })
        .catch(erro => {
            mensagem.textContent = erro.message
            mensagem.className = 'erro'
            total.textContent = ''
            tabela.innerHTML = ''
            proximo.textContent = ''
        })
}

document.getElementById('btnConsultar').addEventListener('click', consultarFeriados)
consultarFeriados()
