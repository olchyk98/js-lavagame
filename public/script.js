// Prototype

/*
	Monsters -> ground, air,
	Lava,
	Animations, End Animations, Damage light,
	Mate,
	Rages ( stronger monsters:
		hp: x2,
		damage: x2,
		hero regeneration: x.5
	), Raves (more monsters),
	Boss, Spikes (Complete assets->items->1)

	Sounds, BgMusic - Undertale - Megalovania

	Menu,
	Save Game / Restore Game (Local Storage).

	///
	meteor (+)
	shield (+)
	gorilla (+)
	fix gorilla bomb delta (+)
	bomb (+)
	bird*
	bunker?
	mate
	story lines for items, monsters, hero (ex: Gorilla)
	rave,
	rage,
	boss,
	sounds,
	menu -> play, controls, rules,
	auto save => (if exit during action -> e-dialog), settings,

	remove p5js library -> clear canvas
*/

// x. Predict block using object + use only type in Creature.switch (+)
// x. Use Element id to delete bullet and calculate monster's hp (+)
// x. Fix items array. => {} -> [] ---> redraw (+)
// x. Fix BAD::2H3_sjn2 - Bad Queue (+)
// 1. Hero health by object
// END. noLoop() on die + TODO

const settings = {
	canvas: {
		height: 445, // 445
		width: 850, // 800 - 850
		FPS: 30,
		target: null
	},
	inGame: true,
	playerHBHeight: 17.5, // 17.5
	gameAssets: {
		BACKGROUND: {
			type: "THEME",
			model: null
		},
		BLOCK: {
			id: 1,
			type: "BLOCK",
			model: null
		},
		LAVA: {
			id: 2,
			type: "BLOCK",
			model: []
		},
		ARMOR_1: {
			id: 20,
			type: "ITEM",
			health: 15,
			model: null
		},
		ARMOR_2: {
			id: 21,
			type: "ITEM",
			health: 25,
			model: null
		},
		ARMOR_3: {
			id: 22,
			type: "ITEM",
			health: 45,
			model: null
		},
		HELMET: {
			id: 23,
			type: "ITEM",
			health: 30,
			model: null
		},
		BOOTS: {
			id: 24,
			type: "ITEM",
			speed: 5,
			limit: 600,
			model: null
		},
		SHIELD_ITEM: {
			id: 25,
			type: "ITEM",
			model: null
		},
		HEALTH_BOTTLE: {
			id: 26,
			type: "ITEM",
			health: 120,
			model: null
		},
		MATE_SPAWNER: {
			name: "Mate",
			id: 27,
			type: "ITEM",
			model: null
		},
		METEOR_SUMMONER: {
			name: "Meteor",
			id: 28,
			type: "ITEM",
			model: null
		},
		METEOR: {
			id: 50,
			type: "OBJECT",
			model: null,
			speed: 24
		},
		SHIELD: {
			id: 51,
			type: "OBJECT",
			model: null,
			time: 175 // frames // 1000(30fps) -> 32s, 175 ~ 6s
		},
		BOMB: {
			id: 52,
			type: "OBJECT",
			model: null
		},
		HERO_BULLET: {
			id: 70,
			type: "BULLET",
			model: null
		},
		LIZARD_BULLET: {
			id: 71,
			type: "BULLET",
			model: null
		},
		MONSTER_2_BULLET: {
			id: 72,
			type: "BULLET",
			model: null
		},
		SLIME: {
			id: 90,
			type: "MONSTER",
			model: null,
			health: 75,
			regeneration: 0,
			damage: 15,
			attackDelta: 30,
			minSpeed: 1.5,
			maxSpeed: 2,
			maxJumps: 1,
			jumpHeight: 12
		},
		LIZARD: {
			id: 91,
			type: "MONSTER",
			model: null,
			health: 20,
			regeneration: 5,
			minSpeed: 4.5,
			maxSpeed: 5,
			damage: 10,
			bulletRange: 400,
			bulletSpeed: 20,
			attackDelta: 40,
			maxJumps: 2,
			jumpHeight: 12
		},
		GORILLA: {
			id: 92,
			type: "MONSTER",
			model: null,
			health: 200,
			regeneration: 75,
			minSpeed: 1,
			maxSpeed: 1.5,
			damage: 20,
			attackDelta: 20,
			bombDelta: 200,
			maxJumps: 1,
			jumpHeight: 5,
			bombRange: 400,
			bombTime: 200,
			bombDamage: 20
		},
		SMOKE: {
			id: 110,
			type: "VISUAL",
			model: []
		}
	},
	itemKeys: [
		70, 71,
		66, 78
	]
}

let player = {
	models: {
		idle: null,
		run: null,
		jump: null,
		fly: null,
	},
	OBJECT: null,
	heatlh: 1,
	regeneration: 5,
	damage: 10,
	minSpeed: 4.5,
	maxSpeed: 5,
	bulletRange: settings.canvas.width * .75
},
	monsters = [],
	monstersID = 0,

	bullets = [],
	bulletsID = 0,

	meteors = [],
	meteorsID = 0,

	bombs = [],
	bombsID = 0,

	items = [],
	itemsID = 0,
	itemsRefresh = {
		started: false,
		wait: 0,
		delta: 0
	},


	touchableElements = [];

