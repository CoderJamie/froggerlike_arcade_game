/* TODO

	SOUNDS
	http://soundbible.com/suggest.php?q=splash&x=0&y=0

	REQUIREMENTS:
	* README (required)

	PLAYER
	X don't let the player leave the screen (required)
	X react when the player reaches the water (required)
	X reset game when player dies (required)
	X react when player vs enemy collision occurs (required)
	X start player in a random column
	X add a collision (player death) animation
	X make player's death splash disappear after a second (just move it off the visible area)

	ENEMIES
	X generate random enemies in different locations
	X introduce new enemies periodically (do I need to destroy those that have left the canvas?)
	X remove enemies from the array once they leave the screen - array.splice(index, 1)
	X allow enemies to move from either side of the screen (basically, rows will go in different directions with each level)
	X react when enemies collide
	X randomize starting position of enemies (will always start offscreen, though)
	X begin with a random number of enemies, preferably based on the user's level
	X start enemies at different times (this can be simulated simply by moving them further off the screen)
	X limit speed boost from enemy collisions (some are way too fast)
	* add new enemy sprites

	GAMEPLAY:
	X improve collision detection
	X player must reach a raft in order to win the round
	X Lower levels are far too easy (it's too easy to just run straight across the road)
	X track user's highest level
	X force a slight pause after play wins/dies before they can continue
	X sound effects for winning and losing
	* save high score to a cookie

	BONUS
	X create a victory routine (player rides around on the raft for a second or two while bugs continue moving)
	X create a player died routine (bugs continue moving)
	X keep score (reset to zero when the player dies)
	X make the game more difficult whenever player reaches a higher score (increase speed of enemies? increase number of enemies?)

	JEWELS (planned)
	* Blue Gem, Green Gem, Orange Gem, Heart, Key, Rock, Selector, Star
	* if eaten by an enemy, they disappear
	* if grabbed by the player they may...
		* slow all enemies
		* reverse direction of enemies
		* kill enemies on the screen (or maybe the shark)
	* if a rock appears in the road, the player cannot occupy that space. Enemies will gradually push the rock off the screen, though

	FIRE (planned)
	* at TK difficulty, a flame sprouts up in the grass and will gradually spread to a neighboring patch. If the player collides with it, he catches fire and the game ends.
	* if you implement fire, you must let the user decide when the round begins (otherwise they'll die while grabbing a snack or looking away)
*/

// preload sounds
var splat = new Audio("sounds/splat.wav");
var splash = new Audio("sounds/splash.wav");
var bump = new Audio("sounds/whoosh.wav");
var win1 = new Audio("sounds/victory-laugh-1.wav");
var win2 = new Audio("sounds/victory-laugh-2.wav");

var Round = function() {
	this.level = 1;
	this.nextLevel = 1;
	this.difficulty = 1;
	this.highestLevel = 1;
	this.active = true;
	this.disableInput = false;
	this.continueDisplay = false;
	this.rows = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];
};

Round.prototype.endRound = function() {
	this.active = false;
	this.disableInput = true;

	var par = this;

	setTimeout(function() {
		par.continueDisplay = true;
		par.disableInput = false;
	}, 1500);
};

Round.prototype.initRound = function() {
	this.continueDisplay = false;
	this.level = round.nextLevel;

	// set new highest level
	if (this.nextLevel > this.highestLevel) {
		this.highestLevel = this.nextLevel;
	}

	// determine round difficulty (this will be used to gradually make the game more difficult)
	this.difficulty = Math.cbrt(this.level); // difficulty is cbrt(level) (sqrt got too difficult too quickly)

	// set direction each row in the road tiles goes
	this.rows = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];

	// spawn enemies
	allEnemies = [];

	// spawn 1 enemy per row
	allEnemies.push(new Enemy(1));
	allEnemies.push(new Enemy(2));
	allEnemies.push(new Enemy(3));

	// spawn additional enemies based on the user's current level
	var moreEnemies = Math.floor(this.difficulty) - 1;
	for (var i = 0; i < moreEnemies; i++) {
		allEnemies.push(new Enemy());
	}

	// respawn raft
	raft = new Raft();

	// respawn player
	player = new Player();

	// start the round
	this.active = true;
};

