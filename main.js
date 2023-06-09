import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

import { ARButton } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/webxr/ARButton.js';
class LoadModelDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 45;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(180, -40, 80);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(0, 10, 10);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);
    
    light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(0, 10, -10);
    this._scene.add(light);
    
    light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(10, 10, 0);
    this._scene.add(light);
    
    light = new THREE.AmbientLight(0xFFFFFF, 0.7);
    this._scene.add(light);
    
    

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      /*/'./resources/posx.jpg',
      './resources/negx.jpg',
      './resources/posy.jpg',
      './resources/negy.jpg',
      './resources/posz.jpg',
      './resources/negz.jpg',/*/
    ]);
    this._scene.background = texture;

    /*/const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);
/*/
    this._mixers = [];
    this._previousRAF = null;

    this._LoadModel();
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'girl.fbx', 'dance.fbx', new THREE.Vector3(0, -1.5, 5));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(12, 0, -10));
    // this._LoadAnimatedModelAndPlay(
    //     './resources/dancer/', 'dancer.fbx', 'Silly Dancing.fbx', new THREE.Vector3(-12, 0, -10));
    this._RAF();
  }
  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/Model/Brain_withtextures.gltf', (gltf) => {
      const model = gltf.scene;
      const nodes = gltf.parser.json.nodes;
      const meshNames = [
        'WhiteMatterRight',
        'WhiteMatterLeft',
        'Ventricle',
        'FalxTentorium',
        'Diencephalon',
        'CerebellumWhiteRight 1',
        'CerebellumWhiteLeft 1',
        'CerebellumGrey',
        'BrainStem',
        'CortexLeft',
        'CortexRight'
      ];
  
      const visibilityMap = {}; // Stores the visibility state of each mesh
  
      for (let i = 0; i < nodes.length; i++) {
        const node = model.getObjectById(nodes[i].mesh);
        if (node && meshNames.includes(nodes[i].name)) {
          visibilityMap[nodes[i].name] = true; // Initialize all parts as visible
        }
      }
  
      const labelContainer = document.createElement('div');
      labelContainer.style.position = 'absolute';
      labelContainer.style.top = '0';
      labelContainer.style.left = '0';
      labelContainer.style.width = '100%';
      labelContainer.style.height = '100%';
      labelContainer.style.pointerEvents = 'none';
      document.body.appendChild(labelContainer);
  
      meshNames.forEach((meshName) => {
        const node = model.getObjectByName(meshName);
        if (node) {
          const box = new THREE.Box3().setFromObject(node);
          const center = box.getCenter(new THREE.Vector3());
  
          const label = document.createElement('div');
          label.textContent = meshName;
          label.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          label.style.color = 'white';
          label.style.padding = '5px';
          label.style.position = 'absolute';
          label.style.transform = 'translate(-50%, -50%)';
          label.style.left = `${(center.x + 1) * window.innerWidth / 2}px`;
          label.style.top = `${(-center.y + 1) * window.innerHeight / 2}px`;
          labelContainer.appendChild(label);
  
          const button = document.createElement('button');
          button.textContent = meshName;
          button.style.backgroundColor = 'gray';
          button.style.color = 'white';
          button.style.border = 'none';
          button.style.borderRadius = '50%';
          button.style.padding = '10px';
          button.style.width = '50px';
          button.style.height = '50px';
          button.style.position = 'absolute';
          button.style.right = '10px';
          button.style.top = `${(meshNames.indexOf(meshName) + 1) * 60}px`;
          document.body.appendChild(button);
  
          button.addEventListener('click', () => {
            const node = model.getObjectByName(meshName);
            if (node) {
              visibilityMap[meshName] = !visibilityMap[meshName];
              node.visible = visibilityMap[meshName];
              button.style.backgroundColor = visibilityMap[meshName] ? 'green' : 'gray';
            }
          });
  
          node.userData = { label, button };
        }
      });
  
      const hideButton = document.createElement('button');
      hideButton.textContent = 'Hide Names';
      hideButton.style.backgroundColor = 'gray';
      hideButton.style.color = 'white';
      hideButton.style.border = 'none';
      hideButton.style.padding = '10px';
      hideButton.style.position = 'absolute';
      hideButton.style.right = '10px';
      hideButton.style.bottom = '10px';
      document.body.appendChild(hideButton);
  
      hideButton.addEventListener('click', () => {
        meshNames.forEach((meshName) => {
          const node = model.getObjectByName(meshName);
          if (node && node.userData.label) {
            node.userData.label.style.display = 'none';
          }
        });
      });
  
      const showButton = document.createElement('button');
      showButton.textContent = 'Show Names';
      showButton.style.backgroundColor = 'gray';
      showButton.style.color = 'white';
      showButton.style.border = 'none';
      showButton.style.padding = '10px';
      showButton.style.position = 'absolute';
      showButton.style.right = '10px';
      showButton.style.bottom = '70px';
      document.body.appendChild(showButton);
  
      showButton.addEventListener('click', () => {
        meshNames.forEach((meshName) => {
          const node = model.getObjectByName(meshName);
          if (node && node.userData.label) {
            node.userData.label.style.display = 'block';
          }
        });
      });
  // Create a hotspot button
const hotspotButton = document.createElement('button');
hotspotButton.className = 'Hotspot';
hotspotButton.setAttribute('slot', 'hotspot-1');
hotspotButton.setAttribute('data-position', '0.581958580275513m -0.32791104476930477m 0.319783903766528m');
hotspotButton.setAttribute('data-normal', '0.9984546666768878m 0.039101632876064094m 0.03948849069755169m');
hotspotButton.setAttribute('data-visibility-attribute', 'visible');

// Create a label for the hotspot
const label = document.createElement('div');
label.className = 'HotspotAnnotation';
label.textContent = 'Cortex';

// Add the label to the hotspot button
hotspotButton.appendChild(label);

// Add the hotspot button to the document body or a container element
document.body.appendChild(hotspotButton);
      const scale = 40; // Adjust this value as per your requirement
      gltf.scene.scale.set(scale, scale, scale);
      this._scene.add(model);
    });
  }
  
  


  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      if (this._mixers.length > 0) {
        this._mixers.forEach((mixer) => {
          mixer.update(0.016);
        });
      }
      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});