// 0 - void
// 1 - block
// 2 - lava
const map = [
	[0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1/**/, 1, 1, 1/**/, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class Element {
	constructor(isBlock = false, leftIndex = -1, bottomIndex = -1, typenum, id = 0) {

		this.isBlock = isBlock;
		if(isBlock) {
			this.size = settings.canvas.width / map[0].length; // 30

			this.leftIndex = leftIndex;
			this.bottomIndex = bottomIndex;

			this.pos = {
				x: leftIndex * this.size,
				y: settings.canvas.height - (map.length - bottomIndex) * this.size
			}
		}

		this.type = typenum;
		this.id = id;
	}

	predictObstacle(pos, width, height) {
		let { x: px, y: py } = pos,
			{ x: ex, y: ey } = this.pos;

		if(
			(px + width >= ex) && (px <= ex + this.size) && // x (left, right)
			(py + height >= ey) && (py <= ey + this.size) // y (top, bottom)
		) {
			return this;
		}
	}
}

class Block extends Element {
	constructor(leftIndex, bottomIndex, number) {
		super(true, leftIndex, bottomIndex, number, 0);
	}

	render() {
		image(settings.gameAssets.BLOCK.model, this.pos.x, this.pos.y, this.size, this.size);
		// rect(this.pos.x, this.pos.y, this.size, this.size);

		return this;
	}
}

class Lava extends Element {
	constructor(leftIndex, bottomIndex, number) {
		super(true, leftIndex, bottomIndex, number, 0);

		this.currentFrame = 0;
		this.currentSprite = 0;
	}

	render() {
		image(settings.gameAssets.LAVA.model[this.currentSprite], this.pos.x, this.pos.y, this.size, this.size);

		return this;
	}

	update() {
		if(!settings.inGame) return;

		if(++this.currentFrame % 5 === 0 && ++this.currentSprite > settings.gameAssets.LAVA.model.length - 1) {
			this.currentSprite = 0;
		}

		return this;
	}
}

class Creature {
	constructor(id = 0, race, pos, maxHealth, currentHealth, models, width, height, regenPower, damage, asl, speed, jh, maxJumps = 3, bulletRange = 0, bulletSpeed = 0) {
		this.isAlive = true;
		this.race = race;
		this.id = id;

		this.models = models;
		this.model = this.models.idle || this.models;

		this.damage = damage;
		this.bulletRange = bulletRange;
		this.bulletSpeed = bulletSpeed;

		this.asl = asl; // Attack Speed Limit

		if(typeof asl !== "object") {
			this.aslDelta = 0;
		} else {
			let a = Object.assign({}, asl);

			Object.keys(a).forEach(io => {
				a[io] = 0;
			});

			this.aslDelta = a;
		}


		this.pos = pos || {
			x: 0,
			y: 0
		}

		this.strictJump = true;
		this.maxJumps = maxJumps;
		this.jumps = 0;

		this.width = width;
		this.height = height;
		if(!this.width || !this.height) {
			alert("ERROR! Check the console!");
			throw new Error("We couldn't load creature's dimensions. Please, provide these values.")
		}

		this.gravity = 30 / settings.canvas.FPS;
		this.velocity = 0;

		this.speed = speed;
		this.jumpHeight = jh;
		this.movement = 0;
		this.direction = 1;

		this.maxHealth = maxHealth;
		this.health = currentHealth || maxHealth;

		if(regenPower) {
			this.regenDelta = 0;
			this.regenPower = regenPower;
		}

		this.set = {
			helmet: null,
			armor: null,
			shield: null
		}
	}

	update() {
		if(!this.isAlive) return this;

		if(typeof this.aslDelta !== "object") { // 22
			if(--this.aslDelta < 0) {
				this.aslDelta = 0;
			}
		} else { // {}
			Object.keys(this.aslDelta).forEach(io => {
				if(--this.aslDelta[io] < 0) this.aslDelta[io] = 0;
			});
		}

		if(this.race === 'hero' && this.set.shield && --this.set.shield.time <= 0) {
			this.set.shield = null;
		}

		let testYPassed = true,
			testXPassed = true,
			damage = 0,
			speed = this.speed + ((this.set.boots && this.set.boots.speed) || 1);

		// Test y
		touchableElements.forEach(io => {
			let yTest = io.predictObstacle( // y
				{
					x: this.pos.x,
					y: this.pos.y + (this.velocity + this.gravity)
				},
				this.width,
				this.height
			),
				xTest = io.predictObstacle( // x
				{
					x: this.pos.x + this.movement * speed,
					y: this.pos.y
				},
				this.width,
				this.height
			);

			if(xTest) {
				var xTestObject = xTest;
				xTest = xTest.type;
			}
			if(yTest) {
				var yTestObject = yTest;
				yTest = yTest.type;
			}

			if([xTest, yTest].includes(1) || [xTest, yTest].includes(2)) { // if material is block or lava
				if([xTest, yTest].includes(2)) {
					if(!damage) damage += 10;
					if(this.race === 'hero') this.jumps = 0;
				} else {
					this.jumps = this.maxJumps;
				}

				if(yTest && testYPassed) {
					testYPassed = false;
					this.velocity = this.gravity;
				}

				if(xTest && testXPassed) {
					testXPassed = false;
				}

				// Notify monster about blocks around him.
				if(this.race === 'monster' && this.detectObstacle && settings.inGame && this.isAlive) {
					let a = xTestObject,
						b = yTestObject;
					
					(a || b) && this.detectObstacle(a, b);
				}
			} else if(xTest || yTest) { // if material is health bottle
				if(xTest !== yTest) return;

				switch(xTest) {
					case settings.gameAssets.HEALTH_BOTTLE.id:
						xTestObject.destroy();
						this.health += settings.gameAssets.HEALTH_BOTTLE.health;
						if(this.health > this.maxHealth) this.health = this.maxHealth;
					break;
					case settings.gameAssets.ARMOR_1.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.armor = {
								name: "ARMOR_1",
								health: settings.gameAssets.ARMOR_1.health
							}
						}
					break;
					case settings.gameAssets.ARMOR_2.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.armor = {
								name: "ARMOR_2",
								health: settings.gameAssets.ARMOR_2.health
							}
						}
					break;
					case settings.gameAssets.ARMOR_3.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.armor = {
								name: "ARMOR_3",
								health: settings.gameAssets.ARMOR_3.health
							}
						}
					break;
					case settings.gameAssets.HELMET.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.helmet = {
								name: "HELMET",
								health: settings.gameAssets.HELMET.health
							}
						}
					break;
					case settings.gameAssets.BOOTS.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.boots = {
								name: "BOOTS",
								speed: settings.gameAssets.BOOTS.speed,
								limit: settings.gameAssets.BOOTS.limit,
							}
						}
					break;
					case settings.gameAssets.SHIELD_ITEM.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.set.shield = {
								name: "SHIELD_ITEM",
								time: settings.gameAssets.SHIELD.time
							}
						}
					break;
					case settings.gameAssets.MATE_SPAWNER.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.takeItem("MATE_SPAWNER");
						}
					break;
					case settings.gameAssets.METEOR_SUMMONER.id:
						xTestObject.destroy();
						if(this.race === 'hero') {
							this.takeItem("METEOR_SUMMONER");
						}
					break;
					case settings.gameAssets.HERO_BULLET.id:
						if(this.race !== 'hero') {
							xTestObject.destroy();
							damage += xTestObject.damage;
						}
					break;
					case settings.gameAssets.LIZARD_BULLET.id:
						if(this.race !== 'monster') {
							xTestObject.destroy();
							damage += xTestObject.damage;
						}
					break;
					case settings.gameAssets.METEOR.id:
						if(this.race !== 'hero') {
							damage += xTestObject.damage;
						}
					break;
					default:break;
				}
			}
		});

		this.declareDamage(damage);

		this.velocity += this.gravity;
		if(testYPassed) {
			this.pos.y += this.velocity;
		}

		if(testXPassed) {
			let a = this.set.boots;

			if(a) {
				a.limit -= abs(this.movement * speed);
				if(a.limit <= 0) this.set.boots = null;
			}

			this.pos.x += this.movement * speed;

			if(this.movement) this.direction = Math.sign(this.movement);

			if(this.pos.x + this.width > settings.canvas.width && this.race !== 'monster') {
				this.pos.x = settings.canvas.width - this.width;
			} else if(this.pos.x < 0) {
				this.pos.x = 0;
			}
		}

		if(Math.sign(this.velocity) !== -1) { // velocity is 0 or positive
			if(testYPassed) { // in air, but falls
				this.model = this.models.fly || this.model
			} else { // on the ground
				if(this.movement)
				this.model = this.models.idle || this.model;
			}
		} else {
			this.model = this.models.jump || this.model;
		}

		return this;
	}

	declareDamage(a) {
		let { helmet: b, armor: c, shield: aa } = this.set,
			d = () => (this.health <= 0) ? this.declareDeath(this.race) : null;

		if(aa) {
			return;
		} else if(b) {
			let e = b.health - a;
			if(e > 0) {
				b.health = e;
			} else if(e === 0) {
				delete this.set.helmet;
			} else {
				this.health -= a -= b.health;
				d();
				delete this.set.helmet;
			}
		} else if(c) {
			let e = c.health - a;
			if(e > 0) {
				c.health = e;
			} else if(e === 0) {
				delete this.set.armor;
			} else {
				this.health -= a -= c.health;
				d();
				delete this.set.armor;
			}
		} else {
			this.health -= a;
			d();
		}
	}

	regenerate() {
		if(!this.regenPower || !this.isAlive || !settings.inGame) return;

		if(++this.regenDelta % 125 === 0) {
			this.regenDelta = 1;

			this.health += this.regenPower;
			if(this.health > this.maxHealth) this.health = this.maxHealth;
		}
	}

	controlPos(mov) {
		this.movement = mov;
		this.touches = { x: false, y: false };
	}

	jump(iterations = 1) {
		for(let ma = 0; ma < iterations; ma++) {
			if(!this.jumps) return;
		
			this.velocity = -this.jumpHeight;
			if(this.strictJump) this.jumps--;
		}
	}

	declareDeath(entity = 'monster') {
		this.isAlive = false;
		this.health = 0;
		this.set = {}

		if(entity === 'hero') {
			settings.inGame = false;
			settings.canvas.target.style.filter = "grayscale(100%)";
			/*
				The p5.js library provides filter() function,
				but it needs a lot of memory.
				So, 'll' use CSS filter.
			*/
		} else if(entity === 'monster') {
			let a = monsters;
			a.splice(a.findIndex(io => io.id === this.id), 1);
		}
	}
}

