const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//Carregando as imagens do caramelo, do fundo, do carro, da moto e da tela de morte
const carameloImg = new Image();
carameloImg.src = 'caramelo_andando_sprite.png';

const fundoImg = new Image();
fundoImg.src = 'fundo.png';

const carroImg = new Image();
carroImg.src = 'taxi_sprite.png';

const motoImg = new Image();
motoImg.src = 'moto_sprite.png';

const telaMorteImg = new Image();
telaMorteImg.src = 'telaDeMorte.png';

//Configurando o fundo de acordo com a proporção da imagem
const fundo = {
    x: 0,
    largura: 900,
    altura: canvas.height,
    velocidade: 4
};

//Configurando a altura do chão
const chaoY = 295;

//Configurando os quadros da animação do caramelo
const sprite = {
    totalQuadros: 8,      
    quadroAtual: 0,       
    larguraQuadro: 400,    
    alturaQuadro: 245,     
    contadorFrames: 0,
    velocidadeAnimacao: 6
};

//Configurando os quadros da animação do carro
const carroSprite = {
    totalQuadros: 8,       
    quadroAtual: 0,        
    larguraQuadro: 272,    
    alturaQuadro: 194,     
    contadorFrames: 0,
    velocidadeAnimacao: 5
};

//Configurando os quadros da animação da moto
const motoSprite = {
    totalQuadros: 8,
    quadroAtual: 0,
    larguraQuadro: 100,
    alturaQuadro: 100,
    contadorFrames: 0,
    velocidadeAnimacao: 5
};

//Criando o objeto do player (caramelo)
const caramelo = {
    x: 60,
    y: chaoY - 60,
    largura: 70,
    altura: 60,
    velocidadeY: 0,
    gravidade: 0.8,
    forcaPulo: -15,
    noChao: true
};

//Estado de game over e área do botão REINICIAR na tela de morte
let gameOver = false;
const botaoReiniciar = {
    xInicio: 0.38,
    xFim: 0.62,
    yInicio: 0.81,
    yFim: 0.97
};

//Pontuação e recorde
let pontos = 0;
let contadorPontos = 0;
let recorde = Number(localStorage.getItem('recordeCaramelo')) || 0;

//Lista que guarda os carros que aparecem na tela
let carros = [];
let tempoProximoCarro = sortearTempoCarro();

//Lista que guarda as motos que aparecem na tela
let motos = [];
let tempoProximaMoto = sortearTempoMoto();

//Distância mínima entre obstáculos para não virem colados ou no mesmo tempo
const distanciaMinimaSpawn = 240;

//Função que verifica se já tem carro ou moto muito perto do spawn
function spawnOcupado() {
    for (let i = 0; i < carros.length; i++) {
        if (carros[i].x + carros[i].largura > canvas.width - distanciaMinimaSpawn) {
            return true;
        }
    }

    for (let i = 0; i < motos.length; i++) {
        if (motos[i].x + motos[i].largura > canvas.width - distanciaMinimaSpawn) {
            return true;
        }
    }

    return false;
}

//Função que sorteia um tempo entre 1s e 4s para criar o próximo carro
function sortearTempoCarro() {
    const tempoMinimo = 60;  
    const tempoMaximo = 240; 
    return Math.floor(Math.random() * (tempoMaximo - tempoMinimo + 1)) + tempoMinimo;
}

//Função que sorteia um tempo para criar a próxima moto
function sortearTempoMoto() {
    const tempoMinimo = 90;  
    const tempoMaximo = 260; 
    return Math.floor(Math.random() * (tempoMaximo - tempoMinimo + 1)) + tempoMinimo;
}

//Função que cria um novo carro fora da tela
function criarCarro() {
    const larguraCarro = 98;
    const alturaCarro = 70;

    carros.push({
        x: canvas.width,
        y: chaoY - alturaCarro,
        largura: larguraCarro,
        altura: alturaCarro,
        velocidade: 6,
        pontuou: false
    });
}

//Função que cria uma nova moto fora da tela
function criarMoto() {
    const larguraMoto = 85;
    const alturaMoto = Math.round(larguraMoto * (motoSprite.alturaQuadro / motoSprite.larguraQuadro));

    motos.push({
        x: canvas.width,
        y: chaoY - alturaMoto,
        largura: larguraMoto,
        altura: alturaMoto,
        velocidade: 7,
        pontuou: false
    });
}

//Função que atualiza e salva o recorde se a pontuação atual for maior
function atualizarRecorde() {
    if (pontos > recorde) {
        recorde = pontos;
        localStorage.setItem('recordeCaramelo', recorde);
    }
}

