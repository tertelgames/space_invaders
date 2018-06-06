engine.world.gravity.y = 0;

var playing = false;

var score = 0;

var backgroundImg = new Sprite('images/background.png');
var shipImg = new Sprite('images/ship.png');
var lifeImg = new Sprite('images/life.png');
var gameoverImg = new Sprite('images/game_over.png');

var canvases = {
    background : Canvas.create(),
    main : Canvas.create(),
    UI : Canvas.create()
};

function drawBackground(){
    backgroundImg.drawPattern(0, 0, window.innerWidth, window.innerHeight, canvases.background);
}
backgroundImg.onload = drawBackground;

lifeImg.onload = UI.draw;

function init(){
    playing = true;
    
    var bottom = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight * 0.8,
        window.innerWidth, window.innerHeight * 0.1, {isSensor : true, label : 'bottom'});
    Matter.World.add(engine.world, bottom);
    
    new Entity(0, 0, UI.offsetX, window.innerWidth, {isStatic : true});
    new Entity(window.innerWidth - UI.offsetX, 0, UI.offsetX, 
        window.innerHeight, {isStatic : true});
    
    player.init();
    
    Enemy.init();
    
    Render.start();
    Update.start();
}

function render(){
    canvases.main.ctx.clear();
    
    for(var i in Entities) if(Entities[i].render) Entities[i].render();
}

function update(){
    
    if(!playing && IO.isTapped(13)) location.reload();
    
    for(var i in Entities) if(Entities[i].update) Entities[i].update();
}

Matter.Events.on(engine, 'collisionActive', function(e){
    for(var i in e.pairs){
        var pair = e.pairs[i];
        if(!(pair.bodyA.label == 'projectile' || pair.bodyB.label == 'projectile'))
        continue;
        if(!(pair.bodyA.label == 'enemy' || pair.bodyB.class == 'enemy'))
        continue;
        
        pair.bodyA.entity.destroy();
        pair.bodyB.entity.destroy();
        
        for(var j in pair){
            if(pair[j].label == 'enemy') score += pair[j].entity.score;
        }
        
        UI.draw();
    }
});
Matter.Events.on(engine, 'collisionActive', function(e){
    for(var i in e.pairs){
        var pair = e.pairs[i];
        if(!(pair.bodyA.label == 'enemy_projectile' || pair.bodyB.label == 'enemy_projectile'))
        continue;
        if(!(pair.bodyA.label == 'player' || pair.bodyB.class == 'player'))
        continue;
        
        pair.bodyA.entity.destroy();
        pair.bodyB.entity.destroy();
        
        player.destroy();
        player.lives -= 1;
        
        if(player.lives == -1) gameOver();
        else window.setTimeout(function() {
            UI.draw();
            player.init();
        }, 500)
    }
});
Matter.Events.on(engine, 'collisionActive', function(e){
    for(var i in e.pairs){
        var pair = e.pairs[i];
        if(!(pair.bodyA.label == 'enemy' || pair.bodyB.label == 'enemy'))
        continue;
        if(!(pair.bodyA.label == 'bottom' || pair.bodyB.label == 'bottom'))
        continue;
        
        window.setTimeout(function(){
            gameOver();
        }, 500);
    }
});

function gameOver(){
    playing = false;
    
    for(var i in Entities) Entities[i].destroy();
    
    Render.stop();
    Canvas.save();
    window.setTimeout(function() {
        for(var i in canvases){
            window.canvases[i].ctx.clear();
        }
        canvases.background.ctx.globalAlpha = 0.9;
        drawBackground();
        canvases.main.ctx.fillStyle = 'black';
        canvases.main.ctx.fillRect(0, window.innerHeight / 3 - gameoverImg.image.height,
            window.innerWidth, gameoverImg.image.height * 2);
        gameoverImg.draw(window.innerWidth / 2 - gameoverImg.image.width / 2,
            window.innerHeight / 3 - gameoverImg.image.height / 2,
            gameoverImg.image.width, gameoverImg.image.height, canvases.main);
        var active = false;
        canvases.UI.ctx.font = '20px Times';
        var text = "PRESS ENTER TO CONTINUE";
        var blinkInterval = window.setInterval(function(){
            active = !active;
            canvases.UI.ctx.fillStyle = active ? 'red' : 'black';
            canvases.UI.ctx.fillText(text, 
                window.innerWidth / 2 - 5 * text.length,
                window.innerHeight / 2);
        }, 500);
    }, 500);
}

$(document).ready(init);