class Meteor extends Element {
	constructor(id, pos = null, dir = null, target) {
		let a = settings.gameAssets.METEOR;
		super(false, -1, -1, a.id, id);

		this.damage = 400;

		this.model = a.model;
		this.size = 150;

		this.speed = a.speed;
		{
			let b = target,
				c = settings.canvas,
				d = (b.x > c.width / 2);

			this.pos = pos || {
				y: b.y - c.height,
				x: (d) ? b.x - c.height : b.x + c.height
			}
			this.direction = {
				x: (d) ? 1 : -1 , // pos- => +, pos+ => -
				y: 1,
			}
		}

	}

	render() {
		push();
			tint(255, 100);
			image(this.model, this.pos.x, this.pos.y, this.size, this.size);
		pop();

		return this;
	}

	update() {
		this.pos.x += this.direction.x * this.speed;
		this.pos.y += this.direction.y * this.speed;
	}
}

class Bullet extends Element {
	constructor(id, hostnum, damage = 1, model, pos, dir, speed, rangeX) {
		super(false, -1, -1, hostnum, id);

		this.size = 25;

		this.damage = damage;
		this.model = model;

		this.rangeX = rangeX;
		this.ranged = 0;

		this.pos = pos || { x: 0, y: 0 };
		this.direction = dir || { x: 1, y: 0 };

		this.speed = speed;
	}

