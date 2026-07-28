// Pega o canvas e o contexto de desenho 2D
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Spritesheet com as imagens do jogo
const img = new Image();
img.src = "/media/flappy-bird-set.png";

let gamePlaying = false; // false = tela inicial, true = jogando

const gravity = 0.5;   // gravidade aplicada a cada frame
const speed = 4;       // velocidade dos canos e do fundo
const size = [60, 36];  // tamanho do pássaro
const jump = -11.5;    // impulso do pulo

const cTenth = canvas.width / 10; // posição X fixa do pássaro

const pipeWidth = 78;
const pipeGap = 270;

// Gera uma altura aleatória pra abertura do cano
const pipeLoc = () =>
  Math.random() * (canvas.height - (pipeGap + pipeWidth) - pipeWidth) +
  pipeWidth;

let index = 0,
  bestScore = Number(localStorage.getItem("flappyBestScore")) || 0,
  currentScore = 0,
  pipes = [],
  flight,
  flyHeight;

// (Re)inicia o jogo
const setup = () => {
  currentScore = 0;
  flight = jump;
  flyHeight = canvas.height / 2 - size[1] / 2;

  pipes = Array(3)
    .fill()
    .map((a, i) => [canvas.width + i * (pipeGap + pipeWidth), pipeLoc()]);
};

// Desenha um frame do jogo
const render = () => {
  index++;

  // Fundo com rolagem contínua
  ctx.drawImage(
    img, 0, 0, canvas.width, canvas.height,
    -((index * (speed / 2)) % canvas.width) + canvas.width, 0,
    canvas.width, canvas.height
  );
  ctx.drawImage(
    img, 0, 0, canvas.width, canvas.height,
    -((index * (speed / 2)) % canvas.width), 0,
    canvas.width, canvas.height
  );

  if (gamePlaying) {
    // Pássaro em movimento
    ctx.drawImage(
      img, 432, Math.floor((index % 9) / 3) * size[1], ...size,
      cTenth, flyHeight, ...size
    );

    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    // Tela inicial
    ctx.drawImage(
      img, 432, Math.floor((index % 9) / 3) * size[1], ...size,
      canvas.width / 2 - size[0] / 2, flyHeight, ...size
    );

    flyHeight = canvas.height / 2 - size[1] / 2;

    ctx.font = "bold 30px courier";
    ctx.fillText(`Melhor recorde: ${bestScore}`, 55, 245);
    ctx.fillText(`Aperte para jogar`, 48, 535);
  }

  if (gamePlaying) {
    pipes.map((pipe) => {
      pipe[0] -= speed;

      // Cano de cima
      ctx.drawImage(
        img, 432, 588 - pipe[1], pipeWidth, pipe[1],
        pipe[0], 0, pipeWidth, pipe[1]
      );
      // Cano de baixo
      ctx.drawImage(
        img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap,
        pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap
      );

      // Cano saiu da tela: soma ponto e cria um novo
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        bestScore = Math.max(bestScore, currentScore);
        localStorage.setItem("flappyBestScore", bestScore);

        pipes = [
          ...pipes.slice(1),
          [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()],
        ];
      }

      // Checa colisão
      if (
        [
          pipe[0] <= cTenth + size[0],
          pipe[0] + pipeWidth >= cTenth,
          pipe[1] > flyHeight ||
            pipe[1] + pipeGap < flyHeight + size[1],
        ].every((elem) => elem)
      ) {
        gamePlaying = false;
        setup();
      }
    });
  }

  // Score fora do canvas
  document.getElementById("bestScore").innerHTML = `MELHOR: ${bestScore}`;
  document.getElementById("currentScore").innerHTML = `ATUAL: ${currentScore}`;

  window.requestAnimationFrame(render);
};

img.onload = render;
setup();

// Ação de pular / começar, usada pelo clique, toque e teclado
const handleAction = () => {
  gamePlaying = true;
  flight = jump;
};

document.addEventListener("click", handleAction);

document.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleAction();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    handleAction();
  }
});