/*
My Game Project
*/

// ----------------------
// Variable Declarations
// ----------------------

var gameChar_x, gameChar_world_x, gameChar_y;
var isLeft, isRight, isFalling, isPlummeting;
var floorPos_y;
var scrollPos;

var canyonsInput, collectablesInput, cloudsInput, enemiesInput, mountainsInput, platformsInput, treesInput;
var canyons, collectables, clouds, enemies, mountains, platforms, trees;
var flagpole, sun;

var game_score;
var lives;

var deathSound, flagpoleReachedSound, foundSound, hitSound, jumpSound, musicSound;

var musicOn;

// ---------------------
// Main p5.js functions
// ---------------------

function preload()
{
    soundFormats('mp3');
    
    jumpSound = loadSound('assets/jump.mp3');
    jumpSound.setVolume(0.1);
    
    deathSound = loadSound('assets/death.mp3');
    deathSound.setVolume(0.3);
    
    flagpoleReachedSound = loadSound('assets/finish.mp3');
    flagpoleReachedSound.setVolume(0.3);
    
    foundSound = loadSound('assets/found.mp3');
    foundSound.setVolume(0.3);
    
    hitSound = loadSound('assets/hit.mp3');
    hitSound.setVolume(0.3);
    
    musicSound = loadSound('assets/music.mp3');
    musicSound.setVolume(0.1);
}

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    
    frameRate(60);
    
    musicOn = false;
    
    resetGame();
}

