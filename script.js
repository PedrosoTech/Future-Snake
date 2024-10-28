// Configuração inicial do canvas
const tela = document.getElementById('cobrinha');
const contexto = tela.getContext('2d');

// Definir dimensões 16:9
const LARGURA = 800;
const ALTURA = 450;
tela.width = LARGURA;
tela.height = ALTURA;

// Tamanho de cada quadrado ajustado para as novas dimensões
const quadrado = ALTURA / 20;

// Cobrinha inicial com duas unidades
let cobrinha = [
    { // Cabeça
        x: Math.floor(LARGURA / (2 * quadrado)) * quadrado,
        y: Math.floor(ALTURA / (2 * quadrado)) * quadrado
    },
    { // Primeira parte do corpo
        x: Math.floor(LARGURA / (2 * quadrado)) * quadrado - quadrado,
        y: Math.floor(ALTURA / (2 * quadrado)) * quadrado
    }
];

// Comida inicial
let comida = criarComida();

// Direção inicial
let direcao = "direita";
let pontos = 0;

// Velocidade inicial
let velocidadeJogo = 100;
let jogo;
let jogoIniciado = false;

// Controles
function atualizarDirecao(evento) {
    // Setas do teclado
    if(evento.keyCode == 37 && direcao != "direita") direcao = "esquerda";
    if(evento.keyCode == 38 && direcao != "baixo") direcao = "cima";
    if(evento.keyCode == 39 && direcao != "esquerda") direcao = "direita";
    if(evento.keyCode == 40 && direcao != "cima") direcao = "baixo";
    
    // Teclas WASD
    if((evento.keyCode == 65 || evento.key == 'a') && direcao != "direita") direcao = "esquerda";    // A
    if((evento.keyCode == 87 || evento.key == 'w') && direcao != "baixo") direcao = "cima";          // W
    if((evento.keyCode == 68 || evento.key == 'd') && direcao != "esquerda") direcao = "direita";    // D
    if((evento.keyCode == 83 || evento.key == 's') && direcao != "cima") direcao = "baixo";          // S
}

function verificarColisao(x, y) {
    // Colisão com as paredes
    if(x < 0 || x >= LARGURA || y < 0 || y >= ALTURA) {
        return true;
    }
    
    // Colisão com o próprio corpo (exceto a cabeça)
    for(let i = 1; i < cobrinha.length; i++) {
        if(cobrinha[i].x === x && cobrinha[i].y === y) {
            return true;
        }
    }
    
    return false;
}

function criarComida() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (LARGURA / quadrado)) * quadrado;
        y = Math.floor(Math.random() * (ALTURA / quadrado)) * quadrado;
    } while (cobrinha.some(segmento => segmento.x === x && segmento.y === y));
    
    return { x, y };
}

function desenharJogo() {
    // Limpar o canvas antes de desenhar o novo frame
    contexto.fillStyle = "#04040c";
    contexto.fillRect(0, 0, LARGURA, ALTURA);
    
    // Desenhar a cobra como um caminho contínuo
    if (cobrinha.length > 0) {
        contexto.beginPath();
        contexto.moveTo(cobrinha[0].x + quadrado/2, cobrinha[0].y + quadrado/2);
        
        // Criar um gradiente para a cobra
        let gradiente = contexto.createLinearGradient(
            cobrinha[0].x, cobrinha[0].y,
            cobrinha[cobrinha.length-1].x, cobrinha[cobrinha.length-1].y
        );
        gradiente.addColorStop(0, "#4CAF50");    // Cor da cabeça
        gradiente.addColorStop(1, "#81C784");    // Cor do corpo
        
        contexto.strokeStyle = gradiente;
        contexto.lineWidth = quadrado - 2;
        contexto.lineCap = 'round';
        contexto.lineJoin = 'round';

        // Desenhar o corpo da cobra como uma linha suave
        for (let i = 1; i < cobrinha.length; i++) {
            let xc = (cobrinha[i].x + cobrinha[i-1].x) / 2 + quadrado/2;
            let yc = (cobrinha[i].y + cobrinha[i-1].y) / 2 + quadrado/2;
            contexto.quadraticCurveTo(
                cobrinha[i-1].x + quadrado/2, 
                cobrinha[i-1].y + quadrado/2,
                xc, yc
            );
        }
        
        // Conectar até o último segmento
        if (cobrinha.length > 1) {
            contexto.quadraticCurveTo(
                cobrinha[cobrinha.length-1].x + quadrado/2,
                cobrinha[cobrinha.length-1].y + quadrado/2,
                cobrinha[cobrinha.length-1].x + quadrado/2,
                cobrinha[cobrinha.length-1].y + quadrado/2
            );
        }
        
        contexto.stroke();
        
        // Desenhar a cabeça da cobra
        contexto.beginPath();
        contexto.fillStyle = "#4CAF50";
        contexto.arc(
            cobrinha[0].x + quadrado/2,
            cobrinha[0].y + quadrado/2,
            quadrado/2 - 1,
            0,
            Math.PI * 2
        );
        contexto.fill();
    }

    // Desenhar a maçã usando a imagem
    contexto.drawImage(
        imagemMaca,
        comida.x,
        comida.y,
        quadrado - 1,
        quadrado - 1
    );
    
    let cobrinhaX = cobrinha[0].x;
    let cobrinhaY = cobrinha[0].y;
    
    if(direcao == "direita") cobrinhaX += quadrado;
    if(direcao == "esquerda") cobrinhaX -= quadrado;
    if(direcao == "cima") cobrinhaY -= quadrado;
    if(direcao == "baixo") cobrinhaY += quadrado;
    
    if(verificarColisao(cobrinhaX, cobrinhaY)) {
        clearInterval(jogo);
        mostrarGameOver();
        return;
    }
    
    if(cobrinhaX == comida.x && cobrinhaY == comida.y) {
        pontos += 1;
        document.getElementById('pontos').innerHTML = pontos;
        comida = criarComida();
    } else {
        cobrinha.pop();
    }
    
    let novaCabeca = {
        x: cobrinhaX,
        y: cobrinhaY
    };
    
    cobrinha.unshift(novaCabeca);
    
    // Após desenhar a cabeça da cobra, adicione:
    desenharLingua(cobrinha[0].x, cobrinha[0].y, direcao);
}

