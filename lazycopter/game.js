/// <reference path = "../phaser.d.ts" />

{ // variables
    var bg1;
    var collider1;
    var deathText;
    var gamestart = false;
    var gameRestart = false;
    var hiscore = 0;
    var hiscoreText;
    var isDead = false;
    var lastObstacleOffset = 80;
    var lastObstacleDistance = 320;
    var logo;
    var obstaclesBottom = [];
    var obstaclesTop = [];
    var obstaclesMid = [];
    var obstacleOffsetAmplitude = 80;
    var obstacleDistanceAmplitude = 170;
    var obstacleVelocity = 180;
    var player;
    var playerGravity = 300;
    var score = 0;
    var scoreText;
    var scoreTimer;
    var startText;
}

config = {
    type: Phaser.AUTO,
    backgroundColor: 0x050c1f,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 540,
        height: 960,
    },
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: {y:0},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    fps: {
        target: 60,
        min: 30,
        forceSetTimeOut: true
    },
    audio: {
        disableWebAudio: true
    }
};

game = new Phaser.Game(config);


function preload(){
    this.load.spritesheet('player', 'assets/playerSpritesheet.png', { frameWidth: 100, frameHeight: 58 });
    this.load.image('obstacle1', 'assets/obstacle1.png');
    this.load.image('obstacle2', 'assets/obstacle2.png');
    this.load.image('deathText', 'assets/deathText.png');
    this.load.image('startText', 'assets/startText.png');
    this.load.image('logo', 'assets/logo.png');
}

function create(){
    bg1 = this.add.graphics();
    bg1.fillGradientStyle(0x151e34, 0x151e34, 0x1a3144, 0x1a3144, 1);
    bg1.fillRect(0, 0, 540, 960);

    logo = this.add.sprite(270, 280, 'logo').setVisible(false);
    logo.depth = 10;

    scoreText = this.add.text(25, 60, '0', { fontFamily: '"font1", Arial Black', color: '#bbc8e6'} );
    scoreText.setFontSize(50);
    scoreText.depth = 10;
    scoreText.setStroke('#0090ff', 3);

    hiscoreText = this.add.text(25, 35, 'HI ' + hiscore, { fontFamily: '"font1", Arial Black', color: '#bbc8e6'} );
    hiscoreText.setFontSize(20);
    hiscoreText.depth = 10;
    hiscoreText.setStroke('#0090ff', 3);

    startText = this.add.sprite(270, 700, 'startText').setVisible(false);
    startText.depth = 10;

    deathText = this.add.sprite(270, 500, 'deathText').setVisible(false);
    deathText.depth = 10;

    collider1 = this.physics.add.sprite(-120, 480, 'obstacle1').setVisible(false).setImmovable(true);
    
    player = this.physics.add.sprite(120, 480, 'player').setImmovable(true).setCollideWorldBounds(true);
    if (!gameRestart) {
        player.setGravityY(playerGravity);
        this.physics.pause();
        logo.setVisible(true);
        startText.setVisible(true);
    } else {
        player.body.setGravityY(-playerGravity);
    }
    player.body.setSize(68, 58, true);
    player.body.offset.x = 32;
    player.depth = 2;

    this.anims.create({
        key: 'propeller',
        frames: this.anims.generateFrameNumbers('player', {start: 0, end: 1}),
        frameRate: 20,
        repeat: -1
    });

    player.play('propeller');

    for (var i=0; i<=10; i++) {
        obstaclesTop[i] = this.physics.add.sprite(i*60, -lastObstacleDistance, 'obstacle1').setImmovable(true).setVelocity(-obstacleVelocity, 0).setName('top');
        obstaclesBottom[i] = this.physics.add.sprite(i*60, 960+lastObstacleDistance, 'obstacle1').setImmovable(true).setVelocity(-obstacleVelocity, 0).setName('bottom');
        this.physics.add.overlap(obstaclesTop[i], collider1, obstacleReposition, null, this);
        this.physics.add.overlap(obstaclesBottom[i], collider1, obstacleReposition, null, this);
        this.physics.add.collider(player, obstaclesTop[i], die, null, this);
        this.physics.add.collider(player, obstaclesBottom[i], die, null, this);
    }
    for (var i=0; i<=1; i++) {
        
        obstaclesMid[i] = this.physics.add.sprite(600 + (i+1)*327, 480, 'obstacle2').setImmovable(true).setVelocity(-obstacleVelocity, 0).setName('mid');
        this.physics.add.overlap(obstaclesMid[i], collider1, obstacleReposition, null, this);
        this.physics.add.collider(player, obstaclesMid[i], die, null, this);
    }

    this.input.on('pointerdown', function(pointer){
        if (isDead) {
            isDead = false;
            gameRestart = true;
            score = 0;
            this.scene.restart();
        }
        else {

            player.body.setGravityY(-playerGravity);
        }
        if (!gamestart) {
            logo.setVisible(false);
            startText.setVisible(false);
            this.scene.physics
            gamestart = true;
            this.physics.resume();
        }
    }, this);

    this.input.on('pointerup', function(pointer){
        player.body.setGravityY(playerGravity);
    }, this);

    this.time.addEvent({ delay: 1000, callback: obstacleAmlitudeShift, callBackScope: this, loop: true});
}

function update(time, delta){
    lastObstacleOffset = Math.sin(time / 50) * obstacleOffsetAmplitude;
    lastObstacleDistance = Math.sin(time / 50) * 40 + obstacleDistanceAmplitude;
}

function landedOnPlatform(player, platform) {
    if (score < parseInt(platform.name) && platform.body.touching.up) {
        score = parseInt(platform.name);
        scoreText.text = score;
        landSfx.play();
    }
}

function obstacleReposition(obstacle, collider) {
    obstacle.x = 600;
    if (obstacle.name == 'top') {
        obstacle.y = -lastObstacleDistance + lastObstacleOffset;
    }
    else if (obstacle.name == 'bottom') {
        obstacle.y = 960 + lastObstacleDistance + lastObstacleOffset;
    }
    else if (obstacle.name == 'mid') {
        obstacle.y = Phaser.Math.RND.between(480-(lastObstacleDistance + lastObstacleOffset) + 100, 480+(lastObstacleDistance + lastObstacleOffset) - 100)
    }
}

function die() {
    deathText.setVisible(true);
    this.physics.pause();
    isDead = true;
    player.anims.stop();
}


function obstacleAmlitudeShift() {
    if (gamestart && !isDead) {
        score++;
        scoreText.text = score;
        if (score >= hiscore) {
            hiscore = score;
            hiscoreText.text = 'HI ' + hiscore;
        }
    }
    obstacleDistanceAmplitude = Phaser.Math.RND.between(280, 300);
    obstacleOffsetAmplitude = Phaser.Math.RND.between(60, 80);
}