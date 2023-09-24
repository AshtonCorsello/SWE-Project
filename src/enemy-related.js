/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  ENEMY CLASS AND FUNCTIONS  /////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// enemy class
class Enemy1 {

    constructor() {
      // initialize coordinates
      this.posX = 0;
      this.posY = random(-100, 0);
      this.initialangle = random(0, 2 * PI);
      this.size = 15;
      this.readyToSpawn = false;
      this.lastSpawnedTime = 0;

      // radius of placeholder
      this.radius = sqrt(random(pow(width / 2, 2)));

    }
  
  
    update(time) {
      // x position follows a circle
      let w = 50; // angular speed
      let angle = w * time + this.initialangle;
      this.posX = width / 2 + this.radius * sin(angle);
      this.posY += pow(this.size, 0.5);
      console.log(time);
      // delete enemy if past end of screen
      if (this.posY > height) {
        let index = enemies.indexOf(this);
        enemies.splice(index, 1);
      }
    }
  
    display() {
      ellipse(this.posX, this.posY, this.size);
    }

    showcase(delay) {
    if (enemyOn){
      if(this.readyToSpawn) {
          enemies.push(new Enemy1()); // append enemy object
          this.readyToSpawn = false;
          this.lastSpawnedTime = millis();
      }
      else {
          if(millis() - this.lastSpawnedTime > delay) {
            this.readyToSpawn = true;
          }
      } 
      let t = frameCount / 60; // update time

      for (let enmy of enemies) {
         enmy.update(t); // update enemy position
      }
 
     // loop through enemies with a for..of loop
      for (let enmy of enemies) {
         enmy.display(); // draw enemy
      }
    }
  }
}
