/// <reference path = "../phaser.d.ts" />

{ // variables
var config;
var game;
var enemyspawned = false;
var gamestart = false;
var player;
var playerInvincible = true;
var enemies;
var activeEnemies = [];
var enemyHealth1 = 16;
var particle1;
var upgrade;
var bulletLevel = 1;
var bulletLevelUpAlive = 0;
var pickupAlive = 0;
var offsetX;
var offsetY;
var targetX;
var targetY;
var scoreText;
var startText;
var score = 0;
var lastFired = 0;
var time = 0;
var isShooting = false;
var bulletCountText;
var bulletType = 1;
var sideguns = [];
var midgun;
var hiscore = 0;
var hiscoreText;
}

config = {
    type: Phaser.AUTO,
    backgroundColor: 0x000000,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 540,
        height: 960,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:0},
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
    }
};

game = new Phaser.Game(config);

var Enemy = new Phaser.Class({
    Extends : Phaser.Physics.Arcade.Sprite,
    initialize:
    function Enemy (scene, x, y, texture, health, speedX, speedY) {
        Phaser.Physics.Arcade.Sprite.call(this, scene);
        this.setPosition(x, y);
        this.setTexture(texture);
        this.health = health;
        this.speedY = Phaser.Math.GetSpeed(speedY, 1);
        this.speedX = Phaser.Math.GetSpeed(speedX, 1);
    },

    update: function (time, delta) {
        this.y += this.speedY * delta;
        this.x += Math.sin(this.speedX * time / 5);
        if (this.y >= 1000) this.y = -40;
    }
});

var Pickup = new Phaser.Class({
    Extends : Phaser.Physics.Arcade.Sprite,
    initialize:
    function Pickup (scene) {
        Phaser.Physics.Arcade.Sprite.call(this, scene);
    },
    drop: function(x, y, texture, type) {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        this.setTexture(texture);
        this.type = type;
    },
    update: function (time, delta) {
        this.y += Phaser.Math.GetSpeed(100, 1) * delta;
        this.x += Math.sin(Phaser.Math.GetSpeed(15, 1) * time / 4);
        if (this.y >= 1000) {
            this.setActive(false);
            this.setVisible(false);
            if (this.type == 0) bulletLevelUpAlive--;
            pickupAlive--;};
    }
});