	render() {
		image(this.model, this.pos.x, this.pos.y, this.size, this.size);

		return this;
	}

	update() {
		if(!settings.inGame) return;

		let a = touchableElements.filter(io => io.type !== this.type),
			b = true;
		a.forEach(io => {
			let c = io.predictObstacle(
				{
					x: this.pos.x + this.direction.x * this.speed,
					y: this.pos.y + this.direction.y * this.speed,
				},
				this.size,
				this.size
			);

			if(
				c && c.constructor.name !== this.constructor.name &&
				c.type !== settings.gameAssets.BOMB.id
			) { // c and is not a bullet and is not a bomb

				b = false;

				let d = settings.gameAssets;
				(c.destroy && c.destroy()); // if can be destroyed then destroy
			}
		})

		if(b) {
			let c = this.direction.x * this.speed;

			this.pos.x += c;
			this.ranged += c;
			if(this.ranged > this.rangeX) { // destroy
				this.destroy();
			}

			this.pos.y += this.direction.y * this.speed;
		}

		if(
			!b ||
			this.pos.x > settings.canvas.width ||
			this.pos.x + this.size < 0
		) this.destroy(); // splice self

		return this;
	}

	destroy() {
		bullets.splice(bullets.findIndex(io => io.id === this.id), 1);
	}
}

class Hero extends Creature {
	constructor() {
		super(
			0, // id
			'hero', // race
			null, // pos (default 0 - 0)
			125, // maxHealth
			125, // health
			{ // models / model
				idle: player.models.idle,
				run: player.models.run,
				jump: player.models.jump,
				fly: player.models.fly,
			},
			21, // width*
			35, // height*
			5, // regenPower
			20, // damage
			7.5, // asl (Attack Speed Limit)
			5 / (settings.canvas.FPS / 30), // speed
			9, // jh (Jump Height)
			3, // maxJumps
			player.bulletRange,
			10
		);

		// this.width = 21; // this.model.width -> 1?
		// this.height = 35; // this.model.height -> 1?

		this.items = [];
	}

	render() {
		// Draw hero
		image(this.model, this.pos.x, this.pos.y);

		{ // Draw the health bar
			let a;
			let b;

			if(!this.set.shield) {
				// ${ round(100 / (this.maxHealth / this.health)) }
				a = `Health (${ this.health }hp)`;
				b = "red";
			} else {
				a = `Shield (${ round(this.set.shield.time / settings.canvas.FPS) }s)`;
				b = "purple";
			}

			// Rectangle
			noStroke();
			fill(b);
			rect(0, 0, settings.canvas.width / 100 * (100 / (this.maxHealth / this.health)), settings.playerHBHeight);

			// Text
			textFont(mainFont);
			textSize(24);
			textAlign(CENTER);
			fill(255);
			text(a, settings.canvas.width / 2, 13);
		}

		if(!this.set.shield) {
			// Draw the armor bar
			if(this.set.armor) {
				noStroke();
				fill(15, 0, 255);
				rect(0, 0, settings.canvas.width / 100 * (100 / (this.maxHealth / this.set.armor.health)), settings.playerHBHeight);
			}

			// Draw the helmet bar
			if(this.set.helmet) {
				noStroke();
				fill(0, 255, 0);
				rect(0, 0, settings.canvas.width / 100 * (100 / (this.maxHealth / this.set.helmet.health)), settings.playerHBHeight);
			}
		}

		{ // Draw effects
			let a = 20, // icon size
				b = 5, // margin
				c = Object.values(this.set)
						.filter(io => io)
						.map(io => io.name);

			c.forEach((io, ia) => {
				let c = settings.gameAssets[io].model;
				if(!c) return;

				fill(255);
				image(c, ia * (a + b) + b, settings.playerHBHeight + b, a, a);
			});

		}

		{ // Draw items
			let a = 20, // icon size
				b = 10; // padding

			textFont(mainFont);
			textSize(25);
			textAlign(RIGHT);
			fill(255);

			this.items.forEach((io, ia) => {
				let c = settings.gameAssets[io.name];
				if(!c) return;

				text(
					`${ c.name } ( ${ String.fromCharCode(io.runKey).toLowerCase() } )`,
					settings.canvas.width - a - b * 2,
					settings.playerHBHeight * 2 + ia * (15 + b)
				);

				image(
					c.model,
					settings.canvas.width - a - b,
					settings.playerHBHeight + 5 + ia * (15 + b),
					a, a
				)
			});
		}

		if(this.set.shield) { // Draw shield
			let a = 40; // size

			image(settings.gameAssets.SHIELD.model, this.pos.x + this.width / 2 - a / 2, this.pos.y + this.height / 2 - a / 2, a, a);

		}

		return this;
	}

	shoot() {
		if(!this.isAlive || this.aslDelta > 0) return;

		this.aslDelta = this.asl;

		bullets.push(new Bullet(
			++bulletsID, // id
			settings.gameAssets.HERO_BULLET.id, // hostnum
			this.damage, // damage
			settings.gameAssets.HERO_BULLET.model, // model
			{ // pos
				x: this.pos.x + ((this.direction === 1) ? 15 : -15),
				y: this.pos.y + this.height / 6
			},
			{
				x: this.direction,
				y: 0
			}, // dir
			this.bulletSpeed, // speed
			this.bulletRange // rangeX
		));
	}

