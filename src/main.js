const CANV_WIDTH = window.innerWidth; //originally 720
const CANV_HEIGHT = window.innerHeight; //originally 400
const CANV_AREA = CANV_HEIGHT * CANV_WIDTH;
const CANV_SCALAR = CANV_AREA/288000;

const MIN_ENMY_DELAY = 50; // least possible spawn delay for enemies in miliseconds
const STARTING_ENMY_DELAY = 1000;
const DELAY_DECR_MULT = 10; //how fast level progresses //dont use large number

const FPS_ON = true; //flag for toggling fps counter on and off

var mode = 0; // Stores weither the user has left the main menu
let loadTime = 3; // Stores the number of seconds to load
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  P5JS MAIN FUNCTIONS  //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let player; // player object
let pressedKeys = {}; // Holding for the pressed keys
let enemies = []; // array to hold enemy objects
let projectiles = []; // array to hold projectile objects
let fpsCounter;
let prop = false;// Energy shield presence state
let energiesarray = [];// Array of shield energy cycles
let energies = 0;// Number of energy blocks
let enemyOn = new Boolean(true); // For use in debug. Defaults to true in normal mode. Will turn on or off enemy spawning.
var time = 0; // Playtime
var ShieldCT = 0; // Shield time

let mySound; // background music
let startedAudio = false;

function preload() {
   mySound = loadSound('./src/BeepBox-Song.wav'); // load music file
}


function setup() {
    createCanvas(CANV_WIDTH, CANV_HEIGHT);
    fill(240);
    noStroke();
    player = new Player(CANV_WIDTH/2,(CANV_HEIGHT - CANV_HEIGHT/16),10*CANV_SCALAR); // create a new player object
    enemy1 = new Enemy1()
    projectile1 = new Projectile();
    fpsCounter = new FpsCounter();
    
    lastPrint = millis() - 1000;

    if(mousePressed && !startedAudio){
      userStartAudio();  // starts audio based on user mouse click
      startedAudio = true
    }
  }

function draw() {
     // Check if the audio has started and play it
    if (startedAudio && !mySound.isPlaying()) {
      mySound.play();
    }

    if(mode == 0){ // Main menu
      background(0, 204, 255) // set the background to blue
      textSize(32*CANV_SCALAR);
      textAlign(CENTER);
      text('Marine Mania', CANV_WIDTH/2, CANV_HEIGHT/3); // Name of game
      button1 = createButton('Start Game'); // set text of button
      button1.position(CANV_WIDTH*(5/12), CANV_HEIGHT/2); // set button position
      button1.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      button2 = createButton('Debug Room');
      button2.position(CANV_WIDTH*(5/12), CANV_HEIGHT/1.75); // set button position
      button2.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      if(mouseX >= CANV_WIDTH*(5/12) && mouseX <= CANV_WIDTH*(7/12) && mouseY >= CANV_HEIGHT/2 && mouseY <= CANV_HEIGHT*(11/20) && mouseIsPressed == true){ // If the mouse is at the right spot and clicked
        GameInitialization();
      }
      if(mouseX >= CANV_WIDTH*(5/12) && mouseX <= CANV_WIDTH*(7/12) && mouseY >= CANV_HEIGHT/1.75 && mouseY <= CANV_HEIGHT*(3/5) && mouseIsPressed == true){
        mode = 2;
        removeElements(button1,button2);
      }
    }
    if(mode == 1 | mode == 5){ // Game has started
      let currentTime = int(millis()/1000) // Converts mil secs into seconds
      let countDown = loadTime - currentTime; // Amount of time passed
      var timeElapsed = millis() - lastPrint;
      if(countDown < 0){
        // Drawing the level
        background(145, 240, 243); // set the background to white
        textSize(18*CANV_SCALAR); // determines size of font
        fill(51); // determines color of text

        if(!player.isHit()){ // stops drawing the player if they get hit
          player.display(); // draw the player
          player.update();
        }
        if (timeElapsed > 1000) {
          player.score++;
          console.log(player.score);
          lastPrint = millis();
        }

        if(!player.isHit()){ // stops drawing the player if they get hit
          player.display(); // draw the player
          player.update();
        }
      
      let calcdDelay = STARTING_ENMY_DELAY - currentTime * DELAY_DECR_MULT; // delay decreases over time
      let enemySpawnDelay = (calcdDelay > MIN_ENMY_DELAY) ? calcdDelay : MIN_ENMY_DELAY;
      enemy1.showcase(enemySpawnDelay); //update, draw, and spawn enemies

      projectile1.showcase();
      if (energies == 1 && prop == false){// Start shield button is displayed when the number of energy blocks is greater than 1
        button3 = createButton('Shield');
        button3.position(CANV_WIDTH*(65/72), CANV_HEIGHT*(21/40)); // set button position
        button3.size(CANV_WIDTH*(55/720), CANV_HEIGHT/10); // sets size of button
      }

      if(mouseX >= CANV_WIDTH*(65/72) && mouseX <= CANV_WIDTH*(715/720) && mouseY >= CANV_HEIGHT*(21/40) && mouseY <= CANV_HEIGHT*(25/40) && mouseIsPressed == true && prop == false){// Click on the shield button to turn on the shield if it is off.
        OpenShield();
      }

        if(mouseX >= 650 && mouseX <= 715 && mouseY >= 210 && mouseY <= 250 && mouseIsPressed == true && prop == false){// Click on the shield button to turn on the shield if it is off.
          OpenShield();
        }

        if(mode == 5){// Invincible Mode
          for (let enmy of enemies){ // Shield Mode checks each enemy for collision
            if (intersect(player.x, player.y, player.size-5, enmy.posX, enmy.posY, enmy.size))
              player.setHitFalse();
          }
        }else{
          for (let enmy of enemies){ // checks each enemy for collision
            if (intersect(player.x, player.y, player.size-5, enmy.posX, enmy.posY, enmy.size)){
              player.setHitTrue();
              if(energies > 0 && prop == false){// Death removes shield button if present
                removeElements(button3);
              }
              mode = 9;
            }
          }
        }

        //collision between player projectile and enemies
        //create a standalone function for this
        checkProjectileHit();

      }
      else{
        // Draws the countdown
        background(0, 204, 255) // Used to remove text, Title
        textSize(20*CANV_SCALAR);
        fill(0, 0, 0);
        text("The game will start in: " + countDown, CANV_WIDTH/2, CANV_HEIGHT/3);
      }
        
    }
    if(mode == 2){ // debug room implementation
      DebugDraw();
    }

    if(mode == 9){ // Game Over Screen
      GameOver();
    } 

  //fps counter stuff
  if(FPS_ON){
    if(fpsCounter.readyToUpdate())
      fpsCounter.update();

    fpsCounter.draw();
  }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////           function          ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GameInitialization(){ // initialization
        mode = 1;
        removeElements(button1,button2); // removes the buttons from the screen
        energies = 0;// initialization
        energiesarray = [];// initialization
        setTimeout(Gametime, 4000); // start counting
        setTimeout(energie, 8000); // start shield charge
        loadTime =  int(millis()/1000) + loadTime;// Sets the load time to be the loadtime + whenever the button was pressed
}

