import "./style.css";
import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

// const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};

const generatePlane = () => {
  mesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
};

// const generateGuiForPlane = () => {
//   planeGeometry.dispose();
//   generatePlane();
//   generateUnevenMesh();
//   addColorAttributeToTheMesh();
//   mesh.geometry.attributes.position.originalPosition =
//     mesh.geometry.attributes.position.array;
// };

// gui.add(world.plane, "width", 1, 500).onChange(() => {
//   generateGuiForPlane();
// });

// gui.add(world.plane, "height", 1, 500).onChange(() => {
//   generateGuiForPlane();
// });

// gui.add(world.plane, "widthSegments", 1, 100).onChange(() => {
//   generateGuiForPlane();
// });

// gui.add(world.plane, "heightSegments", 1, 100).onChange(() => {
//   generateGuiForPlane();
// });

const rayCaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});

const mesh = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(mesh);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0.3, -1);
scene.add(backLight);

const addColorAttributeToTheMesh = () => {
  const colors = [];
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  mesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
};

const generateUnevenMesh = () => {
  const { array } = mesh.geometry.attributes.position;
  const randomValues = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 4;
    }

    randomValues.push(Math.random() - 0.5);
  }

  mesh.geometry.attributes.position.randomValues = randomValues;

  console.log(randomValues);
};

mesh.geometry.attributes.position.originalPosition =
  mesh.geometry.attributes.position.array;

console.log(mesh.geometry.attributes.position);

addColorAttributeToTheMesh();
generateUnevenMesh();

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;

const addBreatheEffectOnMesh = () => {
  const { array, originalPosition, randomValues } =
    mesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.005;
    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.005;
  }

  mesh.geometry.attributes.position.needsUpdate = true;
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  rayCaster.setFromCamera(mouse, camera);

  addBreatheEffectOnMesh();
  frame += 0.01;

  const intersects = rayCaster.intersectObject(mesh);
  if (intersects.length > 0) {
    const { face } = intersects[0];
    const { color } = intersects[0].object.geometry.attributes;
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    // vertice 1
    color.setX(face.a, hoverColor.r);
    color.setY(face.a, hoverColor.g);
    color.setZ(face.a, hoverColor.b);

    // vertice 2
    color.setX(face.b, hoverColor.r);
    color.setY(face.b, hoverColor.g);
    color.setZ(face.b, hoverColor.b);

    // vertice 3
    color.setX(face.c, hoverColor.r);
    color.setY(face.c, hoverColor.g);
    color.setZ(face.c, hoverColor.b);

    color.needsUpdate = true;

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setX(face.a, hoverColor.r);
        color.setY(face.a, hoverColor.g);
        color.setZ(face.a, hoverColor.b);

        // vertice 2
        color.setX(face.b, hoverColor.r);
        color.setY(face.b, hoverColor.g);
        color.setZ(face.b, hoverColor.b);

        // vertice 3
        color.setX(face.c, hoverColor.r);
        color.setY(face.c, hoverColor.g);
        color.setZ(face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });
  }
}

animate();

addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
