var gl; // WebGL context

//--------------------------------------------------
// Globals/Constants
//--------------------------------------------------

const MOVE_MAG = 10;
const FIELD_X_LIMIT = 250;
const FIELD_Y_LIMIT = 20;
const FIELD_Z_LIMIT = 250;

//--------------------------------------------------
// Instance Variables
//--------------------------------------------------

// Three
var container;
var camera, scene, renderer;
var particleSystem;

var sphereGeometry, sphereMaterial, sphereMesh;
var planeGeometry, planeMaterial, planeMesh;

var boxGeometry1, boxMaterial1, boxMesh1;
var boxGeometry2, boxMaterial2, boxMesh2;
var boxGeometry3, boxMaterial3, boxMesh3;

// Cannon
var world, timeStep=1/60;
var particleBodyCompound;

var sphereShape, sphereMass, sphereBody;
var planeShape, planeMass, planeBody;
var botShape, botMass, botBody;

var boxShape1, boxMass1, boxBody1;
var boxShape2, boxMass2, boxBody2;
var boxShape3, boxMass3, boxBody3;

initWorld();
initScene();

var CannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
animate();

function initWorld() {
	console.log("Initializing physics");

	// set all of the physical world parameters
	// all Cannon.JS units are SI (metres, kilos, etc.)
	world = new CANNON.World();
	world.gravity.set(0,-50,0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10;	
	world.defaultContactMaterial.contactEquationStiffness = 1e6;
    world.defaultContactMaterial.contactEquationRelaxation = 10;

	//--------------------------------------------------
	// Base Plane/Terrain
	//--------------------------------------------------

	planeShape = new CANNON.Plane();
	planeMass = 0; // mass of 0 will make this plane static

	planeBody = new CANNON.Body({
		mass: planeMass,
		shape: planeShape
	});

	planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), (-Math.PI/2));
	planeBody.position.set(0,0,0);

	world.addBody(planeBody);

	//--------------------------------------------------
	// Container Planes
	//--------------------------------------------------



	//--------------------------------------------------
	// Movable Objects
	//--------------------------------------------------

	//sphere
	sphereShape = new CANNON.Sphere(10);
	sphereMass = 100;
	sphereBody = new CANNON.Body({
		mass: sphereMass,
		shape: sphereShape
	});
	sphereBody.position.set(0, 100, 130);

	world.addBody(sphereBody);

	// cannon boxes use half extents, so Cannon:Three dimensions should be 1:2
	// box #1
	boxShape1 = new CANNON.Box(new CANNON.Vec3( 25, 10, 25 ));
	boxMass1 = 200;

	boxBody1 = new CANNON.Body({
		mass: boxMass1,
		shape: boxShape1
	});

	boxBody1.position.set(-100, 100, 60);
	boxBody1.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,1), (Math.PI/8));
	world.addBody(boxBody1);

	// box #2
	boxShape2 = new CANNON.Box(new CANNON.Vec3( 10, 5, 35 ));
	boxMass2 = 100;

	boxBody2 = new CANNON.Body({
		mass: boxMass2,
		shape: boxShape2,
	});

	boxBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(1,1,0), (-Math.PI/15));
	boxBody2.position.set(75, 35, 40);
	world.addBody(boxBody2);

	// box #3
	boxShape3 = new CANNON.Box( new CANNON.Vec3( 10, 50, 5 ) );
	boxMass3 = 300;

	boxBody3 = new CANNON.Body( {
		mass: boxMass3,
		shape: boxShape3
	});

	boxBody3.position.set(-30, 100, -100);
	world.addBody(boxBody3);

	//--------------------------------------------------
	// User Controlled Objects
	//--------------------------------------------------
	botShape = new CANNON.Box(new CANNON.Vec3( 2, 2, 2 ));
	botMass = 0; 
	botBody = new CANNON.Body({
		mass: botMass,
		shape: botShape,
		type: CANNON.Body.KINEMATIC,
		position: new CANNON.Vec3(0, 1, 0)
	});

	world.addBody(botBody);

}

