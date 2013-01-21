/*globals document, navigator, window*/
"use strict";

var three = require('three');
var sound = require('./sound.js');

var camera, scene, renderer, projector;
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
  camera.position.z = 100;
  camera.position.x = 60;
  camera.position.y = 50;

  scene = new three.THREE.Scene();
  projector = new three.THREE.Projector();
  geometry = new three.THREE.CubeGeometry(8, 8, 8);
  notes = new Array(64);
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
    parseInt(window.getComputedStyle(grid).getPropertyValue('height').replace(/px/g, ""), 10),
    parseInt(window.getComputedStyle(grid).getPropertyValue('width').replace(/px/g, ""), 10)
  );
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
  return;
  //event.preventDefault();
  //var vector = new three.THREE.Vector3(
  //  ( event.clientX / window.innerWidth ) * 2 - 1,
  //  - ( event.clientY / window.innerHeight ) * 2 + 1,
  //  0.5
  //);
  //projector.unprojectVector( vector, camera );

  //var ray = new three.THREE.Ray( camera.position, 
  //    vector.subSelf( camera.position ).normalize() );

  //var intersects = ray.intersectObjects( notes );

  //if ( intersects.length > 0 ) {
  //  intersects[ 0 ].object.materials[ 0 ].color.setHex( Math.random() * 0xffffff );
  //  var particle = new three.THREE.Particle(particleMaterial);
  //  particle.position = intersects[0].point;
  //  particle.scale.x = particle.scale.y = 8;
  //  scene.add(particle);
  //}

  // Parse all the faces
  //for ( var i in intersects ) {
  //  intersects[ i ].face.material[ 0 ].color
  //  .setHex( Math.random() * 0xffffff | 0x80000000 );
  //}
}

document.addEventListener("DOMContentLoaded", launch, false);
document.addEventListener("mousedown", onDocumentMouseDown, false);
