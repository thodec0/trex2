var fimDeJogo, fimimg, reinicioimg, restart, restartimg;
var trex, trex_correndo, trex_parado;
var solo, soloimg;
var soloinvisivel;
var nuvemimg;
var pontuacao = 0;
var tempoSomFim0 = 60;
var Obs_1, Obs_2, Obs_3, Obs_4, Obs_5, Obs_6;
var somSalto, somFim, somPonto;
var soloVx0 = -7;
var delGrav = 0.5;

var JOGAR = 1;
var ENCERRAR = 0;
var estado = JOGAR;

function preload() {
  trex_correndo = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trex_parado = loadAnimation("trex_collided.png");
  soloimg = loadImage("ground2.png");
  nuvemimg = loadImage("cloud.png");
  Obs_1 = loadImage("obstacle1.png");
  Obs_2 = loadImage("obstacle2.png");
  Obs_3 = loadImage("obstacle3.png");
  Obs_4 = loadImage("obstacle4.png");
  Obs_5 = loadImage("obstacle5.png");
  Obs_6 = loadImage("obstacle6.png");

  fimimg = loadImage("gameOver.png");
  restartimg = loadImage("restart.png");

  somSalto = loadSound("jump.mp3");
  somFim = loadSound("die.mp3");
  somPonto = loadSound("checkPoint.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
 


  //criar grupos para as nuvens e obstáculos:
  grupoNuvens = createGroup();
  grupoObstaculos = createGroup();

  //texto de Fim de jogo:
  fimDeJogo = createSprite(width/600*300, height/200*100);
  fimDeJogo.addImage(fimimg);
  fimDeJogo.scale = 0.5;
  fimDeJogo.visible = false;

  restart = createSprite(width/600*300, height/250*150);
  restart.addImage(restartimg);
  restart.scale = 0.5;
  restart.visible = false;

  //criar um sprite do trex
  trex = createSprite(width/600*50, height/200*160, width/600*20, height/200*50);
  trex.addAnimation("runing", trex_correndo);
  trex.addAnimation("parado", trex_parado);
  trex.scale = 0.5;
  //trex.debug = true;
  //trex.setCollider("rectangle", 0, 0, trex.width+200, trex.height);

  trex.setCollider("circle", 0, 0, 40);

  //criar uma sprite para o solo
  solo = createSprite(width/600*200, height/200*195, width/600*400, height/200*20);
  solo.addImage(soloimg);
  solo.velocityX = soloVx0;

  //criar solo invisivel
  soloinvisivel = createSprite(width/600*200, height/200*200, width/600*400, height/200*5);

  //console.log("OI"+" "+"Mundo");
}

function draw() {
  background("white");
  // console.log("este é o estado: " + estado);
  
  if (estado === JOGAR) {
    geranuvem();
    geraObstaculos();
    
    // pontuacao:
    pontuacao = pontuacao + Math.round(frameRate()/60) ;    

    // nível:
    solo.velocityX = soloVx0 - (3 * pontuacao)/500;
    tempoSomFim = tempoSomFim0;
  } else {
    trex.changeAnimation("parado");
    solo.velocityX = 0;
    
    grupoNuvens.setVelocityXEach(0);
    grupoObstaculos.setVelocityXEach(0);    
    grupoNuvens.setLifetimeEach(-1);
    grupoObstaculos.setLifetimeEach(-1);

    fimDeJogo.visible = true;
    restart.visible = true;
    fimDeJogo.depth = grupoNuvens.depth + 10;
    restart.depth = grupoNuvens.depth + 10;
    tempoSomFim = tempoSomFim - Math.round(frameRate()/60);
  }
  if (grupoObstaculos.isTouching(trex)) {
    
    estado = ENCERRAR;
    //trex.velocityY = -10;
    somSalto.play();
    if (tempoSomFim > 0) {
      somFim.play();
      //console.log(tempoSomFim);
    }
  }
  if((touches.length > 0 || mousePressedOver(restart)) && estado === ENCERRAR){
    //console.log("reiniciar o jogo");
    reset();
    touches = [];
  }

  if (pontuacao > 0 && pontuacao % 500 === 0) {
    somPonto.play();
    solo.velocityX = solo.velocityX - 1;
    delGrav = delGrav + 0.05;
  }
  

  //controle de salto do trex
  if ((touches.length > 0 || keyDown("space")) && trex.y >= 600) {
    trex.velocityY = -10;
    somSalto.play();
    touches = [];
  }
  //gravidade
  trex.velocityY = trex.velocityY + delGrav;

  //colisao com o soloinvisivel
  trex.collide(soloinvisivel);
  soloinvisivel.visible = false;

  //reinicia solo => solo infinito:
  if (solo.x < solo.width/3) {
    solo.x = solo.width/2;
  }
  

  drawSprites();
  text("Pontuação: " + pontuacao + " seg", width/600*450, height/200*20);
}

function reset(){
  
  pontuacao = 0;
  
  fimDeJogo.visible = false;
  restart.visible = false;
  
  grupoNuvens.destroyEach();
  grupoObstaculos.destroyEach();
  
  trex.changeAnimation("runing");
  
  estado = JOGAR;
  solo.velocityX = soloVx0;
  
  
  
}
function geranuvem() {
  if (frameCount % 60 === 0) {
    var nuvem = createSprite(width/600*601, height/200*150, width/600*40, height/200*10);
    nuvem.velocityX = -3;

    //tempo de vida:
    nuvem.lifetime = Math.abs(width / nuvem.velocityX);

    //adiona a imagem:
    nuvem.addImage(nuvemimg);

    //adiciona posição aleatória:
    nuvem.y = Math.round(random(1, height/200*125));

    //dimensiona:
    //nuvem.scale = 0.4;
    nuvem.scale = random(0.25, 0.6);

    //profundidade:
    trex.depth = nuvem.depth + 10;
    //nuvem.depth = trex.depth;
    //trex.depth = trex.depth + 1;

    grupoNuvens.add(nuvem);
     
  }
}

function geraObstaculos() {
  if (frameCount % 60 === 0) {
    var obstaculo = createSprite(width/600*601, height/200*195, width/600*10, height/200*40);
   
    obstaculo.velocityX = solo.velocityX;

    var tipoObstaculo = Math.round(random(1, 6));

    switch (tipoObstaculo) {
      case 1:
        obstaculo.addImage(Obs_1);
        break;
      case 2:
        obstaculo.addImage(Obs_2);
        break;
      case 3:
        obstaculo.addImage(Obs_3);
        break;
      case 4:
        obstaculo.addImage(Obs_4);
        break;
      case 5:
        obstaculo.addImage(Obs_5);
        break;
      case 6:
        obstaculo.addImage(Obs_6);
        break;
    }

    obstaculo.scale = 0.5;
    //obstaculo.debug = true;
    obstaculo.lifetime = Math.abs(width / obstaculo.velocityX);
    grupoObstaculos.add(obstaculo);
    
  }
  
  
}