var Bullet = new Phaser.Class({
        
    Extends: Phaser.GameObjects.Image,
    
    initialize:
    
    function Bullet (scene) {
        Phaser.GameObjects.Image.call(this, scene);
        
        this.speedY = Phaser.Math.GetSpeed(1000, 1);
        this.speedX = 0;
    },
    
    fire: function (x, y, texture, speedX, speedY) {
        this.setPosition(x, y - 50);
        this.setTexture(texture);
        this.setActive(true);
        this.setVisible(true);
        if (speedX) this.setRotation(Phaser.Math.GetSpeed(speedX, 1));
        this.speedX = speedX === undefined ? 0 : Phaser.Math.GetSpeed(speedX, 1);
        this.speedY = speedY === undefined ? 0 : Phaser.Math.GetSpeed(speedY, 1);
    },
    
    update: function (time, delta) {
        this.y -= this.speedY * delta;
        this.x += this.speedX * delta;
        
        if (this.y < -50 || this.y > 1010 || this.x < -50 || this.x > 590) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});

function preload(){
    this.load.spritesheet('ship1', 'assets/ship1/ship1Spritesheet.png', {frameWidth: 94, frameHeight: 74});
    this.load.spritesheet('enemy1', 'assets/enemies/enemy1Spritesheet.png', {frameWidth: 65, frameHeight: 54});
    // this.load.spritesheet('explosion1', 'assets/explosions/explosion1Spritesheet.png', {frameWidth: 128, frameHeight: 128});
    this.load.image('sidegun', 'assets/ship1/sidegun.png');
    this.load.image('midgun', 'assets/ship1/midgun.png');
    this.load.image('bullet1_1', 'assets/bullets/bullet1_1.png');
    this.load.image('bullet2_1', 'assets/bullets/bullet2_1.png');
    this.load.image('bullet3_1', 'assets/bullets/bullet3_1.png');
    this.load.image('bullet1_2', 'assets/bullets/bullet1_2.png');
    this.load.image('bullet2_2', 'assets/bullets/bullet2_2.png');
    this.load.image('bullet3_2', 'assets/bullets/bullet3_2.png');
    this.load.image('bullet1_3', 'assets/bullets/bullet1_3.png');
    this.load.image('bullet2_3', 'assets/bullets/bullet2_3.png');
    this.load.image('bullet3_3', 'assets/bullets/bullet3_3.png');
    this.load.image('enemyBullet1', 'assets/bullets/enemyBullet1.png');
    this.load.image('particle1', 'assets/explosions/particle1.png');
    this.load.image('upgrade0', 'assets/pickups/upgrade0.png');
    this.load.image('upgrade1', 'assets/pickups/upgrade1.png');
    this.load.image('upgrade2', 'assets/pickups/upgrade2.png');
    this.load.image('upgrade3', 'assets/pickups/upgrade3.png');
    this.load.image('bg1', 'assets/bg/bg1.jpg');
}

function create(){
    this.bg1 = this.add.tileSprite(0, 0, 540, 2600, 'bg1');
    this.bg1.setOrigin(0,0);
    this.bg1.depth = - 5
    scoreText = this.add.text(25, 60, '0', { fontFamily: '"font1", Arial, Calibri', color: '#00deff'} );
    scoreText.setFontSize(50);
    scoreText.depth = 10;

    hiscoreText = this.add.text(25, 35, 'HI ' + hiscore, { fontFamily: '"font1", Arial Black', color: '#00deff'} );
    hiscoreText.setFontSize(20);
    hiscoreText.depth = 10;

    // bulletCountText = this.add.text(15, 100, 'bullet count ', { fontFamily: '"Roboto Condensed", Arial, Calibri', color: '#ffffff'} );
    // bulletCountText.setFontSize(20);
    // bulletCountText.depth = 10;

    startText = this.add.text(270, 480, 'Tap to start', { fontFamily: '"font1", Arial, Calibri', color: '#ffffff'})
    startText.setFontSize(30);
    startText.depth = 10;
    startText.setOrigin(0.5, 0.5);

    player = this.physics.add.sprite(270, 700, 'ship1');
    player.setCollideWorldBounds(true);
    
    sideguns[0] = this.add.sprite(200, 740, 'sidegun').setVisible(false);
    sideguns[1] = this.add.sprite(340, 740, 'sidegun').setVisible(false);
    midgun = this.add.sprite(270, 700, 'midgun').setVisible(false);
    midgun.depth = player.depth - 1;

    enemies = this.physics.add.group({runChildUpdate: true});
    particle1 = this.add.particles('particle1');

    // upgrade = this.physics.add.group({runChildUpdate: true});
    // this.physics.add.overlap(player, upgrade, pickup, null, this);
    this.physics.add.overlap(player, enemies, enemyPlayerHit, null, this);

    this.time.addEvent({ delay: 200, callback: enemyFire, callbackScope: this, loop: true });
    
    {//anims
        this.anims.create({
        key: 'normal',
        frames: [ { key: 'ship1', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'shoot',
        frames: this.anims.generateFrameNumbers('ship1', { start: 0, end: 1 }),
        frameRate: 20,
        repeat: -1
    });

    this.anims.create({
        key: 'enemyNormal',
        frames: [ { key: 'enemy1', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'enemyGotHit',
        frames: [ { key: 'enemy1', frame: 1 } ],
        frameRate: 20,
    });

    this.anims.create({
        key: 'explode1',
        frames: this.anims.generateFrameNumbers('explosion1', { start: 0, end: 13 }),
        frameRate: 20,
    });
    }

    
    this.input.on('pointerdown', function(pointer){
        if (!gamestart) {
            startText.setVisible(false);
            this.time.delayedCall(2000, function () { playerInvincible = false; });
            player.setVisible(true).setActive(true);
            player.body.enable = true;
            // offsetX = 0;
            // offsetY = 0;
            player.x = 270;
            player.y = 700;

            score = 0;
            bulletType = 1;
            
            if (!enemyspawned) {
                enemyspawned = true;
                for (var i=0; i<15; i++) {
                    var enemy = this.children.add(new Enemy(this, Phaser.Math.RND.between(220, 320), Phaser.Math.RND.between(-1200, -50), 'enemy1', enemyHealth1, Phaser.Math.RND.between(4, 15), Phaser.Math.RND.between(120, 180)));
                    enemies.add(enemy);
                    Phaser.Utils.Array.Add(activeEnemies, enemy);
                }
            }
            gamestart = true;
        }
        offsetX = player.x - this.input.activePointer.x;
        offsetY = player.y - this.input.activePointer.y;
        
        player.anims.play('shoot');
        isShooting = true;

    }, this);

    this.input.on('pointermove', function(pointer){
        if (gamestart) {
            if (pointer.isDown){ //player shooting system
                // var pointer = this.input.activePointer;
                targetX = pointer.x + offsetX;
                targetY = pointer.y + offsetY;
                player.x = targetX;
                player.y = targetY;
                
            }else{
                if (Math.abs(player.x-targetX) <= 30 || Math.abs(player.y-targetY) <= 30){
                    player.setVelocityX(player.body.velocity.x/1.1);
                    player.setVelocityY(player.body.velocity.y/1.1);
                    // player.setVelocity(0);
                }
            }
        }
    }, this);
    
    this.input.on('pointerup', function(pointer){
        // player.setVelocity(0);
        player.anims.play('normal');
        isShooting = false;
    }, this)
    
    {// Bullets
    enemyBullets = this.physics.add.group({
        classType: Bullet,
        maxSize: 20,
        runChildUpdate: true
    });
    bulletsL = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });
    bulletsR = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });
    bulletsM = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });
    bulletsL2 = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });
    bulletsR2 = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });
    upgrade = this.physics.add.group({
        classType: Pickup,
        maxSize: 2,
        runChildUpdate: true
    })
    this.physics.add.overlap(enemies, bulletsL, enemyHit, null, this);
    this.physics.add.overlap(enemies, bulletsR, enemyHit, null, this);
    this.physics.add.overlap(enemies, bulletsL2, enemyHit, null, this);
    this.physics.add.overlap(enemies, bulletsR2, enemyHit, null, this);
    this.physics.add.overlap(enemies, bulletsM, enemyHit, null, this);
    this.physics.add.overlap(player, enemyBullets, enemyPlayerHit, null, this);
    this.physics.add.overlap(player, upgrade, pickup, null, this);
    }
}