// Enemies our player must avoid
var Enemy = function(row) {
	// Variables applied to each of our instances go here,
	// we've provided one for you to get started

	var d = new Date();
	var t = d.getTime();

	this.id = Math.random() * t; // give each enemy a unique id (for collision detection, and array cleanup)
	this.type = 'enemy';

	// determine starting location
	// if row is specified, use it. Otherwise, randomly choose one.
	if (!row) {
		var row = Math.floor(Math.random() * 3) + 1; // begin in a random row (1-3)
	}

	this.y = (row * 83) - 20; // Rows begin at ~60 and are spaced 83px apart, with a -20px top buffer area

	// set direction and starting point (each row determines the direction of travel)
	this.direction = round.rows[row - 1];




	var canvasWidth = 505; // can't pull canvas width yet, so hardcode it
	var myWidth = 101; // can't pull a sprite that hasn't been rendered, so hardcode it

	// setup starting position and direction
	if (this.direction === 0) {
	   this.sprite = 'images/enemy-bug.png';
	   if (allEnemies.length < 3) {
		   this.x = 0 - myWidth; // if initial 3 enemies, start them right at the edge of the screen
	   } else {
		   this.x = Math.round(Math.random() * (-myWidth * 2)) + 0;
	   }
	} else {
	   this.sprite = 'images/enemy-bug-flipped.png';
	   if (allEnemies.lenth < 3) {
		   this.x = canvasWidth + myWidth; // if initial 3 enemies, start them right at the edge of the screen
	   } else {
		   this.x = Math.round(Math.random() * (myWidth * 2)) + canvasWidth;
	   }
	}

	// set random enemy speed based on user's level/score (gradually increase difficulty)
	// base speed should be between 20 and 80. Top speed can still be playable at 500+.
	var baseSpeed = 50;
	this.speed = Math.round(((Math.random() * baseSpeed) + 20) * round.difficulty); // multiply speeds by round difficulty
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {

	if (!round.active) {
		return;
	}

	var canvas = document.getElementsByTagName("canvas");
	var width = canvas[0].width;
	var myWidth = Resources.get(this.sprite).width;

	// skip any further processing if this is already off the canvas
	if ((this.direction === 0 && this.x > width) || (this.direction === 1 && this.x < -myWidth)) {
		return;
	}

	// move the enemy
	if (this.direction === 0) {
		this.x = (this.x + (this.speed * dt)); // multiply by dt to ensure consistent speed on all computers
	} else {
		this.x = (this.x - (this.speed * dt)); // multiply by dt to ensure consistent speed on all computers
	}

	// remove enemies when they go off the canvas and spawn a replacement
	if ((this.direction === 0 && this.x > width) || (this.direction === 1 && this.x < -myWidth)) {
		allEnemies.push(new Enemy());
		this.remove();
	}

	detectCollision(this);
};

// remove enemy from allEnemies array
Enemy.prototype.remove = function() {
	for (var i = 0; i < allEnemies.length; i++) {
		if (allEnemies[i].id == this.id) {
			allEnemies.splice(i, 1);
			break;
		}
	}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Raft = function() {
	this.type = 'raft';
	this.sprite = 'images/raft.png';

	// starting location (random column)
	this.x = ((Math.floor(Math.random() * 5) + 1) * 100) - 100;

	// always begin in the water
	this.y = -20;

	var baseSpeed = 80;
	this.speed = Math.round(((Math.random() * baseSpeed) + 20) * round.difficulty); // multiply speeds by round difficulty

	this.direction = Math.floor(Math.random() * 2) - 1; // random direction
};

Raft.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Raft.prototype.update = function(dt) {

	// get canvas width (need it for right edge)
	var canvas = document.getElementsByTagName("canvas");
	var width = canvas[0].width - 206;

	if (this.x < 0) {
		this.direction = 0;
	// is this at the edge of the canvas + width of the raft sprite?
	} else if (this.x > (width + Resources.get(this.sprite).width)) {
		this.direction = 1;
	}

	// move
	if (this.direction === 0) {
		this.x = (this.x + (this.speed * dt)); // multiply by dt to ensure consistent speed on all computers
	} else {
		this.x = (this.x - (this.speed * dt)); // multiply by dt to ensure consistent speed on all computers
	}
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	this.type = 'player';
	this.sprite = 'images/char-boy.png';

	this.status = "alive";
	this.onRaft = false;

	// starting location
	// begin in random column (columns are 0-4, spaced 100px apart)
	this.x = ((Math.floor(Math.random() * 5) + 1) * 100) - 100;
	// always begin on the bottom row
	this.y = 380;

	// movement speeds (distance per move)
	this.yspeed = 80;
	this.xspeed = 100;
};

Player.prototype.update = function() {
	// if player is on the raft, float around on it until the round ends
	if (this.onRaft) {
		this.x = raft.x;
		return;
	}

	// don't do anything else if the round isn't active
	if (!round.active) {
		return;
	}

	detectCollision(this);

	// Is player in the water?
	var loc = getLocation(this);
	if (loc.row === 0) {
		this.playerInWater();
	}
};

Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

	// write status text
	if (round.continueDisplay) {
		displayContinueText();
	}

	writeLevel(); // display player's current level
};

Player.prototype.handleInput = function(key) {

	// if input is disabled, then don't process any keypresses
	if (round.disableInput) {
		return;
	}

	// if round isn't active, restart with any keypress
	if (!round.active) {
		round.initRound(); // if round isn't active, reset game when any key is pressed
		return;
	}

	var canvas = document.getElementsByTagName("canvas");
	// treat canvas as smaller to avoid player going off visible area
	var height = canvas[0].height - 200;
	var width = canvas[0].width - 206;

	switch (key) {
		case "up":
			// don't let player go above the top of the canvas
			// the player's position in the water is actually -20 on the canvas, so work with this
			if ((this.y - this.yspeed) >= -10) {
				this.y = this.y - this.yspeed;
			} else {
				this.y = -10;
			}
			break;

		case "down":
			// don't let the player go off the bottom of the canvas
			if ((this.y + this.yspeed) < height) {
				this.y = this.y + this.yspeed;
			}
			break;

		case "left":
			// don't let the player go off the left side of the screen
			if ((this.x - this.xspeed) > -20) {
				this.x = this.x - this.xspeed;
			}
			break;

		case "right":
			// don't let the player go off the right side of the screen
			if ((this.x - this.xspeed) < width) {
				this.x = this.x + this.xspeed;
			}
			break;

		default:
			break;
	}
};

Player.prototype.killPlayer = function() {
	splat.play(); // play sound
	this.sprite = 'images/char-bloodsplash.png';
	this.status = 'dead';
	round.nextLevel = 1;
	round.endRound();
};

Player.prototype.drownPlayer = function() {
	splash.play(); // play sound
	this.sprite = 'images/char-splash.png',
	this.status = 'dead';
	round.nextLevel = 1;

	setTimeout(function() {
		this.x = 1000;
	}, 750);

	round.endRound();
};

Player.prototype.playerInWater = function() {
	// is the player on the raft?
	// need to detect a player and raft collision, but player needs to be about center of the raft
	var playerRadius = (Resources.get(this.sprite).width / 2) - 20;
	var raftRadius = (Resources.get(raft.sprite).width / 2) - 40;

	var distance = Math.abs(this.x - raft.x);

	if (distance < (playerRadius + raftRadius)) {
		this.onRaft = true;
		this.playerWins();
	} else {
		this.drownPlayer();
	}
};

Player.prototype.playerWins = function() {
	this.status = 'won';

	round.disableInput = true;
	round.nextLevel = round.level + 1;

	setTimeout(function() {

		killEnemies();

		// play victory sound
		var snd = Math.round(Math.random() * 2) + 1;
		if (snd == 1) {
			win1.play();
		} else {
			win2.play();
		}

		round.disableInput = false;
		round.endRound();
	}, 1000);
};

// Setup objects that will be created in initRound();
var round = new Round();
var allEnemies = [];
var player = {};
var raft = {};
round.initRound();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});