	takeItem(item) {
		let a = this.items,
			b = settings.itemKeys,
			c = false;

		if(a.length > b.length - 1) {
			a.splice(0, 1);
			c = true;
		}

		a.forEach((io, ia, arr) => { // restore keys order
			arr[ia].runKey = b[ia];
		});

		a.push({
			name: item,
			runKey: b[a.length]
		});
	}

	useItem(a) {
		if(!this.isAlive) return;

		let b = this.items,
			c = b.findIndex(({ runKey: b }) => b === a); // Find the first item with that id and use it.

		if(c < 0) return;

		let d = settings.gameAssets[b[c].name].id; // get id
		b.splice(c, 1);

		switch(d) {
			case settings.gameAssets.METEOR_SUMMONER.id: {
				let e = Object.assign({}, this.pos);
				e.y -= this.height * 2;

				e.height = 2;

				meteors.push(new Meteor(++meteorsID, null, null, e));
			}
			break;
			default:break;
		}
	}
}

class Monster extends Creature {
	constructor(health, model, regen = 1, pos, damage = 10, size, maxJumps, minSpeed, maxSpeed, bulletRange, bulletSpeed, asl, jh) {
		super(
			++monstersID,
			'monster',
			pos,
			health,
			health,
			model,
			size,
			size,
			regen,
			damage,
			asl,
			random(minSpeed, maxSpeed),
			jh,
			maxJumps,
			bulletRange,
			bulletSpeed
		);

		this.size = size;
	}

	render() {
		fill(255, 0, 0);

		let hpHeight = 10,
			hpMargin = 2.5;

		rect(
			this.pos.x - this.size / 3.5,
			this.pos.y - (hpHeight + hpMargin),
			this.size * 1.5 / 100 * (100 / (this.maxHealth / this.health)),
			hpHeight
		);
		image(this.model, this.pos.x, this.pos.y, this.size, this.size);

		textFont(mainFont);
		textSize(25);
		textAlign(CENTER);
		fill(255);
		text(`${ this.health }hp`, this.pos.x + this.size / 2, this.pos.y - hpHeight - hpMargin - 5);

		return this;
	}
}

class Slime extends Monster {
	constructor() {
		let a = settings.gameAssets.SLIME;

		super(
			a.health, // heatlh
			a.model, // model
			a.regeneration, // regeneration power
			{ // position
				x: settings.canvas.width,
				y: 0
			},
			a.damage, // damage
			30, // size
			a.maxJumps, // maxJumps
			a.minSpeed, // minSpeed
			a.maxSpeed, // maxSpeed
			0,
			0,
			a.attackDelta,
			a.jumpHeight
		);
	}

	think() {
		if(!settings.inGame) return;

		// Move to the player
		let a = player.OBJECT,
			b = this.pos,
			c = 20, // rangeX
			f = 5, // rangeY
			d = a.pos.x + this.size / 2,
			e = (
				(d > b.x - c && d < b.x + this.size + c) && // x
				(!(a.pos.y < b.y - f) && !(a.pos.y > b.y + this.size + f))
			);

		if(a.pos.x !== this.pos.x && !e) {
			this.movement = {
				true: 1,
				false: -1,
			}[a.pos.x > this.pos.x];
		}

		if(e && this.aslDelta <= 0) this.attack();
	}

	attack() {
		this.jump();
		this.aslDelta = this.asl;
		player.OBJECT.declareDamage(this.damage);
	}

	detectObstacle(a, b) {
		let c = settings.gameAssets;

		// Simple movement (It's the easiest monster)
		if((a && a.type === c.BLOCK.id) || (b && b.type === c.LAVA.id)) {
			this.jump();
		}
	}
}

class Lizard extends Monster {
	constructor() {
		let a = settings.gameAssets.LIZARD,
			b = 30; // size

		super(
			a.health, // heatlh
			a.model, // model
			a.regeneration, // regeneration power
			{ // position
				x: settings.canvas.width,
				y: 0
			},
			a.damage, // damage
			b, // size
			a.mapJumps, // maxJumps
			a.minSpeed, // minSpeed
			a.maxSpeed, // maxSpeed
			a.bulletRange, // bulletrange
			a.bulletSpeed, // bulletSpeed
			a.attackDelta, // Bullet time restore
			a.jumpHeight
		);
	}

	think() {
		if(!settings.inGame) return;

		let a = player.OBJECT,
			b = this,
			c = abs(a.pos.x - b.pos.x),
			d = this.bulletRange,
			e = abs(a.height - b.size), // difference between heights
			f = "pos",
			g = "height",
			h = a[f].y - e < b[f].y && a[f].y + a[g] + e > b[f].y + b[g];

		if(
			c > d * .9 || !h
		) { // 
			this.movement = {
				true: 1,
				false: -1,
			}[a.pos.x > b.pos.x];
		} else if(c < d * .65) { // if too near
			this.movement = {
				true: 1,
				false: -1,
			}[a.pos.x < b.pos.x];
		} else {
			this.movement = 0;
		}

		if(c < d && h && this.aslDelta <= 0) {
			this.attack(a);
		}
	}

	attack(player) {
		this.aslDelta = this.asl;
		bullets.push(new Bullet(
			++bulletsID, // id
			settings.gameAssets.LIZARD_BULLET.id, // hostnum
			this.damage, // damage
			settings.gameAssets.LIZARD_BULLET.model, // model
			{ // pos
				x: this.pos.x,
				y: this.pos.y + this.height / 6
			},
			{
				x: (player.pos.x > this.pos.x) ? 1 : -1,
				y: 0
			}, // dir
			this.bulletSpeed, // speed
			this.bulletRange // rangeX
		));
	}

