const chaveArray = "HorariosSave";
const chaveActivate = "KeyBool";
const versaoData = "DataVersion";
const modo = "modoLight";

const estiloData = "ElementosVisuais";
const arraysData = "dadosHeL";

//Cria um objeto com as informações de arrays
function arrayDataC(version, hArray, lArray){
    this.version = version;
    this.horarios = hArray;
    this.locations = lArray;
}

//Cria um objeto com os dados de estilo
function estiloDataC(light){
    this.modoLight = light;
}

///Abre as informações da pagina com base nas versão 1
function openHistoryV1() {
    let array = JSON.parse(localStorage.getItem(chaveArray)) || [];
    let boolean = JSON.parse(localStorage.getItem(chaveActivate)) || false;
    let version = JSON.parse(localStorage.getItem(versaoData)) || 1;
    let light = JSON.parse(localStorage.getItem(modo)) || 0;
    return { array, boolean, version, light };
}

//Função para atualizar os dados da versão 1 para 2
function update1to2(){
    const dadosSalvos = openHistoryV1();

    //Salva os elementos visuais em objetos
    let elementosVisuais = new estiloDataC(dadosSalvos.light);
    localStorage.removeItem("KeyBool");
    localStorage.removeItem("modoLight");

    //Salva os dados de horario e localização
    let dadosHeL = new arrayDataC(2,dadosSalvos.array,[]);
    (dadosHeL.horarios).forEach((array) => {
        if(array.length == 2)dadosHeL.locations.push([null,null])
        else if(array.length == 1) dadosHeL.locations.push([null])
    });
    localStorage.removeItem("HorariosSave");
    localStorage.removeItem("DataVersion");
    localStorage.setItem(estiloData,JSON.stringify(elementosVisuais));
    localStorage.setItem(arraysData,JSON.stringify(dadosHeL));
}
if(JSON.parse(localStorage.getItem(versaoData)) == 1) update1to2();


//---------------------------Codigos de gerenciamento do historico de horario
///limpa o historico de senhas
function clearArrays() {
    localStorage.removeItem(arraysData);
    location.reload();
}

function resetStyleData(){
    localStorage.removeItem(estiloData);
    location.reload();
}

///Abre as informações da pagina
function openArrayData() {
    let dados = JSON.parse(localStorage.getItem(arraysData));
    if (!dados) return new arrayDataC(2, [], []);
    if (!dados.horarios) dados.horarios = [];
    if (!dados.locations) dados.locations = [];
    
    return dados;
}

function openStyleData(){
    return JSON.parse(localStorage.getItem(estiloData)) || new estiloDataC(0);
}

function saveArraysData(dataHeL){
    localStorage.setItem(arraysData, JSON.stringify(dataHeL));
}

function saveStyleData(styleDataNew){
    localStorage.setItem(estiloData, JSON.stringify(styleDataNew));
}

///Verifica os horarios
function seeArraysData() {
    console.log(JSON.parse(localStorage.getItem(arraysData)));
}

//verifica a versão dos dados salvos
function seeVersion() {
    console.log(JSON.parse(localStorage.getItem(arraysData)).version);
}
//------------------------------------------------------------------------------

//Funcoes relacionadas com o horario e localização
//Devolve um array com o horario atual
function tempo() {
    const time = new Date();
    return [time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()];
}

//Devolve um array com a localização atual e a precisão ou 0 em caso de erro
function position() {
    return new Promise((resolve) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (posicao) => {
                    let latitude = posicao.coords.latitude;
                    let longitude = posicao.coords.longitude;
                    let precisao = posicao.coords.accuracy;
                    resolve([latitude, longitude, precisao]);
                },
                () => resolve(0),
                { timeout: 5000 }
            );
        } else {
            resolve(0);
        }
    });
}

//Devolve se o botão de play ta ativado
function activate(){
    let horarios = openArrayData().horarios;
    if(horarios.length == 0 || horarios[horarios.length - 1].length == 2) return 0;
    return 1;
}

//Adiciona nos dados de arrays o tempo atual e a localização
async function saveTime() {
    let arrays = openArrayData();
    let posicao = await position();
    let isActivate = activate();
    if(posicao == 0) posicao = undefined;
    if (!isActivate) {
        arrays.horarios.push([tempo()]);
        arrays.locations.push([posicao]);
    }
    else {
        let lengthA = arrays.horarios.length - 1
        arrays.horarios[lengthA].push(tempo());
        arrays.locations[lengthA].push(posicao)
    }
    saveArraysData(arrays);
    return isActivate;
}

//Calcula o intervalo entre dois tempos
function tempoDecorrido(inicio, fim) {
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
function updateButton() {
    const isactivate = activate();
    const botao = document.getElementById("botao");
    const icone = document.getElementById("icone");
    if (isactivate) {
        botao.className = "botao-stop";
        icone.className = "stop-icon";
    }
    else {
        botao.className = "botao-play";
        icone.className = "play-icon";
    }
}

//Se for um numero, Retorna uma string de tamanho 2 ou mais
function fN(Num){
    return isNaN(Num) ? Num : (String(Num).padStart(2,"0"));
}

//Função pra mudar o estilo da pagina
function mudarEstilo(estilo, variaveis){
    Object.entries(variaveis).forEach(([variavel, valor]) => estilo.setProperty(variavel,valor));
}

//muda o tema se a pagina tiver um botão pra tal
if(document.getElementById("MudarTema"))
{
    if(openStyleData().modoLight == 1) definirTema(1);
    else definirTema(0);
    const botao = document.getElementById("MudarTema");
    botao.onclick = function() 
    {
        let light = openStyleData().modoLight;
        definirTema(!light);
    }
}

//define o tema de uma pagina
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
    saveStyleData(new estiloDataC(light));
}
//-------------------------------Funcoes Especiais para cada pagina

//Funcoes da pagina Principal
if (document.getElementById("principal")) {
    let botao = document.getElementById("botao");
    let arrays = openArrayData();
    updateButton();
    botao.onclick = async function () {
        await saveTime();
        updateButton();
    }
}

//Cria uma tabela com os horarios
function creatTable(array) {
    const tBody = document.getElementById("TabelaHorario");
    array.forEach((element,indice) => {
        let novalinha = document.createElement("tr");
        let {horas, min, seg} = tempoDecorrido(element[0],element[1]);
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

//Funcoes da pagina da tabela
if(document.getElementById("tabela")){
    const clearButton = document.getElementById("clearHistory");
    let array = openArrayData().horarios;
    creatTable(array);
    clearButton.onclick = function(){
        let senha = window.prompt("Confirme a limpeza digitando `Sim` da mesma forma:");
        if(senha == "Sim"){
            clearArrays();
        }
    }
}