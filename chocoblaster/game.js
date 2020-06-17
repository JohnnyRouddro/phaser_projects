/// <reference path = "../phaser.d.ts" />

{ // variables
var bg1;
var bgFrame;
var bgm;
var color = ['red', 'blue', 'green', 'brown', 'yellow', 'orange', 'purple'];
var column = 4;
var dropDownDelay = 10000;
var dropTimer;
var dropTimerBar;
var emitters = [];
var gameoverSprite;
var gamestarted = false;
var gems;
var gemsArray = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
var gemsMatched = [];
var gun;
var gunGem;
var gunGemNumber = 0;
var hiscore = 0;
var hiscoreText;
var logo;
var keyboardKeys;
var particles = [];
var refreshGridTimedEvent;
var restartbtn;
var score = 0;
var scoreText;
var scoreTimer;
var sfxPull;
var sfxShoot;
var sfxSplash;
var startbtn;
var startText;
var waitToFill = -1;

var upbtn;
var rightbtn;
var downbtn;
var leftbtn;
}

config = {
    type: Phaser.AUTO,
    backgroundColor: 0x4a3094,
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
    },
    audio: {
        disableWebAudio: true
    }
};

game = new Phaser.Game(config);

var Gem = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    Initialize:
    function Gem(scene){
        Phaser.GameObjects.Image.call(this, scene);
    },
    
    reset: function(x, y, texture){
        this.x = x;
        this.y  = y;
        this.setTexture(texture);
    }
});

function preload(){
    this.load.image('upbtn_up', 'assets/UI/upbtn_up.png');
    this.load.image('rightbtn_up', 'assets/UI/rightbtn_up.png');
    this.load.image('downbtn_up', 'assets/UI/downbtn_up.png');
    this.load.image('leftbtn_up', 'assets/UI/leftbtn_up.png');
    this.load.image('upbtn_down', 'assets/UI/upbtn_down.png');
    this.load.image('rightbtn_down', 'assets/UI/rightbtn_down.png');
    this.load.image('downbtn_down', 'assets/UI/downbtn_down.png');
    this.load.image('leftbtn_down', 'assets/UI/leftbtn_down.png');
    this.load.image('gun', 'assets/gun.png');
    this.load.image('line', 'assets/line.png');
    this.load.image('red', 'assets/gems/red.png');
    this.load.image('blue', 'assets/gems/blue.png');
    this.load.image('green', 'assets/gems/green.png');
    this.load.image('brown', 'assets/gems/brown.png');
    this.load.image('yellow', 'assets/gems/yellow.png');
    this.load.image('orange', 'assets/gems/orange.png');
    this.load.image('purple', 'assets/gems/purple.png');
    this.load.image('particle_red', 'assets/particles/particle_red.png');
    this.load.image('particle_blue', 'assets/particles/particle_blue.png');
    this.load.image('particle_green', 'assets/particles/particle_green.png');
    this.load.image('particle_brown', 'assets/particles/particle_brown.png');
    this.load.image('particle_yellow', 'assets/particles/particle_yellow.png');
    this.load.image('particle_orange', 'assets/particles/particle_orange.png');
    this.load.image('particle_purple', 'assets/particles/particle_purple.png');
    this.load.image('logo', 'assets/UI/logo.png');
    this.load.image('gameover', 'assets/UI/gameover.png');
    this.load.image('startbtn', 'assets/UI/startbtn.png');
    this.load.image('restartbtn', 'assets/UI/restartbtn.png');
    this.load.image('bgFrame', 'assets/bgFrame.png');
    this.load.image('dropTimerBar', 'assets/UI/dropTimerBar.png');
    this.load.audio('pull', ['assets/audio/pull.mp3']);
    this.load.audio('shoot', ['assets/audio/shoot.mp3']);
    this.load.audio('splash', ['assets/audio/splash.mp3']);
    this.load.audio('bgm', ['assets/audio/chocoblaster_bgm.mp3']);
}

