/// <reference path = "../phaser.d.ts" />

{ // variables
    var bg1;
    var player;
    var blinkSfx;
    var camera;
    var collider1;
    var day = true;
    var dayToggleButton;
    var dayToggleButtonClicked = false;
    var deathSfx;
    var deathText;
    var gamestart = false;
    var highestPlatform = 2;
    var isDead = false;
    var jumpSfx;
    var landSfx;
    var logo;
    var platforms = [];
    var prevHighestPlatformVelocityX = 75;
    var score = 0;
    var scoreText;
    var startText;
    var hiscore = 0;
    var hiscoreText;
}

config = {
    type: Phaser.AUTO,
    backgroundColor: 0xFFFFFF,
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
    this.load.spritesheet('player', 'assets/playerSpritesheet.png', { frameWidth: 70, frameHeight: 69 });
    this.load.image('bg1', 'assets/bg1.png');
    this.load.image('bg2', 'assets/bg2.png');
    this.load.image('platform1', 'assets/platform1.png');
    this.load.image('collider1', 'assets/collider1.png');
    this.load.image('logo', 'assets/logo.png');
    this.load.image('sun', 'assets/sun.png');
    this.load.image('moon', 'assets/moon.png');
    this.load.image('startText', 'assets/startText.png');
    this.load.image('deathText', 'assets/deathText.png');
    this.load.audio('jumpSfx', ['assets/jump.mp3', 'assets/jump.ogg']);
    this.load.audio('deathSfx', ['assets/die.mp3', 'assets/die.ogg']);
    this.load.audio('blinkSfx', ['assets/blink.mp3', 'assets/blink.ogg']);
    this.load.audio('landSfx', ['assets/land.mp3', 'assets/land.ogg']);
}

function create(){
    jumpSfx = this.sound.add('jumpSfx');
    deathSfx = this.sound.add('deathSfx');
    blinkSfx = this.sound.add('blinkSfx');
    landSfx = this.sound.add('landSfx');

    bg1 = this.add.sprite(0, 0, 'bg1').setOrigin(0).setScrollFactor(0);

    dayToggleButton = this.add.sprite(480, 60, 'moon').setScrollFactor(0);
    dayToggleButton.setInteractive();
    dayToggleButton.depth = 10;
    dayToggleButton.on('pointerdown', dayToggleDown, this);
    dayToggleButton.on('pointerup', dayToggleUp, this);

    logo = this.add.sprite(270, 320, 'logo').setScrollFactor(0);

    scoreText = this.add.text(25, 65, '0', { fontFamily: '"font1", Arial Black', color: '#ffffff'} ).setScrollFactor(0);
    scoreText.setFontSize(50);
    scoreText.depth = 10;
    scoreText.setShadow(3, 3, '#117fb8');
    
    hiscoreText = this.add.text(25, 35, 'HI ' + hiscore, { fontFamily: '"font1", Arial Black', color: '#ffffff'} ).setScrollFactor(0);
    hiscoreText.setFontSize(20);
    hiscoreText.depth = 10;
    hiscoreText.setShadow(3, 3, '#117fb8');


    startText = this.add.sprite(270, 420, 'startText').setScrollFactor(0);
    startText.depth = 10;

    deathText = this.add.sprite(270, 400, 'deathText').setScrollFactor(0).setVisible(false);
    deathText.depth = 10;

    // startText = this.add.text(270, 420, 'Tap to start', { align: 'center', fontFamily: '"font1", font2, Arial Black', color: '#ffffff'} ).setScrollFactor(0);
    // startText.setFontSize(40);
    // startText.setOrigin(0.5);
    // startText.depth = 10;
    // startText.setShadow(0, 4, '#117fb8');
    // // startText.setShadow(0, 4, '#c07011');

    
    // deathText = this.add.text(270, 400, 'You Died!\n\nTap to restart', { align: 'center', fontFamily: '"font1", font2, Arial Black', color: '#ffffff'} ).setScrollFactor(0).setVisible(false);
    // deathText.setFontSize(30);
    // deathText.setOrigin(0.5);
    // deathText.depth = 10;
    // deathText.setShadow(0, 3, '#117fb8');

    collider1 = this.physics.add.sprite(270, 1200, 'collider1').setVisible(false);

    
    platforms[0] = this.physics.add.sprite(270, 800, 'platform1').setImmovable(true).setBounce(1).setVelocity(0, 0).setCollideWorldBounds(true).setName('0');
    platforms[1] = this.physics.add.sprite(270, 480, 'platform1').setImmovable(true).setBounce(1).setVelocity(-100, 0).setCollideWorldBounds(true).setName('1');
    platforms[2] = this.physics.add.sprite(270, 160, 'platform1').setImmovable(true).setBounce(1).setVelocity(75, 0).setCollideWorldBounds(true).setName('2');

    for (var i = 0; i <= 2; i++) {
        this.physics.add.overlap(platforms[i], collider1, platformReposition, null, this);
    }

    player = this.physics.add.sprite(270, 745, 'player');
    player.setGravityY(520);
    player.setCollideWorldBounds(true);
    player.body.checkCollision.up = false;
    player.body.checkCollision.right = false;
    player.body.checkCollision.left = false;

    player.body.setSize(40, 68, true);

    this.anims.create({
        key: 'blink',
        frames: this.anims.generateFrameNumbers('player', {start: 1, end: 0}),
        frameRate: 10,
    });

    this.time.addEvent({ delay: 250, callback: blink, callbackScope: this, loop: true });

    this.physics.add.collider(player, collider1, die, null, this);

    this.physics.add.collider(player, platforms[0], landedOnPlatform, null, this);
    this.physics.add.collider(player, platforms[1], landedOnPlatform, null, this);
    this.physics.add.collider(player, platforms[2], landedOnPlatform, null, this);

    camera = this.cameras.add(0, 0, 540, 960);

    camera.startFollow(player, false, 0, 0.01, 0, 300);


    this.input.on('pointerdown', function(pointer){
        if (!dayToggleButtonClicked) {
            if (isDead) {
                restart(this.physics.world);
            }
            else if(player.body.touching.down) {

                player.body.setVelocityY(-600);
                jumpSfx.play()
                
                this.tweens.add({
                    targets: player,
                    displayHeight: 80,
                    displayWidth: 60,
                    ease: 'Sine.easeOut',
                    // ease: 'Bounce.inOut',
                    duration: 200,
                    yoyo: true
                })
            }
            if (!gamestart) {
                logo.setVisible(false);
                startText.setVisible(false);
                gamestart = true;
            }
        }
    }, this);
    this.physics.world.bounds.height = 3000;

}

