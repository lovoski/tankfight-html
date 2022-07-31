const {
    JSgameServer
} = require("lovoski_jsgameframework");

var fs = require("fs");

class PlayerTank {
    constructor(xDefault, yDefault, speed, tankNo) {
        this.xPos = xDefault;
        this.yPos = yDefault;
        this.curDir = -1;
        this.tankNo = tankNo;
        this.speed = speed;
        this.spaceCD = false;
        this.eCD = false;
        this.qCD = false;
        this.fCD = false;
        this.bsu = false;
        if (tankNo == -1) {
            this.hp = 1;
        } else {
            this.hp = 5000000000;
        }
        this.wfr = false;
    }
    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 48;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 48;
        return xc && yc;
    }
    updatePos(dir) {
        let tb = this.yPos <= 0;
        let lb = this.xPos <= 0;
        let db = this.yPos >= 672;
        let rb = this.xPos >= 952;
        this.curDir = dir;
        let ox = this.xPos,
            oy = this.yPos,
            od = this.curDir;
        if (dir == DIR_UP) {
            if (tb) return [ox, oy, od];
            this.yPos -= this.speed;
        } else if (dir == DIR_DOWN) {
            if (db) return [ox, oy, od];
            this.yPos += this.speed;
        } else if (dir == DIR_LEFT) {
            if (lb) return [ox, oy, od];
            this.xPos -= this.speed;
        } else if (dir == DIR_RIGHT) {
            if (rb) return [ox, oy, od];
            this.xPos += this.speed;
        }
        for (let i = 0; i < brickCollection.length; i++) {
            if (brickCollection[i].hp > 0) {
                let c = brickCollection[i].inHitBox(this.xPos, this.yPos, 48, 5);
                if (c) {
                    this.xPos = ox;
                    this.yPos = oy;
                    return [ox, oy, od];
                }
            }
        }
        for (let i = 0; i < enemyTankCollection.length; i++) {
            if (enemyTankCollection[i].hp > 0) {
                let c = enemyTankCollection[i].inHitBox(this.xPos, this.yPos, 48, 0);
                if (c) {
                    this.xPos = ox;
                    this.yPos = oy;
                    return [ox, oy, od];
                }
            }
        }
        if (boss.hp > 0) {
            let c = boss.inHitBox(this.xPos, this.yPos, 48, 0);
            if (c) {
                this.xPos = ox;
                this.yPos = oy;
                return [ox, oy, od];
            }
        }
        return [ox, oy, od];
    }
}

class Bullet {
    constructor(xPos, yPos, dir, speed, type = 21, damage = 1, flag = 2) {
        this.odX = xPos;
        this.odY = yPos;
        this.ox = xPos;
        this.oy = yPos;
        this.xPos = xPos;
        this.yPos = yPos;
        this.dir = dir;
        this.speed = speed;
        this.type = type;
        this.damage = damage;
        this.hp = 1;
        this.flag = flag;
        this.hitX = xPos;
        this.hitY = yPos;
        this.hitObj = 0;
        this.circleTimes = 0;
    }
    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 12;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 12;
        return xc && yc;
    }
}

class EnemyTank {
    constructor(xDefault, yDefault, dDir, tankNo, level, id) {
        this.xdt = xDefault;
        this.ydt = yDefault;
        this.xPos = xDefault;
        this.yPos = yDefault;
        this.ox = xDefault;
        this.oy = yDefault;
        this.curDir = dDir;
        this.tankNo = tankNo;
        this.speed = DEFAULT_TANK_SPEED;
        this.spaceCD = false;
        this.hp = level;
        this.level = level;
        this.wfr = false;
        this.life = 3;
        this.fixed = false;
        this.id = id;
    }
    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 48;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 48;
        return xc && yc;
    }
    updateState() {
        let that = this;
        if (that.hp <= 0) {
            if (!that.wfr && (boss.hp > 0 || that.life > 0)) {
                if (boss.hp <= 0) that.life--;
                that.wfr = true;
                setTimeout(function () {
                    that.xPos = that.xdt;
                    that.yPos = that.ydt;
                    that.ox = that.xdt;
                    that.oy = that.ydt;
                    that.hp = that.level;
                    that.speed = DEFAULT_TANK_SPEED;
                    that.fixed = false;
                    that.wfr = false;
                }, 10000); //enemy tank resurrects 10 seconds latter
            }
            return;
        }
        let tb = that.yPos <= 0;
        let lb = that.xPos <= 0;
        let db = that.yPos >= 672;
        let rb = that.xPos >= 952;
        that.ox = that.xPos;
        that.oy = that.yPos;
        let randSeed = Math.random();
        let changeRatio = 0.01;
        if (that.curDir == 1) {
            if (tb) {
                that.curDir += 1;
                return;
            }
            if (randSeed < changeRatio) {
                that.curDir += 2;
            }
            that.yPos -= that.speed;
        } else if (that.curDir == 2) {
            if (db) {
                that.curDir -= 1;
                return;
            }
            if (randSeed < changeRatio) {
                that.curDir += 2;
            }
            that.yPos += that.speed;
        } else if (that.curDir == 3) {
            if (lb) {
                that.curDir += 1;
                return;
            }
            if (randSeed < changeRatio) {
                that.curDir -= 2;
            }
            that.xPos -= that.speed;
        } else if (that.curDir == 4) {
            if (rb) {
                that.curDir -= 1;
                return;
            }
            if (randSeed < changeRatio) {
                that.curDir -= 2;
            }
            that.xPos += that.speed;
        }
        if (!that.fixed && findPlayerTank(that.xPos, that.yPos, that.curDir)) {
            that.speed = 0;
            that.xPos = that.ox;
            that.yPos = that.oy;
            that.fixed = true;
            setTimeout(function () {
                that.speed = DEFAULT_TANK_SPEED;
                that.fixed = false;
            }, 700);
            if (!that.spaceCD) {
                let bPos = bulletPos(
                    that.curDir, that.xPos, that.yPos, that.level == 4 ? 22 : 21);
                let nb = new Bullet(bPos[0], bPos[1], bPos[2], DEFAULT_BULLET_SPEED, that.level == 4 ? 22 : 21, that.level == 4 ? 2 : 1);
                bulletCollection.push(nb);
                that.spaceCD = true;
                setTimeout(function () {
                    that.spaceCD = false;
                }, that.level >= 3 ? 400 : 550);
            }
            return;
        }
        for (let i = 0; i < brickCollection.length; i++) {
            if (brickCollection[i].inHitBox(that.xPos, that.yPos, 48, 0)) {
                if (randSeed < 0.2) that.curDir = that.curDir > 2 ? that.curDir == 3 ? 1 : 3 : that.curDir == 2 ? 3 : 2;
                else that.curDir = that.curDir > 2 ? that.curDir == 3 ? 4 : 3 : that.curDir == 2 ? 1 : 2;
                that.xPos = that.ox;
                that.yPos = that.oy;
                return;
            }
        }
        for (let p in playerTankCollection) {
            if (playerTankCollection[p].inHitBox(that.xPos, that.yPos, 48, 0)) {
                that.speed = 0;
                that.xPos = that.ox;
                that.yPos = that.oy;
                setTimeout(function () {
                    that.speed = DEFAULT_TANK_SPEED;
                }, 700);
                return;
            }
        }
        for (let i = 0; i < enemyTankCollection.length; i++) {
            if (enemyTankCollection[i].id == that.id) continue;
            if (enemyTankCollection[i].inHitBox(that.xPos, that.yPos, 48, 0)) {
                that.xPos = that.ox;
                that.yPos = that.oy;
                that.curDir = (that.curDir + 1) % 4 + 1;
                return;
            }
        }
    }
}