//Função que reinicia o jogo inteiro quando clica no botão REINICIAR
function reiniciarJogo() {
    gameOver = false;
    atualizarRecorde();
    pontos = 0;
    contadorPontos = 0;

    carros = [];
    tempoProximoCarro = sortearTempoCarro();

    motos = [];
    tempoProximaMoto = sortearTempoMoto();

    fundo.x = 0;

    caramelo.y = chaoY - caramelo.altura;
    caramelo.velocidadeY = 0;
    caramelo.noChao = true;

    sprite.quadroAtual = 0;
    sprite.contadorFrames = 0;
    carroSprite.quadroAtual = 0;
    carroSprite.contadorFrames = 0;
    motoSprite.quadroAtual = 0;
    motoSprite.contadorFrames = 0;
}

//Função que verifica se o caramelo encostou em algum obstáculo
function verificarColisao(player, obstaculo) {
    const margemX = 14;
    const margemY = 12;

    return (
        player.x + margemX < obstaculo.x + obstaculo.largura - margemX &&
        player.x + player.largura - margemX > obstaculo.x + margemX &&
        player.y + margemY < obstaculo.y + obstaculo.altura - margemY &&
        player.y + player.altura - margemY > obstaculo.y + margemY
    );
}

//Função que faz o cachorro pular
function pular() {
    if (gameOver) return;

    if (caramelo.noChao) {
        caramelo.velocidadeY = caramelo.forcaPulo;
        caramelo.noChao = false;
    }
}

//Função que verifica se o clique/toque caiu no botão REINICIAR da tela de morte
function verificarCliqueTelaMorte(evento) {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clienteX = evento.touches ? evento.touches[0].clientX : evento.clientX;
    const clienteY = evento.touches ? evento.touches[0].clientY : evento.clientY;

    const xCanvas = ((clienteX - rect.left) / rect.width) * canvas.width;
    const yCanvas = ((clienteY - rect.top) / rect.height) * canvas.height;

    const dentroX = xCanvas >= canvas.width * botaoReiniciar.xInicio && xCanvas <= canvas.width * botaoReiniciar.xFim;
    const dentroY = yCanvas >= canvas.height * botaoReiniciar.yInicio && yCanvas <= canvas.height * botaoReiniciar.yFim;

    if (dentroX && dentroY) {
        reiniciarJogo();
    }
}

//Configurando os botões para pular e reiniciar na tela de morte
document.addEventListener('keydown', (evento) => {
    if (gameOver && (evento.code === 'Enter' || evento.code === 'Space')) {
        reiniciarJogo();
        return;
    }

    if (evento.code === 'Space' || evento.code === 'ArrowUp') {
        pular();
    }
});

canvas.addEventListener('touchstart', (evento) => {
    if (gameOver) {
        verificarCliqueTelaMorte(evento);
    } else {
        pular();
    }
});

canvas.addEventListener('mousedown', (evento) => {
    if (gameOver) {
        verificarCliqueTelaMorte(evento);
    } else {
        pular();
    }
});

//Função que desenha os pontos e o recorde no canto superior direito
function desenharPontuacao() {
    ctx.save();
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    const textoPontos = `PONTOS: ${pontos}`;
    const textoRecorde = `RECORDE: ${recorde}`;

    ctx.strokeText(textoPontos, canvas.width - 20, 32);
    ctx.fillText(textoPontos, canvas.width - 20, 32);

    ctx.font = 'bold 16px Arial';
    ctx.strokeText(textoRecorde, canvas.width - 20, 56);
    ctx.fillText(textoRecorde, canvas.width - 20, 56);
    ctx.restore();
}