function detectCollision(obj) {
	// collision = two objects must be in the same row and then in the same column
	// if objects are on same row, get the distance from one to the other. If it is <= half it's width (radius), there's a collision
	// only register a collision if the checking obj is behind the one being checked (ignore objects not in front of obj)

	var myLoc = getLocation(obj);
	var myRadius = Resources.get(obj.sprite).width / 2;

	// If I'm not the player, see if the player and I have collided
	if (obj.type != "player") {
		var playerLoc = getLocation(player);

		// are these on the same row?
		if (myLoc.row == playerLoc.row) {
			var playerRadius = (Resources.get(player.sprite).width / 2) - 20; // shrink radius a bit since the image has a small body
			// get collision radius
			var collisionRadius = myRadius + playerRadius;
			var distance = Math.abs(obj.x - player.x);

			if (distance <= collisionRadius) {
				player.killPlayer();
				return;
			}
		}
	}

	// see if I collided with an enemy that isn't myself
	for (var i = 0; i < allEnemies.length; i++) {
		// if this enemy is me, skip it to avoid detecting a collision with myself
		if (allEnemies[i].id == obj.id) {
			continue;
		}
		var eLoc = getLocation(allEnemies[i]);
		var eRadius = Resources.get(allEnemies[i].sprite).width / 2;
		var collisionRadius = myRadius + eRadius - 20;

		// are we on the same row?
		if (myLoc.row == eLoc.row) {
			var distance = Math.abs(obj.x - allEnemies[i].x);

			// is the target in front of me? (don't look for collisions behind me)
			if (obj.direction === 0 && (allEnemies[i].x <= obj.x)) {
				continue;
			} else if (obj.direction === 1 && (allEnemies[i].x > obj.x)) {
				continue;
			}

			// collision detected!
			if (distance <= collisionRadius) {
				bump.play();

				// increase the enemy speed (the collision gave it extra momentum)
				allEnemies[i].speed = allEnemies[i].speed + (Math.round(Math.random() * 20) + 10);

				// reduce my speed (I hit something, so it should slow me down)
				//obj.speed = obj.speed - Math.round(obj.speed / 4);
			}
		}
	}
}

