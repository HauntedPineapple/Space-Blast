//#region Page setup
"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 700
});
document.body.querySelector("#container").appendChild(app.view);
let sidebar = document.createElement("div");
sidebar.setAttribute("id", "sidebar");
document.body.querySelector("#container").appendChild(sidebar);

let sideInfo = "<div id='text'  > <p>Arrow keys and WASD to move</p>";
sideInfo += "<p>[Spacebar] to fire</p></div>";
sideInfo += "<p>M to toggle sound</p>"
sidebar.innerHTML = sideInfo;
//#endregion

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
app.loader.
    add([
        "images/Spaceship.png",
        "images/PlayerShip.png",
        "images/enemy1.png",
        "images/enemy2.png",
        "images/enemy3.png",
        "images/enemy4.png",
        "images/enemy5.png",
        "images/enemy6.png",
        "images/explosions.png",
        "images/StartGame_Button.png",
        "images/StartOver_Button.png",
        "images/bg.png",
        "images/bgStars.png"
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// #region game variables
let bgSpeed = 1;
let bgY = 0;
let bgBack, bgFront;

let startScene, gameScene, gameOverScene;
let startGameButton, startOverButton;
let gameOverText;

let player;
let playerBullets = [];

let enemies = [];
let enemyBullets = [];

let explosions = [];
let explosionTextures;

let score, highScore;
let life = 100;
let paused = true;
let multiplier = 1;

let shootSound, explosionSound, backgroundMusic;
let muted = false;

let startTime, updatedTime, savedTime, difference, time;
let isTiming = false;
let timerInterval;

let count = 1;
let spawnRate = 3;
let moveSpeed = 5;
let cooldown, playerCooldown;
//#endregion

function setup() {
    stage = app.stage;
    startScene = new PIXI.Container();


    gameScene = new PIXI.Container();
    gameScene.visible = false;


    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;


    player = new Ship();
    gameScene.addChild(player);

    backgroundMusic = new Howl({
        src: ["sounds/swing.mp3"],
        loop: true,
        volume: 0.3
    });
    shootSound = new Howl({
        src: ['sounds/shoot.wav'],
        volume: 0.05
    });
    explosionSound = new Howl({
        src: ['sounds/explosion.wav'],
        volume: 0.1
    });

    bgBack = createBG(app.loader.resources["images/bg.png"].texture);
    bgFront = createBG(app.loader.resources["images/bgStars.png"].texture);
    explosionTextures = loadSpriteSheet();

    stage.addChild(startScene);
    stage.addChild(gameScene);
    stage.addChild(gameOverScene);
    createStartScene();

    app.ticker.add(gameLoop);
}

//#region Background
function createBG(texture) {
    let tiling = new PIXI.TilingSprite(texture, 600, 700);
    tiling.position.set(0, 0);
    app.stage.addChild(tiling);
    return tiling;
}
function updateBG() {
    bgY = (bgY + bgSpeed);
    bgFront.tilePosition.y = bgY;
    bgBack.tilePosition.y = bgY / 3;
}
//#endregion

//#region Controls
const controller = {
    "ArrowUp": { pressed: false, func: moveUp },
    "ArrowLeft": { pressed: false, func: moveLeft },
    "ArrowDown": { pressed: false, func: moveDown },
    "ArrowRight": { pressed: false, func: moveRight },
    "w": { pressed: false, func: moveUp },
    "a": { pressed: false, func: moveLeft },
    "s": { pressed: false, func: moveDown },
    "d": { pressed: false, func: moveRight },
    " ": { pressed: false, func: fireBullet }
}
document.addEventListener("keydown", (e) => {
    if (controller[e.key]) {
        controller[e.key].pressed = true;
        e.preventDefault();
    }
    if (e.key == "m") {
        muted = !muted;
        backgroundMusic.mute(muted);
    }
})
document.addEventListener("keyup", (e) => {
    if (controller[e.key]) {
        controller[e.key].pressed = false;
        e.preventDefault();
    }
})

function playerControl() {
    Object.keys(controller).forEach(key => {
        controller[key].pressed && controller[key].func()
    })
}

function moveUp() {
    player.y -= moveSpeed;
}
function moveDown() {
    player.y += moveSpeed;
}
function moveLeft() {
    player.x -= moveSpeed;
}
function moveRight() {
    player.x += moveSpeed;
}
//#endregion

//#region Timer
function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(getTimeString, 1);
}

function pauseTimer() {
    time = getTimeString();
    clearInterval(timerInterval);
}

//increases time and formats it
function getTimeString() {
    updatedTime = new Date().getTime();

    difference = updatedTime - startTime;

    let diffInHrs = difference / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let diffInMs = (diffInSec - ss) * 100;
    let ms = Math.floor(diffInMs);

    let formattedHH = hh.toString().padStart(2, "0");
    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
    let formattedMS = ms.toString().padStart(3, "0");

    time = `${formattedHH}:${formattedMM}:${formattedSS}`;
    return time;
}
//#endregion

function createStartScene() {
    startGameButton = new PIXI.Sprite(PIXI.Texture.from('images/StartGame_Button.png'));
    startGameButton.x = 40;
    startGameButton.y = 300;
    startGameButton.interactive = true;
    startGameButton.buttonMode = true;
    startGameButton.on("pointerup", startGame);
    startGameButton.on("pointerover", e => e.target.alpha = 0.7);
    startGameButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startGameButton);
}
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    isTiming = true;
    paused = false;
    backgroundMusic.play();

    score = 0;
    life = 100;
    player.x = 300;
    player.y = 600;

    clearInterval(timerInterval);
    startTimer();
}

