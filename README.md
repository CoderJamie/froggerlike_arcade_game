# Untitled Frontend Nanodegree Arcade Game

_Untitled_ is a Frogger-like arcade game in which the goal is to get your player
across the road and onto the flotation device in the water while dodging giant enemy bugs.

This game was developed as a project for the Udacity Frontend Developer Nanodegree program.

## Installation.
* There is no configuration or special installation required. Simply unzip the contents into a 
  directory on your computer or on a web server, and load index.html in your browser.

## Game Play.
* Use the keyboard arrow keys to move your play around the screen.
* The player dies if he collides with an enemy bug or falls into the water without
jumping onto the flotation device.
* The game becomes more difficult as the player levels up.
* The player's level resets to 0 when the player dies.

## Development Features.
These are improvements and additions I made to the original code.

* Added additional sprites to the game.

* Player spawns in a random area on the bottom row. This is to add a little less predictability
  to the game.

* Enemy bugs are removed from the allEnemies array once they leave the screen to reduce
  memory overhead and unnecessary processing and rendering of enemies no longer on the canvas.
  Removed enemies will spawn a new random enemy.
  
* The player no longer wins by merely reaching the water, but must jump onto a constantly moving
  raft. The player dies by falling into the water.
  
* The player's sprite will change when killed.

* Enemies now move left-to-right _and_ right-to-left. The direction of each of the 3 road rows
  changes randomly every time a round is started.
  
* The game tracks the user's level. Level increases each time the user wins the round and difficult
  increases based on the user's current level. Game difficulty affects how many enemies are spawned,
  the max speed of enemies, and the max speed of the moving raft. The user's level resets to 0 when
  the player dies.
  
* The game keeps track of the player's highest achieved level.
  
* Enemies can no longer run over each other. Instead, collision detection will cause them to bump
  one another, which causes the enemy being bumped to gain a slight speed increase. This becomes more
  common at level 3 and higher.
  
* Added sound effects for player death, enemies bumping each other, and victory.