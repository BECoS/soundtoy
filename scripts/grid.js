/* The grid module is the rendered presentation of the sequencer */
var three = require('three');
//var sound = require('./sound.js');
var gmodel = require('./gridModel.js');
//var smodel = require('./soundModel.js');
//var metro = require('./metronome.js'); 
var $ = require('jquery-browserify');

var camera, scene, renderer, projector, canvasWidth, canvasHeight;
var geometry, material, mesh, mesh2;
var notes, seqs;
var audioContext;

var cubeActiveColor = 0x000f00;
var cubeInactiveColor = 0x0000F0;

function figureOutAnimationCall() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
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

//function setNote(noteIndex) {
//  sound.play(Math.floor(noteIndex / 8)); 
//}

function animate() {
  window.requestAnimationFrame(animate);
  //if (gmodel.isPlaying()) {
  //  var column = gmodel.getActiveColumn();
  //  for (var i = 0; i < 64; i++) {
  //    if (notes[i] !== undefined) {
  //      if (i % 8 == column) {
  //        notes[i].rotation.x += 0.1;
  //        notes[i].rotation.y += 0.2;
  //        //if (notes[i].active) {
  //        //  setNote(i);
  //        //}
  //      }
  //      else {
  //        notes[i].rotation.x = 0;  
  //        notes[i].rotation.y = 0;
  //      }
  //    }
  //  }
  //} else {
  //  for (var j = 0; j < 64; j++) {
  //    if (notes[j] !== undefined) {
  //      notes[j].rotation.x += 0;
  //      notes[j].rotation.y += 0;
  //    }
  //  } 
  //}
  var activeColumn = gmodel.getActiveColumn() - 1; // Go back in time to sync with the music
  activeColumn = activeColumn === -1 ? 7 : activeColumn;
  for (var i = 0; i < 64; i++) {
    var colActive = i % 8 === activeColumn ? 
      true : false;
    var cube = notes[i];
    if (colActive) {
      cube.rotation.x += 0.2;
    } else {
      cube.rotation.x = 0;
    }
    if (cube.active) { 
      cube.material.color.setHex(cubeActiveColor);
      cube.material.wireframe = true;
    } else {
      cube.material.color.setHex(cubeInactiveColor);
      cube.material.wireframe = false;
    }
  }
  renderer.render(scene, camera);
}

function initGraphics() {
  var i, note, grid;
  camera = new three.THREE.PerspectiveCamera(75, 1, 1, 10000);
  camera.position.z = 100;
  camera.position.x = 60;
  camera.position.y = 50;

  scene = new three.THREE.Scene();
  projector = new three.THREE.Projector();
  geometry = new three.THREE.CubeGeometry(8, 8, 8);
  notes = [];
  for (i = 0; i < 64; i++) {
    note = new three.THREE.Mesh(geometry,
        new three.THREE.MeshLambertMaterial({color: cubeInactiveColor}));
    note.position.x = 16 * (i % 8);
    note.position.y = 16 * Math.floor(i / 8);
    note.column = i % 8;
    note.row = Math.floor(i / 8);
    note.active = Boolean(gmodel.getState(note.column, note.row));
    notes.push(note);
    scene.add(note);
  }
  renderer = new three.THREE.CanvasRenderer();
  grid = document.getElementById('grid');
  renderer.setSize(
    canvasHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('height').replace(/px/g, ""), 10),
    canvasWidth = parseInt(window.getComputedStyle(grid).getPropertyValue('width').replace(/px/g, ""), 10)
  );
  camera.updateProjectionMatrix();
  document.getElementById('grid').appendChild(renderer.domElement);
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
  var x = event.clientX  - canvasWidth / 2;
  var y = event.clientY - canvasHeight / 2;
  var vector = new three.THREE.Vector3(
    (x / canvasWidth) * 2,
    -(y / canvasHeight) * 2,
    1 
  );
  projector.unprojectVector(vector, camera);
  var raycaster = new three.THREE.Raycaster(camera.position, 
      vector.sub(camera.position).normalize());
  var intersects = raycaster.intersectObjects(notes);
  if (intersects.length > 0) {
    var cube = intersects[0].object;
    cube.active = !cube.active;
    gmodel.updateModel(cube.column, cube.row, Number(cube.active));
    console.log('Clicked: ' + cube.column + ', ' + cube.row);
  }
  if (dbg) {
    console.log('Clicked: ' + x + ', ' + y);
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
    case 189:
      camera.position.z += 10;
      break;
    case 187:
      camera.position.z += 10;
      break;
  }
}

document.addEventListener("DOMContentLoaded", launch, false);
document.addEventListener("keydown", onDocumentKeyDown, false);