function create(){
    // gemsMatched.push([1,2]);
    // console.log(visited(1, 2));
    sfxPull = this.sound.add('pull');
    sfxShoot = this.sound.add('shoot');
    sfxSplash = this.sound.add('splash');
    bgm = this.sound.add('bgm');

    bg1 =  this.add.graphics();
    bg1.fillGradientStyle(0xc767ab, 0xc767ab, 0x6143b7, 0x6143b7, 1);
    bg1.fillRect(0, 0, 540, 960);

    bgFrame = this.add.sprite(0, 0, 'bgFrame').setOrigin(0, 0).setVisible(false);

    dropTimerBar = this.add.sprite(270, 702, 'dropTimerBar').setVisible(false);
    
    logo = this.add.sprite(270, 320, 'logo').setVisible(false);
    logo.depth = 10;
    
    startbtn = this.add.sprite(270, 580, 'startbtn').setVisible(false);
    startbtn.depth = 10;

    restartbtn = this.add.sprite(270, 500, 'restartbtn').setVisible(false).setInteractive();
    restartbtn.depth = 10;
    restartbtn.on('pointerdown', startGame, this);
    
    scoreText = this.add.text(45, 25, '0', { fontFamily: '"font1", Arial Black', color: '#fe4444'} );
    scoreText.setFontSize(30);
    scoreText.depth = 10;
    scoreText.setStroke('#ffffff', 3);
    
    hiscoreText = this.add.text(45, 8, 'HI ' + hiscore, { fontFamily: '"font1", Arial Black', color: '#fe4444'} );
    hiscoreText.setFontSize(15);
    hiscoreText.depth = 10;
    hiscoreText.setStroke('#ffffff', 3);
    
    gameoverSprite = this.add.sprite(270, 365, 'gameover').setVisible(false);
    gameoverSprite.depth = 10;
    
    gunGem = this.add.sprite(270, 715, 'red').setVisible(false);
    line = this.add.sprite(270, 65, 'line').setOrigin(0.5, 0).setVisible(false);
    gun = this.add.sprite(270, 700, 'gun').setVisible(false);
    
    gems = this.physics.add.group({
        classType: Gem,
        maxSize: 300,
    });
    
    if(!gamestarted){
        logo.setVisible(true);
        startbtn.setVisible(true).setInteractive();
        startbtn.on('pointerdown', startGame, this);
    }
    else{
        { //Creating Buttons
        upbtn = this.add.sprite(270, 800, 'upbtn_up');
        upbtn.setInteractive();
        upbtn.depth = 10;
        upbtn.on('pointerdown', upbtnDown, this);
        upbtn.on('pointerup', upbtnUp, this);
    
        rightbtn = this.add.sprite(425, 845, 'rightbtn_up');
        rightbtn.setInteractive();
        rightbtn.depth = 10;
        rightbtn.on('pointerdown', rightbtnDown, this);
        rightbtn.on('pointerup', rightbtnUp, this);
        
        downbtn = this.add.sprite(270, 880, 'downbtn_up');
        downbtn.setInteractive();
        downbtn.depth = 10;
        downbtn.on('pointerdown', downbtnDown, this);
        downbtn.on('pointerup', downbtnUp, this);
        
        leftbtn = this.add.sprite(115, 845, 'leftbtn_up');
        leftbtn.setInteractive();
        leftbtn.depth = 10;
        leftbtn.on('pointerdown', leftbtnDown, this);
        leftbtn.on('pointerup', leftbtnUp, this);
        }
        bgm.play({loop: true, volume: 0.75});
        bgFrame.setVisible(true);
        dropTimerBar.setVisible(true);
        column = 4;
        gun.setVisible(true);
        line.setVisible(true);
        gemsArray = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        for(var i=0; i<7; i++){ //initializing the grid
            gemsArray[i] = new Array(9);
            for(var j=0; j<9; j++){
                gemsArray[i][j] = gems.get();
                
                var texture = color[Phaser.Math.RND.between(0, 6)];
                gemsArray[i][j].reset(88 + j*45, 90 + i*45, texture);
                
                gemsMatched = [];
                
                while(traverse(i, j, texture, 1) > 2){
                    gemsMatched = [];
                    texture = color[Phaser.Math.RND.between(0, 6)];
                }
                gemsArray[i][j].reset(88 + j*45, 90 + i*45, texture);
            }
        }
        
        for(var i=0; i<7; i++){
            particles[i] = this.add.particles('particle_' + color[i]);
        }
        dropTimer = this.time.addEvent({ delay: dropDownDelay, callback: dropDown, callbackScope: this, loop: true});
    }
    
    
    this.input.keyboard.on('keydown_UP', upbtnDown, this);
    this.input.keyboard.on('keydown_RIGHT', rightbtnDown, this);
    this.input.keyboard.on('keydown_DOWN', downbtnDown, this);
    this.input.keyboard.on('keydown_LEFT', leftbtnDown, this);
    this.input.keyboard.on('keyup_UP', upbtnUp, this);
    this.input.keyboard.on('keyup_RIGHT', rightbtnUp, this);
    this.input.keyboard.on('keyup_DOWN', downbtnUp, this);
    this.input.keyboard.on('keyup_LEFT', leftbtnUp, this);
}
function update(time, delta){
    if(gamestarted){
        dropTimerBar.setCrop(0, 0, ((dropDownDelay - dropTimer.elapsed)/dropDownDelay*482), 109);
    }
}