function gameLoop() {
    updateBG();
    if (paused) return;

    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    playerControl();
    let oldX = player.x;
    let oldY = player.y;
    let amt = 6 * dt;
    let newX = lerp(player.x, oldX, amt);
    let newY = lerp(player.y, oldY, amt);
    let w2 = player.width / 2;
    let h2 = player.height / 2;
    player.x = clamp(newX, 0 + w2, sceneWidth - w2);
    player.y = clamp(newY, 0 + h2, sceneHeight - h2);

    //update stat display
    sideInfo = `<div id='text'> <p>Score: ${score}</p>`;
    sideInfo += `<p>Time: ${getTimeString()}</p>`;
    sideInfo += `<p>Life: ${life}</p>`;
    sideInfo += "<p>Arrow keys and WASD to move</p>";
    sideInfo += "<p>[Spacebar] to fire</p> </div>";
    sideInfo += "<p>M to toggle sound</p>"
    sidebar.innerHTML = sideInfo;

    for (let b of playerBullets) {
        b.move(dt);
        if (b.y < -10) {
            b.isAlive = false;
        }
    }

    //update enemies
    spawnEnemy();

    for (let e of enemies) {
        e.move(dt * multiplier);
        if (e.y > sceneHeight + 10) {
            gameScene.removeChild(e);
            e.isAlive = false;
            score--;
        }
    }

    //enemyFire();
    //enemyBulletUpdate(dt);

    for (let e of enemies) {
        for (let pb of playerBullets) {
            if (rectsIntersect(e, pb)) {
                gameScene.removeChild(e);
                e.isAlive = false;
                gameScene.removeChild(pb);
                pb.isAlive = false;
                score++;
            }
        }
        if (e.isAlive && rectsIntersect(e, player)) {
            if (!muted)
                explosionSound.play();
            createExplosion(player.x, player.y, 64, 64);
            gameScene.removeChild(e);
            e.isAlive = false;
            life -= 10;
        }
    }

    // for (let eb of enemyBullets) {
    //     if (rectsIntersect(eb, player)) {
    //         gameScene.removeChild(eb);
    //         eb.isAlive = false;
    //         life-=5;
    //     }
    // }

    playerBullets = playerBullets.filter(pb => pb.isAlive);
    enemies = enemies.filter(e => e.isAlive);
    //enemyBullets = enemyBullets.filter(eb => eb.isAlive);

    if (count < 1000) {
        count++;
    }
    else {
        count = 0;
        score++;
        spawnRate++;
        multiplier += 0.2;
        bgSpeed += 0.2;
    }
    if (life <= 0) {
        endGame();
    }
}

function endGame() {
    paused = true;

    playerBullets.forEach(pb => gameScene.removeChild(pb));
    playerBullets = [];
    //enemyBullets.forEach(eb => gameScene.removeChild(eb));
    //enemyBullets = [];
    enemies.forEach(e => gameScene.removeChild(e));
    enemies = [];

    sideInfo = "<div id='text'  > <p>Arrow keys and WASD to move</p>";
    sideInfo += "<p>[Spacebar] to fire</p> </div>";
    sideInfo += "<p>M to toggle sound</p>"
    sidebar.innerHTML = sideInfo;

    gameOverScene.removeChild(gameOverText);
    gameOverText = new PIXI.Text("GAME OVER!\nScore: " + score + "\nTime: " + getTimeString());
    let textStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 75,
        fontFamily: "Montserrat",
        fontWeight: "bold",
        align: "center"
    });
    gameOverText.style = textStyle;
    gameOverText.x = 25;
    gameOverText.y = sceneHeight / 3 - 160;
    gameOverScene.addChild(gameOverText);

    startOverButton = new PIXI.Sprite(PIXI.Texture.from('images/StartOver_Button.png'));
    startOverButton.x = 40;
    startOverButton.y = 400;
    startOverButton.interactive = true;
    startOverButton.buttonMode = true;
    startOverButton.on("pointerup", startGame);
    startOverButton.on("pointerover", e => e.target.alpha = 0.7);
    startOverButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(startOverButton);

    gameOverScene.visible = true;
    gameScene.visible = false;
    backgroundMusic.stop();

}

