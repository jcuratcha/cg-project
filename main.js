var gl; // WebGL context

const WIDTH = 800;
const HEIGHT = 600;

const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000

const moveMagnitude = 3;

// get DOM element to attach to
const container = document.querySelector('#container');
const scene = new THREE.Scene();

// Create WebGL renderer & camera
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
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

renderer.setSize(WIDTH, HEIGHT);

container.appendChild(renderer.domElement); 

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
var particleCount = 16000;
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

	//x and z position depend on y  	

	// var pX = (Math.random() * 500-250) % pY/2;
	// var pZ = (Math.random() * 500-250) % pY/2;
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
var particleSystem = new THREE.Points(particles, pMaterial);

// add it to the scene
scene.add(particleSystem);

//--------------------------------------------------
// Lights
//--------------------------------------------------

// Main light
const pointLight = new THREE.PointLight(0xffffff);

pointLight.position.x = 0;
pointLight.position.y = 50;
pointLight.position.z = 10;

scene.add(pointLight);

//--------------------------------------------------
// Keypresses
//--------------------------------------------------

function onKeyDown(evt) {
  switch (evt.keyCode) {
	case 37: // 'left arrow'
		particleSystem.position.x = particleSystem.position.x - moveMagnitude; 
		break;
	case 38: // 'up arrow'
		particleSystem.position.z = particleSystem.position.z - moveMagnitude; 
		break;
	case 39: // 'right arrow'
		particleSystem.position.x = particleSystem.position.x + moveMagnitude; 
		break;
	case 40: // 'down arrow'
		particleSystem.position.z = particleSystem.position.z + moveMagnitude; 
		break;
	case 33: // 'page up'
		particleSystem.position.y = particleSystem.position.y + moveMagnitude; 
		break;
	case 34: // 'page down'
		particleSystem.position.y = particleSystem.position.y - moveMagnitude; 
		break;

  }
}

window.addEventListener('keydown', onKeyDown, false );

//--------------------------------------------------
// Update Loop
//--------------------------------------------------

function update() {
	particleSystem.rotation.y += 0.18;

	var event = window.event ? window.event : null;
	if (event !== null)
		console.log(event.keyCode);

	renderer.render(scene, camera);
	requestAnimationFrame(update);	
}

requestAnimationFrame(update);
