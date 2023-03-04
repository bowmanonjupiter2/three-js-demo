import "./App.css";
import { useEffect } from "react";

import * as THREE from "three";
import { JoystickControls } from "three-joystick";
import * as CANNON from "cannon-es";

function App() {

  useEffect(() => {
    console.log("start")

    let scene, camera, renderer, board, ball, box, joystickControls;
    let cannonWorld, groundBody, ballBody, boxBody;
    let clock;
    let isAnimate = true;

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

    // alert("rotate the board so that the ball can meet the box, ready?")

    cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, 0, -6.0);
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

    ballBody.addEventListener(
      "collide",
      function (e) {
        if (e.body === boxBody) {
          isAnimate = false;
          console.log("reload");
          window.location.reload();
          alert(
            "new record:" + Math.round(clock.getElapsedTime()) + " seconds!"
          );
        }
      },
      false
    );

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
    var img = new Image();
    img.onload = function () {
      scene.background = new THREE.TextureLoader().load(img.src);
      setBackground(scene, img.width, img.height);
    };
    img.src = "outer-space-background.jpg";
    // img.src = "thrive_board.png";

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

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (scene.background) {
        setBackground(setBackground, img.width, img.height);
      }
    }

    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);

    const boardGeometry = new THREE.BoxGeometry(16, 16, 1);

    const boardTexture = new THREE.TextureLoader().load("cpu_ground.jpg");
    // const boardTexture = new THREE.TextureLoader().load("thrive_board.png");
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
      color: 0xffff00,
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
      color: 0xFF1493,
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

    animate();
    clock.start();

    function setBackground(scene, bgImgWidth, bgImgHeight) {
      var windowSize = function (withScrollBar) {
        var width = 0;
        var height = 0;
        if (typeof window.innerHeight != "undefined") {
          width = window.innerWidth;
          height = window.innerHeight;
        } else {
          if (document.documentElement.clientWidth === 0) {
            width = document.body.clientWidth;
            height = document.body.clientHeight;
          } else {
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
          }
        }
        return {
          width:
            width - (withScrollBar ? width - document.body.offsetWidth + 1 : 0),
          height: height,
        };
      };
      if (scene.background) {
        var size = windowSize(true);
        var factor = bgImgWidth / bgImgHeight / (size.width / size.height);
        scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
        scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
        scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
        scene.background.repeat.y = factor > 1 ? 1 : factor;
      }
    }

    function animate() {
      if (isAnimate) {
        requestAnimationFrame(animate);
      }

      cannonWorld.fixedStep();

      if (ballBody.position.z <= -100 || boxBody.position.z <= -100) {
        isAnimate = false;
        console.log("reload");
        window.location.reload();
        alert("let's start over.");
      }

      ball.position.copy(ballBody.position);
      ball.quaternion.copy(ballBody.quaternion);

      box.position.copy(boxBody.position);
      box.quaternion.copy(boxBody.quaternion);

      board.position.copy(groundBody.position);
      board.quaternion.copy(groundBody.quaternion);

      joystickControls.update((movement) => {
        if (movement) {
          const sensitivity = 0.00025;

          if (
            Math.abs(groundBody.quaternion.y + movement.moveX * sensitivity) <=
            0.3
          ) {
            groundBody.quaternion.y += movement.moveX * sensitivity;
          }

          if (
            Math.abs(groundBody.quaternion.x + movement.moveY * sensitivity) <=
            0.3
          ) {
            groundBody.quaternion.x += movement.moveY * sensitivity;
          }

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