	detectObstacle(a, b) {
		if(a) {
			let c = a.bottomIndex,
				d = a.leftIndex,
				e = map[c]; // next block

			if(![undefined, 0].includes(e[d])) {
				this.jump();
			}
			if(![undefined, 0].includes(e[d + this.movement])) {
				this.jump(2);
			}
		}
		if(b) {
			let c = b.bottomIndex,
				d = b.leftIndex,
				e = map[c],
				f = e[d],
				g = e[d + this.movement];

			if([f && f.material, g && g.material].includes(settings.gameAssets.LAVA.id)) {
				this.jump();
			}
		}
	}
}

class Gorilla extends Monster {
	/*
	    Big and slow monster that learned how to use the Magnific Bombs and now can teleport you to himself.
        Has a lot of HP, and can kill the hero without any help.
	*/

	constructor() {
		let a = settings.gameAssets.GORILLA,
			b = 45; // size

		super(
			a.health, // heatlh
			a.model, // model
			a.regeneration, // regeneration power
			{ // position
				x: settings.canvas.width,
				y: 0
			},
			a.damage, // damage
			b, // size
			a.mapJumps, // maxJumps
			a.minSpeed, // minSpeed
			a.maxSpeed, // maxSpeed
			0, // bulletrange
			0, // bulletSpeed
			{
				hit: a.attackDelta,
				bomb: a.bombDelta
			}, // attack time restore
			a.jumpHeight
		);
	}

	think() {
		if(!settings.inGame) return;

		let a = player.OBJECT,
			b = this.pos,
			c = abs(a.pos.x - b.x),
			d = settings.gameAssets.GORILLA.bombRange,
			e = 40, // hand hit range
			f = 15,
			g = (b.y > a.pos.y - f && b.y < a.pos.y + a.height + f);

		if(a.pos.x !== b.x) { // too big distance
			this.movement = {
				true: 1,
				false: -1,
			}[a.pos.x > b.x];
		}

		if(c <= e && g && this.aslDelta.hit <= 0) { // hit
			this.hit();
		} else if(c < d && this.aslDelta.bomb <= 0) {
			this.spawnBomb(a);
		}
	}

	spawnBomb(a, b) { // asl for bombs?
		this.aslDelta.bomb = this.asl.bomb;

		bombs.push(new Bomb(
			++bombsID,
			null,
			settings.gameAssets.GORILLA.bombTime,
			settings.gameAssets.GORILLA.bombDamage,
			this.pos
		));
	}

	hit() {
		let a = player.OBJECT;
		this.aslDelta.hit = this.asl.hit;

		this.jump();
		a.declareDamage(this.damage);
		a.velocity -= 15; // 15
		this.jumps = 0;

	}
}

class Bomb extends Element {
	constructor(id, pos, time, damage, target = null) {
		super(false, 0, 0, settings.gameAssets.BOMB.id, 0);

		this.model = settings.gameAssets.BOMB.model;
		this.size = 20;

		this.id = id;

		this.frame = 0;
		this.time = 100 || time;

		this.ex = this.exp = false;

		this.range = 50;
		this.power = 10;
		this.damage = damage;

		this.target = target || null; // WARNING: linked object (live position)

		{
			let a = player.OBJECT.pos,
				b = 30; // range

			this.pos = pos || {
				x: random(a.x - 30, a.x + 30),
				y: random(a.y - 30, a.y + 30)
			}
		}
	}

	render() {
		fill('rgba(255, 0, 0, .25)');
		ellipse(this.pos.x + this.size / 2, this.pos.y + this.size / 2, this.frame, this.frame);

		if(this.ex && this.frame <= settings.gameAssets.SMOKE.model.length) {
			let a = settings.gameAssets.SMOKE.model,
				b = a[a.length - (a.length - this.frame)];

			if(b) image(b, this.ex.x - b.width / 2, this.ex.y);
		} else {
			image(this.model, this.pos.x, this.pos.y, this.size, this.size);
		}

		return this;
	}

	update() {
		if(this.time < 150 && this.time > 50 && !this.ex) this.frame += 5;
		else if(this.time < 50 && !this.ex) this.frame += 10;
		else this.frame++;

		if(this.frame > 30) this.frame = 0;

		this.time--;

		if(this.time <= 0 && !this.ex && !this.exp) {
			this.explode();
			this.exp = true;
		} else if(
			(this.ex && this.frame > settings.gameAssets.SMOKE.model.length) || (
				!this.ex && this.time <= 0
			)
		) {
			bombs.splice(bombs.findIndex(io => io.id === this.id), 1);
		}
	}

	explode() {
		if(!settings.inGame) return;

		let a = player.OBJECT,
			b = (b, bb) => bb >= b - this.range && bb <= b + this.size + this.range;

		if(b(a.pos.x, this.pos.x) && b(a.pos.y, this.pos.y)) {
			this.frame = 0;
			this.ex = Object.assign({}, a.pos);

			if(this.target) {
				a.pos = {
					x: this.target.x,
					y: this.target.y
				}
			} else {
				let aa = () => {
					let a = a => floor(random(a)),
					b = a(map.length),
					c = a(map[0].length),
					d = map[b][c].object,
					e = false;

					if(!d || d.type === settings.gameAssets.LAVA.id) return aa();

					e = false;
					items.map(io => {
						if(e) return;

						if(
							io.pos &&
							io.type !== this.type &&
							io.pos.x === d.pos.x &&
							io.pos.y === d.pos.y - d.size
						) e = true;
					});
					if(e) return aa();

					e = false;
					map.forEach(io => io.forEach(({ object }) => {
						if(e) return;

						if(
							object &&
							object.pos.x === d.pos.x &&
							object.pos.y === d.pos.y - d.size
						) e = true;
					}));
					if(e) return aa();

					return d;
				}

				let c = aa();

				a.pos = {
					x: c.pos.x,
					y: c.pos.y - a.height - 1
				}
			}

			// a.velocity -= this.power;
			// a.declareDamage(this.damage);
		}
	}
}