function killEnemies() {
	splat.play();
	for (var i = 0; i < allEnemies.length; i++) {
		allEnemies[i].sprite = "images/enemy-splat.png";
	}
}

function getLocation(obj) {
	// the game grid has 0-5 rows, 0-4 columns
	// this function determines the grid coordinates of obj

	var loc = {row: 0, column: 0};

	// row
	loc.row = Math.round(obj.y / 80); // rows are 80px apart

	// column
	loc.column = Math.round(obj.x / 100); // columns are 100px apart

	return loc;
}

function writeEndText(txt) {
	var canvas = document.getElementsByTagName("canvas");
	var width = canvas[0].width;
	var height = canvas[0].height;

	ctx.save();
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'black';
	ctx.font = '90pt Impact';
	ctx.textAlign = 'center';
	ctx.lineWidth = 6;

	ctx.fillText(txt, width/2, (height/2) + 80);
	ctx.strokeText(txt, width/2, (height/2) + 80);

	ctx.restore();
}

function displayContinueText() {
	var canvas = document.getElementsByTagName("canvas");
	var width = canvas[0].width;
	var height = canvas[0].height;

	ctx.save();
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'black';
	ctx.textAlign = 'center';
	ctx.font = '28pt Impact';
	ctx.lineWidth = 2;
	ctx.fillText("press any key to continue", width/2, (height/2));
	ctx.strokeText("press any key to continue", width/2, (height/2));
	ctx.restore();
}

function writeLevel() {
	var canvas = document.getElementsByTagName("canvas");
	var width = canvas[0].width;
	var height = canvas[0].height;

	ctx.save();
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'black';
	ctx.font = '30pt Impact';
	ctx.lineWidth = 2;

	ctx.textAlign = 'left';
	ctx.fillText('best ' + round.highestLevel, 10, height - 30);
	ctx.strokeText('best ' + round.highestLevel, 10, height - 30);

	ctx.textAlign = 'right';
	ctx.fillText('level ' + round.level, width - 10, height - 30);
	ctx.strokeText('level ' + round.level, width - 10, height - 30 );

	ctx.restore();
}