function update(time, delta){
    this.bg1.tilePositionY -= 0.07 * delta;
    scoreText.text = score;

    sideguns[0].x = player.x + 70;
    sideguns[1].x = player.x - 70;
    sideguns[0].y = player.y + 40;
    sideguns[1].y = player.y + 40;
    midgun.x = player.x;
    midgun.y = player.y - 15;

    if (gamestart && isShooting) { // player shooting mechanism
        if (time > lastFired){
            var bulletL = bulletsL.get();
            var bulletR = bulletsR.get();
            var bulletM = bulletsM.get();
            var bulletL2 = bulletsL2.get();
            var bulletR2 = bulletsR2.get();

            if (bulletL && bulletR){
                bulletL.fire(player.x - 35, player.y + 10, 'bullet1_' + bulletType.toString(), 0, 1200);
                bulletR.fire(player.x + 35, player.y + 10, 'bullet1_' + bulletType.toString(), 0, 1200);

                if (bulletLevel > 1 && bulletM) {
                    bulletM.fire(player.x, player.y - 20, 'bullet2_' + bulletType.toString(), 0, 1200);
                }
                if (bulletLevel > 2 && bulletL2 && bulletR2) {
                    bulletL2.fire(player.x - 75, player.y + 30, 'bullet3_' + bulletType.toString(), -100, 1200);
                    bulletR2.fire(player.x + 75, player.y + 30, 'bullet3_' + bulletType.toString(), 100, 1200);
                }
                lastFired = time + 100;
            }
            // bulletCountText.text = 'bullet count ' + (bulletsL.getChildren().length + bulletsR.getChildren().length + bulletsL2.getChildren().length + bulletsL2.getChildren().length + bulletsM.getChildren().length);
        }
    }
}

function enemyFire() {
    var bulletOwner = activeEnemies[Phaser.Math.RND.integerInRange(0, activeEnemies.length-1)];

    var enemyBullet = enemyBullets.get();
    if (gamestart && enemyBullet && Phaser.Math.RND.integerInRange(0, 1)) {
        enemyBullet.depth = 1
        enemyBullet.fire(bulletOwner.x, bulletOwner.y + 80, 'enemyBullet1', Phaser.Math.RND.between(-100, 100), Phaser.Math.RND.between(-300, -150));
    }
}