class BossTank {
    constructor(xPos, yPos, dir) {
        this.ox = xPos;
        this.oy = yPos;
        this.xPos = xPos;
        this.yPos = yPos;
        this.flag = 1;
        this.curDir = dir;
        this.qCD = false;
        this.spaceCD = false;
        this.speed = 0.3;
        this.getDestroyed = false;
        this.hp = 70;
        this.turnRatio = 0.01;
        this.dealRatioDamage = false;
    }
    updateBossState() {
        let that = this;
        if (that.hp>0) {
            if (!that.qCD) {
                that.qCD = true;
                let bPos = [];
                for (let i = 1;i<=20;i++) {
                    bPos.push(bulletPos(that.curDir, that.xPos, that.yPos,i,96))
                }
                bulletCollection.push(new Bullet(bPos[0][0], bPos[0][1], bPos[0][2], DEFAULT_BULLET_SPEED*1.3,1,1,1));
                bulletCollection.push(new Bullet(bPos[1][0], bPos[1][1], bPos[1][2], DEFAULT_BULLET_SPEED*1.3,2,1,1));
                bulletCollection.push(new Bullet(bPos[2][0], bPos[2][1], bPos[2][2], DEFAULT_BULLET_SPEED*1.3,3,1,1));
                bulletCollection.push(new Bullet(bPos[3][0], bPos[3][1], bPos[3][2], DEFAULT_BULLET_SPEED*1.3,4,1,1));
                bulletCollection.push(new Bullet(bPos[4][0], bPos[4][1], bPos[4][2], DEFAULT_BULLET_SPEED*1.3,5,1,1));
                bulletCollection.push(new Bullet(bPos[5][0], bPos[5][1], bPos[5][2], DEFAULT_BULLET_SPEED*1.3,6,1,1));
                bulletCollection.push(new Bullet(bPos[6][0], bPos[6][1], bPos[6][2], DEFAULT_BULLET_SPEED*1.3,7,1,1));
                bulletCollection.push(new Bullet(bPos[7][0], bPos[7][1], bPos[7][2], DEFAULT_BULLET_SPEED*1.3,8,1,1));
                //bulletCollection.push(new Bullet(bPos[8][0], bPos[8][1], bPos[8][2], DEFAULT_BULLET_SPEED*1.3,9,1,1));
                bulletCollection.push(new Bullet(bPos[10][0], bPos[10][1], bPos[10][2], DEFAULT_BULLET_SPEED*1.3,11,1,1));
                bulletCollection.push(new Bullet(bPos[11][0], bPos[11][1], bPos[11][2], DEFAULT_BULLET_SPEED*1.3,12,1,1));
                bulletCollection.push(new Bullet(bPos[12][0], bPos[12][1], bPos[12][2], DEFAULT_BULLET_SPEED*1.3,13,1,1));
                bulletCollection.push(new Bullet(bPos[13][0], bPos[13][1], bPos[13][2], DEFAULT_BULLET_SPEED*1.3,14,1,1));
                bulletCollection.push(new Bullet(bPos[14][0], bPos[14][1], bPos[14][2], DEFAULT_BULLET_SPEED*1.3,15,1,1));
                bulletCollection.push(new Bullet(bPos[15][0], bPos[15][1], bPos[15][2], DEFAULT_BULLET_SPEED*1.3,16,1,1));
                bulletCollection.push(new Bullet(bPos[16][0], bPos[16][1], bPos[16][2], DEFAULT_BULLET_SPEED*1.3,17,1,1));
                bulletCollection.push(new Bullet(bPos[17][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED*1.3,18,1,1));
                //bulletCollection.push(new Bullet(bPos[18][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED*1.3,19,1,1));
                setTimeout(function() {
                    that.qCD = false;
                },2000);
            }
            if (this.bossFindPlayer()) {
                if(!that.spaceCD) {
                    that.spaceCD = true;
                    that.turnRatio = 0;
                    let bPos = bulletPos(that.curDir,that.xPos,that.yPos,22,96);
                    //bulletCollection.push(new Bullet(bPos[0],bPos[1],that.curDir,15,22,3));
                    for (let i = 1;i<=4;i++) {
                        if (that.curDir==i) {
                            let xy = i>2?[0,1]:[1,0];
                            bulletCollection.push(new Bullet(bPos[0]+xy[0]*6,bPos[1]+xy[1]*6,that.curDir,15,22,2));
                            bulletCollection.push(new Bullet(bPos[0]-xy[0]*6,bPos[1]-xy[1]*6,that.curDir,15,22,2));
                        }
                    }
                    setTimeout(function() {
                        that.spaceCD = false;
                    },400);
                    setTimeout(function() {
                        that.turnRatio = 0.01;
                    },10000);
                }
            }
            this.ox = this.xPos;
            this.oy = this.yPos;
            let randSeed = Math.random();
            if (randSeed<this.turnRatio) {
                this.curDir = (this.curDir+2)%4+1;
            } else {
                for (let i = 1;i<=4;i++) {
                    if (this.curDir==i) {
                        let mf = i>2?i==3?[-1,0]:[1,0]:i==1?[0,-1]:[0,1];
                        this.xPos += mf[0]*this.speed;
                        this.yPos += mf[1]*this.speed;
                    }
                }
            }
            if (!that.dealRatioDamage) {
                for (let p in playerTankCollection) {
                    if (playerTankCollection[p].inHitBox(that.xPos, that.yPos, 96, -48)) {
                        playerTankCollection[p].hp -= 1;
                    }
                }
                that.dealRatioDamage = true;
                setTimeout(function () {
                    that.dealRatioDamage = false;
                }, 1000);
            }
            for (let i = 0;i<brickCollection.length;i++) {
                if (brickCollection[i].inHitBox(this.xPos,this.yPos,96,0)) {//如果撞到墙壁，回位并改变方向
                    this.xPos = this.ox;
                    this.yPos = this.oy;
                    that.curDir = that.curDir>2?that.curDir==3?4:3:that.curDir==2?1:2;
                }
            }
            for (let p in playerTankCollection) {
                if (playerTankCollection[p].inHitBox(that.xPos,that.yPos,96,0)) {
                    that.speed = 0;
                    that.xPos = that.ox;
                    that.yPos = that.oy;
                    setTimeout(function() {
                        that.speed = 0.3;
                    },2000);
                    return;
                }
            }
        }
    }

    bossFindPlayer() {
        for (let p in playerTankCollection) {
            if (p=="home") continue;
            let px = playerTankCollection[p].xPos;
            let py = playerTankCollection[p].yPos;
            //console.log(px+"   "+py+"   "+this.curDir);
            if (this.curDir==1) {
                //console.log((px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py<this.yPos)
                return (px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py<this.yPos;//up
            } else if (this.curDir==2) {
                //console.log((px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py>this.yPos)
                return (px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py>this.yPos;//down
            } else if (this.curDir==3) {
                //console.log((py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px<this.xPos)
                return (py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px<this.xPos;//left
            } else if (this.curDir==4) {
                //console.log((py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px>this.xPos)
                return (py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px>this.xPos;//right
            }
        }
        return false;
    }
    updateBossState1() {
        let that = this;
        if (that.hp > 0) {
            if (!that.qCD) {
                that.qCD = true;
                let bPos = [];
                for (let i = 1; i <= 20; i++) {
                    bPos.push(bulletPos(that.curDir, that.xPos, that.yPos, i, 96))
                }
                bulletCollection.push(new Bullet(bPos[0][0], bPos[0][1], bPos[0][2], DEFAULT_BULLET_SPEED * 1.3, 1, 1, 1));
                bulletCollection.push(new Bullet(bPos[1][0], bPos[1][1], bPos[1][2], DEFAULT_BULLET_SPEED * 1.3, 2, 1, 1));
                bulletCollection.push(new Bullet(bPos[2][0], bPos[2][1], bPos[2][2], DEFAULT_BULLET_SPEED * 1.3, 3, 1, 1));
                bulletCollection.push(new Bullet(bPos[3][0], bPos[3][1], bPos[3][2], DEFAULT_BULLET_SPEED * 1.3, 4, 1, 1));
                bulletCollection.push(new Bullet(bPos[4][0], bPos[4][1], bPos[4][2], DEFAULT_BULLET_SPEED * 1.3, 5, 1, 1));
                bulletCollection.push(new Bullet(bPos[5][0], bPos[5][1], bPos[5][2], DEFAULT_BULLET_SPEED * 1.3, 6, 1, 1));
                bulletCollection.push(new Bullet(bPos[6][0], bPos[6][1], bPos[6][2], DEFAULT_BULLET_SPEED * 1.3, 7, 1, 1));
                bulletCollection.push(new Bullet(bPos[7][0], bPos[7][1], bPos[7][2], DEFAULT_BULLET_SPEED * 1.3, 8, 1, 1));
                //bulletCollection.push(new Bullet(bPos[8][0], bPos[8][1], bPos[8][2], DEFAULT_BULLET_SPEED*1.3,9,1,1));
                bulletCollection.push(new Bullet(bPos[10][0], bPos[10][1], bPos[10][2], DEFAULT_BULLET_SPEED * 1.3, 11, 1, 1));
                bulletCollection.push(new Bullet(bPos[11][0], bPos[11][1], bPos[11][2], DEFAULT_BULLET_SPEED * 1.3, 12, 1, 1));
                bulletCollection.push(new Bullet(bPos[12][0], bPos[12][1], bPos[12][2], DEFAULT_BULLET_SPEED * 1.3, 13, 1, 1));
                bulletCollection.push(new Bullet(bPos[13][0], bPos[13][1], bPos[13][2], DEFAULT_BULLET_SPEED * 1.3, 14, 1, 1));
                bulletCollection.push(new Bullet(bPos[14][0], bPos[14][1], bPos[14][2], DEFAULT_BULLET_SPEED * 1.3, 15, 1, 1));
                bulletCollection.push(new Bullet(bPos[15][0], bPos[15][1], bPos[15][2], DEFAULT_BULLET_SPEED * 1.3, 16, 1, 1));
                bulletCollection.push(new Bullet(bPos[16][0], bPos[16][1], bPos[16][2], DEFAULT_BULLET_SPEED * 1.3, 17, 1, 1));
                bulletCollection.push(new Bullet(bPos[17][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED * 1.3, 18, 1, 1));
                //bulletCollection.push(new Bullet(bPos[18][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED*1.3,19,1,1));
                setTimeout(function () {
                    that.qCD = false;
                }, 2000);
                if (this.bossFindPlayer()) {
                    if (!that.spaceCD) {
                        that.spaceCD = true;
                        that.turnRatio = 0;
                        let bPos = bulletPos(that.curDir, that.xPos, that.yPos, 22, 96);
                        //bulletCollection.push(new Bullet(bPos[0],bPos[1],that.curDir,15,22,3));
                        for (let i = 1; i <= 4; i++) {
                            if (that.curDir == i) {
                                let xy = i > 2 ? [0, 1] : [1, 0];
                                bulletCollection.push(new Bullet(bPos[0] + xy[0] * 6, bPos[1] + xy[1] * 6, that.curDir, 15, 22, 2));
                                bulletCollection.push(new Bullet(bPos[0] - xy[0] * 6, bPos[1] - xy[1] * 6, that.curDir, 15, 22, 2));
                            }
                        }
                        setTimeout(function () {
                            that.spaceCD = false;
                        }, 400);
                        setTimeout(function () {
                            that.turnRatio = 0.01;
                        }, 10000);
                    }
                }
                this.ox = this.xPos;
                this.oy = this.yPos;
                let randSeed = Math.random();

                if (randSeed < this.turnRatio) {
                    this.curDir = (this.curDir + 2) % 4 + 1;
                } else {
                    for (let i = 1; i <= 4; i++) {
                        if (this.curDir == i) {
                            let mf = i > 2 ? i == 3 ? [-1, 0] : [1, 0] : i == 1 ? [0, -1] : [0, 1];
                            this.xPos += mf[0] * this.speed;
                            this.yPos += mf[1] * this.speed;
                        }
                    }
                }

                for (let i = 0; i < brickCollection.length; i++) {
                    if (brickCollection[i].inHitBox(this.xPos, this.yPos, 96, 0)) { //如果撞到墙壁，回位并改变方向
                        this.xPos = this.ox;
                        this.yPos = this.oy;
                        that.curDir = that.curDir > 2 ? that.curDir == 3 ? 4 : 3 : that.curDir == 2 ? 1 : 2;
                    }
                }
                if (!that.dealRatioDamage) {
                    for (let p in playerTankCollection) {
                        if (playerTankCollection[p].inHitBox(that.xPos, that.yPos, 96, -48)) {
                            playerTankCollection[p].hp -= 1;
                        }
                    }
                    that.dealRatioDamage = true;
                    setTimeout(function () {
                        that.dealRatioDamage = false;
                    }, 1000);
                }

                for (let p in playerTankCollection) {
                    if (playerTankCollection[p].inHitBox(that.xPos, that.yPos, 96, 0)) {
                        that.speed = 0;
                        that.xPos = that.ox;
                        that.yPos = that.oy;
                        setTimeout(function () {
                            that.speed = 0.3;
                        }, 2000);
                        return;
                    }
                }
            }
        }
    }

    bossFindPlayer() {
        for (let p in playerTankCollection) {
            if (p == "home") continue;
            let px = playerTankCollection[p].xPos;
            let py = playerTankCollection[p].yPos;
            //console.log(px+"   "+py+"   "+this.curDir);
            if (this.curDir == 1) {
                //console.log((px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py<this.yPos)
                return (px > this.xPos ? px < this.xPos + 96 : px + 48 > this.xPos) && py < this.yPos; //up
            } else if (this.curDir == 2) {
                //console.log((px>this.xPos?px<this.xPos+96:px+48>this.xPos)&&py>this.yPos)
                return (px > this.xPos ? px < this.xPos + 96 : px + 48 > this.xPos) && py > this.yPos; //down
            } else if (this.curDir == 3) {
                //console.log((py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px<this.xPos)
                return (py > this.yPos ? py < this.yPos + 96 : py + 48 > this.yPos) && px < this.xPos; //left
            } else if (this.curDir == 4) {
                //console.log((py>this.yPos?py<this.yPos+96:py+48>this.yPos)&&px>this.xPos)
                return (py > this.yPos ? py < this.yPos + 96 : py + 48 > this.yPos) && px > this.xPos; //right
            }
        }
        return false;
    }

    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 96;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 96;
        return xc && yc;
    }
}

class Food {
    constructor(xDefault, yDefault, type) {
        this.xPos = xDefault;
        this.yPos = yDefault;
        this.type = type;
    }
    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 48;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 48;
        return xc && yc;
    }
}

class Brick {
    constructor(xDefault, yDefault, type) {
        this.xPos = xDefault;
        this.yPos = yDefault;
        this.hp = type < 10 ? type : 1;
        this.type = type;
        this.flag = 0;
    }
    inHitBox(x, y, size, tole) {
        x += tole;
        y += tole;
        size -= 2 * tole;
        let xc = false,
            yc = false;
        xc = x < this.xPos ? x + size > this.xPos : x < this.xPos + 24;
        yc = y < this.yPos ? y + size > this.yPos : y < this.yPos + 24;
        return xc && yc;
    }
}

function constructBricks(level, col) {
    let mapData = fs.readFileSync(level, "utf-8");
    let arr = mapData.split(" ");
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 1 || arr[i] == 3 || arr[i] == 5 || arr[i] == 80 || arr[i] == 81) {
            let bx = i % col;
            let by = (i - i % col) / col;
            brickCollection.push(new Brick(bx * 48, by * 48, arr[i]));
            brickCollection.push(new Brick(bx * 48 + 24, by * 48, arr[i]));
            brickCollection.push(new Brick(bx * 48, by * 48 + 24, arr[i]));
            brickCollection.push(new Brick(bx * 48 + 24, by * 48 + 24, arr[i]));
        } else if (arr[i] == 2) { //home
            let bx = i % col;
            let by = (i - i % col) / col;
            var home = new PlayerTank(bx * 48, by * 48, 0, -1);
            playerTankCollection["home"] = home;
        } else if (arr[i] >= 10 && arr[i] <= 13) { //enemy
            let bx = i % col;
            let by = (i - i % col) / col;
            var e = new EnemyTank(bx * 48, by * 48, 1, arr[i] - 10, arr[i] - 9, i);
            enemyTankCollection.push(e);
        }
    }
}

const DIR_UP = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;
const DIR_RIGHT = 4;
const DEFAULT_TANK_SPEED = 4;
const DEFAULT_BULLET_SPEED = 15;
var boss = new BossTank(400, 300, 1);
var homeExists = true;

var orbit1 = [],
    orbit2 = [];
var playerCollection = [];
var bulletCollection = [];
var brickCollection = [];
var playerTankCollection = {};
var enemyTankCollection = [];

function bulletPos(dir, x, y, type, size = 48) {
    if (type <= 20) {
        let dire = type <= 10 ? 1 : -1;
        x += (size - 12) / 2;
        y += (size - 12) / 2;
        if (type == 1 || type == 11) {
            return [x + dire * (size - 18), y, dir];
        } else if (type == 2 || type == 12) {
            return [x + dire * (size - 18), y + dire * (size - 18), dir];
        } else if (type == 3 || type == 13) {
            return [x + dire * (size - 18), y - dire * (size - 18), dir];
        } else if (type == 4 || type == 14) {
            return [x, y + dire * (size - 18), dir];
        } else if (type == 5 || type == 15) {
            return [x + dire * (size - 8), y + dire * (size - 23), dir];
        } else if (type == 6 || type == 16) {
            return [x + dire * (size - 23), y - dire * (size - 8), dir];
        } else if (type == 7 || type == 17) {
            return [x + dire * (size - 23), y + dire * (size - 8), dir];
        } else if (type == 8 || type == 18) {
            return [x + dire * (size - 8), y - dire * (size - 23), dir];
        } else if (type == 9 || type == 19) {
            return [];
        } else if (type == 10 || type == 20) {
            return [];
        }
    } else {
        if (dir == DIR_UP) {
            return [x + size / 2 - 6, y - 14, dir];
        } else if (dir == DIR_DOWN) {
            return [x + size / 2 - 6, y + size + 2, dir];
        } else if (dir == DIR_LEFT) {
            return [x - 14, y + size / 2 - 6, dir];
        } else if (dir == DIR_RIGHT) {
            return [x + size + 2, y + size / 2 - 6, dir];
        }
    }
}

function findPlayerTank(x, y, dir) {
    for (let p in playerTankCollection) {
        if (p == "home") continue;
        let px = playerTankCollection[p].xPos;
        let py = playerTankCollection[p].yPos;
        if (dir == 1) {
            return (px > x ? px < x + 48 : px + 48 > x) && py < y; //up
        } else if (dir == 2) {
            return (px > x ? px < x + 48 : px + 48 > x) && py > y; //down
        } else if (dir == 3) {
            return (py > y ? py < y + 48 : py + 48 > y) && px < x; //left
        } else if (dir == 4) {
            return (py > y ? py < y + 48 : py + 48 > y) && px > x; //right
        }
    }
    return false;
}

function updateEnemyTank() {
    let el = enemyTankCollection;
    let l = el.length;
    for (let i = 0; i < l; i++) {
        el[i].updateState();
    }
}

function updateBulletsPos() {
    for (let i = 0; i < bulletCollection.length; i++) {
        if (bulletCollection[i].flag == 0) {
            bulletCollection.splice(i, 1);
            i--;
        }
    }
    let l = bulletCollection.length;
    for (let i = 0; i < l; i++) {
        let b = bulletCollection[i];
        if (b == null) {
            continue;
        }
        let box = hitComponent(b.xPos, b.yPos);
        if (box[0] == 0) {
            b.hitObj = 1;
            enemyTankCollection[box[1]].hp -= b.damage;
            b.flag = 0;
            b.hitX = enemyTankCollection[box[1]].xPos;
            b.hitY = enemyTankCollection[box[1]].yPos;
        }
        if (box[0] == 1) {
            b.hitObj = 2;
            playerTankCollection[box[1]].hp -= b.damage;
            b.flag = 0;
            b.hitX = playerTankCollection[box[1]].xPos;
            b.hitY = playerTankCollection[box[1]].yPos;
        }
        if (box[0] == 2) {
            b.hitObj = 3;
            let hx = (bulletCollection[box[1]].xPos + b.xPos) / 2 - 18;
            let hy = (bulletCollection[box[1]].yPos + b.yPos) / 2 - 18;
            b.flag = 0;
            bulletCollection[box[1]].flag = 0;
            bulletCollection[box[1]].hitX = hx;
            bulletCollection[box[1]].hitY = hy;
            b.hitX = hx;
            b.hitY = hy;
        }
        if (box[0] == 3) {
            b.hitObj = 4;
            brickCollection[box[1]].hp -= b.damage;
            brickCollection[box[1]].flag = 0;
            b.flag = 0;
            b.hitX = brickCollection[box[1]].xPos;
            b.hitY = brickCollection[box[1]].yPos;
        }
        if (box[0] == 4) {
            b.hitObj = 0;
            boss.hp -= b.damage;
            b.flag = 0;
            boss.flag = 0;
            b.hitX = (boss.xPos + b.xPos) / 2;
            b.hitY = (boss.yPos + b.yPos) / 2;
        }
        if (b.xPos <= 0 || b.xPos >= 1000 || b.yPos <= 0 || b.yPos >= 720) {
            b.flag = 0;
            let tb = b.yPos <= 0;
            let lb = b.xPos <= 0;
            let db = b.yPos >= 720;
            let rb = b.xPos >= 1000;
            if (tb) {
                b.hitX = b.xPos - 18;
                b.hitY = b.yPos;
            } else if (lb) {
                b.hitX = b.xPos;
                b.hitY = b.yPos - 18;
            } else if (db) {
                b.hitX = b.xPos - 18;
                b.hitY = b.yPos - 58;
            } else if (rb) {
                b.hitX = b.xPos - 58;
                b.hitY = b.yPos - 18;
            }
        }
        b.ox = b.xPos;
        b.oy = b.yPos;
        if (b.flag == 0) continue;
        if (b.type == 21 || b.type == 22 || b.type == 23) {
            if (b.dir == DIR_UP) {
                b.yPos -= b.speed;
            } else if (b.dir == DIR_DOWN) {
                b.yPos += b.speed;
            } else if (b.dir == DIR_LEFT) {
                b.xPos -= b.speed;
            } else if (b.dir == DIR_RIGHT) {
                b.xPos += b.speed;
            }
        } else {

            for (let i = 1; i <= 20; i++) {
                if (b.type == i) {
                    let dire = i <= 10 ? 1 : -1;
                    let t = i <= 10 ? i : i - 10;
                    moveBullet(t, b, dire);
                }
            }

        }
    }
}

function moveBullet(type, b, dire) {
    if (type == 1) {
        b.xPos += dire * b.speed;
    } else if (type == 2) {
        b.xPos += dire * b.speed;
        b.yPos += dire * b.speed;
    } else if (type == 3) {
        b.xPos += dire * b.speed;
        b.yPos -= dire * b.speed;
    } else if (type == 4) {
        b.yPos += dire * b.speed;
    } else if (type == 5) {
        b.xPos = (dire * orbit1[b.circleTimes][0] + b.odX);
        b.yPos = (dire * orbit1[b.circleTimes][1] + b.odY);
        b.circleTimes++;
    } else if (type == 6) {
        b.xPos = (dire * orbit2[b.circleTimes][0] + b.odX);
        b.yPos = (dire * orbit2[b.circleTimes][1] + b.odY);
        b.circleTimes++;
    } else if (type == 7) {
        b.xPos = (dire * orbit2[b.circleTimes][0] + b.odX);
        b.yPos = (dire * orbit2[b.circleTimes][1] + b.odY);
        b.circleTimes++;
    } else if (type == 8) {
        b.xPos = (dire * orbit1[b.circleTimes][0] + b.odX);
        b.yPos = (dire * orbit1[b.circleTimes][1] + b.odY);
        b.circleTimes++;
    } else if (type == 9) {
        /*b.rou += 2;
        b.degree += 0.02;
        b.xPos = (dire*b.rou*Math.sin(b.degree)+b.odX);
        b.yPos = (dire*b.rou*Math.cos(b.degree)+b.odY);*/
    } else if (type == 10) {
        /*b.rou += 2;
        b.degree += 0.02;
        b.xPos = (dire*b.rou*Math.cos(b.degree)+b.odX);
        b.yPos = (dire*b.rou*Math.sin(b.degree)+b.odY);*/
    }
}

function hitComponent(x, y) {
    for (let i = 0; i < enemyTankCollection.length; i++) {
        //确保只有血量为正数的地方坦克可以被导弹识别
        if (!(enemyTankCollection[i].hp > 0)) continue;
        if (enemyTankCollection[i].inHitBox(x, y, 12, 0)) return [0, i];
    }
    for (let key in playerTankCollection) {
        //确保只有血量为正数的玩家可以被碰撞识别
        if (playerTankCollection[key].hp <= 0) continue;
        if (playerTankCollection[key].inHitBox(x, y, 12, 0)) return [1, key];
    }
    for (let i = 0; i < bulletCollection.length; i++) {
        if (bulletCollection[i].xPos == x && bulletCollection[i].yPos == y) {
            continue;
        }
        if (bulletCollection[i].inHitBox(x, y, 12, 3)) return [2, i];
    }
    for (let i = 0; i < brickCollection.length; i++) {
        if (brickCollection[i].hp <= 0) continue;
        if (brickCollection[i].inHitBox(x, y, 12, -3)) return [3, i];
    }
    if (boss.hp > 0) {
        if (boss.inHitBox(x, y, 12, 0)) return [4];
    }
    return [-1];
}

function loadOribit() {
    let tmp = fs.readFileSync("./resources/orbit", "utf-8");
    let data = JSON.parse(tmp);
    orbit1 = data["o1"];
    orbit2 = data["o2"];
}

function calculate(obj, clientNum) {
    if (obj.gameMode == 1) { //single player mode (use the same key board)
        //this mode allows only two players to play
        if (obj.playerNum == -1) {
            return;
        }
        if (playerCollection.length != 2) {
            playerTankCollection["p" + 1] = new PlayerTank(playerTankCollection["home"].xPos, playerTankCollection["home"].yPos, DEFAULT_TANK_SPEED, 1);
            playerTankCollection["p" + 2] = new PlayerTank(playerTankCollection["home"].xPos, playerTankCollection["home"].yPos, DEFAULT_TANK_SPEED, 2);
            playerCollection.push(1);
            playerCollection.push(2);
            //console.log("this should be shown only once:"+playerCollection.length);
        }

        if (playerTankCollection["home"].hp <= 0) homeExists = false;
        for (let i = 0; i < bulletCollection.length; i++) {
            if (bulletCollection[i].flag == 2) bulletCollection[i].flag = 1;
        }
        for (let i = 0; i < brickCollection.length; i++) {
            if (brickCollection[i].flag == 1) {
                brickCollection.splice(i, 1);
                i--;
            }
        }
        if (boss.flag == 0) boss.flag == 1;
        let keySet = obj.keySet;
        let customObj = obj.customObj;

        let oPos1 = [0, 0, 0];
        let movement1 = [32, 28, 10, 13];
        for (let i = 0; i < 4; i++) {
            if (keySet[movement1[i]]) {
                oPos1 = playerTankCollection["p" + 1].updatePos(i + 1);
                break;
            }
        }

        let oPos2 = [0, 0, 0];
        let movement2 = [37, 39, 36, 38];
        for (let i = 0; i < 4; i++) {
            if (keySet[movement2[i]]) {
                oPos2 = playerTankCollection["p" + 2].updatePos(i + 1);
                break;
            }
        }

        if (playerTankCollection["p" + 1].hp <= 0) {
            let ox = playerTankCollection["p" + 1].xPos,
                oy = playerTankCollection["p" + 1].yPos,
                od = playerTankCollection["p" + 1].curDir;
            if (od == 1) {
                oy += playerTankCollection["p" + 1].speed;
            } else if (od == 2) {
                oy -= playerTankCollection["p" + 1].speed;
            } else if (od == 3) {
                ox += playerTankCollection["p" + 1].speed;
            } else if (od == 4) {
                ox -= playerTankCollection["p" + 1].speed;
            }
            oPos1 = [ox, oy, od]
            if (homeExists) {
                if (!playerTankCollection["p" + 1].wfr) {
                    playerTankCollection["p" + 1].wfr = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 1].xPos = playerTankCollection["home"].xPos;
                        playerTankCollection["p" + 1].yPos = playerTankCollection["home"].yPos;
                        playerTankCollection["p" + 1].hp = 5;
                        playerTankCollection["p" + 1].wfr = false;
                        boss.hp += 3;
                    }, 5000);
                }
            }
        }