function GameOver(){ // Game over
      background(0, 0, 0);
      textSize(64*CANV_SCALAR);
      fill(255, 156, 51);
      text('Game Over', CANV_WIDTH/2, CANV_HEIGHT/3);
      textSize(32*CANV_SCALAR);
      text('Score: ' + player.score, CANV_WIDTH/2, CANV_HEIGHT/2);// determines what is displayed, at what x,y
}

function Gametime(){// Playtime
  time++;
  setTimeout(Gametime, 1000);
}

function changeMode(i){
  mode = i;
}

function DebugDraw(){ //Draw function specifically for Debug menu (AKA Mode 2)
  background(145, 240, 243); //White background

  if(!player.isHit()){ // stops drawing the player if they get hit
    player.display(); // draw the player
    player.update();
  }

  projectile1.showcase();
  enemy1.showcase();

  if (keyCode === 49){
    if (enemyOn)
    {
      enemyOn = false;
    }
    else
    {
      enemyOn = true;
    }
  }
}

function keyPressed(){
    pressedKeys[key] = true;
   if(keyCode === 32){  // if spacebar is pressed
      console.log("Space firing");
      if(!player.isHit()){
        projectiles.push(new Projectile(player.x, player.y+1));
      }
    }
}

function keyReleased(){
    delete pressedKeys[key];
}

//checks if two objects intersect using (x,y) and radius
function intersect(obj1X, obj1Y, obj1R, obj2X, obj2Y, obj2R){
    if (sqrt(pow((obj1X - obj2X),2) + pow((obj1Y - obj2Y),2)) < (obj1R + obj2R)) {return true;}
    else {return false;}
}

function mousePressed(){
   //console.log("Firing from mouse press");
  if(!player.isHit()) { // Checks if the player is hit before firing.
    projectiles.push(new Projectile(mouseX, mouseY));
  }
}

function checkProjectileHit() {
  for (let prjctl of projectiles){
    for (let enmy of enemies){
      if (intersect(prjctl.posX, prjctl.posY, prjctl.size, enmy.posX, enmy.posY, enmy.size)){
        enmy.hit = true;
        prjctl.hitEnemy(enmy);
      }
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