function startGame(){
    gamestarted = true;
    score = 0;
    gunGemNumber = 0;
    this.scene.restart();
}

function gameOver(){
    dropTimer.remove(false);
    gun.setVisible(false);
    line.setVisible(false);
    upbtn.setVisible(false);
    rightbtn.setVisible(false);
    downbtn.setVisible(false);
    leftbtn.setVisible(false);
    gameoverSprite.setVisible(true);
    restartbtn.setVisible(true)
}

function dropDown(){
    // gemsArray[1][0] = gemsArray[0][0];
    // console.log(gemsArray[0][0].texture.key, gemsArray[1][0].texture.key);
    var maxLength = 0;
    for(var j=0; j<9; j++){
        var rowLength = 0;
        for(var i=0; i<13; i++){
            if(gemsArray[i][j] != undefined) rowLength++
        }
        maxLength = Math.max(maxLength, rowLength);
    }
    if(maxLength > 12){
        gameOver();
        return;
    }

    for(var i=14; i>0; i--){
        for(var j=0; j<9; j++){
            if(gemsArray[i-1][j] != undefined){
                // if(i>0)
                gemsArray[i][j] = gemsArray[i-1][j];
                gemsArray[i][j].y += 45;
                // console.log(gemsArray[i][j].x, gemsArray[i][j].y);
            }
        }
    }
    for(var j=0; j<9; j++){
        gemsArray[0][j] = gems.get();
        gemsArray[0][j].setVisible(true).setActive(true);

        var texture = color[Phaser.Math.RND.between(0, 6)];
        gemsArray[0][j].reset(88 + j*45, 90, texture);

        gemsMatched = [];

        while(traverse(0, j, texture, 1) > 2){
            gemsMatched = [];
            texture = color[Phaser.Math.RND.between(0, 6)];
        }
        gemsArray[0][j].reset(88 + j*45, 90, texture);
    }
}


function findMatch(){
    var foundMatch = false;
    for(var i=0; i<14; i++){
        for(var j=0; j<9; j++){
            if(gemsArray[i][j] == undefined) continue;
            gemsMatched = [];
            var texture;
            if(traverse(i, j, gemsArray[i][j].texture.key, 1) > 2){
                foundMatch = true;
                texture = gemsArray[i][j].texture.key;
                
                gemsMatched.forEach(function(item){
                    explode(88+ item[1]*45, 90 + item[0]*45, color.indexOf(texture));
                    score += 10;
                    hiscore = (hiscore > score) ? hiscore : score;
                    scoreText.text = score;
                    hiscoreText.text = 'HI ' + hiscore;
                });
                for(var k=0; k<gemsMatched.length; k++){
                    gemsArray[gemsMatched[k][0]][gemsMatched[k][1]].setVisible(false).setActive(false);
                    gemsArray[gemsMatched[k][0]][gemsMatched[k][1]] = undefined;
                }
                sfxSplash.play();
                continue;
            }
        }
    }
    if(foundMatch) {
        waitToFill = 2;
    }
    else{
        waitToFill = 0;
    }

}

function fillEmptyRows(){
    var emptyRowUp = false;
    do{
        emptyRowUp = false;
        for(var i=1; i<14; i++){
            for(var j=0; j<9; j++){
                if(gemsArray[i-1][j] == undefined && gemsArray[i][j] != undefined){
                    gemsArray[i-1][j] = gemsArray[i][j];
                    gemsArray[i-1][j].y -= 45;
                    gemsArray[i][j] = undefined;
                    emptyRowUp = true;
                }
            }
        }
    }while(emptyRowUp);
}

function onRefreshGrid(){
    if(waitToFill == 1){
        findMatch();
    }
    else if(waitToFill == 2) {
        fillEmptyRows();
        waitToFill = 1;
    }
    else{
        refreshGridTimedEvent.remove(false);
        waitToFill = -1;
    }
}

