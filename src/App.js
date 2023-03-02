import "./App.css";
import * as THREE from "three";
import { JoystickControls } from "three-joystick";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    var scene, camera, renderer, board, ball, joystickControls;

    let FOV;
    let FAR;
    let NEAR = 0.1;

    if (window.innerWidth <= 768) {
      FOV = 50;
      FAR = 1200;
    } else if (window.innerWidth >= 769 && window.innerWidth <= 1080) {
      FOV = 50;
      FAR = 1475;
    } else {
      FOV = 40;
      FAR = 1800;
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      NEAR,
      FAR
    );
    camera.position.z = 40;

    joystickControls = new JoystickControls(camera, scene);
    joystickControls.joystickScale = 8;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    const boardGeometry = new THREE.BoxGeometry(15, 15, 1);
    const boardMaterial = new THREE.MeshBasicMaterial({
      color: 0x0abab5,
      wireframe: false,
    });
    boardMaterial.metalness = 0.75;
    boardMaterial.roughness = 0.2;

    const ballGeometry = new THREE.SphereGeometry(1);
    const ballMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: false,
    });
    ballMaterial.metalness = 0.75;
    ballMaterial.roughness = 0.2;

    board = new THREE.Mesh(boardGeometry, boardMaterial);
    ball = new THREE.Mesh(ballGeometry, ballMaterial);

    scene.add(camera);
    scene.add(board);
    scene.add(ball);

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

    ball.translateZ(1);

    animate();

    function animate() {
      requestAnimationFrame(animate);

      joystickControls.update((movement) => {
        if (movement) {
          const sensitivity = 0.00005;
          if (Math.abs(movement.moveX) >= Math.abs(movement.moveY)) {
            board.rotation.y += movement.moveX * sensitivity;
          } else {
            board.rotation.x += movement.moveY * sensitivity;
          }
        }
      });

      renderer.render(scene, camera);
    }
  }, []);

  return (
    <div/>
  );
}

export default App;
