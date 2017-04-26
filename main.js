var gl; // WebGL context

//--------------------------------------------------
// Globals/Constants
//--------------------------------------------------

const MOVE_MAG = 3;
const FIELD_X_LIMIT = 250;
const FIELD_Y_LIMIT = 20;
const FIELD_Z_LIMIT = 250;

//--------------------------------------------------
// Instance Variables
//--------------------------------------------------

var container;
var camera, scene, renderer;
var particleSystem;

initCannon();
initScene();
animate();

function initCannon() {
	console.log("Initializing physics");
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

	scene.fog = new THREE.Fog( 0x000000, 500, 10000);


	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement); 
	var controls = new THREE.TrackballControls(camera, renderer.domElement);

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];


	//--------------------------------------------------
	// Base Plane/Terrain
	//--------------------------------------------------

	var planeGeometry = new THREE.PlaneGeometry(1, 1);
	var planeMaterial = new THREE.MeshPhongMaterial({
		color: 0x338933,
		side: THREE.DoubleSide
	});

	var plane = new THREE.Mesh(planeGeometry, planeMaterial);

	plane.rotation.x = Math.PI / 2;
	plane.rotation.y = 0;
	plane.rotation.z = 0;

	plane.scale.x = 500;
	plane.scale.y = 500;

	scene.add(plane);

	//--------------------------------------------------
	// Particle system
	//--------------------------------------------------

	// create the particle variables
	var particleCount = 8000;
	var particles = new THREE.Geometry();
	var pMaterial = new THREE.PointsMaterial({
	      color: 0xaaaaaa,
	      size: 2.5,
	    });

	pMaterial.lights.value = true;

	// now create the individual particles
	for (var p = 0; p < particleCount; p++) {

		// create a particle with random
		// position values, -250 -> 250
		var pY = Math.random() * 125;
		var radius = Math.random() * pY/3;
		var angle = Math.random() * 360;

		var pX = radius * Math.cos(angle);
		var pZ = radius * Math.sin(angle);

		var particle = new THREE.Vector3(pX, pY, pZ);

		// create a velocity vector
		particle.velocity = new THREE.Vector3(
		0,              // x
		-Math.random(), // y: random vel
		0);             // z

	  // add it to the geometry
	  particles.vertices.push(particle);
	}

	// create the particle system
	particleSystem = new THREE.Points(particles, pMaterial);

	particleSystem.position.x = 0;
	particleSystem.position.y = 0;
	particleSystem.position.z = 0;

	// add it to the scene
	scene.add(particleSystem);

	//--------------------------------------------------
	// Scene-Physical Objects
	//--------------------------------------------------

	var boxGeometry1 = new THREE.BoxGeometry( 50, 20, 50 );
	var boxMaterial1 = new THREE.MeshPhongMaterial({
			color: 0x347298
		});

	var box1 = new THREE.Mesh(boxGeometry1, boxMaterial1);
	box1.position.set(0, 10, 60);

	scene.add(box1);

	var boxGeometry2 = new THREE.CubeGeometry( 20, 10, 70 );
	var boxMaterial2 = new THREE.MeshPhongMaterial({
			color: 0x999988
		});

	var box2 = new THREE.Mesh(boxGeometry2, boxMaterial2);

	box2.position.set(50, 5, 40);
	scene.add(box2);

	var boxGeometry3 = new THREE.CubeGeometry( 20, 50, 10 );
	var boxMaterial3 = new THREE.MeshPhongMaterial({
			color: 0xf2a348
		});

	var box3 = new THREE.Mesh(boxGeometry3, boxMaterial3);

	box3.position.set(-30, 25, -100);
	scene.add(box3);

	//--------------------------------------------------
	// Lights
	//--------------------------------------------------

	// Main light
	const pointLight = new THREE.PointLight(0xffffff);

	pointLight.position.x = 0;
	pointLight.position.y = 50;
	pointLight.position.z = 10;

	scene.add(pointLight);

	window.addEventListener('keydown', onKeyDown, false );

}

function onKeyDown(evt) {
	switch (evt.keyCode) {

		case 68: // 'right'
			particleSystem.position.x = particleSystem.position.x + MOVE_MAG; 
			if (particleSystem.position.x > FIELD_X_LIMIT)
				particleSystem.position.x = FIELD_X_LIMIT;
			break;
		case 65: // 'left'
			particleSystem.position.x = particleSystem.position.x - MOVE_MAG; 
			if (particleSystem.position.x < -FIELD_X_LIMIT)
				particleSystem.position.x = -FIELD_X_LIMIT;
			break;
		case 83: // 'down'
			particleSystem.position.z = particleSystem.position.z + MOVE_MAG;
			if (particleSystem.position.z > FIELD_Z_LIMIT)
				particleSystem.position.z = FIELD_Z_LIMIT; 
			break;
		case 87: // 'up'
			particleSystem.position.z = particleSystem.position.z - MOVE_MAG;
			if (particleSystem.position.z < -FIELD_Z_LIMIT)
				particleSystem.position.z = -FIELD_Z_LIMIT;  
			break;
		case 81: // 'raise'
			particleSystem.position.y = particleSystem.position.y + MOVE_MAG;
			if (particleSystem.position.y > FIELD_Y_LIMIT)
				particleSystem.position.y = FIELD_Y_LIMIT;
			break;
		case 69: // 'lower'
			particleSystem.position.y = particleSystem.position.y - MOVE_MAG; 
			if (particleSystem.position.y < -FIELD_Y_LIMIT)
				particleSystem.position.y = -FIELD_Y_LIMIT;
			break;

	}
}

function animate() {
	requestAnimationFrame(animate);	

	particleSystem.rotation.y += 0.18;

	var event = window.event ? window.event : null;
	if (event !== null)
		console.log(event.keyCode);

	render();
}

function render() {
	renderer.render(scene, camera);
}
