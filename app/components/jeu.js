import Component from '@glimmer/component';
import Phaser from 'phaser';

const myGame = () => {
  var config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1200,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };

  var player;
  // var stars;
  var bombs;
  var platforms;
  var cursors;
  var score = 0;
  var gameOver = false;
  var scoreText;

  var game = new Phaser.Game(config);

  function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('background_1', 'assets/background_1.png');
    this.load.image('background_2', 'assets/background_2.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('float', 'assets/float.png');
    this.load.image('cauldron', 'assets/cauldron.png');
    this.load.image('floating_rock', 'assets/floating_rock.png');
    this.load.image('book', 'assets/book.png');
    this.load.image('tree-star', 'assets/tree-star.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('floating_rock', 'assets/floating_rock.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('runningWitch', 'assets/runningWitch.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet('witch_attack', 'assets/witch_attack.png', {
      frameWidth: 104,
      frameHeight: 48,
    });
  }

  function create() {
    //  A simple background for our game
    this.add.image(800, 500, 'background').setScale(5.5);
    this.add.image(800, 500, 'background_1').setScale(4.5);
    this.add.image(800, 500, 'background_2').setScale(5.5);
    this.add.image(800, 500, 'tree-star').setScale(5.5);
    this.add.image(1000, 200, 'floating_rock').setScale(2);
    this.add.image(800, 500, 'tree').setScale(3);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(200, 700, 'ground').setScale(1).refreshBody();

    //  Now let's create some ledges
    platforms.create(450, 400, 'float');
     platforms.create(50, 250, 'float');
     platforms.create(750, 220, 'float');
     platforms.create(40, 200, 'cauldron');
     platforms.create(750, 180, 'book');

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'runningWitch');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    //player.setScale() determines size of sprite

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: 'runningLeft',
      frames: this.anims.generateFrameNumbers('runningWitch', {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'runningWitch', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'runningRight',
      frames: this.anims.generateFrameNumbers('runningWitch', {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('witch_attack', {
        start: 0,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    // stars = this.physics.add.group({
    //   key: 'star',
    //   repeat: 11,
    //   setXY: { x: 12, y: 0, stepX: 70 },
    // });

    // stars.children.iterate(function (child) {
    //   //  Give each star a slightly different bounce
    //   child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#000',
    });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    // this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    // this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
  }

  function update() {
    if (gameOver) {
      return;
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.setFlip(true, false);
      player.anims.play('runningLeft', true);

    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.setFlip(false, false);
      player.anims.play('runningRight', true);

    } else if (cursors.down.isDown) {
      player.anims.play('attack', true);
      player.setVelocityX(0);
      
    } else {
      player.setVelocityX(0);

      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-450);
    }
  }

  function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    // if (stars.countActive(true) === 0) {
    //   //  A new batch of stars to collect
    //   stars.children.iterate(function (child) {
    //     child.enableBody(true, child.x, 0, true, true);
    //   });

    //   var x =
    //     player.x < 400
    //       ? Phaser.Math.Between(400, 800)
    //       : Phaser.Math.Between(0, 400);

    //   var bomb = bombs.create(x, 16, 'bomb');
    //   bomb.setBounce(1);
    //   bomb.setCollideWorldBounds(true);
    //   bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    //   bomb.allowGravity = false;
    // }
  }

  function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
  }
};

export default class JeuComponent extends Component {
  // myGame() function in the component talking to the template
  runGame() {
    myGame();
  }
}