function mostrarGameOver() {
    const modal = document.getElementById('modalGameOver');
    const pontuacaoFinal = document.getElementById('pontuacaoFinal');
    pontuacaoFinal.textContent = pontos;
    modal.style.display = 'flex';
}

function reiniciarJogo() {
    // Resetar variáveis do jogo com duas unidades
    const centroX = Math.floor(LARGURA / (2 * quadrado)) * quadrado;
    const centroY = Math.floor(ALTURA / (2 * quadrado)) * quadrado;
    
    cobrinha = [
        { // Cabeça
            x: centroX,
            y: centroY
        },
        { // Primeira parte do corpo
            x: centroX - quadrado,
            y: centroY
        }
    ];
    
    direcao = "direita";
    pontos = 0;
    document.getElementById('pontos').innerHTML = pontos;
    comida = criarComida();
    
    // Esconder o modal
    const modal = document.getElementById('modalGameOver');
    modal.style.display = 'none';
    
    // Reiniciar o intervalo do jogo com a velocidade atual
    clearInterval(jogo);
    const selectVelocidade = document.getElementById('velocidade');
    velocidadeJogo = parseInt(selectVelocidade.value);
    jogoIniciado = false;
}

// Inicializar o jogo apenas quando uma tecla for pressionada
document.addEventListener('keydown', function(evento) {
    if (!jogoIniciado) {
        iniciarJogo();
        jogoIniciado = true;
    }
    atualizarDirecao(evento);
});

function iniciarJogo() {
    const selectVelocidade = document.getElementById('velocidade');
    velocidadeJogo = parseInt(selectVelocidade.value);
    jogo = setInterval(desenharJogo, velocidadeJogo);
}

// Carregar a imagem da maçã
const imagemMaca = new Image();
imagemMaca.src = 'assets/apple.png';

// Desenhar o primeiro frame do jogo
desenharJogo();

function desenharLingua(x, y, direcao) {
    const comprimentoLingua = quadrado / 3;
    const larguraBifurcacao = quadrado / 11;
    
    contexto.beginPath();
    contexto.strokeStyle = "#FF69B4";
    contexto.lineWidth = 1.5;
    
    // Posição base no centro da cabeça
    let baseX = x + quadrado/2;
    let baseY = y + quadrado/2;
    
    // Calcular pontos de controle e pontas
    let pontoControleX, pontoControleY, ponta1X, ponta1Y, ponta2X, ponta2Y;
    
    switch(direcao) {
        case "direita":
            pontoControleX = baseX + comprimentoLingua * 0.3;
            pontoControleY = baseY;
            ponta1X = baseX + comprimentoLingua * 0.7;
            ponta1Y = baseY - larguraBifurcacao;
            ponta2X = baseX + comprimentoLingua * 0.7;
            ponta2Y = baseY + larguraBifurcacao;
            break;
        case "esquerda":
            pontoControleX = baseX - comprimentoLingua * 0.3;
            pontoControleY = baseY;
            ponta1X = baseX - comprimentoLingua * 0.7;
            ponta1Y = baseY - larguraBifurcacao;
            ponta2X = baseX - comprimentoLingua * 0.7;
            ponta2Y = baseY + larguraBifurcacao;
            break;
        case "cima":
            pontoControleX = baseX;
            pontoControleY = baseY - comprimentoLingua * 0.3;
            ponta1X = baseX - larguraBifurcacao;
            ponta1Y = baseY - comprimentoLingua * 0.7;
            ponta2X = baseX + larguraBifurcacao;
            ponta2Y = baseY - comprimentoLingua * 0.7;
            break;
        case "baixo":
            pontoControleX = baseX;
            pontoControleY = baseY + comprimentoLingua * 0.3;
            ponta1X = baseX - larguraBifurcacao;
            ponta1Y = baseY + comprimentoLingua * 0.7;
            ponta2X = baseX + larguraBifurcacao;
            ponta2Y = baseY + comprimentoLingua * 0.7;
            break;
    }
    
    // Desenhar a primeira parte da bifurcação
    contexto.beginPath();
    contexto.moveTo(baseX, baseY);
    contexto.quadraticCurveTo(pontoControleX, pontoControleY, ponta1X, ponta1Y);
    contexto.stroke();
    
    // Desenhar a segunda parte da bifurcação
    contexto.beginPath();
    contexto.moveTo(baseX, baseY);
    contexto.quadraticCurveTo(pontoControleX, pontoControleY, ponta2X, ponta2Y);
    contexto.stroke();
}