function initScene() {

	console.log("Initializing Scene");
	//--------------------------------------------------
	// Camera
	//--------------------------------------------------

	const VIEW_ANGLE = 45;
	const ASPECT = window.innerWidth / window.innerHeight;
	const NEAR = 0.1;
	const FAR = 10000

	// get DOM element to attach to
	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();

	// Create WebGL renderer & camera
	renderer = new THREE.WebGLRenderer();
	camera = new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR
		);

	camera.position.z = 450;
	camera.position.y = 150;

	// camera.rotation.x = Math.PI / 4;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	scene.add(camera);

	scene.fog = new THREE.Fog(0x000000, 500, 10000);

	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);

	//--------------------------------------------------
	// Base Plane/Terrain
	//--------------------------------------------------

	planeGeometry = new THREE.BoxGeometry(500, 500, 1);
	planeMaterial = new THREE.MeshPhongMaterial({
		color: 0x338933
	});

	planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

	scene.add(planeMesh);

	//--------------------------------------------------
	// User Controlled Objects
	//--------------------------------------------------

	botGeometry = new THREE.CubeGeometry( 1, 1, 1 );
	botMaterial = new THREE.MeshPhongMaterial({
			color: 0xf2a48a
		});

	botMesh = new THREE.Mesh(botGeometry, botMaterial);
	scene.add(botMesh);

	//--------------------------------------------------
	// Particle system
	//--------------------------------------------------

	// create the particle variables
	var particleCount = 500;
	var particles = new THREE.Geometry();
	var pMaterial = new THREE.MeshPhongMaterial({
	      color: 0xaaaaaa,
	      side: THREE.DoubleSide
	    });

	pMaterial.lights.value = true;

	// create the particle system
	particleSystem = new THREE.Group();

	var parShape = new CANNON.Sphere(1);
	particleBodyCompound = new CANNON.Body({
		mass: 0,
		shape: parShape,
		type: CANNON.Body.KINEMATIC,
		position: new CANNON.Vec3(pX, pY, pZ),
		angularDamping: 0,
		angularVelocity: new CANNON.Vec3(0, 10, 0),
		linearDamping: 10
	});

	// now create the individual particles
	for (var p = 0; p < particleCount; p++) {

		// create a particle with random
		// position values, -250 -> 250
		var pY = Math.random() * 125;

		// var pY = 125 * p;
		// var radius = Math.random() * pY/3;
		var radius = pY/3;
		var angle = Math.random() * 360;

		var pX = radius * Math.cos(angle);
		var pZ = radius * Math.sin(angle);

		var particleGeo = new THREE.SphereGeometry(1,8,6);
		var particleMat = pMaterial;

		var particle = new THREE.Mesh(particleGeo, particleMat);
		particle.position.set(pX, pY, pZ);

		// add it to the geometry
		particleSystem.add(particle);

		//create Cannon particles to go along with it, added as compound shapes
		particleBodyCompound.addShape(parShape, new CANNON.Vec3(pX, pY, pZ));

		// particleBodies.push(parBody);
		// world.addBody(parBody);
	}

	world.addBody(particleBodyCompound);

	console.log(world);

	// add it to the scene
	scene.add(particleSystem);

	// --------------------------------------------------
	// Scene-Physical Objects
	// --------------------------------------------------

	sphereGeometry = new THREE.SphereGeometry(10,8,10);
	sphereMaterial = new THREE.MeshPhongMaterial({
		color: 0xff0000,
		wireframe: false
	});

	sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphereMesh);

	boxGeometry1 = new THREE.BoxGeometry( 50, 20, 50 );
	boxMaterial1 = new THREE.MeshPhongMaterial({
			color: 0x347298
		});

	boxMesh1 = new THREE.Mesh(boxGeometry1, boxMaterial1);
	scene.add(boxMesh1);

	boxGeometry2 = new THREE.CubeGeometry( 20, 10, 70 );
	boxMaterial2 = new THREE.MeshPhongMaterial({
			color: 0x999988
		});

	boxMesh2 = new THREE.Mesh(boxGeometry2, boxMaterial2);
	scene.add(boxMesh2);

	boxGeometry3 = new THREE.CubeGeometry( 20, 100, 10 );
	boxMaterial3 = new THREE.MeshPhongMaterial({
			color: 0xf2a348
		});

	boxMesh3 = new THREE.Mesh(boxGeometry3, boxMaterial3);
	scene.add(boxMesh3);

	//--------------------------------------------------
	// Lights
	//--------------------------------------------------

	// Center Point light
	const pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(50, 100, 50);
	scene.add(pointLight);

	// Directional Light
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
	dirLight.position.set(0,1,0.3);
	dirLight.castShadows = true;
	scene.add(dirLight);

	window.addEventListener('keydown', onKeyDown, false );

}