function enemyHit(enemy, bullet){
    if (bullet.active === true && enemy.active === true){
        bullet.setActive(false).setVisible(false);
        enemy.anims.play('enemyGotHit');
        this.time.delayedCall(50, tintOff, [enemy], this);
        enemy.health -= bulletLevel < 2 ? 2 : 1;
        if (enemy.health <= 0){
            enemy.setActive(false).setVisible(false);
            Phaser.Utils.Array.Remove(activeEnemies, enemy);

            score += 10;
            if (score >= hiscore) {
                hiscore = score;
                hiscoreText.text = 'HI ' + hiscore;
            }
            this.time.delayedCall(2000, respawnEnemy, [enemy, enemyHealth1], this);

            var emitter = explode(enemy.x, enemy.y);
            this.time.delayedCall(2000, function () { emitter.destroy; });
            
            var rand = Math.floor(Math.random() * 20);

            if ((bulletType != rand) && pickupAlive < 1) { // random pickup dropping
                if (rand == 1) {
                    var pickup = upgrade.get()
                    pickup.drop(enemy.x, enemy.y, 'upgrade1', 1);
                    pickupAlive++;
                }
                else if (rand == 2) {
                    var pickup = upgrade.get()
                    pickup.drop(enemy.x, enemy.y, 'upgrade2', 2);
                    pickupAlive++;
                }
                else if (rand == 3) {
                    var pickup = upgrade.get()
                    pickup.drop(enemy.x, enemy.y, 'upgrade3', 3);
                    pickupAlive++;
                }
                else if (rand >= 17) {
                    if (bulletLevel + bulletLevelUpAlive < 3) {
                        var pickup = upgrade.get()
                        pickup.drop(enemy.x, enemy.y, 'upgrade0', 0);
                        bulletLevelUpAlive++;
                        pickupAlive++;
                    }
                }
            }
        }
    }
}

function tintOff(target){
    target.anims.play('enemyNormal');

    // target.setTint(0xffffff);
}

function explode(x, y, size){

    var emitter = particle1.createEmitter({
        alpha: { start: 0.75, end: 0 },
        scale: { start: 0.2, end: size === undefined ? 0.6 : size },
        speed: 0,
        angle: { min: -85, max: -95 },
        rotate: { min: -90, max: 90 },
        lifespan: { min: 200, max: 400 },
        blendMode: 'ADD',
        frequency: 0,
        maxParticles: 8,
        x: x,
        y: y
    });

    return emitter;
}

function respawnEnemy(enemy, health) {
    enemy.setActive(true).setVisible(true);
    Phaser.Utils.Array.Add(activeEnemies, enemy);
    enemy.health = health;
    enemy.x = Phaser.Math.RND.between(220, 320);
    enemy.y = Phaser.Math.RND.between(-1200, -50);
}

function pickup(player, pickup){
    if (pickup.type == 0 && bulletLevel < 3) {
        bulletLevel++;
        bulletLevelUpAlive--;
        if (bulletLevel == 2) {
            midgun.setVisible(true);
        }
        if (bulletLevel == 3) {
            sideguns[0].setVisible(true);
            sideguns[1].setVisible(true);
        }
    }
    else if (pickup.type != 0) {
        bulletType = pickup.type;
    }
    pickup.depth = player.depth + 1;
    pickup.body.enable = false
    this.tweens.add({
        targets: pickup,
        alpha: 0,
        scale: 3,
        ease: 'Sine.easeOut',
        duration: 400,
        onComplete: function () { pickup.destroy(); }
    })
    pickupAlive--;
}

function enemyPlayerHit(player, enemy) {
    if (player.active && enemy.active) {
        enemy.setActive(false).setVisible(false);
        score += 10;
        if (score >= hiscore) {
            hiscore = score;
            hiscoreText.text = 'HI ' + hiscore;
        }

        if (enemy.health) enemy.health = 0;
        var emitter = explode(enemy.x, enemy.y);

        this.time.delayedCall(2000, function () { emitter.destroy; });
        this.time.delayedCall(2000, respawnEnemy, [enemy, enemyHealth1], this);

        if (!playerInvincible) {
            if (bulletLevel <= 1) {
                gameOver();

                var emitter = explode(player.x, player.y);
                this.time.delayedCall(2000, function () { emitter.destroy; });
            } else {
                if (bulletLevel == 2) {
                    midgun.setVisible(false);
                }
                if (bulletLevel == 3) {
                    sideguns[0].setVisible(false);
                    sideguns[1].setVisible(false);
                    
                    var emitter1 = explode(sideguns[0].x, sideguns[0].y, 0.3);
                    this.time.delayedCall(2000, function () { emitter1.destroy; });
                    var emitter2 = explode(sideguns[1].x, sideguns[1].y, 0.3);
                    this.time.delayedCall(2000, function () { emitter2.destroy; });
                }
                bulletLevel--;
            }
        }
    }
}

function gameOver() {
    player.setActive(false).setVisible(false);
    player.body.enable = false;
    gamestart = false;
    playerInvincible = true;
    startText.text = 'Tap to respawn';
    startText.setVisible(true);
    if (score >= hiscore) {
        hiscore = score;
        hiscoreText.text = 'HI ' + hiscore;
    }
    score = 0;
}