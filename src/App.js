import "./App.css";
import * as THREE from "three";
import { JoystickControls } from "three-joystick";
import * as CANNON from 'cannon-es';
import { useEffect } from "react";

function App() {
  useEffect(() => {

    var scene, camera, renderer, board, ball, joystickControls;
    var cannonWorld, groundBody, ballBody;

    cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, 0, -9.82);
    cannonWorld.broadphase = new CANNON.NaiveBroadphase();
    cannonWorld.solver.iterations = 5;

    // var physicsMaterial = new CANNON.Material("groundMaterial");
    // var physicsContactMaterial = new CANNON.ContactMaterial(
    //   physicsMaterial,
    //   physicsMaterial,
    //   0.4,
    //   0.0
    // );
    groundBody = new CANNON.Body({
      mass: 0,
      position : new CANNON.Vec3(0,0,-0.5),
      shape: new CANNON.Box(new CANNON.Vec3(8,8,0.5)),
      // type: CANNON.Body.STATIC,
      // shape : new CANNON.Plane(),
      material: new CANNON.Material({friction: 0.5, restitution: 0.1})
      // material: physicsContactMaterial
    });

    ballBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0,0,0.5),
      shape : new CANNON.Sphere(0.5),
      material: new CANNON.Material({friction: 0.5, restitution: 0.1})
    });

    cannonWorld.addBody(groundBody);
    cannonWorld.addBody(ballBody);

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
    camera.position.y = -30;
    camera.lookAt(0,-5,0);

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
    const boardMaterial = new THREE.MeshBasicMaterial({
      color: 0x0abab5,
      wireframe: false,
    });
    boardMaterial.metalness = 0.75;
    boardMaterial.roughness = 0.2;

    const ballGeometry = new THREE.SphereGeometry(0.5);
    const ballMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: false,
    });
    ballMaterial.metalness = 0.75;
    ballMaterial.roughness = 0.2;

    board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.receiveShadow = true;
    // board.translateZ(-0.5);
    // board.userData = groundBody;
    board.position.copy(groundBody.position);
    board.quaternion.copy(groundBody.quaternion);

    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    // ball.translateZ(0.5);
    // ball.userData = ballBody;
    ball.position.copy(ballBody.position);
    ball.quaternion.copy(ballBody.quaternion);

    scene.add(camera);
    scene.add(board);
    scene.add(ball);

    var ambientLight = new THREE.AmbientLight(0xd5d5d5);
    ambientLight.intensity = 1;
    ambientLight.position.set(6,-30,6);
    scene.add(ambientLight);

    // var bottomRightDirectionLight = new THREE.DirectionalLight();
    // bottomRightDirectionLight.position.x = 5;
    // bottomRightDirectionLight.position.y = 3;
    // bottomRightDirectionLight.position.z = -5;
    // bottomRightDirectionLight.intensity = 1.3;
    // scene.add(bottomRightDirectionLight);

    // var frontDirectionLight = new THREE.DirectionalLight();
    // frontDirectionLight.position.x = -5;
    // frontDirectionLight.position.y = 5;
    // frontDirectionLight.position.z = 5;
    // frontDirectionLight.intensity = 1.3;
    // scene.add(frontDirectionLight);


    animate();

    function animate() {
      requestAnimationFrame(animate);

      cannonWorld.fixedStep();

      ball.position.copy(ballBody.position);
      ball.quaternion.copy(ballBody.quaternion);

      board.position.copy(groundBody.position);
      board.quaternion.copy(groundBody.quaternion);

      // joystickControls.update((movement) => {

      //   if (movement) {
      //     const sensitivity = 0.00005;
      //     if (Math.abs(movement.moveX) >= Math.abs(movement.moveY)) {
      //       board.rotation.y += movement.moveX * sensitivity;
      //     } else {
      //       board.rotation.x += movement.moveY * sensitivity;
      //     }
      //   }
      // });

      // groundBody.position.copy(board.position);
      // groundBody.quaternion.copy(board.quaternion);

      joystickControls.update((movement) => {

        if (movement) {
          const sensitivity = 0.0001;
          if (Math.abs(movement.moveX) >= Math.abs(movement.moveY)) {
            //groundBody.rotation.y += movement.moveX * sensitivity;
            groundBody.quaternion.y += movement.moveX * sensitivity;
          } else {
            //groundBody.rotation.x += movement.moveY * sensitivity;
            groundBody.quaternion.x += movement.moveY * sensitivity;
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
