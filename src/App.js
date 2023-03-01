import "./App.css";
import * as THREE from "three";
import { RotationJoystickControls } from "three-joystick";

function App() {
  var scene, camera, renderer, board;

  var rotationJoyStick;

  let FOV;
  let FAR;
  let NEAR = 0.1;

  if(window.innerWidth <= 768) {
    FOV = 50;
    FAR = 1200;
  } else if (window.innerWidth >= 769 && window.innerWidth <= 1080) {
    FOV = 50;
    FAR = 1475;
  } else {
    FOV = 40;
    FAR = 1800;
  }

  function startGame() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      NEAR,
      FAR
    );
    camera.position.z = 40;

    let pixelRatio = window.devicePixelRatio
    let AA = true;
    if (pixelRatio > 1 ) {
      AA = false;
    }

    renderer = new THREE.WebGLRenderer({ antialias: AA, powerPreference: "high-performance", });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(15, 15, 0.5);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0abab5,
      wireframe: false,
    });
    material.metalness = 0.75;
    material.roughness = 0.2;
    board = new THREE.Mesh(geometry, material);

    rotationJoyStick = new RotationJoystickControls(camera, scene, board);

    rotationJoyStick.joystickScale = 8;

    scene.add(camera);
    scene.add(board);
    addLight();

    // board.rotation.y = Math.PI / 2;
    // camera.lookAt(0,0,0);

    animate();
  }

  function addLight() {
    var ambientLight = new THREE.AmbientLight(0xd5d5d5);
    ambientLight.intensity = 1;
    scene.add(ambientLight);

    var bottomRightDirectionLight = new THREE.DirectionalLight();
    bottomRightDirectionLight.position.x = 5;
    bottomRightDirectionLight.position.y = 3;
    bottomRightDirectionLight.position.z = -5;
    bottomRightDirectionLight.intensity = 1.3;
    scene.add(bottomRightDirectionLight);

    var frontDirectionLight = new THREE.DirectionalLight();
    frontDirectionLight.position.x = -5;
    frontDirectionLight.position.y = 5;
    frontDirectionLight.position.z = 5;
    frontDirectionLight.intensity = 1.3;
    scene.add(frontDirectionLight);
  }

  function animate() {
    requestAnimationFrame(animate);

    rotationJoyStick.update();

    renderer.render(scene, camera);
  }

  return (
    <div>
      <button onClick={startGame}>Start</button>
    </div>
  );
}

export default App;
