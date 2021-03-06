var window = this;
var $ = function() {};
console.error = console.log;
var document = {
  createElement : function() {
    return {
      getContext : function() {
        return new WebGLRenderingContext();
      },
      setTransform : function() {}

    };
  }
};
var navigator = {
  userAgent : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.215 Safari/535.1'
};

var WebGLRenderingContext = require('../lib/webgl.js').WebGLRenderingContext;

var THREE = require('../example/threejs/three.js');

THREE.WebGLRenderer.prototype = {};


  // set the scene size
  var WIDTH = 300,
      HEIGHT = 300;

  // set some camera attributes
  var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;


  // create a WebGL renderer, camera
  // and a scene
  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.Camera(  VIEW_ANGLE,
                                  ASPECT,
                                  NEAR,
                                  FAR  );
  var scene = new THREE.Scene();

  // the camera starts at 0,0,0 so pull it back
  camera.position.z = 300;

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);


  // create the sphere's material
  var sphereMaterial = new THREE.MeshLambertMaterial(
  {
      color: 0xCC0000
  });

  // set up the sphere vars
  var radius = 50, segments = 16, rings = 16;

  // create a new mesh with sphere geometry -
  // we will cover the sphereMaterial next!
  var sphere = new THREE.Mesh(
     new THREE.SphereGeometry(radius, segments, rings),
     sphereMaterial);

  // add the sphere to the scene
  scene.addChild(sphere);

  // create a point light
  var pointLight = new THREE.PointLight( 0xFFFFFF );

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;

  // add to the scene
  scene.addLight(pointLight);

// draw!
var a = 1000;
while(a--) {
  renderer.render(scene, camera);
  webgl_rendering_context_flush();
}