function onKeyDown(evt) {
	switch (evt.keyCode) {

		case 68: // 'right'
			particleBodyCompound.velocity.set(MOVE_MAG, 0, 0);
			// particleSystem.position.x = particleSystem.position.x + MOVE_MAG; 

			// if (particleSystem.position.x > FIELD_X_LIMIT)
			// 	particleSystem.position.x = FIELD_X_LIMIT;
			break;
		case 65: // 'left'
			particleBodyCompound.velocity.set(-MOVE_MAG, 0, 0);
			// particleSystem.position.x = particleSystem.position.x - MOVE_MAG; 

			// if (particleSystem.position.x < -FIELD_X_LIMIT)
			// 	particleSystem.position.x = -FIELD_X_LIMIT;
			break;
		case 83: // 'down'
			particleBodyCompound.velocity.set(0, 0, MOVE_MAG);
			// particleSystem.position.z = particleSystem.position.z + MOVE_MAG;

			// if (particleSystem.position.z > FIELD_Z_LIMIT)
			// 	particleSystem.position.z = FIELD_Z_LIMIT; 
			break;
		case 87: // 'up'
			particleBodyCompound.velocity.set(0, 0, -MOVE_MAG);
			// particleSystem.position.z = particleSystem.position.z - MOVE_MAG;

			// if (particleSystem.position.z < -FIELD_Z_LIMIT)
			// 	particleSystem.position.z = -FIELD_Z_LIMIT;  
			break;
		case 81: // 'raise'
			particleBodyCompound.velocity.set(0, MOVE_MAG, 0);
			// particleSystem.position.y = particleSystem.position.y + MOVE_MAG;

			// if (particleSystem.position.y > FIELD_Y_LIMIT)
			// 	particleSystem.position.y = FIELD_Y_LIMIT;
			break;
		case 69: // 'lower'
			particleBodyCompound.velocity.set(0, -MOVE_MAG, 0);
			// particleSystem.position.y = particleSystem.position.y - MOVE_MAG; 

			// if (particleSystem.position.y < -FIELD_Y_LIMIT)
			// 	particleSystem.position.y = -FIELD_Y_LIMIT;
			break;
		case 88: // 'stop linear motion'
			particleBodyCompound.velocity.setZero();
			break;
	}
}

function animate() {
	requestAnimationFrame(animate);	

	// particleSystem.rotation.y += Math.PI/30;

	var event = window.event ? window.event : null;
	if (event !== null)
		console.log(event.keyCode);

	updatePhysics();
	render();
}

function updatePhysics() {
	world.step(timeStep);

	// copy coordinate information from cannon.js object to three.js object
	sphereMesh.position.copy(sphereBody.position);
	sphereMesh.quaternion.copy(sphereBody.quaternion);

	planeMesh.position.copy(planeBody.position);
	planeMesh.quaternion.copy(planeBody.quaternion);

	boxMesh1.position.copy(boxBody1.position);
	boxMesh1.quaternion.copy(boxBody1.quaternion);

	boxMesh2.position.copy(boxBody2.position);
	boxMesh2.quaternion.copy(boxBody2.quaternion);

	boxMesh3.position.copy(boxBody3.position);
	boxMesh3.quaternion.copy(boxBody3.quaternion);

	// particleBodyCompound.position.copy(particleSystem.position);
	// particleBodyCompound.quaternion.copy(particleSystem.quaternion);
	particleSystem.position.copy(particleBodyCompound.position);
	particleSystem.quaternion.copy(particleBodyCompound.quaternion);
}

function render() {
	// CannonDebugRenderer.update();
	renderer.render(scene, camera);
}
