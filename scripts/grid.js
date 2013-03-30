const dbg = true;
const offset = 15;
const documentBorder = 20;

var THREE = require('three').THREE;
//var sound = require('./sound.js');
var gmodel = require('./gridModel.js');
//var smodel = require('./soundModel.js');
//var metro = require('./metronome.js'); 
var $ = require('jquery-browserify');

var camera, scene, renderer, projector, canvasWidth, canvasHeight;
var cubes, pointLight, ambientLight, squareViewSize, sphere, particleSystem;
var lastFrameTime = 0;
var cubeActiveColor = 0x000000;
var cubeInactiveColor = 0x0000F0;


function figureOutAnimationCall() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
}

function animate() {
  window.requestAnimationFrame(animate);
  var frameTime = gmodel.getTime(); 
  if (frameTime - lastFrameTime  < 0.016666667) {
    // Don't bother trying to do more than 60fps
    return;
  }
  lastFrameTime = frameTime;
  var activeCol = gmodel.getActiveColumn() - 1; // Go back in time to sync with the music
  activeCol = activeCol === -1 ? gmodel.numVoices() - 1: activeCol; 
  for (var voice = 0; voice < gmodel.numVoices(); voice++) {
    for (var note = 0; note < gmodel.numNotes(); note++) {
      var cube = cubes[voice][note];
      if (cube.note === activeCol) {
        cube.rotation.x += 0.04;
        cube.rotation.y += 0.04;
      } else {
        cube.rotation.x = 0;
        cube.rotation.y = 0;
      }
      if (cube.active) { 
        cube.material.color.setHex(cubeActiveColor);
        cube.material.wireframe = true;
      } else {
        cube.material.color.setHex(cubeInactiveColor);
        cube.material.wireframe = false;
      }
    }
  }
  renderer.render(scene, camera);
}

function initAudio() {
  try {
    gmodel.initialize();
  } catch (e) {
    //alert("This won't work unless you use a recent version of Chrome or Safari.");
    console.log(e.name);
    console.log(e.message);
  }
}

window.$ = $;

function getGridSize() {
  var panelWidth = Number($('#panel').css("width").match(/\d+/));
  var panelHeight = Number($('#panel').css("height").match(/\d+/));
  var gridWidth = (document.width - 75) - panelWidth;
  var gridHeight = document.height - (document.height - panelHeight);
  console.log("gridWidth is " + gridWidth + " gridHeight is " + gridHeight);
  return [gridWidth, gridHeight];
}

function getGridOffset() {
  var panelHeight = Number($('#panel').css("height").match(/\d+/));
  return [0, document.height - panelHeight];
}

function getNoteSize() {
  var size = getGridSize();
  return [size[0] / gmodel.numNotes(),
    size[1] / gmodel.numVoices()];
}

function addStars() {
  var particleCount = 1800,
      particles = new THREE.Geometry(),
      pMaterial =
        new THREE.ParticleBasicMaterial({
          color: 0xFFFFFF,
          size: 0.01
        });
  for(var p = 0; p < particleCount; p++) {
    var pX = Math.random() * 1000 - 500 , pY = Math.random() * 1200 - 450,
         pZ = 1, particle = new THREE.Vector3(pX, pY, pZ);
    particles.vertices.push(particle);
  }
  particleSystem = new THREE.ParticleSystem(particles, pMaterial);
  scene.add(particleSystem);
}

