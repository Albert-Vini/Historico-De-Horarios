const chaveArray = "HorariosSave";
const chaveLength = "KeyLength";
const chaveActivate = "KeyBool";
const versaoData = "DataVersion";

//---------------------------Codigos de gerenciamento do historico de horario
///limpa o historico de senhas
function clearHistory() {
    localStorage.setItem("HorariosSave", JSON.stringify([]));
    localStorage.setItem("KeyLength", JSON.stringify(0));
    localStorage.setItem("KeyBool", JSON.stringify(false));
    localStorage.setItem(versaoData, JSON.stringify(1));
    location.reload();
}

///Abre o historico de horarios
function openHistory() {
    array = JSON.parse(localStorage.getItem(chaveArray)) || [];
    tamanho = JSON.parse(localStorage.getItem(chaveLength)) || 0;
    boolean = JSON.parse(localStorage.getItem(chaveActivate)) || false;
    version = JSON.parse(localStorage.getItem(versaoData)) || 1;
    return { array, tamanho, boolean, version };
}

///Salva o historico de horarios
function saveHistory(array, tamanho, boolean, version) {
    localStorage.setItem(chaveArray, JSON.stringify(array));
    localStorage.setItem(chaveLength, JSON.stringify(tamanho));
    localStorage.setItem(chaveActivate, JSON.stringify(boolean));
    localStorage.setItem(versaoData, JSON.stringify(version));
}

///Verifica os horarios
function seeHistory() {
    console.log(JSON.parse(localStorage.getItem(chaveArray)));
}

//verifica a versão dos dados salvos
function seeVersion() {
    console.log(String(JSON.parse(localStorage.getItem(versaoData))));
}
//------------------------------------------------------------------------------

//Funcoes relacionadas com o horario o salvamento na lista
//Devolve um array com o horario atual
function tempo() {
    const time = new Date();
    return [time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()];
}

//Adiciona no array o tempo atual
function saveTime() {
    let { array: horarios, tamanho, boolean: activate, version } = openHistory();
    if (!activate) {
        horarios.push([tempo()]);
        tamanho++;
    }
    else {
        horarios[tamanho - 1].push(tempo());
    }
    activate = !activate;
    saveHistory(horarios, tamanho, activate, version);
    return activate;
}

function tempoDecorrido(intervalo) {
    let [inicio, fim] = intervalo
    if(!fim)return{horas:0, min:0, seg:0};
    let data1 = new Date(...inicio);
    let data2 = new Date(...fim);
    let difMili = data2-data1;
    let horas = Math.floor(difMili / (1000 * 60 * 60));
    let min = Math.floor((difMili % (1000 * 60 * 60)) / (1000 * 60));
    let seg = Math.floor(((difMili % (1000 * 60 * 60)) % (1000 * 60)) / 1000)
    return { horas, min, seg };
}

//------------------------------------------------------------------------------

//Atualiza o botão pra o activate atual
function updateButton(activate) {
    const botao = document.getElementById("botao");
    const icone = document.getElementById("icone");

    if (activate) {
        botao.className = "botao-stop";
        icone.className = "stop-icon"
    }
    else {
        botao.className = "botao-play";
        icone.className = "play-icon"
    }
}

//Funcoes da pagina Principal
if (document.getElementById("principal")) {
    let dataHistory = openHistory()
    updateButton(dataHistory.boolean);
    botao.onclick = function () {
        let activate = saveTime();
        updateButton(activate);
    }
}

//Funcoes da pagina da tabela
if(document.getElementById("tabela")){
    const clearButton = document.getElementById("clearHistory");
    let {array} = openHistory();
    creatTable(array);
    
    function creatTable(array) {
        const tBody = document.getElementById("TabelaHorario");
        array.forEach((element,indice) => {
            let novalinha = document.createElement("tr");
            let {horas, min, seg} = tempoDecorrido(element);
            let minFormatado = fN(min);
            let horaFormatada = fN(horas);
            let segFormatado = fN(seg);
            let saida = element[1] || ["--", "--", "--", "--", "--", "--"];
            novalinha.innerHTML = 
            `
            <td>${indice+1}</td>
            <td>
                <div class="celulaDividida">
                    <div>${fN(element[0][2])}/${fN(element[0][1]+1)}/${fN(element[0][0])}</div>
                    <div>${fN(saida[2])}/${ saida[1] != "--" ? fN(saida[1] +1) : saida[1]}/${fN(saida[0])}</div>
                </div>
            </td>
            <td>${horaFormatada}:${minFormatado}:${segFormatado}</td>
            <td>
                <div class="celulaDividida">
                    <div>${fN(element[0][3])}:${fN(element[0][4])}:${fN(element[0][5])}</div>
                    <div>${fN(saida[3])}:${fN(saida[4])}:${fN(saida[5])}</div>
                </div>
            </td>
            `;
            tBody.appendChild(novalinha);
        });
    }

    clearButton.onclick = function(){clearHistory();}

}

function fN(Num){
    return isNaN(Num) ? Num : (String(Num).padStart(2,"0"));
}