        if (playerTankCollection["p" + 2].hp <= 0) {
            let ox = playerTankCollection["p" + 2].xPos,
                oy = playerTankCollection["p" + 2].yPos,
                od = playerTankCollection["p" + 2].curDir;
            if (od == 2) {
                oy += playerTankCollection["p" + 2].speed;
            } else if (od == 2) {
                oy -= playerTankCollection["p" + 2].speed;
            } else if (od == 3) {
                ox += playerTankCollection["p" + 2].speed;
            } else if (od == 4) {
                ox -= playerTankCollection["p" + 2].speed;
            }
            oPos2 = [ox, oy, od]
            if (homeExists) {
                if (!playerTankCollection["p" + 2].wfr) {
                    playerTankCollection["p" + 2].wfr = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 2].xPos = playerTankCollection["home"].xPos;
                        playerTankCollection["p" + 2].yPos = playerTankCollection["home"].yPos;
                        playerTankCollection["p" + 2].hp = 5;
                        playerTankCollection["p" + 2].wfr = false;
                        boss.hp += 3;
                    }, 5000);
                }
            }
        }

        if (playerTankCollection["p" + 1].hp > 0) {
            //玩家坦克还有hp时可以进行操作
            if (keySet[40]) {
                if (!playerTankCollection["p" + 1].spaceCD) {
                    let bPos = bulletPos(playerTankCollection["p" + 1].curDir, playerTankCollection["p" + 1].xPos, playerTankCollection["p" + 1].yPos, 21);
                    let nb = new Bullet(bPos[0], bPos[1], bPos[2], DEFAULT_BULLET_SPEED);
                    bulletCollection.push(nb);
                    playerTankCollection["p" + 1].spaceCD = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 1].spaceCD = false;
                    }, playerTankCollection["p" + 1].bsu ? 300 : 500);
                }
            }
            if (keySet[15]) { //bullet that can recover health for hit target
                if (!playerTankCollection["p" + 1].fCD) {
                    playerTankCollection["p" + 1].fCD = true;
                    let bPos = bulletPos(playerTankCollection["p" + 1].curDir, playerTankCollection["p" + 1].xPos, playerTankCollection["p" + 1].yPos, 23)
                    bulletCollection.push(new Bullet(bPos[0], bPos[1], bPos[2], 4, 23, -2, 1));
                    setTimeout(function () {
                        playerTankCollection["p" + 1].fCD = false;
                    }, 10000);
                }
            }
            if (keySet[26]) {
                if (!playerTankCollection["p" + 1].qCD) {
                    playerTankCollection["p" + 1].qCD = true;
                    let bPos = [];
                    for (let i = 1; i <= 20; i++) {
                        bPos.push(bulletPos(
                            playerTankCollection["p" + 1].curDir, playerTankCollection["p" + 1].xPos, playerTankCollection["p" + 1].yPos, i))
                    }
                    bulletCollection.push(new Bullet(bPos[0][0], bPos[0][1], bPos[0][2], DEFAULT_BULLET_SPEED * 1.3, 1, 1, 1));
                    bulletCollection.push(new Bullet(bPos[1][0], bPos[1][1], bPos[1][2], DEFAULT_BULLET_SPEED * 1.3, 2, 1, 1));
                    bulletCollection.push(new Bullet(bPos[2][0], bPos[2][1], bPos[2][2], DEFAULT_BULLET_SPEED * 1.3, 3, 1, 1));
                    bulletCollection.push(new Bullet(bPos[3][0], bPos[3][1], bPos[3][2], DEFAULT_BULLET_SPEED * 1.3, 4, 1, 1));
                    bulletCollection.push(new Bullet(bPos[4][0], bPos[4][1], bPos[4][2], DEFAULT_BULLET_SPEED * 1.3, 5, 1, 1));
                    bulletCollection.push(new Bullet(bPos[5][0], bPos[5][1], bPos[5][2], DEFAULT_BULLET_SPEED * 1.3, 6, 1, 1));
                    bulletCollection.push(new Bullet(bPos[6][0], bPos[6][1], bPos[6][2], DEFAULT_BULLET_SPEED * 1.3, 7, 1, 1));
                    bulletCollection.push(new Bullet(bPos[7][0], bPos[7][1], bPos[7][2], DEFAULT_BULLET_SPEED * 1.3, 8, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[8][0], bPos[8][1], bPos[8][2], DEFAULT_BULLET_SPEED*1.3,9,1,1));
                    //bulletCollection.push(new Bullet(bPos[9][0], bPos[9][1], bPos[9][2], DEFAULT_BULLET_SPEED*1.3,10,1,1));
                    bulletCollection.push(new Bullet(bPos[10][0], bPos[10][1], bPos[10][2], DEFAULT_BULLET_SPEED * 1.3, 11, 1, 1));
                    bulletCollection.push(new Bullet(bPos[11][0], bPos[11][1], bPos[11][2], DEFAULT_BULLET_SPEED * 1.3, 12, 1, 1));
                    bulletCollection.push(new Bullet(bPos[12][0], bPos[12][1], bPos[12][2], DEFAULT_BULLET_SPEED * 1.3, 13, 1, 1));
                    bulletCollection.push(new Bullet(bPos[13][0], bPos[13][1], bPos[13][2], DEFAULT_BULLET_SPEED * 1.3, 14, 1, 1));
                    bulletCollection.push(new Bullet(bPos[14][0], bPos[14][1], bPos[14][2], DEFAULT_BULLET_SPEED * 1.3, 15, 1, 1));
                    bulletCollection.push(new Bullet(bPos[15][0], bPos[15][1], bPos[15][2], DEFAULT_BULLET_SPEED * 1.3, 16, 1, 1));
                    bulletCollection.push(new Bullet(bPos[16][0], bPos[16][1], bPos[16][2], DEFAULT_BULLET_SPEED * 1.3, 17, 1, 1));
                    bulletCollection.push(new Bullet(bPos[17][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED * 1.3, 18, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[18][0], bPos[18][1], bPos[18][2], DEFAULT_BULLET_SPEED*1.3,19,1,1));
                    //bulletCollection.push(new Bullet(bPos[19][0], bPos[19][1], bPos[19][2], DEFAULT_BULLET_SPEED*1.3,20,1,1));
                    setTimeout(function () {
                        playerTankCollection["p" + 1].qCD = false;
                    }, 6000);
                }
            }
            if (keySet[14]) {
                if (!playerTankCollection["p" + 1].eCD) {
                    playerTankCollection["p" + 1].speed *= 2;
                    playerTankCollection["p" + 1].eCD = true;
                    playerTankCollection["p" + 1].bsu = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 1].speed *= 0.5;
                        playerTankCollection["p" + 1].bsu = false;
                        setTimeout(function () {
                            playerTankCollection["p" + 1].eCD = false;
                        }, 5000);
                    }, 3000);
                }
            }
        }

        if (playerTankCollection["p" + 2].hp > 0) {
            //玩家坦克还有hp时可以进行操作
            if (keySet[0]) {
                if (!playerTankCollection["p" + 2].spaceCD) {
                    let bPos = bulletPos(playerTankCollection["p" + 2].curDir, playerTankCollection["p" + 2].xPos, playerTankCollection["p" + 2].yPos, 21);
                    let nb = new Bullet(bPos[0], bPos[1], bPos[2], DEFAULT_BULLET_SPEED);
                    bulletCollection.push(nb);
                    playerTankCollection["p" + 2].spaceCD = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 2].spaceCD = false;
                    }, playerTankCollection["p" + 2].bsu ? 300 : 500);
                }
            }
            if (keySet[3]) { //bullet that can recover health for hit target
                if (!playerTankCollection["p" + 2].fCD) {
                    playerTankCollection["p" + 2].fCD = true;
                    let bPos = bulletPos(playerTankCollection["p" + 2].curDir, playerTankCollection["p" + 2].xPos, playerTankCollection["p" + 2].yPos, 23)
                    bulletCollection.push(new Bullet(bPos[0], bPos[1], bPos[2], 4, 23, -2, 1));
                    setTimeout(function () {
                        playerTankCollection["p" + 2].fCD = false;
                    }, 10000);
                }
            }
            if (keySet[1]) {
                if (!playerTankCollection["p" + 2].qCD) {
                    playerTankCollection["p" + 2].qCD = true;
                    let bPos = [];
                    for (let i = 1; i <= 20; i++) {
                        bPos.push(bulletPos(
                            playerTankCollection["p" + 2].curDir, playerTankCollection["p" + 2].xPos, playerTankCollection["p" + 2].yPos, i))
                    }
                    bulletCollection.push(new Bullet(bPos[0][0], bPos[0][1], bPos[0][2], DEFAULT_BULLET_SPEED * 1.3, 1, 1, 1));
                    bulletCollection.push(new Bullet(bPos[1][0], bPos[1][1], bPos[1][2], DEFAULT_BULLET_SPEED * 1.3, 2, 1, 1));
                    bulletCollection.push(new Bullet(bPos[2][0], bPos[2][1], bPos[2][2], DEFAULT_BULLET_SPEED * 1.3, 3, 1, 1));
                    bulletCollection.push(new Bullet(bPos[3][0], bPos[3][1], bPos[3][2], DEFAULT_BULLET_SPEED * 1.3, 4, 1, 1));
                    bulletCollection.push(new Bullet(bPos[4][0], bPos[4][1], bPos[4][2], DEFAULT_BULLET_SPEED * 1.3, 5, 1, 1));
                    bulletCollection.push(new Bullet(bPos[5][0], bPos[5][1], bPos[5][2], DEFAULT_BULLET_SPEED * 1.3, 6, 1, 1));
                    bulletCollection.push(new Bullet(bPos[6][0], bPos[6][1], bPos[6][2], DEFAULT_BULLET_SPEED * 1.3, 7, 1, 1));
                    bulletCollection.push(new Bullet(bPos[7][0], bPos[7][1], bPos[7][2], DEFAULT_BULLET_SPEED * 1.3, 8, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[8][0], bPos[8][1], bPos[8][2], DEFAULT_BULLET_SPEED*1.3,9,1,1));
                    //bulletCollection.push(new Bullet(bPos[9][0], bPos[9][1], bPos[9][2], DEFAULT_BULLET_SPEED*1.3,10,1,1));
                    bulletCollection.push(new Bullet(bPos[10][0], bPos[10][1], bPos[10][2], DEFAULT_BULLET_SPEED * 1.3, 11, 1, 1));
                    bulletCollection.push(new Bullet(bPos[11][0], bPos[11][1], bPos[11][2], DEFAULT_BULLET_SPEED * 1.3, 12, 1, 1));
                    bulletCollection.push(new Bullet(bPos[12][0], bPos[12][1], bPos[12][2], DEFAULT_BULLET_SPEED * 1.3, 13, 1, 1));
                    bulletCollection.push(new Bullet(bPos[13][0], bPos[13][1], bPos[13][2], DEFAULT_BULLET_SPEED * 1.3, 14, 1, 1));
                    bulletCollection.push(new Bullet(bPos[14][0], bPos[14][1], bPos[14][2], DEFAULT_BULLET_SPEED * 1.3, 15, 1, 1));
                    bulletCollection.push(new Bullet(bPos[15][0], bPos[15][1], bPos[15][2], DEFAULT_BULLET_SPEED * 1.3, 16, 1, 1));
                    bulletCollection.push(new Bullet(bPos[16][0], bPos[16][1], bPos[16][2], DEFAULT_BULLET_SPEED * 1.3, 17, 1, 1));
                    bulletCollection.push(new Bullet(bPos[17][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED * 1.3, 18, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[18][0], bPos[18][1], bPos[18][2], DEFAULT_BULLET_SPEED*1.3,19,1,1));
                    //bulletCollection.push(new Bullet(bPos[19][0], bPos[19][1], bPos[19][2], DEFAULT_BULLET_SPEED*1.3,20,1,1));
                    setTimeout(function () {
                        playerTankCollection["p" + 2].qCD = false;
                    }, 6000);
                }
            }
            if (keySet[2]) {
                if (!playerTankCollection["p" + 2].eCD) {
                    playerTankCollection["p" + 2].speed *= 2;
                    playerTankCollection["p" + 2].eCD = true;
                    playerTankCollection["p" + 2].bsu = true;
                    setTimeout(function () {
                        playerTankCollection["p" + 2].speed *= 0.5;
                        playerTankCollection["p" + 2].bsu = false;
                        setTimeout(function () {
                            playerTankCollection["p" + 2].eCD = false;
                        }, 5000);
                    }, 3000);
                }
            }
        }

        updateEnemyTank();
        updateBulletsPos();
        boss.updateBossState();

        let p1 = {
            "name": "p" + obj.playerNum,
            "hp": playerTankCollection["p" + 1].hp,
            "tankNo": playerTankCollection["p" + 1].tankNo,
            "x": playerTankCollection["p" + 1].xPos,
            "y": playerTankCollection["p" + 1].yPos,
            "dir": playerTankCollection["p" + 1].curDir,
            "ox": oPos1[0],
            "oy": oPos1[1],
            "od": oPos1[2]
        };
        let p2 = {
            "name": "p" + obj.playerNum,
            "hp": playerTankCollection["p" + 2].hp,
            "tankNo": playerTankCollection["p" + 2].tankNo,
            "x": playerTankCollection["p" + 2].xPos,
            "y": playerTankCollection["p" + 2].yPos,
            "dir": playerTankCollection["p" + 2].curDir,
            "ox": oPos2[0],
            "oy": oPos2[1],
            "od": oPos2[2]
        };

        let rtObj = {};
        rtObj["home"] = playerTankCollection["home"];
        rtObj["p1"] = p1;
        rtObj["p2"] = p2;
        rtObj["boss"] = boss;
        rtObj["bulletCollection"] = bulletCollection;
        rtObj["enemyTankCollection"] = enemyTankCollection;
        rtObj["brickCollection"] = brickCollection;
        return JSON.stringify(rtObj);


    } else { //double player mode
        if (obj.playerNum == -1) {
            return;
        }
        if (playerTankCollection["home"].hp <= 0) homeExists = false;
        for (let i = 0; i < bulletCollection.length; i++) {
            if (bulletCollection[i].flag == 2) bulletCollection[i].flag = 1;
        }
        for (let i = 0; i < brickCollection.length; i++) {
            if (brickCollection[i].flag == 1) {
                brickCollection.splice(i, 1);
                i--;
            }
        }
        if (boss.flag == 0) boss.flag == 1;
        let keySet = obj.keySet;
        let customObj = obj.customObj;
        if (playerCollection.length == 0 || !(playerCollection.includes(("p" + obj.playerNum)))) {
            playerCollection.push("p" + obj.playerNum);
            let nPlayerTank = new PlayerTank(playerTankCollection["home"].xPos, playerTankCollection["home"].yPos, DEFAULT_TANK_SPEED, obj.playerNum);
            playerTankCollection["p" + obj.playerNum] = nPlayerTank;
        }
        let oPos = [0, 0, 0];
        let movement = [32, 28, 10, 13];
        for (let i = 0; i < 4; i++) {
            if (keySet[movement[i]]) {
                oPos = playerTankCollection["p" + obj.playerNum].updatePos(i + 1);
                break;
            }
        }

        //检查玩家的状况
        if (playerTankCollection["p" + obj.playerNum].hp <= 0) {
            let ox = playerTankCollection["p" + obj.playerNum].xPos,
                oy = playerTankCollection["p" + obj.playerNum].yPos,
                od = playerTankCollection["p" + obj.playerNum].curDir;
            if (od == 1) {
                oy += playerTankCollection["p" + obj.playerNum].speed;
            } else if (od == 2) {
                oy -= playerTankCollection["p" + obj.playerNum].speed;
            } else if (od == 3) {
                ox += playerTankCollection["p" + obj.playerNum].speed;
            } else if (od == 4) {
                ox -= playerTankCollection["p" + obj.playerNum].speed;
            }
            oPos = [ox, oy, od]
            if (homeExists) {
                if (!playerTankCollection["p" + obj.playerNum].wfr) {
                    playerTankCollection["p" + obj.playerNum].wfr = true;
                    setTimeout(function () {
                        playerTankCollection["p" + obj.playerNum].xPos = playerTankCollection["home"].xPos;
                        playerTankCollection["p" + obj.playerNum].yPos = playerTankCollection["home"].yPos;
                        playerTankCollection["p" + obj.playerNum].hp = 5;
                        playerTankCollection["p" + obj.playerNum].wfr = false;
                        boss.hp += 3;
                    }, 5000);
                }
            }
        }
        if (playerTankCollection["p" + obj.playerNum].hp > 0) {
            //玩家坦克还有hp时可以进行操作
            if (keySet[40]) {
                if (!playerTankCollection["p" + obj.playerNum].spaceCD) {
                    let bPos = bulletPos(playerTankCollection["p" + obj.playerNum].curDir, playerTankCollection["p" + obj.playerNum].xPos, playerTankCollection["p" + obj.playerNum].yPos, 21);
                    let nb = new Bullet(bPos[0], bPos[1], bPos[2], DEFAULT_BULLET_SPEED);
                    bulletCollection.push(nb);
                    playerTankCollection["p" + obj.playerNum].spaceCD = true;
                    setTimeout(function () {
                        playerTankCollection["p" + obj.playerNum].spaceCD = false;
                    }, playerTankCollection["p" + obj.playerNum].bsu ? 300 : 500);
                }
            }
            if (keySet[15]) { //bullet that can recover health for hit target
                if (!playerTankCollection["p" + obj.playerNum].fCD) {
                    playerTankCollection["p" + obj.playerNum].fCD = true;
                    let bPos = bulletPos(playerTankCollection["p" + obj.playerNum].curDir, playerTankCollection["p" + obj.playerNum].xPos, playerTankCollection["p" + obj.playerNum].yPos, 23)
                    bulletCollection.push(new Bullet(bPos[0], bPos[1], bPos[2], 4, 23, -2, 1));
                    setTimeout(function () {
                        playerTankCollection["p" + obj.playerNum].fCD = false;
                    }, 10000);
                }
            }
            if (keySet[26]) {
                if (!playerTankCollection["p" + obj.playerNum].qCD) {
                    playerTankCollection["p" + obj.playerNum].qCD = true;
                    let bPos = [];
                    for (let i = 1; i <= 20; i++) {
                        bPos.push(bulletPos(
                            playerTankCollection["p" + obj.playerNum].curDir, playerTankCollection["p" + obj.playerNum].xPos, playerTankCollection["p" + obj.playerNum].yPos, i))
                    }
                    bulletCollection.push(new Bullet(bPos[0][0], bPos[0][1], bPos[0][2], DEFAULT_BULLET_SPEED * 1.3, 1, 1, 1));
                    bulletCollection.push(new Bullet(bPos[1][0], bPos[1][1], bPos[1][2], DEFAULT_BULLET_SPEED * 1.3, 2, 1, 1));
                    bulletCollection.push(new Bullet(bPos[2][0], bPos[2][1], bPos[2][2], DEFAULT_BULLET_SPEED * 1.3, 3, 1, 1));
                    bulletCollection.push(new Bullet(bPos[3][0], bPos[3][1], bPos[3][2], DEFAULT_BULLET_SPEED * 1.3, 4, 1, 1));
                    bulletCollection.push(new Bullet(bPos[4][0], bPos[4][1], bPos[4][2], DEFAULT_BULLET_SPEED * 1.3, 5, 1, 1));
                    bulletCollection.push(new Bullet(bPos[5][0], bPos[5][1], bPos[5][2], DEFAULT_BULLET_SPEED * 1.3, 6, 1, 1));
                    bulletCollection.push(new Bullet(bPos[6][0], bPos[6][1], bPos[6][2], DEFAULT_BULLET_SPEED * 1.3, 7, 1, 1));
                    bulletCollection.push(new Bullet(bPos[7][0], bPos[7][1], bPos[7][2], DEFAULT_BULLET_SPEED * 1.3, 8, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[8][0], bPos[8][1], bPos[8][2], DEFAULT_BULLET_SPEED*1.3,9,1,1));
                    //bulletCollection.push(new Bullet(bPos[9][0], bPos[9][1], bPos[9][2], DEFAULT_BULLET_SPEED*1.3,10,1,1));
                    bulletCollection.push(new Bullet(bPos[10][0], bPos[10][1], bPos[10][2], DEFAULT_BULLET_SPEED * 1.3, 11, 1, 1));
                    bulletCollection.push(new Bullet(bPos[11][0], bPos[11][1], bPos[11][2], DEFAULT_BULLET_SPEED * 1.3, 12, 1, 1));
                    bulletCollection.push(new Bullet(bPos[12][0], bPos[12][1], bPos[12][2], DEFAULT_BULLET_SPEED * 1.3, 13, 1, 1));
                    bulletCollection.push(new Bullet(bPos[13][0], bPos[13][1], bPos[13][2], DEFAULT_BULLET_SPEED * 1.3, 14, 1, 1));
                    bulletCollection.push(new Bullet(bPos[14][0], bPos[14][1], bPos[14][2], DEFAULT_BULLET_SPEED * 1.3, 15, 1, 1));
                    bulletCollection.push(new Bullet(bPos[15][0], bPos[15][1], bPos[15][2], DEFAULT_BULLET_SPEED * 1.3, 16, 1, 1));
                    bulletCollection.push(new Bullet(bPos[16][0], bPos[16][1], bPos[16][2], DEFAULT_BULLET_SPEED * 1.3, 17, 1, 1));
                    bulletCollection.push(new Bullet(bPos[17][0], bPos[17][1], bPos[17][2], DEFAULT_BULLET_SPEED * 1.3, 18, 1, 1));
                    //bulletCollection.push(new Bullet(bPos[18][0], bPos[18][1], bPos[18][2], DEFAULT_BULLET_SPEED*1.3,19,1,1));
                    //bulletCollection.push(new Bullet(bPos[19][0], bPos[19][1], bPos[19][2], DEFAULT_BULLET_SPEED*1.3,20,1,1));
                    setTimeout(function () {
                        playerTankCollection["p" + obj.playerNum].qCD = false;
                    }, 6000);
                }
            }
            if (keySet[14]) {
                if (!playerTankCollection["p" + obj.playerNum].eCD) {
                    playerTankCollection["p" + obj.playerNum].speed *= 2;
                    playerTankCollection["p" + obj.playerNum].eCD = true;
                    playerTankCollection["p" + obj.playerNum].bsu = true;
                    setTimeout(function () {
                        playerTankCollection["p" + obj.playerNum].speed *= 0.5;
                        playerTankCollection["p" + obj.playerNum].bsu = false;
                        setTimeout(function () {
                            playerTankCollection["p" + obj.playerNum].eCD = false;
                        }, 5000);
                    }, 3000);
                }
            }
        }
        if (obj.playerNum == 1) {
            updateEnemyTank();
            updateBulletsPos();
            boss.updateBossState();
        }
        /* updateEnemyTank();
        updateBulletsPos();
        boss.updateBossState(); */

        let p = {
            "name": "p" + obj.playerNum,
            "hp": playerTankCollection["p" + obj.playerNum].hp,
            "tankNo": playerTankCollection["p" + obj.playerNum].tankNo,
            "x": playerTankCollection["p" + obj.playerNum].xPos,
            "y": playerTankCollection["p" + obj.playerNum].yPos,
            "dir": playerTankCollection["p" + obj.playerNum].curDir,
            "ox": oPos[0],
            "oy": oPos[1],
            "od": oPos[2]
        };
        let rtObj = {};
        rtObj["home"] = playerTankCollection["home"];
        rtObj["p"] = p;
        rtObj["boss"] = boss;
        rtObj["bulletCollection"] = bulletCollection;
        rtObj["enemyTankCollection"] = enemyTankCollection;
        rtObj["brickCollection"] = brickCollection;
        return JSON.stringify(rtObj);
    }

};
loadOribit();
constructBricks("resources/map/level1.lvlmap", 21);
var gameServer = new JSgameServer(calculate, "127.0.0.1", 9807);
gameServer.launch();