function initGraphics() {
  var grid;
  //camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
  var width = document.width;
  var height = document.height;
  camera = new THREE.OrthographicCamera(width / -2, width / 2,
      height / 2, height / -2, 1, 1000);
  camera.position.z = 100;
  camera.position.x = 0;
  camera.position.y = 0;
  cubes = new Array(gmodel.numVoices());
  scene = new THREE.Scene();
  projector = new THREE.Projector();
  //addStars();
  var noteSep = 2;
  var noteSize = getNoteSize();
  for (var voice = 0; voice < gmodel.numVoices(); voice++) {
    cubes[voice] = new Array(gmodel.numNotes());
    for (var note = 0; note < gmodel.numNotes(); note++) {
      var material = new THREE.MeshLambertMaterial({
        color: 0x0000AF,
        //emissive: 0x0000FF,
        //shininess: 100,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      var geometry = new THREE.CubeGeometry(noteSize[0] - noteSep, noteSize[1] - noteSep, 10, 1, 1, 1);
      var cube = new THREE.Mesh(geometry, material);
      cube.position.x = (noteSize[0] + noteSep) * note - width/2 + documentBorder;
      cube.position.y = 
        (noteSize[1] + noteSep) * voice - height/2 - documentBorder + getGridOffset()[1];
      cube.voice = voice;
      cube.note = note;
      cube.active = Boolean(gmodel.getState(cube.voice, cube.note));
      cubes[voice][note] = cube;
      scene.add(cube);
    }
  }
  pointLight = new THREE.DirectionalLight(0xFF66FF);
  pointLight.position.set(0, 0, 1000);
  pointLight.distance = 10;
  pointLight.intensity = 0.2;
  scene.add(pointLight);
  //ambientLight = new THREE.AmbientLight(0x0066FF);
  //ambientLight.intensity = 0.2;
  //scene.add(ambientLight);
  renderer = //new THREE.CanvasRenderer();
    new THREE.WebGLRenderer({antialias: true});
  grid = document.getElementById('grid');
  squareViewSize = document.width > document.height ? document.width : document.height;
  renderer.setSize(
    //canvasHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('height').replace(/px/g, ""), 10),
    //canvasWidth = parseInt(window.getComputedStyle(grid).getPropertyValue('width').replace(/px/g, ""), 10)
    document.width,
    document.height 
  );
  camera.updateProjectionMatrix();
  document.getElementById('grid').appendChild(renderer.domElement);
  if (dbg) {
    createSphere(0, 0);
  }
}

function launch() {
  window.dbg = false;
  var browserString = navigator.vendor;
  if (!browserString.match(/google|apple/i)) {
    alert("This won't work unless you use a recent version of Chrome or Safari.");
    return;
  }
  figureOutAnimationCall();
  initAudio();
  initGraphics();
  $('#grid').mousedown(onGridMouseDown);
  animate();
}

function onGridMouseDown(event) {
  event.preventDefault();
  var x = event.clientX;
  var y = event.clientY;
  var coords = windowSpaceToThreeSpace(x, y);
  console.log("In window space you clicked: " + x + ", " + y);
  //var vector = new THREE.Vector3(x3, y3, 1);
  console.log("In three space the coordinates are: " + coords[0] + ", " + coords[1]);
  //captureCubeClick(vector);
}

function createSphere(x, y) {
  var geom = new THREE.SphereGeometry(1, 1, 1);
  var mat = new THREE.MeshLambertMaterial({color:0x000000});
  sphere = new THREE.Mesh(geom, mat);
  sphere.position.x = 0;
  sphere.position.y = 0;
  sphere.position.z = 0;
  scene.add(sphere);
}

function windowSpaceToThreeSpace (x, y) {
  y = document.height - y;
  return [x, y];
}

function threeSpaceToWindowSpace (x, y) {
  y = document.height - y;
  return [x, y];
}

function boundingBox(coords, x1, x2, y1, y2) {
  if ((coords[0] < x2 && coords[0] > x1) && (coords[1] < y2 && coords[1] > y1)) {
    return true;
  }
  return false;
}

function captureCubeClick (vector) {
  if (dbg) {
    //scene.add(new THREE.Line(new THREE.Geometry(vector), new THREE.LineBasicMaterial()));
  }
  projector.unprojectVector(vector, camera);
  var allCubes = []; 
  for (var voice = 0; voice < gmodel.numVoices(); voice++) { 
    for (var note = 0; note < gmodel.numNotes(); note++) { 
      allCubes.push(cubes[voice][note]);
    }
  }
  var raycaster = new THREE.Raycaster(camera.position, 
      vector.sub(camera.position).normalize());
  var intersects = raycaster.intersectObjects(allCubes);
  if (intersects.length > 0) {
    var cube = intersects[0].object;
    cube.active = !cube.active;
    gmodel.updateModel(cube.voice, cube.note, Number(cube.active));
    return;
  } 
  if (dbg) {
    console.log("Intersects nothing");
  }
}

function onDocumentKeyDown(event) {
  var keychar = event.which;
  spherePos();
  switch (keychar) {
    case 38: 
      camera.position.y -= 10;
      break;
    case 40: 
      camera.position.y += 10;
      break;
    case 37:
      camera.position.x += 10;
      break;
    case 39:
      camera.position.x -= 10;
      break;
    case 33:
      camera.position.z += 10;
      break;
    case 34:
      camera.position.z -= 10;
      break;
    case 87:
      sphere.position.y += 1;
      break;
    case 65:
      sphere.position.x -= 1;
      break;
    case 68:
      sphere.position.x += 1;
      break;
    case 83:
      sphere.position.y -= 1;
      break;
    case 81:
      sphere.position.z += 1;
      break;
    case 69:
      sphere.position.z -= 1;
      break;
    default:
      console.log(keychar + " pressed");
      break;
  }
}

//$(window).resize(initGraphics);
document.addEventListener("DOMContentLoaded", launch, false);
document.addEventListener("keydown", onDocumentKeyDown, false);

// DEBUG
if (dbg) {
  window.spherePos = function () {
    console.log("X: " + sphere.position.x + ", " + 
        "Y: " + sphere.position.y + ", " +
        "Z: " + sphere.position.z); 
  };
}