function fireBullet() {
    if (paused) return;
    if (cooldown < player.fireRate) {
        cooldown++;
    }
    else {
        cooldown = 0;
        let b = new Bullet(0xFFFFFF, player.x, player.y);
        playerBullets.push(b);
        gameScene.addChild(b);
        if (!muted)
            shootSound.play();
    }
}

//uses the gradually increasing spawn rate and compares it against a 
//randomly generated number to decide if and what type of enemy to spawn
function spawnEnemy() {
    if (getRandom(0, 300) < spawnRate) {
        if (getRandom(0, 100) < 5) {
            //TODO: Implement new type of enemy
        }
        if (getRandom(0, 100) < 10) {
            let bu = new Buzzer(getRandom(0, sceneWidth), -10);
            enemies.push(bu);
            gameScene.addChild(bu);
        }
        if (getRandom(0, 100) < 25) {
            let bo = new Bomber(getRandom(0, sceneWidth), -10);
            enemies.push(bo);
            gameScene.addChild(bo);
        }
        if (getRandom(0, 100) < 50) {
            let a = new Angler(getRandom(0, sceneWidth), -10);
            enemies.push(a);
            gameScene.addChild(a);
        }
        if (getRandom(0, 100) < 75) {
            //TODO: Implement new type of enemy
        }
        if (getRandom(0, 100) < 80) {
            let d = new Drone(getRandom(0, sceneWidth), -10);
            enemies.push(d);
            gameScene.addChild(d);
        }
    }
}

//TODO:GET THIS WORKING
// function enemyFire() {
//     for (let i = 0; i < enemies.length; i++) {
//         switch (enemies[i].type) {
//             case "drone":
//                 if (enemies[i].cooldown < enemies[i].fireRate) {
//                     enemies[i].cooldown++;
//                 }
//                 else {
//                     enemies[i].cooldown = 0;
//                     let b = new Bullet(0xFA2C00, enemies[i].x, enemies[i].y, { x: 0, y: 1 });
//                     enemyBullets.push(b);
//                     gameScene.addChild(b);
//                 }
//                 break;
//             case "bomber":
//                 if (enemies[i].cooldown < enemies[i].fireRate) {
//                     enemies[i].cooldown++;
//                 }
//                 else {
//                     enemies[i].cooldown = 0;
//                     let b = new Bullet(0xFA2C00, enemies[i].x, enemies[i].y, { x: 0, y: 1 });
//                     enemyBullets.push(b);
//                     gameScene.addChild(b);
//                 }
//                 break;
//             case "angler":
//                 if (enemies[i].cooldown < enemies[i].fireRate) {
//                     enemies[i].cooldown++;
//                 }
//                 else {
//                     enemies[i].cooldown = 0;
//                     let b = new Bullet(0xFA2C00, enemies[i].x, enemies[i].y, { x: 0, y: 1 });
//                     enemyBullets.push(b);
//                     gameScene.addChild(b);
//                 }
//                 break;
//             case "buzzer":
//                 if (enemies[i].cooldown < enemies[i].fireRate) {
//                     enemies[i].cooldown++;
//                 }
//                 else {
//                     enemies[i].cooldown = 0;
//                     let b = new Bullet(0xFA2C00, enemies[i].x, enemies[i].y, { x: 0, y: 1 });
//                     enemyBullets.push(b);
//                     gameScene.addChild(b);
//                 }
//                 break;
//         }
//     }
// }
// function enemyBulletUpdate(dt) {
//     for (let eb of enemyBullets) {
//         eb.move(dt);
//         if (eb.y > sceneHeight + 10) {
//             eb.isAlive = false;
//         }
//         if (rectsIntersect(eb, player)) {
//             gameScene.removeChild(eb);
//             eb.isAlive = false;
//             life-=5;
//         }
//     }
// }

function loadSpriteSheet() {
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // https://pixijs.download/release/docs/PIXI.BaseTexture.html
    let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // https://pixijs.download/release/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    // https://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    // the animation frames are 64x64 pixels
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2; // we want the explosions to appear at the center of the circle
    expl.y = y - h2; // ditto
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();

}