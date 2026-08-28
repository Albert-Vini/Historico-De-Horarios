const chaveArray = "HorariosSave";
const chaveActivate = "KeyBool";
const versaoData = "DataVersion";
const modo = "modoLight";

//---------------------------Codigos de gerenciamento do historico de horario
///limpa o historico de senhas
function clearHistory() {
    localStorage.setItem(chaveArray, JSON.stringify([]));
    localStorage.setItem(chaveActivate, JSON.stringify(false));
    localStorage.setItem(versaoData, JSON.stringify(1));
    location.reload();
}

///Abre as informações da pagina
function openHistory() {
    array = JSON.parse(localStorage.getItem(chaveArray)) || [];
    boolean = JSON.parse(localStorage.getItem(chaveActivate)) || false;
    version = JSON.parse(localStorage.getItem(versaoData)) || 1;
    light = JSON.parse(localStorage.getItem(modo)) || 0;
    return { array, boolean, version, light };
}

///Salva o historico de horarios
function saveHistory(array, boolean, version, light) {
    localStorage.setItem(chaveArray, JSON.stringify(array));
    localStorage.setItem(chaveActivate, JSON.stringify(boolean));
    localStorage.setItem(versaoData, JSON.stringify(version));
    localStorage.setItem(modo, JSON.stringify(light));
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
    let { array: horarios, boolean: activate, version , light } = openHistory();
    if (!activate) {
        horarios.push([tempo()]);
    }
    else {
        horarios[horarios.length - 1].push(tempo());
    }
    activate = !activate;
    saveHistory(horarios, activate, version, light);
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
        icone.className = "stop-icon";
    }
    else {
        botao.className = "botao-play";
        icone.className = "play-icon";
    }
}

// Retorna, se for um numero, uma string de tamanho 2 ou mais
function fN(Num){
    return isNaN(Num) ? Num : (String(Num).padStart(2,"0"));
}

//Função pra mudar o estilo da pagina
function mudarEstilo(estilo, variaveis){
    Object.entries(variaveis).forEach(([variavel, valor]) => estilo.setProperty(variavel,valor));
}

if(document.getElementById("MudarTema"))
{
    if(openHistory().light =="1") definirTema(1);
    else definirTema(0);
    const botao = document.getElementById("MudarTema");
    botao.onclick = function() 
    {
        let light = openHistory().light;
        Number(light);
        definirTema(!Number(light));
    }
}

function definirTema(light)
{
    const botao = document.getElementById("MudarTema");
    const styleCha = document.documentElement.style;
    if(light == 1)
    {
        let white = {
            "--bg-color": "#f8f8f8",
            "--card-bg": "#d0d0d1",
            "--nav-bg": "#c1c1c1",
            "--nav-hover": "#3b3b54",
            "--text-color": "#000000",
            "--border-color": "#aeaeaf",
            "--shadow": "0 10px 30px #9f9f9f"
        }
        mudarEstilo(styleCha,white);
        botao.textContent = "Mudar tema ☀️";
    }
    else
    {
        let black = {
            "--bg-color": "#121212",
            "--card-bg": "#1e1e2e",
            "--nav-bg": "#2a2a3c",
            "--nav-hover": "#3b3b54",
            "--text-color": "#ffffff",
            "--border-color": "#33334d",
            "--shadow": "0 10px 30px rgba(0, 0, 0, 0.5)"
        }
        mudarEstilo(styleCha,black);
        botao.textContent = "Mudar tema 🌒";
    }
    localStorage.setItem(modo, JSON.stringify(light));
}
//-------------------------------Funcoes Especiais para cada pagina

//Funcoes da pagina Principal
if (document.getElementById("principal")) {
    let botao = document.getElementById("botao");
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

    clearButton.onclick = function(){
        let senha = window.prompt("Confirme a limpeza digitando `Sim` da mesma forma:");
        if(senha == "Sim"){
            clearHistory();
        }
    }
}