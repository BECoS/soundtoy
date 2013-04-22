var dbg = true;

var THREE = require('three').THREE;
//var sound = require('./sound.js');
var gmodel = require('./gridModel.js');
//var smodel = require('./soundModel.js');
//var metro = require('./metronome.js'); 
var $ = require('jquery-browserify');

var camera, scene, renderer, projector, canvasWidth, canvasHeight;
var cubes, ambientLight, sphere, particleSystem;
var lastFrameTime = 0;
var cubeActiveColor = 0xF6FBA2;
var cubeInactiveColor = 0x0000F0;


function figureOutAnimationCall() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
}

function toggleCubesVisible(visible) {
  for (var voice = 0; voice < cubes.length; voice++) {
    for (var note = 0; note < cubes[0].length; note++) {
      cubes[voice][note].visible = visible;
    }
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  var frameTime = gmodel.getTime(); 
  if (frameTime - lastFrameTime  < 0.016666667) {
    // Don't bother trying to do more than 60fps
    return;
  }
  lastFrameTime = frameTime;
  toggleCubesVisible(window.isGridVisible); 
  var activeCol = gmodel.getActiveColumn() - 1; // Go back in time to sync with the music
  activeCol = activeCol === -1 ? gmodel.numVoices() - 1: activeCol; 
  for (var voice = 0; voice < gmodel.numVoices(); voice++) {
    for (var note = 0; note < gmodel.numNotes(); note++) {
      var cube = cubes[voice][note];
      //if (cube.note === activeCol) {
      //  cube.rotation.x += 0.04;
      //  cube.rotation.y += 0.04;
      //} else {
      //  cube.rotation.x = 0;
      //  cube.rotation.y = 0;
      //}
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
  var gridWidth = $('#grid').width();
  var gridHeight = $('#grid').height();
  return [gridWidth, gridHeight];
}

function getNoteSize() {
  var size = getGridSize();
  return [size[0] / gmodel.numNotes(),
    size[1] / gmodel.numVoices()];
}

function removeAllCubes() {
  if (typeof scene === 'undefined' || typeof cubes === 'undefined') { return; }
  for (var voice = 0; voice < gmodel.numVoices(); voice++) {
    for (var note = 0; note < gmodel.numNotes(); note++) {
      if (typeof cubes[voice] !== 'undefined') {
        scene.remove(cubes[voice][note]);
      }
    }
  }
}

function sizeNotes() {
  removeAllCubes();
  var grid = $('#grid');
  var width = grid.width();
  var height = grid.height();
  console.log("Resizing cubes\nGrid is " + width + " by " + height);
  var noteSep = 4;
  var noteSize = getNoteSize();
  for (var voice = 0; voice < gmodel.numVoices(); voice++) {
    cubes[voice] = new Array(gmodel.numNotes());
    for (var note = 0; note < gmodel.numNotes(); note++) {
      var material = new THREE.MeshLambertMaterial({
        blending: THREE.AdditiveBlending,
      });
      var geometry = new THREE.CubeGeometry(noteSize[0] - noteSep, noteSize[1] - noteSep, 10, 1, 1, 1);
      var cube = new THREE.Mesh(geometry, material);
      cube.position.y = -noteSize[1] * voice + (height / 2) - noteSize[1] / 2;
      cube.position.x = noteSize[0] * note - (width / 2) + noteSize[0] / 2;
      cube.voice = voice;
      cube.note = note;
      cube.active = Boolean(gmodel.getState(cube.voice, cube.note));
      cubes[voice][note] = cube;
      scene.add(cube);
    }
  }
}

function initGraphics() {
  var grid = $('#grid');
  var width = grid.width();
  var height = grid.height();
  camera = new THREE.OrthographicCamera(width / 2, width / -2, 
       height / 2, height / -2, -100, 1000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = -100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  cubes = new Array(gmodel.numVoices());
  projector = new THREE.Projector();
  scene = new THREE.Scene();
  sizeNotes();
  //addStars();
  //ambientLight = new THREE.AmbientLight(0x268bd2);
  //ambientLight.intensity = 0.001;
  //scene.add(ambientLight);
  renderer = new THREE.CanvasRenderer({ canvas : document.getElementById('grid') });
    //new THREE.WebGLRenderer({canvas : document.getElementById('grid'), antialias: true});
  renderer.setSize(width, height);
  camera.updateProjectionMatrix();
  $(window).resize(function () { 
    console.log("Grid height is: " + $('#grid').height());
  });
  if (dbg) {
    //createSphere(0, 0, 0);
  }
}

function toggleGrid() {
  window.isGridVisible = !window.isGridVisible; 
}

function launch() {
  window.dbg = true;
  window.isGridVisible = true;
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
  var x = event.pageX;
  var y = event.pageY;
  var coords = windowSpaceToThreeSpace(x, y);
  console.log("In window space you clicked: " + x + ", " + y);
  var vector = new THREE.Vector3(coords[0], coords[1], 1);
  console.log("In three space the coordinates are: " + coords[0] + ", " + coords[1]);
  captureCubeClick(vector);
}

function createSphere(x, y) {
  var geom = new THREE.SphereGeometry(10, 10, 10);
  var mat = new THREE.MeshLambertMaterial({color:0xa2a200});
  sphere = new THREE.Mesh(geom, mat);
  sphere.position.x = x;
  sphere.position.y = y;
  sphere.position.z = 0;
  scene.add(sphere);
}

function windowSpaceToThreeSpace (x, y) {
  y -= $('#bar').height(); 
  x -= $('#selector').width();
  y = 2 * (-y / $('#grid').height()) + 1;
  x = 2 * (x / $('#grid').width()) - 1;
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
  var allCubes = []; 
  for (var voice = 0; voice < gmodel.numVoices(); voice++) { 
    for (var note = 0; note < gmodel.numNotes(); note++) { 
      allCubes.push(cubes[voice][note]);
    }
  }
  var raycaster = projector.pickingRay(vector, camera);
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
  if (dbg) {
    console.log("Sphere position: " + sphere.position.x + ", " + sphere.position.y);
  }
}


// DEBUG
if (dbg) {
  window.spherePos = function () {
    console.log("X: " + sphere.position.x + ", " + 
        "Y: " + sphere.position.y + ", " +
        "Z: " + sphere.position.z); 
  };
}

document.addEventListener("DOMContentLoaded", launch, false);
document.addEventListener("keydown", onDocumentKeyDown, false);

exports.sizeNotes = sizeNotes;