function update(time, delta){
    this.physics.world.bounds.y = camera.scrollY - 1000;
    collider1.y = camera.scrollY + 1000;
}

function landedOnPlatform(player, platform) {
    if (score < parseInt(platform.name) && platform.body.touching.up) {
        score = parseInt(platform.name);
        scoreText.text = score;
        landSfx.play();
        if (score >= hiscore) {
            hiscore = score;
            hiscoreText.text = 'HI ' + hiscore;
        }
    }
}

function platformReposition(platform, collider) {
    platform.y = camera.scrollY;
    platform.x = Phaser.Math.RND.between(5 + platform.width/2, 535 - platform.width/2);
    platform.name = parseInt(platform.name) + 3;

    var plusOrMinus = Math.floor(Phaser.Math.RND.between(0,1));

    if (Math.abs(prevHighestPlatformVelocityX) < 50) {
        
        var velocity = Phaser.Math.RND.between(85, 130);
        platform.setVelocity( velocity - 2*velocity*plusOrMinus, 0);
        prevHighestPlatformVelocityX = velocity;
    }
    else {
        var velocity = Phaser.Math.RND.between(0, 50);
        platform.setVelocity( velocity - 2*velocity*plusOrMinus, 0);
        prevHighestPlatformVelocityX = velocity;
    }
}

function die() {
    deathSfx.play();
    player.setVisible(false).setActive(false);
    player.body.enable = false;
    isDead = true;
    deathText.setVisible(true);
}

function restart(world) {
    score = 0;
    scoreText.text = '0';
    prevHighestPlatformVelocityX = 75;
    camera.scrollY = -100;
    player.setPosition(270, 745);

    world.bounds.y = camera.scrollY - 1000;
    collider1.y = camera.scrollY + 1000;

    platforms[0].setPosition(270, 800).setVelocity(0, 0);
    platforms[1].setPosition(270, 480).setVelocity(-100, 0);
    platforms[2].setPosition(270, 160).setVelocity(75, 0);

    for (var i=0; i<=2; i++) {
        platforms[i].name = i;
    }

    deathText.setVisible(false);
    isDead = false;
    player.body.enable = true;
    player.setVisible(true).setActive(true);
}

function blink() {
    if (Phaser.Math.RND.between(0,10) == 0 && !isDead) {
        player.anims.play('blink');
        blinkSfx.play();
    }
}

function dayToggleDown() {
    dayToggleButtonClicked = true;
    if (day) {
        bg1.setTexture('bg2');
        day = false;
        dayToggleButton.setTexture('sun');
        document.getElementById('body').style.backgroundColor = '#000000';
    }
    else {
        bg1.setTexture('bg1');
        day = true;
        dayToggleButton.setTexture('moon');
        document.getElementById('body').style.backgroundColor = '#FFFFFF';
    }
}

function dayToggleUp() {
    dayToggleButtonClicked = false;
}