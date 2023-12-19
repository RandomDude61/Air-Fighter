import Phaser from 'phaser'
import FallingObject from '../ui/FallingObject'
import Missile from '../ui/Missile';
export default class SkyScene extends Phaser.Scene {
	constructor() {
		super('shooting-scene')
	}

	//INIT METHOD
	init() {
		this.score = 0;
		this.missiles = undefined;
		this.player = undefined;
		this.speed = 100;
		this.nav_left = false;
		this.nav_right = false;
		this.shoot = false;
		this.cursor = undefined;
		this.enemies = undefined;
		this.enemySpeed = 50;
		this.scoreLabel = undefined;
		this.lifeLabel = undefined;
		this.score = 0
		this.life = 3
		this.lastFired = 10
		this.enemyScale = 0.2
	}

	//PRELOAD METHOD 
	preload() {
		this.load.image('player', 'images/F-22.png')
		this.load.image('background', 'images/bg_layer1.png')
		this.load.image('right-btn', 'images/right-btn.png')
		this.load.image('left-btn', 'images/left-btn.png')
		this.load.image('shoot', 'images/shoot-btn.png')
		this.load.image('enemy', 'images/F-22.png')
		this.load.image('missile', 'images/missile.png')
	}

	//CREATE METHOD
	create() {
		const gameWidth = this.scale.width*0.5;
		const gameHeight = this.scale.height*0.5;
	    this.add.image(gameWidth, gameHeight, 'background')
		this.createButton()
		this.player = this.createPlayer()
		this.enemies = this.physics.add.group({
			classType: FallingObject,
			maxSize: 10,
			runChildUpdate: true
		})
		this.time.addEvent({
			delay: Phaser.Math.Between(1000, 5000),
			callback: this.spawnEnemy,
			callbackScope: this,
			loop: true
		})
		this.missiles = this.physics.add.group({
			classType: Missile,
			maxSize: 10,
			runChildUpdate: true
		})
		this.physics.add.overlap(
			this.missiles,
			this.enemies,
			this.hitEnemy,
			null,
			this
		)
		this.scoreLabel = this.add.text(10,10,'Score', {
			fontSize: '16px',
			fill: 'black',
			backgroundColor: 'white'
		}).setDepth(1)
		this.lifeLabel = this.add.text(10,30,'Life', {
			fontSize: '16px',
			fill: 'black',
			backgroundColor: 'white'
		}).setDepth(1)
		this.physics.add.overlap(
			this.player,
			this.enemies,
			this.decreaseLife,
			null,
			this
		)
	}

	//UPDATE METHOD
	update(time) {
		this.movePlayer(this.player, time)
		this.scoreLabel.setText('Score : ' + this.score);
		this.lifeLabel.setText('Life : ' + this.life)
	}

	//CREATE PLAYER METHOD
	createPlayer() {
		const player = this.physics.add.sprite(200, 450, 'player').setScale(0.2)
		player.setCollideWorldBounds(true)
		return player
	}
	
	//CREATE BUTTON METHOD 
	createButton() {
		this.input.addPointer(3)
		
		let shoot = this.add.image(320, 550, 'shoot')
			.setInteractive().setDepth(0.5).setAlpha(0.8)

		let nav_left = this.add.image(50, 550, 'left-btn')
			.setInteractive().setDepth(0.5).setAlpha(0.8)
		let nav_right = this.add.image(nav_left.x +
		nav_left.displayWidth+10, 550,'right-btn')
			.setInteractive().setDepth(0.5).setAlpha(0.8)
		
		//LEFT BUTTON
		nav_left.on('pointerdown', () => {
			this.nav_left = true
		}, this)
		nav_left.on('pointerout', () => {
			this.nav_left = false
		}, this)

		//RIGHT BUTTON
		nav_right.on('pointerdown', () => {
			this.nav_right = true
		}, this)
		nav_right.on('pointerout', () => {
			this.nav_right = false
		}, this)

		//SHOOT BUTTON
	    shoot.on('pointerdown', () => {
			this.shoot = true
		}, this)
		shoot.on('pointerout', () => {
			this.shoot = false
		}, this)


	}

	//MOVE PLAYER METHOD
	movePlayer(player, time) {
		if(this.nav_left) {
			this.player.setVelocityX(this.speed * -1)
	 	} else if(this.nav_left) {
	 		this.player.setVelocityX(this.speed)

	 	} else {
	 		this.player.setVelocityX(0)
	 	}
		if ((this.shoot) && time > this.lastFired) {
			const missile = this.missiles.get(0, 0, 'missile')
			if (missile) {
			missile.fire(this.player.x, this.player.y)
			this.lastFired =  time + 150
			}
		}
	}

	//SPAWN ENEMY METHOD
	spawnEnemy() {
		const config = {
			speed: 30,
			rotation: 0.1
		}
	
		const enemy = this.enemies.get(0,0,'enemy',config).setScale(0.15).setFlipY(true)
		const positionX = Phaser.Math.Between(50, 350)
		if (enemy) {
			enemy.spawn(positionX)
		}
	}
	
	//HIT ENEMY METHOD
	hitEnemy(missile, enemy) {
		missile.die()
		enemy.die()
		this.score += 10;
	}

	//DECREASE LIFE
	decreaseLife(player, enemy) {
		enemy.die()
		this.life--
		if (this.life == 2){
			player.setTint (0xff0000)
		}else if (this.life == 1) {
			player.setTint (0xff0000).setAlpha(0.2)
		}else if (this.life == 0) {
			this.scene.start('over-scene',{score:this.score})
		}
	}
}
