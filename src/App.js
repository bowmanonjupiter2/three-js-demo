import "./App.css";
import { useEffect } from "react";

import * as THREE from "three";
import { JoystickControls } from "three-joystick";
import * as CANNON from "cannon-es";

function App() {
  useEffect(() => {
    let scene, camera, renderer, board, ball, box, joystickControls;
    let cannonWorld, groundBody, ballBody, boxBody;
    let clock;

    clock = new THREE.Clock();

    let FOV,
      FAR,
      NEAR = 0.1;

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

    cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, 0, -4.0);
    cannonWorld.broadphase = new CANNON.NaiveBroadphase();
    cannonWorld.solver.iterations = 5;

    groundBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, -0.5),
      shape: new CANNON.Box(new CANNON.Vec3(8, 8, 0.5)),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.1 }),
    });

    const randomX = Math.floor(-4 + Math.random() * 8);
    const randomY = Math.floor(-4 + Math.random() * 8);

    ballBody = new CANNON.Body({
      mass: 5,
      position: new CANNON.Vec3(randomX, randomY, 0.5),
      shape: new CANNON.Sphere(0.5),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.0 }),
    });

    ballBody.addEventListener("collide", function (e) {
      if (e.body === boxBody) {
        window.location.reload();
        alert("new record:" + Math.round(clock.getElapsedTime()) + " seconds!");
      }
    });

    const randomX2 = Math.floor(-6 + Math.random() * 12);
    const randomY2 = Math.floor(-6 + Math.random() * 12);

    boxBody = new CANNON.Body({
      mass: 5,
      position: new CANNON.Vec3(randomX2, randomY2, 0.5),
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.0 }),
    });

    cannonWorld.addBody(groundBody);
    cannonWorld.addBody(ballBody);
    cannonWorld.addBody(boxBody);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      NEAR,
      FAR
    );
    camera.position.z = 40;
    camera.position.y = -30;
    camera.lookAt(scene.position);

    joystickControls = new JoystickControls(camera, scene);
    joystickControls.joystickScale = 8;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    const boardGeometry = new THREE.BoxGeometry(16, 16, 1);

    const boardTexture = new THREE.TextureLoader().load("cpu_ground.jpg");
    const boardMaterial = new THREE.MeshBasicMaterial({ map: boardTexture });

    board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.receiveShadow = true;

    board.position.copy(groundBody.position);
    board.quaternion.copy(groundBody.quaternion);

    const ballGeometry = new THREE.SphereGeometry(0.5, 30, 30);
    const ballMaterial = new THREE.MeshPhongMaterial({
      shininess: 50,
      normalMap: new THREE.TextureLoader().load("map.jpg"),
      wireframe: false,
      specular: 0xffffff,
      flatShading: false,
      color: 0xff0000,
    });

    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;

    ball.position.copy(ballBody.position);
    ball.quaternion.copy(ballBody.quaternion);

    const boxGeometry = new THREE.BoxGeometry(1);
    const boxMaterial = new THREE.MeshPhongMaterial({
      shininess: 50,
      normalMap: new THREE.TextureLoader().load("map.jpg"),
      wireframe: false,
      specular: 0xffffff,
      flatShading: false,
      color: 0x00ff00,
    });

    box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;

    box.position.copy(boxBody.position);
    box.quaternion.copy(boxBody.quaternion);

    scene.add(camera);
    scene.add(board);
    scene.add(ball);
    scene.add(box);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 0.3;
    //ambientLight.position.set(6, -30, 6);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xffffff, 0.4);
    spotlight.castShadow = true;
    spotlight.position.set(100, 100, 20);
    scene.add(spotlight);

    const spotlight2 = new THREE.SpotLight(0xffffff, 0.4);
    spotlight2.castShadow = true;
    spotlight2.position.set(-50, -100, 50);
    scene.add(spotlight2);

    clock.start();
    animate();

    function animate() {
      requestAnimationFrame(animate);

      cannonWorld.fixedStep();

      ball.position.copy(ballBody.position);
      ball.quaternion.copy(ballBody.quaternion);

      box.position.copy(boxBody.position);
      box.quaternion.copy(boxBody.quaternion);

      board.position.copy(groundBody.position);
      board.quaternion.copy(groundBody.quaternion);

      joystickControls.update((movement) => {
        if (movement) {
          const sensitivity = 0.00025;
          groundBody.quaternion.y += movement.moveX * sensitivity;
          groundBody.quaternion.x += movement.moveY * sensitivity;
          // if (Math.abs(movement.moveX) >= Math.abs(movement.moveY)) {
          //   groundBody.quaternion.y += movement.moveX * sensitivity;
          // } else {
          //   groundBody.quaternion.x += movement.moveY * sensitivity;
          // }
        }
      });
      renderer.render(scene, camera);
    }
  }, []);

  return <div />;
}
export default App;