function draw()
{
    if (musicSound.isLoaded() && !musicOn) // Using musicOn to have music play once when the file is loaded.
    {
        musicSound.loop();
        musicOn = true;
    }
    
	background(100, 155, 235); // Fill the sky blue

	noStroke();
    for (let i=180; i > 130; i=i-5) // Draw some green ground with shades
    {
        fill(0, i, 0);
        rect(0, floorPos_y + 50 - (i -130), width, height/4); 
    }

    push();
    translate(scrollPos,0);
    
    // ------------------------
    // Draw Background objects
    // ------------------------
    
    for (let i = 0; i < clouds.length; i++)       // Draw the clouds.
    {
        clouds[i].draw();
    }

    for (let i = 0; i < mountains.length; i++)    // Draw the mountains.
    {
        mountains[i].draw();
    }
	
    for (let i = 0; i < trees.length; i++)        // Draw the trees
    {
        trees[i].draw();
    }
    
    drawSun();  // Draw the sun
    
    // ------------------------
    // Draw Interactive objects
    // ------------------------

    for (let i = 0; i < canyons.length; i++)      // Draw canyons.
    {
        canyons[i].draw();
        canyons[i].check(gameChar_world_x, gameChar_y);
    }
	
    for (let i = 0; i < platforms.length; i++)    // Draw platforms
    {
        platforms[i].draw();
    }
    
    for (let i = 0; i < collectables.length; i++) // Draw collectable items.
    {
        if (!collectables[i].found)
        {
            collectables[i].draw();
            collectables[i].checkCollected(gameChar_world_x, gameChar_y);
        }
    }
    
    for (let i = 0; i < enemies.length; i ++)     // Draw the enemies
    {
        enemies[i].draw();
        
        var enemyContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        
        if (enemyContact)
        {
            hitSound.play();
            if (lives > 0)
            {
                lives--;
                startGame();
                break;
            }
        }
    }
    
    drawFlagpole(); // Draw the Flagpole
    
    pop();

    drawScore(); // Draw the score
    drawLives(); // Draw the lives
    
    drawGameChar(); // Draw game character.

    if (lives < 1) // Check for displaying game over message
    {
        drawEndMessage('Game over. Press space to continue', 255, 0, 0);
        return
    }

    if (flagpole.isReached) // Check if the flagpole is reached for displaying game finished message
    {
        drawEndMessage('Level complete. Press space to continue', 0, 255, 0);
        return  
    }
    
	if (isLeft && gameChar_y <= floorPos_y)  // Logic to make the game character move or the background scroll.
	{
		if (gameChar_x > width * 0.3)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if (isRight && gameChar_y <= floorPos_y) // Logic to make the game character move or the background scroll.
	{
		if (gameChar_x < width * 0.7)
		{
			gameChar_x += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}
    
	
    if (gameChar_y < floorPos_y) // Logic to make the game character rise and fall.
    {
        var onPlatform = false;
        for (let i = 0; i < platforms.length; i++) // Logic to check if the character is in contact with any of the platforms
        {
            if (platforms[i].checkContact(gameChar_world_x, gameChar_y))
            {
                onPlatform = true;
                isFalling = false;
                break;
            }
        }
        if (!onPlatform)
        {
            gameChar_y += 3; // Increase character speed by 2 pixel/frame when falling
            isFalling = true;
            console.log('INFO: Falling DOWN');
        }
    } 
    else 
    {
        isFalling = false;
    }
    
    if (!flagpole.isReached) // Logic the check if the flagpole has been reached
    {
        checkFlagpole();
    }
    
    checkPlayerDie();
    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}

// ----------------------
// Key control functions
// ----------------------

function keyPressed()                                        // Function to controll key pressed events.
{
    if (keyCode == 37  && gameChar_y <= floorPos_y) // 37: Left key
    { 
        isLeft = true;
        console.log('INFO: Heading LEFT ( isLeft:' + isLeft + ' )');
    }
    if (keyCode == 39 && gameChar_y <= floorPos_y) // 39: Right Key
    { 
        isRight = true;
        console.log('INFO: Heading RIGHT ( isRight:' + isRight + ' )');
    }
    if (keyCode == 38 && !isFalling) // 38: Up Key
    { 
        gameChar_y -= 120;
		jumpSound.play();
        console.log('INFO: Jump UP');
    }
    if (keyCode == 32 && (flagpole.isReached || lives < 1)) // 32: Spacebar
    {
        resetGame();
    }
}

function keyReleased()                                       // Function to controll key released events.
{
    if (keyCode == 37 && gameChar_y <= floorPos_y)
    {
        isLeft = false;
        console.log('INFO: Heading LEFT: "STOP" ( isLeft:' + isLeft + ' )');
    }
    if (keyCode == 39 && gameChar_y <= floorPos_y)
    {
        isRight = false;
        console.log('INFO: Heading RIGHT: "STOP" ( isRight:' + isRight + ' )');
    }
}

// ---------------------------------
// Game character related functions
// ---------------------------------

function drawGameChar()                                      // Function to draw the game character.
{
    strokeWeight(1);
    stroke(1);
    fill(220, 20, 60);
    
    if (isLeft && isFalling) // Characted is JUMPing to the LEFT
	{
        rect(gameChar_x - 6, gameChar_y - 35, 10, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x - 3, gameChar_y - 43, 14, 19); // head

        rect(gameChar_x - 17, gameChar_y - 32, 16, 5); //left hand

        fill(30, 144, 255);
        rect(gameChar_x + 5, gameChar_y - 6, 9, 4);  // right foot
        rect(gameChar_x - 16, gameChar_y - 11, 9, 4); // left foot

        fill(220, 20, 60);
        arc(gameChar_x -3, gameChar_y - 54, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 15, gameChar_y - 54, gameChar_x + 4, gameChar_y - 54);
	}
	else if (isRight && isFalling) // Characted is JUMPing to the RIGHT
	{
        rect(gameChar_x - 6, gameChar_y - 36, 10, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x + 3, gameChar_y - 43, 14, 19); // head

        rect(gameChar_x, gameChar_y - 35, 16, 5); // right hand

        fill(30, 144, 255);
        rect(gameChar_x + 5, gameChar_y - 11, 9, 4);  // right foot
        rect(gameChar_x - 15, gameChar_y - 6, 9, 4); // left foot

        fill(220, 20, 60);
        arc(gameChar_x + 3, gameChar_y - 54, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 4, gameChar_y - 54, gameChar_x + 15, gameChar_y - 54);
	}
	else if (isLeft) // Characted is walking to the LEFT
	{
        rect(gameChar_x - 6, gameChar_y - 36, 10, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x - 3, gameChar_y - 43, 14, 19); // head

        rect(gameChar_x - 16, gameChar_y - 32, 16, 5); //left hand

        fill(30, 144, 255);
        if ((frameCount % 14) < 8)
        {
            rect(gameChar_x + 3, gameChar_y - 5, 9, 4);  // right foot
            rect(gameChar_x - 14, gameChar_y - 7, 9, 4); // left foot
        } else 
        {
            rect(gameChar_x + 3, gameChar_y - 7, 9, 4);  // right foot
            rect(gameChar_x - 14, gameChar_y - 5, 9, 4); // left foot
        }
        fill(220, 20, 60);
        arc(gameChar_x -3, gameChar_y - 47, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 15, gameChar_y - 47, gameChar_x + 4, gameChar_y - 47);
	}
	else if (isRight) // Characted is walking to the RIGHT
	{
        rect(gameChar_x - 6, gameChar_y - 36, 10, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x + 3, gameChar_y - 44, 14, 19); // head

        rect(gameChar_x, gameChar_y - 33, 16, 5); // right hand

        fill(30, 144, 255);
        if ((frameCount % 14) < 8)
        {
            rect(gameChar_x + 3, gameChar_y - 7, 9, 4);  // right foot
            rect(gameChar_x - 14, gameChar_y - 5, 9, 4); // left foot         
        } else 
        {
            rect(gameChar_x + 3, gameChar_y - 5, 9, 4);  // right foot
            rect(gameChar_x - 14, gameChar_y - 7, 9, 4); // left foot             
        }
        fill(220, 20, 60);
        arc(gameChar_x + 3, gameChar_y - 47, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 4, gameChar_y - 47, gameChar_x + 15, gameChar_y - 47);
	}
	else if (isFalling || isPlummeting) // Characted is either FALLING or PLUMMENTING
	{
        rect(gameChar_x - 9, gameChar_y - 36, 16, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x, gameChar_y - 43, 14, 19); // head

        rect(gameChar_x + 8, gameChar_y - 33, 5, -16); // right hand
        rect(gameChar_x - 14, gameChar_y - 33, 5, -16); //left hand

        fill(30, 144, 255);
        rect(gameChar_x + 5, gameChar_y - 7, 9, 4);  // right foot
        rect(gameChar_x - 16, gameChar_y - 7, 9, 4); // left foot

        fill(220, 20, 60);
        arc(gameChar_x, gameChar_y - 54, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 7, gameChar_y - 54, gameChar_x + 7, gameChar_y - 54);
	}
	else // Character is standing still
	{
        rect(gameChar_x - 9, gameChar_y - 36, 16, 30, 3); // body

        fill(255, 228, 196);
        ellipse(gameChar_x, gameChar_y - 43, 14, 19); // head

        rect(gameChar_x + 5, gameChar_y - 33, 5, 16); // right hand
        rect(gameChar_x - 12, gameChar_y - 33, 5, 16); //left hand

        fill(30, 144, 255);
        rect(gameChar_x + 3, gameChar_y - 5, 9, 4);  // right foot
        rect(gameChar_x - 14, gameChar_y - 5, 9, 4); // left foot

        fill(220, 20, 60);
        arc(gameChar_x, gameChar_y - 47, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(gameChar_x - 7, gameChar_y - 47, gameChar_x + 7, gameChar_y - 47)
	}
}

function checkPlayerDie()                                    // Function to check if the character died.
{
    if (gameChar_y > height && lives > 0)
    {
        deathSound.play();
        lives -= 1;
        if (lives > 0)
        {
            startGame();
        }
    }
}

// ----------------------------
// Background render functions
// ----------------------------

function createCloud(x, y, scale)                           // Factroy function to create clouds.
{
    var cloud = 
    {
        x: x,
        y: y,
        s: scale,
        a: 1, // cloud animation modifier
        draw: function ()
        {
            fill(255);
            if (frameCount % 100 < 50)
            {
                this.a = 1;
            } 
            else 
            {
                this.a = 0; 
            }
            ellipse(this.x +  0          + this.a, this.y               , 60 * this.s, 45 * this.s); 
            ellipse(this.x + 45 * this.s + this.a, this.y               , 50 * this.s, 50 * this.s);
            ellipse(this.x + 80 * this.s + this.a, this.y               , 60 * this.s, 40 * this.s);
            ellipse(this.x + 20 * this.s + this.a, this.y - 25  * this.s, 55 * this.s, 50 * this.s);
            ellipse(this.x + 60 * this.s + this.a, this.y - 25  * this.s, 65 * this.s, 50 * this.s);                 
        }
    };
    return cloud;
}

function createMountain(x, y, height, width, complexity)    // Factory function to create mountains.
{
    var mountain = 
    {
        x: x,
        y: y,
        height: height,
        width: width,
        c: complexity,
        draw: function ()
        {
            if (this.c >= 0) { // Draw dark back summit
            fill(110);
            triangle(this.x +  10 - this.width, this.y, 
                     this.x + 390 + this.width, this.y, 
                     this.x + 210             , this.height); 
            }
            if (this.c >= 1) { // Draw lighter middle summits
                fill(135);
                triangle(this.x +   0 - this.width, this.y, 
                         this.x + 270 + this.width, this.y, 
                         this.x + 100             , this.height + 80); 
                triangle(this.x + 210 - this.width, this.y, 
                         this.x + 400 + this.width, this.y, 
                         this.x + 300             , this.height + 120);
            }
            if (this.c > 1) { // Draw lightest nearest summit
                fill(160);
                triangle(this.x +  90 - this.width, this.y, 
                         this.x + 380 + this.width, this.y, 
                         this.x + 170             , this.height + 100);
            }            
        }
    };
    return mountain;
}

function createTree(x)                                      // Factory function to create trees.
{
    var tree = 
    {
        x: x,
        y: (2*height/3) - 5,
        draw: function ()
        {
            fill(139, 69, 19);
            rect(this.x, this.y, 20, 53); // Draw brown tree trunk
            fill(30, 115, 30);
            triangle(this.x + 10, this.y - 85, // Draw dark green upper tree canopy
                     this.x - 10, this.y - 55,
                     this.x + 30, this.y - 55); 
            triangle(this.x + 10, this.y - 80, // Draw dark green middle tree canopy
                     this.x - 20, this.y - 20,
                     this.x + 40, this.y - 20); 
            triangle(this.x + 10, this.y - 50, // Draw dark green lower tree canopy
                     this.x - 30, this.y + 20,
                     this.x + 50, this.y + 20);             
        }
    };
    return tree;
}

function drawSun()                                          // Function to draw the sun.
{
    noStroke();
    fill(255, 215, 10, 17);
    ellipse(width/2 - 140, 80, (frameCount % 500)*2, (frameCount % 500)*2);
    fill(200, 160, 10);
    ellipse(width/2 - 140 , 80, 80, 80);
    fill(250, 220, 0);
    ellipse(width/2 - 140, 80, 70, 70); 
}

// ----------------------------------
// Function for interactible objects
// ----------------------------------

function createCanyon(x, width)                             // Factory function to create canyons.
{
    var canyon = 
    {
        x: x,
        width: width,
        level: 432,
        depth: 144,
        draw: function () // Function to draw canyon objects.
        {
            fill(100, 155, 235);
            rect(this.x, this.level +  0, this.width, this.depth +  0);
            fill(100, 205, 255);                                            // Draw lighter upper water
            rect(this.x, this.level + 20, this.width, this.depth + 10);
            fill(100, 185, 255);                                            // Draw darker lower water
            rect(this.x, this.level + 30, this.width, this.depth + 19);
        },
        check: function (gc_x, gc_y) // Function to check character is over a canyon.
        {
            if (gc_x > this.x + 6 && 
                gc_x < this.x + this.width - 6 && 
                gc_y >= this.level)
            {
                isPlummeting = true;
                isRight = false;
                isLeft = false;
                gameChar_y += 5;
                console.log('FATAL: You \'re dead')
            }    
        }
    }
    return canyon;
}

function createCollectable(x_pos, y_pos, size)              // Factory function to create collectables.
{
    var collectable = 
    {
        x: x_pos,
        y: y_pos,
        s: size,
        found: false,
        draw: function()
        {
            fill(255, 0, 0);
            ellipse(this.x +  0         , this.y, 17 * this.s, 17 * this.s);
            ellipse(this.x + 14 * this.s, this.y, 17 * this.s, 17 * this.s);

            triangle(this.x +  7 * this.s, this.y + 20 * this.s, 
                     this.x -  8 * this.s, this.y +  3 * this.s, 
                     this.x + 22 * this.s, this.y +  3 * this.s); 
        },
        checkCollected: function(gc_x, gc_y)
        {
            if (dist(this.x, this.y, gc_x - 6, gc_y - 36) < 40)
            {
                this.found = true;
                game_score += 1;
                foundSound.play();
            }
        }
    }
    return collectable;
}

function createPlatform(x, y, length)                       // Factory function to create platforms.
{
    var platform = 
    {
        x: x,
        y: y,
        length: length,
        draw: function()
        {
            fill(139, 69, 19);
            rect(this.x + 3, this.y + 3, this.length, 20);
            fill(218, 165, 32);
            rect(this.x + 0, this.y + 0, this.length, 20);           
        },
        checkContact: function(gc_x, gc_y)
        {
            if (gc_x > this.x - 10 && gc_x < this.x + 10 + this.length)
            {
                var d = this.y - gc_y;
                if (d >= 0 && d < 5)
                {
                    return true;
                }
            }
            return false;
        }
    }
    return platform;
}

function Enemy(x, y, range, speed)                          // Constructor function to create enemies.
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = speed;

    this.update = function()
    {
        this.currentX += this.inc;
        if (this.currentX >= this.x + this.range)
        {
            this.inc = -speed;
        } 
        else if (this.currentX < this.x)
        {
            this.inc = speed;
        }
    }
    
    this.draw = function()
    {
        this.update();
        
        noStroke();
        fill (255, 255, 255);
        ellipse(this.currentX + 20, this.y - 23, 40, 40);
        rect(this.currentX, this.y - 23, 40, 27);
        fill (0);  
        ellipse(this.currentX + 10, this.y - 26, 10, 11);
        ellipse(this.currentX + 30, this.y - 26, 10, 11);
        fill(66, 134, 244);
        ellipse(this.currentX + 10, this.y - 26, 6, 7);
        ellipse(this.currentX + 30, this.y - 26, 6, 7);
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        var dl = dist(gc_x, gc_y, this.currentX +  0, this.y);
        var dr = dist(gc_x, gc_y, this.currentX + 50, this.y);
        if (dl < 12 || dr < 12)
        {
            return true;
        }
        return false;
    }
}

function drawFlagpole()                                     // Function to draw the Flagpole.
{ 
    push();
    strokeWeight(5);
    stroke(80, 80, 80);
    line(flagpole.x_pos + 2, floorPos_y, flagpole.x_pos, floorPos_y - 140);
    stroke(192, 192, 192);
    line(flagpole.x_pos + 0, floorPos_y, flagpole.x_pos, floorPos_y - 140);
    
    stroke(192);
    strokeWeight(2);
    fill(255, 130, 0, 200);
    if (flagpole.isReached)
    {
        rect(flagpole.x_pos, floorPos_y - 135, 41, 36);
    } else {
        rect(flagpole.x_pos, floorPos_y -  40, 41, 36);   
    }
    pop();
}

function checkFlagpole()                                    // Function to check if the flagpole has been reached.
{
    let dist = abs(gameChar_world_x - flagpole.x_pos);
    if (dist < 10)
    {
        flagpole.isReached = true;
        flagpole.playSound();
    }
}

// ---------------------
// UI related functions 
// ---------------------

function drawScore()
{
    push;
    fill(255);
    stroke(0);
    strokeWeight(3);
    textSize(24);
    text("Score: " + game_score, 16, 30);
    pop;
}

function drawLives()
{
    push;
    fill(255);
    stroke(0);
    strokeWeight(3);
    textSize(24);
    text("Lives: ", width - 146, 30);
    if (lives == 0) // If lives are 0, then write "Dead" next to lives
    {
        fill(255, 0, 0);
        strokeWeight(2);
        text("Dead", width - 76, 30);   
    }
    noStroke();
    for (let i = lives; i > 0; i--) // Draw the head and hat life token
    {
        strokeWeight(1);
        stroke(1);
        fill(255, 228, 196);
        ellipse(width - 90 + i * 20, 22, 14, 19); // head
        
        fill(220, 20, 60);
        arc(width - 90 + i * 20, 22, 14, 19, PI, PI, CHORD); // hat
        strokeWeight(2);
        line(width - 97 + i * 20, 22,width - 83 + i * 20, 22)
    }
    pop;   
}

function drawEndMessage(message, r, g ,b)                   // Dynamic draw end message function.
{
    noStroke();
    textSize(26);
    fill(r, g, b, 160);
    rect(width/2 - textWidth(message)/2 - 20, height/2 - 140, textWidth(message) + 40, 130);
    fill(255);
    text(message, width/2 - textWidth(message)/2, height/2 - 65);
}

// ------------------------
// Uncategorized functions 
// ------------------------

function startGame()                                        // Function that initialises the game (except lives).
{
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    
    defineObjectInputs();
    
    trees = [];
    
    for (let i=0; i < treesInput.length; i++)
    {
        trees.push(createTree(treesInput[i]));
    }
        
    collectables = [];
    
    for (let i=0; i < collectablesInput.length; i++)
    {
        collectables.push(createCollectable(collectablesInput[i].x_pos, collectablesInput[i].y_pos, collectablesInput[i].size));
    }
    
    clouds = [];
    
    for (let i = 0; i < cloudsInput.length; i++)
    {
        clouds.push(createCloud(cloudsInput[i].x_pos,
                                cloudsInput[i].y_pos,
                                cloudsInput[i].scale));
    }
    
    mountains = [];
    
    for (let i = 0; i < mountainsInput.length; i++)
    {
        mountains.push(createMountain(mountainsInput[i].x_pos,
                                      mountainsInput[i].y_pos,
                                      mountainsInput[i].height_mod,
                                      mountainsInput[i].width_mod,
                                      mountainsInput[i].complexity));
    }
    
    canyons = [];
    
    for (let i = 0; i < canyonsInput.length; i++)
    {
        canyons.push(createCanyon(canyonsInput[i].x_pos,
                                  canyonsInput[i].width));
    }
    
    platforms = [];
    
    for (let i = 0; i < platformsInput.length; i++)
    {
        platforms.push(createPlatform(platformsInput[i].x_pos,
                                      platformsInput[i].y_pos,
                                      platformsInput[i].width));
    }

    enemies = [];
    
    for (var i = 0; i < enemiesInput.length; i++)
    {
        enemies.push(new Enemy(enemiesInput[i].x_pos, 
                               enemiesInput[i].y_pos,
                               enemiesInput[i].range,
                               enemiesInput[i].speed));
    }
    
    game_score = 0;
    flagpole = {isReached: false, x_pos: 2500, playSound: function() { flagpoleReachedSound.play() }};
}

function resetGame()                                        // Function for reseting the game (alos reset lives).
{
        startGame();
        lives = 3;
}

function defineObjectInputs()                               // Function to define the objects.
{
    canyonsInput =
    [
        {x_pos:-2000, width: 800},
        {x_pos: -890, width:  80},       
        {x_pos:  130, width:  80},
        {x_pos:  730, width:  80},
        {x_pos: 1550, width: 280}
    ];
    
    collectablesInput = 
    [
        {x_pos:-1170, y_pos: 400, size: 0.7},
        {x_pos: -800, y_pos: 100, size: 0.9},
        {x_pos: -600, y_pos: 400, size: 0.9},
        {x_pos: -450, y_pos: 200, size: 0.9},
        {x_pos:  100, y_pos: 400, size: 0.7},
        {x_pos:  430, y_pos: 400, size: 0.7},
        {x_pos:  770, y_pos: 300, size: 0.7},
        {x_pos: 1250, y_pos: 400, size: 0.7},
        {x_pos: 1900, y_pos: 400, size: 1.2},
        {x_pos: 2280, y_pos: 300, size: 0.7}
    ];
    
    cloudsInput = [
        {x_pos: -1260, y_pos: 100, scale: 0.6},
        {x_pos: -1060, y_pos: 120, scale: 1.1},
        {x_pos:  -760, y_pos: 140, scale: 1.0},
        {x_pos:  -220, y_pos: 200, scale: 1.3},
        {x_pos:   120, y_pos: 150, scale: 1.5}, 
        {x_pos:   550, y_pos: 190, scale: 1.0},
        {x_pos:   500, y_pos: 100, scale: 0.6},
        {x_pos:   800, y_pos: 130, scale: 0.6},
        {x_pos:   900, y_pos: 110, scale: 0.4},
        {x_pos:  1200, y_pos: 150, scale: 1.2},
        {x_pos:  1420, y_pos: 160, scale: 0.8},
        {x_pos:  1720, y_pos: 150, scale: 1.0},
        {x_pos:  1920, y_pos: 200, scale: 0.7},
        {x_pos:  2160, y_pos: 100, scale: 1.8},
        {x_pos:  2760, y_pos: 130, scale: 1.4}
    ];
    
    enemiesInput = 
    [
        {x_pos: -680, y_pos: floorPos_y - 10, range: 140, speed: 1  },
        {x_pos:  -50, y_pos: floorPos_y - 10, range: 140, speed: 2  },
        {x_pos:  850, y_pos: floorPos_y - 10, range: 160, speed: 1.5},
        {x_pos: 1080, y_pos: floorPos_y - 10, range: 140, speed: 0.5},
        {x_pos: 1780, y_pos: floorPos_y - 10, range: 140, speed: 2  }
    ];
    
    mountainsInput = [
        {x_pos: -1180, y_pos: floorPos_y, height_mod: 400, width_mod: -150, complexity: 0},
        {x_pos:  -720, y_pos: floorPos_y, height_mod: 100, width_mod:   40, complexity: 2},
        {x_pos:  -250, y_pos: floorPos_y, height_mod: 260, width_mod: -100, complexity: 0}, 
        {x_pos:   270, y_pos: floorPos_y, height_mod: 200, width_mod:  -30, complexity: 1},
        {x_pos:   820, y_pos: floorPos_y, height_mod: 120, width_mod:    0, complexity: 2},
        {x_pos:  1200, y_pos: floorPos_y, height_mod: 380, width_mod: -120, complexity: 0},
        {x_pos:  1820, y_pos: floorPos_y, height_mod: 200, width_mod:  -30, complexity: 1},
        {x_pos:  2220, y_pos: floorPos_y, height_mod: 400, width_mod: -150, complexity: 0}
    ];
    
    platformsInput =
    [
        {x_pos: -700, y_pos: floorPos_y - 200, width: 100},
        {x_pos: -500, y_pos: floorPos_y - 140, width: 120},
        {x_pos: -260, y_pos: floorPos_y - 140, width: 120},
        {x_pos:  -70, y_pos: floorPos_y -  80, width: 100},
        {x_pos: 1100, y_pos: floorPos_y -  80, width: 120},
        {x_pos: 1300, y_pos: floorPos_y - 140, width: 120},
        {x_pos: 1400, y_pos: floorPos_y - 240, width: 150}
    ];
    
    treesInput = [-1110, -730, -300, 30, 270, 650, 950, 1200, 1500, 2220, 2650];
}