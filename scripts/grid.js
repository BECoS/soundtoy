/*globals document, navigator, window*/

var three = require('three');
var sound = require('./sound.js');

var camera, scene, renderer, projector, canvasWidth, canvasHeight;
var geometry, material, mesh, mesh2;
var notes, seqs;
var audioContext;

function figureOutAnimationCall() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
}

function initAudio() {
  try {
    //sound.audioinit();
  } catch (e) {
    alert("This won't work unless you use a recent version of Chrome or Safari.");
  }
}

function animate() {
  var note;
  window.requestAnimationFrame(animate);
  for (note in notes) {
    if (notes.hasOwnProperty('note') && note.active) {
      note.rotation.x += 0.01;
      note.rotation.y += 0.02;
    }
  }
  renderer.render(scene, camera);
}

function initGraphics() {
  var i, note, grid;
  camera = new three.THREE.PerspectiveCamera(75, 1, 1, 10000);
  //camera = new three.THREE.OrthographicCamera(0, 100, 0, 100);
  //camera = new three.THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 1, 10000);
  //camera.position.set(0, 300, 500);
  //camera.position.set(0, 0, 0);
  //camera.position.set(100, 60, 50);
  camera.position.z = 100;
  camera.position.x = 60;
  camera.position.y = 50;

  scene = new three.THREE.Scene();
  projector = new three.THREE.Projector();
  geometry = new three.THREE.CubeGeometry(8, 8, 8);
  notes = [];
  for (i = 0; i < 64; i++) {
    note = new three.THREE.Mesh(geometry,
        new three.THREE.MeshLambertMaterial({color: 0x0000F0}));
    note.position.x = 16 * (i % 8);
    note.position.y = 16 * Math.floor(i / 8);
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
  //jQuery(document).ready(function(){
  //    $(document).mousemove(function(e) {
  //      $('#pos').html("Mouse: " + e.pageX +', '+ e.pageY + "<br/>Camera: " 
  //        + camera.position.x + ", " + camera.position.y);
  //      }); 
      // $(document).click(function(e) {
      //   catchClick(e.pageX, e.pageY);   
      // });
  //    });
  var browserString = navigator.vendor;
  if (!browserString.match(/[gG]oogle|[aA]pple/g)) {
    alert("This won't work unless you use a recent version of Chrome or Safari.");
    return;
  }
  figureOutAnimationCall();
  initGraphics();
  initAudio();
  animate();
}

function onDocumentMouseDown(event) {
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
  particleMaterial = new three.THREE.ParticleCanvasMaterial({
    color: 0x000000,
    program: function(context) {
      context.beginPath();
      context.arc(0, 0, 0.25, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }
  });
  var particle = new three.THREE.Particle(particleMaterial);
  particle.position = new three.THREE.Vector2(event.clientX, event.clientY);
  console.log("Clientspace is (" + event.clientX + ", " + event.clientY + ")");
  //console.log("Worldspace is (" + raycaster.tX + ", " + event.clientY + ")");
  scene.add(particle);
  if (intersects.length > 0) {
    intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
  }
}

function onDocumentKeyDown(event) {
  var keychar = event.which;
  console.log("Key: " + keychar);
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
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("keydown", onDocumentKeyDown, false);
