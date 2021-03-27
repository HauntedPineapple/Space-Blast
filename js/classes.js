class Ship extends PIXI.Sprite {
    constructor(x = 300, y = 600) {
        super(app.loader.resources["images/PlayerShip.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.5);
        this.x = x;
        this.y = y;
        this.fireRate = 10;
    }
}

class Drone extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/enemy1.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.5);
        this.x = x;
        this.y = y;
        this.hp = 10;
        this.speed = 100;
        this.fireRate = 15;
        this.cooldown=0;
        this.type = "drone";
        this.fwd = { x: 0, y: 1 };
        this.isAlive = true;
    }
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
class Bomber extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/enemy2.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.65);
        this.x = x;
        this.y = y;
        this.hp = 10;
        this.speed = 50;
        this.fireRate = 30;
        this.cooldown=0;
        this.type = "bomber";
        this.fwd = { x: 0, y: 1 };
        this.isAlive = true;
    }
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
class Angler extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/enemy3.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.55);
        this.x = x;
        this.y = y;
        this.hp = 20;
        this.speed = 120;
        this.fireRate = 10;
        this.cooldown=0;
        this.type = "angler";
        this.fwd = { x: 0, y: 1 };
        this.isAlive = true;
    }
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
class Buzzer extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/enemy4.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.4);
        this.x = x;
        this.y = y;
        this.hp = 10;
        this.speed = 150;
        this.fireRate = 20;
        this.cooldown=0;
        this.type = "buzzer";
        this.fwd = { x: 0, y: 1 };
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        let rand = getRandom(0, 100);
        if (rand % 35) {
            this.fwd *= -1;
        }
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFFFFFF, x = 0, y = 0, speed = 400, fwd = { x: 0, y: -1 }) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;
        this.fwd = fwd;
        this.speed = speed;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