function upbtnDown(){
    upbtn.setTexture('upbtn_down');
    var addedBottomGem;
    while(gunGemNumber){
        addedBottomGem = addBottomGem(column, gunGem.texture.key);
        if(addedBottomGem){
            gunGemNumber--;
        }
        else break;
    }
    if(addedBottomGem) sfxShoot.play();
    if(!gunGemNumber){
        gunGem.setVisible(false);
    }
    // console.log(this.time);
    // this.time.delayedCall(300, function () { refreshGrid(this); });
    if(waitToFill == -1){
        waitToFill = 1;
        refreshGridTimedEvent = this.time.addEvent({ delay: 250, callback: onRefreshGrid, callbackScope: this, loop: true});
    }
}

function rightbtnDown(){
    rightbtn.setTexture('rightbtn_down');
    if(gun.x < 450){
        gun.x += 45;
        gunGem.x += 45;
        line.x += 45;
        column++;
    }
    else{
        gun.x = 90;
        gunGem.x = 90;
        line.x = 90;
        column = 0;
    }
}

function downbtnDown(){
    downbtn.setTexture('downbtn_down');
    var texture = bottomGemTex(column);
    if(gunGemNumber){
        if(texture == gunGem.texture.key) {
            gunGem.setTexture(texture);
            removeBottomGem(column);
            gunGem.setVisible(true);
            gunGemNumber++;
            sfxPull.play();
        }
    }
    else{
        if(texture) {
            gunGem.setTexture(texture);
            removeBottomGem(column);
            gunGem.setVisible(true);
            gunGemNumber++;
            sfxPull.play();
        }
    }
}

function leftbtnDown(){
    leftbtn.setTexture('leftbtn_down');
    if(gun.x > 90){
        gun.x -= 45;
        gunGem.x -= 45;
        line.x -= 45;
        column--;
    }
    else{
        gun.x = 450;
        gunGem.x = 450;
        line.x = 450;
        column = 8;
    }
}

function upbtnUp(){
    upbtn.setTexture('upbtn_up');
}
function rightbtnUp(){
    rightbtn.setTexture('rightbtn_up');
}
function downbtnUp(){
    downbtn.setTexture('downbtn_up');
}
function leftbtnUp(){
    leftbtn.setTexture('leftbtn_up');
}

function bottomGemTex(column){
    var row = 0;
    while(gemsArray[row][column] != undefined){
        row++;
    }
    if(row){
        --row;
        return gemsArray[row][column].texture.key;
    }
    else return 0;
}

function removeBottomGem(column){
    var row = 0;
    while(gemsArray[row][column] != undefined){
        row++;
    }

    if(row){
        --row;
        gemsArray[row][column].setVisible(false).setActive(false);
        gemsArray[row][column] = undefined;
    }
    else return 0;
}

function addBottomGem(column, texture){
    var row = 0;
    while(row < 13){
        if(gemsArray[row][column] == undefined) break;
        else row++;
    }
    
    
    if(row < 13){
        gemsArray[row][column] = gems.get();
        gemsArray[row][column].reset(88 + column*45, 90 + row*45, texture);
        gemsArray[row][column].setVisible(true).setActive(true);
        // refreshGrid();
        return 1;
    }
    else{
        // refreshGrid();
        return 0;
    }
}

function traverse(row, column, texture, count){
    // if(row < 0 || row > 6 || column < 0 || column > 3) return --count;
    // else 
    if(gemsArray[row][column] == undefined) return --count;
    if(texture != gemsArray[row][column].texture.key) return --count;
    else{
        gemsMatched.push([row, column]);
        // console.log(count + " (" + row + "," + column + ")");
        // count++;
        if(row > 0 && !visited(row-1, column))
            count = traverse(row-1, column, texture, ++count);
        
        if(row < 14 && !visited(row+1, column))
            count = traverse(row+1, column, texture, ++count);
        
        if(column > 0 && !visited(row, column-1))
            count = traverse(row, column-1, texture, ++count);
        
        if(column < 9 && !visited(row, column+1))
            count = traverse(row, column+1, texture, ++count);

        return count;
    }
}

function visited(x, y){
    return gemsMatched.some(function(item){
        if(item[0] == x && item[1] == y) return true;
        else return false;
    });
}

function explode(x, y, particle_idx, size){

    particles[particle_idx].createEmitter({
        alpha: { start: 1, end: 0 },
        scale: { start: 0.75, end: size === undefined ? 1.2 : size },
        speed: 0,
        angle: { min: -180, max: -180 },
        rotate: { min: -30, max: 30 },
        lifespan: { min: 200, max: 300 },
        blendMode: 'NORMAL',
        frequency: 0,
        maxParticles: 3,
        x: x,
        y: y
    });
}