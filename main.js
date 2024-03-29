var gl; // WebGL context

//--------------------------------------------------
// Globals/Constants
//--------------------------------------------------

const MOVE_MAG = 30;
const PARTICLE_COUNT = 50;
const TORNADO_SPEED = 50;

//--------------------------------------------------
// Flags
//--------------------------------------------------

// true for Three Points, false for Three Sphere as particles
var USE_POINTS_AS_PARTICLES = true;

// use CANNON debug mode module to show wireframe physical bounding boxes
var CANNON_DEBUG_MODE = true;

var TORNADO_COUNTERCLOCKWISE = true;

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

var houseRoofGeo, houseRoofMat, houseRoofMesh;
var houseWallGeoLeft, houseWallMatLeft, houseWallMeshLeft;
var houseWallGeoRight, houseWallMatRight, houseWallMeshRight;

var houseRoofGeo2, houseRoofMat2, houseRoofMesh2;
var houseWallGeoLeft2, houseWallMatLeft2, houseWallMeshLeft2;
var houseWallGeoRight2, houseWallMatRight2, houseWallMeshRight2;

// Cannon
var world, timeStep=1/60;
var particleBodyCompound;

var sphereShape, sphereMass, sphereBody;
var planeShape, planeMass, planeBody;
var botShape, botMass, botBody;

var boxShape1, boxMass1, boxBody1;
var boxShape2, boxMass2, boxBody2;
var boxShape3, boxMass3, boxBody3;

var houseRoofShape, houseRoofMass, houseRoofBody;
var houseWallShapeLeft, houseWallMassLeft, houseWallBodyLeft;
var houseWallShapeRight, houseWallMassRight, houseWallBodyRight;

var houseRoofShape2, houseRoofMass2, houseRoofBody2;
var houseWallShapeLeft2, houseWallMassLeft2, houseWallBodyLeft2;
var houseWallShapeRight2, houseWallMassRight2, houseWallBodyRight2;

var cannonDebugRenderer;

//--------------------------------------------------
// Main Script
//--------------------------------------------------

initWorld();
initScene();

if (CANNON_DEBUG_MODE)
	cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

animate();


//====================================================================================================
// Functions!
//====================================================================================================

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

	// house
	houseRoofShape = new CANNON.Box(new CANNON.Vec3(10, 1, 10));
	houseRoofMass = 200;

	houseRoofBody = new CANNON.Body({
		shape: houseRoofShape,
		mass: houseRoofMass,
		position: new CANNON.Vec3(50, 10, 50)
	});
	world.addBody(houseRoofBody);

	houseWallShapeLeft = new CANNON.Box(new CANNON.Vec3(2, 5, 10));
	houseWallMassLeft = 200;

	houseWallBodyLeft = new CANNON.Body({
		shape: houseWallShapeLeft,
		mass: houseWallMassLeft,
		position: new CANNON.Vec3(45, 5, 50)
	});
	world.addBody(houseWallBodyLeft);

	houseWallShapeRight = new CANNON.Box(new CANNON.Vec3(2, 5, 10));
	houseWallMassRight = 200;

	houseWallBodyRight = new CANNON.Body({
		shape: houseWallShapeRight,
		mass: houseWallMassRight,
		position: new CANNON.Vec3(55, 5, 50)
	});
	world.addBody(houseWallBodyRight);

	// another house
	houseRoofShape2 = new CANNON.Box(new CANNON.Vec3(10, 1, 10));
	houseRoofMass2 = 200;

	houseRoofBody2 = new CANNON.Body({
		shape: houseRoofShape2,
		mass: houseRoofMass2,
		position: new CANNON.Vec3(-50, 10, -50)
	});
	world.addBody(houseRoofBody2);

	houseWallShapeLeft2 = new CANNON.Box(new CANNON.Vec3(2, 5, 10));
	houseWallMassLeft2 = 200;

	houseWallBodyLeft2 = new CANNON.Body({
		shape: houseWallShapeLeft2,
		mass: houseWallMassLeft2,
		position: new CANNON.Vec3(-45, 5, -50)
	});
	world.addBody(houseWallBodyLeft2);

	houseWallShapeRight2 = new CANNON.Box(new CANNON.Vec3(2, 5, 10));
	houseWallMassRight2 = 200;

	houseWallBodyRight2 = new CANNON.Body({
		shape: houseWallShapeRight2,
		mass: houseWallMassRight2,
		position: new CANNON.Vec3(-55, 5, -50)
	});
	world.addBody(houseWallBodyRight2);

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
	camera.position.y = 200;

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
	// Particle system
	//--------------------------------------------------

	var parShape = new CANNON.Sphere(1);
		particleBodyCompound = new CANNON.Body({
			mass: 0,
			shape: parShape,
			type: CANNON.Body.KINEMATIC,
			position: new CANNON.Vec3(0, 0, 0),
			angularDamping: 0,
			angularVelocity: new CANNON.Vec3(0, TORNADO_SPEED, 0),
			linearDamping: 10
		});

	if (USE_POINTS_AS_PARTICLES) {
		// create the particle variables
		var particles = new THREE.Geometry();
		var pMaterial = new THREE.PointsMaterial({
			color: 0xaaaaaa,
			size: 2.5
		});

		pMaterial.lights.value = true;

		// now create the individual particles
		for (var p = 0; p < PARTICLE_COUNT; p++) {

			var point = generateTornadoPoint(125);

			particles.vertices.push(point);

			//create Cannon particles to go along with vertex, added as compound shapes
			particleBodyCompound.addShape(parShape, point);
		}
		particleSystem = new THREE.Points(particles, pMaterial);

		world.addBody(particleBodyCompound);
	} else {
		// create the particle variables
		var pMaterial = new THREE.MeshPhongMaterial({
			color: 0xaaaaaa,
			side: THREE.DoubleSide
		});

		// create the particle system
		particleSystem = new THREE.Group();

		// now create the individual particles
		for (var p = 0; p < PARTICLE_COUNT; p++) {

			var point = generateTornadoPoint(125);

			var particleGeo = new THREE.SphereGeometry(1,8,6);

			var particle = new THREE.Mesh(particleGeo, pMaterial);
			particle.position.copy(point);

			// add it to the geometry
			particleSystem.add(particle);

			//create Cannon particles to go along with it, added as compound shapes
			particleBodyCompound.addShape(parShape, point);
		}

		world.addBody(particleBodyCompound);
	}

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

	boxGeometry3 = new THREE.CubeGeometry(20, 100, 10);
	boxMaterial3 = new THREE.MeshPhongMaterial({
			color: 0xf2a348
		});

	boxMesh3 = new THREE.Mesh(boxGeometry3, boxMaterial3);
	scene.add(boxMesh3);

	//make a house
	var houseColor = 0x439802;
	houseRoofGeo = new THREE.CubeGeometry(20, 2, 20);
	houseRoofMat = new THREE.MeshPhongMaterial({
		color: houseColor
	});
	houseRoofMesh = new THREE.Mesh(houseRoofGeo, houseRoofMat);
	scene.add(houseRoofMesh);

	houseWallGeoLeft = new THREE.CubeGeometry(4, 10, 20);
	houseWallMatLeft = new THREE.MeshPhongMaterial({
		color: houseColor
	});
	houseWallMeshLeft = new THREE.Mesh(houseWallGeoLeft, houseWallMatLeft);
	scene.add(houseWallMeshLeft);

	houseWallGeoRight = new THREE.CubeGeometry(4, 10, 20);
	houseWallMatRight = new THREE.MeshPhongMaterial({
		color: houseColor
	});
	houseWallMeshRight = new THREE.Mesh(houseWallGeoRight, houseWallMatRight);
	scene.add(houseWallMeshRight);

	var houseColor2 = 0x3430ff;
	var houseMaterial2 = new THREE.MeshPhongMaterial({
		color: houseColor2
	})

	houseRoofMesh2 = new THREE.Mesh(houseRoofGeo, houseMaterial2);
	houseWallMeshLeft2 = new THREE.Mesh(houseWallGeoLeft, houseMaterial2);
	houseWallMeshRight2 = new THREE.Mesh(houseWallGeoRight, houseMaterial2);

	scene.add(houseRoofMesh2);
	scene.add(houseWallMeshLeft2);
	scene.add(houseWallMeshRight2);

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

