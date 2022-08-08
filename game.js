import kaboom from "./kaboom.js";
kaboom({ background: [111, 119, 227] });
loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("block_blue", "block_blue.png");
loadSprite("block", "block.png");
loadSprite("coin", "coin.png");
loadSprite("castle", "castle.png");
loadSprite("surprise", "surprise.png");
loadSprite("pipe_up", "pipe_up.png");
loadSprite("evil_mushroom", "evil_mushroom.png");
loadSprite("star", "star.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("life", "life.png");
loadSprite("cloud", "cloud.png");
loadSprite("mushroom", "mushroom.png");
loadSound("jumpSound", "jumpSound.mp3");
loadSound("gameSound", "gameSound.mp3");

function patrol(distance = 100, speed = 60, dir = 1) {
  return {
    id: "patrol",
    require: ["pos", "area",],
    startingPos: vec2(0, 0),
    add() {
      this.startingPos = this.pos;
      this.on("collide", (obj, side) => {
        if (side === "left" || side === "right") {
          dir = -dir;
        }
      });
    },
    update() {
      if (Math.abs(this.pos.x - this.startingPos.x) >= distance) {
        dir = -dir;
      }
      this.move(speed * dir, 0);
    },
  };
}
scene("start", () => {

  add([
    text("Press space to start", { size: 24 }),
    pos(width() / 2, height() / 2),
    origin("center"),
    
  ]);

  onKeyRelease("space", () => {
    go("game");
  })
});

go("start");

scene("game", () => {
  layers(["bg", "obj", "ui"], "obj");
  play("gameSound");
  const map = [
    "                                                                                   ",
    "                                                                                   ",
    "                                                                                   ",
    "                                                                                   ",
    "                               !!!!!!                         !!!!!!!!             ",
    "                                                                                   ",
    "                                                                                   ",
    "                                                                                   ",
    "                                                                                   ",
    "                                                                                ^   ",
    "                                                                      =               E   =     ",
    "                                                                      =====================             ",
    "                                                                                                                     ",
    "        !!!                                =     !!!!                                               E=           ",
    "                                           =================----==================-===================                                        ",
    "                                     ===   =================    ======================================   ",
    "                                                                                                        ",
    "                              ===                                                                   ",
    "                         ===                                                                                           ",
    "                               ===                                                                    ",
    "                                     ===                         !!!!                                                           ",
    "                                         = E @      =                                                 ",
    "                                         ============                                                  ",
    "                                                                                  ^              ",
    "                                                                                                                           v    ",
    "                                                                                               ",
    "                                                                               $  =    $       E  $$          $$      $$$    E      $$$        @   E =  ",
    "                                                                                  ====================================================================       ",
    "                                                                                                                         ",
    "                                                                             ==                                      ",
    "                                                                       ==                                         ",
    "                                                                                                                 ",
    "        =  $*$ E      =                                                                                              ",
    "        =========--====                                           ==                                                                 ",
    "        =========  ==== ===                                                                                           ",
    "                             ==                             ==                                                                        ",
    "                                 ==                                                                                                    ",
    "                                    ==                ==                                                                               ",
    "                                            $$$                                                                                   +   ",
    "                                          =======                                                                                     ",
    "                                                                                                                                      ",
    "                                                                                                                                      ",
    "       v                                =                                                                                          ====",
    " =              E         E   $ $$ $    =                                                                                         =====",
    " ===============--==========--===========                                                                                =============",
    " ===============  ==========  ===========                                                                                =============",
  ];
  const mapkeys = {
    width: 20,
    height: 20,
    "=": () => [sprite("block"), solid(), area(), "block"],
    "-": () => [sprite("block_blue"), solid(), area(), "die"],
    "+": () => [sprite("castle"), solid(), area()],
    $: () => [sprite("coin"), area(), "coin"],
    "^": () => [sprite("surprise"), solid(), area(), "surprise-coin"],
    v: () => [sprite("surprise"), solid(), area(), "surprise-mushroom"],
    m: () => [sprite("mushroom"), area(),body(), "mushroom"],
    "*": () => [sprite("life"), area(), "life"],
    "!": () => [sprite("cloud")],
    "@": () => [sprite("pipe_up"), solid(), area(), "pipe"],
    x: () => [sprite("unboxed"), solid(), area()],
    E: () => [sprite("evil_mushroom"), solid(), area(), body(), patrol(), "evil1"],
    
  };
  const gamelevel = addLevel(map, mapkeys);

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    area(),
    big(),
  ]);

  //const score = add([
    //text("Score: 0"),
   // pos(player.pos.x,player.pos.y), origin("right"),
   //  {value: 0 },
  //]);

  onKeyDown("right", () => {
    player.move(200, 0);
  });
  onKeyDown("left", () => {
    player.move(-200, 0);
  });
  let isjumping=false
  onKeyDown("space", () => {
    if (player.isGrounded()) {
      play("jumpSound");
      player.jump(450);
      isjumping=true
    }
  });
  player.onHeadbutt((obj) => {
    if (obj.is("surprise-coin")) {
      gamelevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("x", obj.gridPos.sub(0, 0));
    }
  });
  player.onHeadbutt((obj) => {
    if (obj.is("surprise-mushroom")) {
      gamelevel.spawn("m", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("x", obj.gridPos.sub(0, 0));
    }
  });
  player.onCollide("coin", (x) => {
    destroy(x);
  });
  player.onCollide("life", (x) => {
    destroy(x);
  });
  player.onCollide("mushroom", (x) => {
    destroy(x);
    player.biggify(10)
  });
  player.onCollide("die", (x) => {
    shake(120);
    destroy(x);
  });
  player.onUpdate(() => {
    camPos(player.pos);
  });
  player.onCollide("pipe", () => {
   onKeyPress("down",()=>{
    go("win")
   })
  });
  onUpdate("mushroom", (mushroom) => {
    mushroom.move(70, 0);
  });

  

  player.onCollide("evil1", (x) => {
    if (isjumping)
    {
      destroy(x)
    }
    else{

      go("gameover");
    }
  });
  
  player.onUpdate(()=>{
    if(player.isGrounded()){
      isjumping=false
    }
    else{
      isjumping=true;
    }
  })


  //player.onCollide("coin", () => {
    //score.value += 1;
   // score.text = "Score:" + score.value;
//  });
  player.action(() => {
    camPos(player.pos);
    if (player.pos.y > 2000) go("gameover");
  });
})


scene("win", () => { 
  add([
  text("U ARE PRO DUDE "),
  pos(width() / 2, height() / 2),
  origin("center"),
]);
});

scene("gameover", () => {
  add([
    text("gameover\n hehehehe uwill never win baby "),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
});