//Função que atualiza a física e a movimentação
function atualizar() {
    if (gameOver) return;

    //Soma +1 ponto a cada 6 frames de corrida
    contadorPontos++;
    if (contadorPontos >= 6) {
        pontos++;
        contadorPontos = 0;
        atualizarRecorde();
    }

    fundo.x -= fundo.velocidade;

    if (fundo.x <= -fundo.largura) {
        fundo.x = 0;
    }

    caramelo.velocidadeY += caramelo.gravidade;
    caramelo.y += caramelo.velocidadeY;

    if (caramelo.y >= chaoY - caramelo.altura) {
        caramelo.y = chaoY - caramelo.altura;
        caramelo.velocidadeY = 0;
        caramelo.noChao = true;
    }

    if (caramelo.noChao) {
        sprite.contadorFrames++;

        if (sprite.contadorFrames >= sprite.velocidadeAnimacao) {
            sprite.quadroAtual = (sprite.quadroAtual + 1) % sprite.totalQuadros;
            sprite.contadorFrames = 0;
        }
    } else {
        sprite.quadroAtual = 1;
    }

    carroSprite.contadorFrames++;
    if (carroSprite.contadorFrames >= carroSprite.velocidadeAnimacao) {
        carroSprite.quadroAtual = (carroSprite.quadroAtual + 1) % carroSprite.totalQuadros;
        carroSprite.contadorFrames = 0;
    }

    motoSprite.contadorFrames++;
    if (motoSprite.contadorFrames >= motoSprite.velocidadeAnimacao) {
        motoSprite.quadroAtual = (motoSprite.quadroAtual + 1) % motoSprite.totalQuadros;
        motoSprite.contadorFrames = 0;
    }

    //Controlando o tempo para aparecer novos carros
    tempoProximoCarro--;
    if (tempoProximoCarro <= 0) {
        if (!spawnOcupado()) {
            criarCarro();
            tempoProximoCarro = sortearTempoCarro();
        } else {
            tempoProximoCarro = 20;
        }
    }

    //Movendo cada carro e verificando colisão e pontuação ao passar
    for (let i = carros.length - 1; i >= 0; i--) {
        const carro = carros[i];
        carro.x -= carro.velocidade;

        if (!carro.pontuou && carro.x + carro.largura < caramelo.x) {
            carro.pontuou = true;
            pontos += 10;
            atualizarRecorde();
        }

        if (verificarColisao(caramelo, carro)) {
            atualizarRecorde();
            gameOver = true;
            break;
        }

        if (carro.x + carro.largura < 0) {
            carros.splice(i, 1);
        }
    }

    //Controlando o tempo para aparecer novas motos
    tempoProximaMoto--;
    if (tempoProximaMoto <= 0) {
        if (!spawnOcupado()) {
            criarMoto();
            tempoProximaMoto = sortearTempoMoto();
        } else {
            tempoProximaMoto = 20;
        }
    }

    //Movendo cada moto e verificando colisão e pontuação ao passar
    for (let i = motos.length - 1; i >= 0; i--) {
        const moto = motos[i];
        moto.x -= moto.velocidade;

        if (!moto.pontuou && moto.x + moto.largura < caramelo.x) {
            moto.pontuou = true;
            pontos += 15;
            atualizarRecorde();
        }

        if (verificarColisao(caramelo, moto)) {
            atualizarRecorde();
            gameOver = true;
            break;
        }

        if (moto.x + moto.largura < 0) {
            motos.splice(i, 1);
        }
    }
}

//Função que desenha tudo na tela
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fundoImg, fundo.x, 0, fundo.largura, fundo.altura);
    ctx.drawImage(fundoImg, fundo.x + fundo.largura, 0, fundo.largura, fundo.altura);

    const recorteX = sprite.quadroAtual * sprite.larguraQuadro;

    ctx.drawImage(
        carameloImg,
        recorteX, 0, sprite.larguraQuadro, sprite.alturaQuadro,
        caramelo.x, caramelo.y, caramelo.largura, caramelo.altura
    );

    const recorteCarroX = carroSprite.quadroAtual * carroSprite.larguraQuadro;

    for (let i = 0; i < carros.length; i++) {
        const carro = carros[i];
        ctx.drawImage(
            carroImg,
            recorteCarroX, 0, carroSprite.larguraQuadro, carroSprite.alturaQuadro,
            carro.x, carro.y, carro.largura, carro.altura
        );
    }

    const recorteMotoX = motoSprite.quadroAtual * motoSprite.larguraQuadro;

    for (let i = 0; i < motos.length; i++) {
        const moto = motos[i];
        ctx.drawImage(
            motoImg,
            recorteMotoX, 0, motoSprite.larguraQuadro, motoSprite.alturaQuadro,
            moto.x, moto.y, moto.largura, moto.altura
        );
    }

    desenharPontuacao();

    if (gameOver) {
        ctx.drawImage(telaMorteImg, 0, 0, canvas.width, canvas.height);
    }
}

//Fazendo o loop principal do jogo, que roda o tempo todo
function gameLoop() {
    atualizar();
    desenhar();
    requestAnimationFrame(gameLoop);
}

//Quantidade de imagens carregadas
let imagensCarregadas = 0;

//Função que inicia o loop principal do jogo logo após carregar as 5 imagens
function verificarCarregamento() {
    motoSprite.larguraQuadro = motoImg.naturalWidth / motoSprite.totalQuadros;
    motoSprite.alturaQuadro = motoImg.naturalHeight;

    imagensCarregadas++;

    //SE a quantidade de imagens carregas for igual a quantidade de imagens, começa
    if (imagensCarregadas === 5) {
        gameLoop();
    }
}

carameloImg.onload = verificarCarregamento;
fundoImg.onload = verificarCarregamento;
carroImg.onload = verificarCarregamento;
motoImg.onload = verificarCarregamento;
telaMorteImg.onload = verificarCarregamento;