function generateTornadoPoint(height) {
	var pY = Math.random() * height;

	var radius = pY/3;
	var angle = Math.random() * 360;

	var pX = radius * Math.cos(angle);
	var pZ = radius * Math.sin(angle);

	return new THREE.Vector3(pX, pY, pZ);
}

function onKeyDown(evt) {
	switch (evt.keyCode) {

		case 68: // 'right'
			particleBodyCompound.velocity.set(MOVE_MAG, 0, 0);
			break;
		case 65: // 'left'
			particleBodyCompound.velocity.set(-MOVE_MAG, 0, 0);
			break;
		case 83: // 'down'
			particleBodyCompound.velocity.set(0, 0, MOVE_MAG);
			break;
		case 87: // 'up'
			particleBodyCompound.velocity.set(0, 0, -MOVE_MAG);
			break;
		case 81: // 'raise'
			particleBodyCompound.velocity.set(0, MOVE_MAG, 0);
			break;
		case 69: // 'lower'
			particleBodyCompound.velocity.set(0, -MOVE_MAG, 0);
			break;
		case 88: // 'stop linear motion'
			particleBodyCompound.velocity.setZero();
			break;
	}
}

function animate() {
	requestAnimationFrame(animate);	

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

	houseRoofMesh.position.copy(houseRoofBody.position);
	houseRoofMesh.quaternion.copy(houseRoofBody.quaternion);

	houseWallMeshLeft.position.copy(houseWallBodyLeft.position);
	houseWallMeshLeft.quaternion.copy(houseWallBodyLeft.quaternion);

	houseWallMeshRight.position.copy(houseWallBodyRight.position);
	houseWallMeshRight.quaternion.copy(houseWallBodyRight.quaternion);

	houseRoofMesh2.position.copy(houseRoofBody2.position);
	houseRoofMesh2.quaternion.copy(houseRoofBody2.quaternion);

	houseWallMeshLeft2.position.copy(houseWallBodyLeft2.position);
	houseWallMeshLeft2.quaternion.copy(houseWallBodyLeft2.quaternion);

	houseWallMeshRight2.position.copy(houseWallBodyRight2.position);
	houseWallMeshRight2.quaternion.copy(houseWallBodyRight2.quaternion);

	particleSystem.position.copy(particleBodyCompound.position);
	particleSystem.quaternion.copy(particleBodyCompound.quaternion);
}

function render() {
	if (CANNON_DEBUG_MODE)
		cannonDebugRenderer.update();
	renderer.render(scene, camera);
}
