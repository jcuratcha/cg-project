var gl; // WebGL context

const WIDTH = 800;
const HEIGHT = 600;

const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000

// get DOM element to attach to
const container = document.querySelector('#container');

// Create WebGL renderer & camera
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR
	)

const scene = new THREE.Scene();

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

plane.position.z = -350;

plane.rotation.x = 90;
plane.rotation.y = 0;
plane.rotation.z = 0;

plane.scale.x = 500;
plane.scale.y = 500;

scene.add(plane);

//--------------------------------------------------
// Particle system
//--------------------------------------------------

// create the particle variables
var particleCount = 8000,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      size: 2,
    });

pMaterial.lights.value = true;

// now create the individual particles
for (var p = 0; p < particleCount; p++) {

	// create a particle with random
	// position values, -250 -> 250
	var pY = Math.random() * 100;
	var radius = pY/3;
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

// particleSystem.position.y = -150;
particleSystem.position.z = -350;

// particleSystem.rotation.z = 180;

// add it to the scene
scene.add(particleSystem);

//--------------------------------------------------
// Lights
//--------------------------------------------------

// Main light
const pointLight = new THREE.PointLight(0xffffff);

pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

scene.add(pointLight);

//--------------------------------------------------
// Update Loop
//--------------------------------------------------

function update() {
	particleSystem.rotation.y += 0.08;

	renderer.render(scene, camera);
	requestAnimationFrame(update);	
}

requestAnimationFrame(update);