class Item extends Element {
	constructor(id, model, isVisible, typenum) {
		super(false, 0, 0, typenum, 0);

		this.size = 30;
		this.isVisible = isVisible;
		this.model = model;

		this.id = id;

		this.pos = null;
	}

	render() {
		if(!this.pos) this.pos = this.genPos();

		image(this.model, this.pos.x, this.pos.y, this.size, this.size);

		return this;
	}

	update() {
		this.pos = {
			x: this.pos.x + sin(this.pos.x),
			y: this.pos.y + sin(this.pos.y)
		}
	}

	destroy() {
		let a = items;
		a.splice(a.findIndex(io => io.id === this.id), 1);
	}

	genPos() {
		let aa = () => {
			let a = a => floor(random(a)),
			b = a(map.length), // y in the array
			c = a(map[0].length), // x in the array
			d = map[b][c].object,
			e = false;

			// Prevent spawn under lava
			if(!d || d.type === settings.gameAssets.LAVA.id) return aa();

			// Validate if no items on this position
			e = false;
			items.map(io => {
				if(e) return;

				if(
					io.pos &&
					io.type !== this.type &&
					io.pos.x === d.pos.x &&
					io.pos.y === d.pos.y - d.size
				) e = true;
			});
			if(e) return aa();

			// Validate if no blocks on this position
			e = false;
			map.forEach(io => io.forEach(({ object }) => {
				if(e) return;

				if( // XXX
					object &&
					object.pos.x === d.pos.x &&
					object.pos.y === d.pos.y - d.size
				) e = true;
			}));
			if(e) return aa();

			return d;
		}

		let a = aa();

		return ({
			x: a.pos.x,
			y: a.pos.y - a.size
		});
	}
}

function preload() {
	mainFont = loadFont('./assets/mainFont.ttf');
}

function setup() {
	settings.canvas.target = createCanvas(settings.canvas.width, settings.canvas.height).elt;
	frameRate(settings.canvas.FPS);

	settings.gameAssets.BACKGROUND.model       = loadImage('./assets/background.jpg');
	settings.gameAssets.BLOCK.model            = loadImage('./assets/block.png');
	settings.gameAssets.HEALTH_BOTTLE.model    = loadImage('./assets/items/heal.png');
	settings.gameAssets.ARMOR_1.model          = loadImage('./assets/items/arm1.png');
	settings.gameAssets.ARMOR_2.model          = loadImage('./assets/items/arm2.png');
	settings.gameAssets.ARMOR_3.model          = loadImage('./assets/items/arm3.png');
	settings.gameAssets.HERO_BULLET.model      = loadImage('./assets/bullets/fireball.png');
	settings.gameAssets.LIZARD_BULLET.model    = loadImage('./assets/bullets/monster1.gif');
	settings.gameAssets.MONSTER_2_BULLET.model = loadImage('./assets/bullets/monster2.gif');
	settings.gameAssets.BOOTS.model            = loadImage('./assets/items/boots.png');
	settings.gameAssets.HELMET.model           = loadImage('./assets/items/helm.png');
	settings.gameAssets.MATE_SPAWNER.model     = loadImage('./assets/items/mateSpawner.png');
	settings.gameAssets.SHIELD_ITEM.model      = loadImage('./assets/items/shield.png');
	settings.gameAssets.SHIELD.model           = loadImage('./assets/items/shieldEffect.png');
	settings.gameAssets.METEOR_SUMMONER.model  = loadImage('./assets/items/sMeteor.png');
	settings.gameAssets.METEOR.model           = loadImage('./assets/items/meteor.png');
	settings.gameAssets.BOMB.model             = loadImage('./assets/items/poison.png')
	settings.gameAssets.SLIME.model            = loadImage('./assets/monsters/slime.gif');
	settings.gameAssets.LIZARD.model           = loadImage('./assets/monsters/lizard.gif');
	settings.gameAssets.GORILLA.model          = loadImage('./assets/monsters/gorilla.png');
	player.models.idle                         = loadImage('./assets/hero/idle.gif');
	player.models.run                          = loadImage('./assets/hero/run.gif');
	player.models.jump                         = loadImage('./assets/hero/jump.png');
	player.models.fly                          = loadImage('./assets/hero/fly.gif');

	[
		'./assets/lava/1.png',
		'./assets/lava/2.png',
		'./assets/lava/3.png',
		'./assets/lava/4.png',
		'./assets/lava/5.png',
		'./assets/lava/6.png',
		'./assets/lava/7.png',
		'./assets/lava/8.png',
		'./assets/lava/9.png',
		'./assets/lava/10.png',
		'./assets/lava/11.png',
		'./assets/lava/12.png',
		'./assets/lava/13.png',
		'./assets/lava/14.png',
		'./assets/lava/15.png',
		'./assets/lava/16.png',
		'./assets/lava/17.png',
		'./assets/lava/18.png',
		'./assets/lava/19.png',
		'./assets/lava/20.png',
		'./assets/lava/21.png',
		'./assets/lava/22.png',
		'./assets/lava/23.png',
		'./assets/lava/24.png',
		'./assets/lava/25.png',
		'./assets/lava/26.png',
		'./assets/lava/27.png',
		'./assets/lava/28.png',
		'./assets/lava/29.png',
		'./assets/lava/30.png',
		'./assets/lava/31.png',
		'./assets/lava/32.png',
		'./assets/lava/34.png',
		'./assets/lava/35.png',
		'./assets/lava/36.png',
		'./assets/lava/37.png',
		'./assets/lava/38.png',
		'./assets/lava/39.png',
		'./assets/lava/40.png',
		'./assets/lava/41.png',
		'./assets/lava/42.png',
		'./assets/lava/43.png',
		'./assets/lava/44.png',
		'./assets/lava/45.png'
	].forEach(io => {
		settings.gameAssets.LAVA.model.push(loadImage(io));
	});

	[
		'./assets/tpsmoke/1.gif',
		'./assets/tpsmoke/2.gif',
		'./assets/tpsmoke/3.gif',
		'./assets/tpsmoke/4.gif',
		'./assets/tpsmoke/5.gif',
		'./assets/tpsmoke/6.gif',
		'./assets/tpsmoke/7.gif'
	].forEach(io => {
		settings.gameAssets.SMOKE.model.push(loadImage(io));
	})

	player.OBJECT = new Hero;
	// monsters.push(new Slime);
	// monsters.push(new Lizard);
	monsters.push(new Gorilla);

	// bombs.push(new Bomb(++bombsID, null, settings.gameAssets.GORILLA.bombTime, settings.gameAssets.GORILLA.bombTime, null));

	// items.push(new Item(++itemsID, settings.gameAssets.HEALTH_BOTTLE.model, true, settings.gameAssets.HEALTH_BOTTLE.id));
	// items.push(new Item(++itemsID, settings.gameAssets.ARMOR_1.model, true, settings.gameAssets.ARMOR_1.id));
	// items.push(new Item(++itemsID, settings.gameAssets.ARMOR_2.model, true, settings.gameAssets.ARMOR_2.id));
	// items.push(new Item(++itemsID, settings.gameAssets.ARMOR_3.model, true, settings.gameAssets.ARMOR_3.id));
	// items.push(new Item(++itemsID, settings.gameAssets.HELMET.model, true, settings.gameAssets.HELMET.id));
	// items.push(new Item(++itemsID, settings.gameAssets.BOOTS.model, true, settings.gameAssets.BOOTS.id));
	// items.push(new Item(++itemsID, settings.gameAssets.MATE_SPAWNER.model, true, settings.gameAssets.MATE_SPAWNER.id));
	// items.push(new Item(++itemsID, settings.gameAssets.METEOR_SUMMONER.model, true, settings.gameAssets.METEOR_SUMMONER.id));
	// items.push(new Item(++itemsID, settings.gameAssets.SHIELD_ITEM.model, true, settings.gameAssets.SHIELD_ITEM.id));

	// meteors.push(new Meteor(++meteorsID, player.OBJECT.pos));
}

function draw() {
	image(settings.gameAssets.BACKGROUND.model, 0, 0, settings.canvas.width, settings.canvas.height);

	if(++itemsRefresh.delta >= itemsRefresh.wait && settings.inGame) {
		if(!itemsRefresh.started) {
			itemsRefresh.started = true;
		} else { // spawn random item
			let a = settings.gameAssets,
				b = Object.keys(a).filter(io => a[io].type === "ITEM"),
				e = b[floor(random(b.length))],
				{ model, id } = a[e];

			items.push(new Item(++itemsID, model, true, id));

		}

		itemsRefresh.wait = round(random(500, 1000)); // 500 - 5000
		itemsRefresh.delta = 1;
	}

	if(!settings.inGame) {
		textFont(mainFont);
		textSize(64);
		textAlign(CENTER);
		fill(255);
		text('YOU DIED!', settings.canvas.width / 2, settings.canvas.height / 2 + 20);
		// noLoop();
	}

	touchableElements = [];

	map.forEach((io, ia, arr1) => {
		io.forEach((ik, il, arr2) => {
			if(ik) {
				if(Number.isInteger(ik)) { // generate class
					switch(ik) {
						case settings.gameAssets.BLOCK.id: // block
							var a = new Block(il, ia, ik);
						break;
						case settings.gameAssets.LAVA.id: // lava
							var a = new Lava(il, ia, ik);
						break;
						default:return; // invalid element -> break function
					}

					arr2[il] = {
						object: a,
						material: ik
					}
				} else { // use exists class
					touchableElements.push(ik.object);
					ik.object.render();
					ik.object.update && ik.object.update();
				}
			}
		});
	});

	items.forEach(io => {
		if(io.isVisible) {
			touchableElements.push(io);
			io.render().update();
		}
	});

	bombs.forEach(io => {
		touchableElements.push(io);
		io.render().update();
	});

	bullets.forEach(io => {
		touchableElements.push(io);
		io.render().update();
	});

	meteors.forEach(io => {
		touchableElements.push(io);
		io.render().update();
	});

	monsters.forEach(io => {
		io.render().update().think();
	});

	player.OBJECT.render().update().regenerate();
}

function keyPressed() {
	if([65, 68].includes(keyCode)) {
		player.OBJECT.controlPos((keyCode === 65) ? -1 : 1);
	} else if(keyCode === 32) {
		player.OBJECT.jump();
	} else if(keyCode === 13) {
		player.OBJECT.shoot();
	} else {
		player.OBJECT.useItem(keyCode)
	}
}

function keyReleased() {
	if([65, 68].includes(keyCode)) {
		player.OBJECT.controlPos(0);
	}
}