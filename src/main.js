import 'webxr-polyfill';
import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { SnowFlakes } from './snow';
import { bottomCenterLogo, topLeftLogo } from './logos'

// Obtain actual host (localhost o any domain)
const baseUrl = window.location.origin;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Create a scene using JS
const sceneEl = document.createElement('a-scene');
sceneEl.setAttribute('mindar-face', '');
sceneEl.setAttribute('embedded', '');
sceneEl.setAttribute('color-space', 'sRGB');
sceneEl.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
sceneEl.setAttribute('device-orientation-permission-ui', 'enabled: false');

// Add pre-load-assets
const assets = document.createElement('a-assets');
assets.innerHTML = `
  <a-asset-item id="headModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/sparkar/headOccluder.glb"></a-asset-item>
  <a-asset-item id="chrismasHat" src="${baseUrl}/hat.glb"></a-asset-item>
  <a-asset-item id="chrismasHat2" src="${baseUrl}/gorro.gltf"></a-asset-item>
  <a-asset-item id="filter" src="${baseUrl}/last-filter.png"></a-asset-item>
`;
// Add assets in main scene
sceneEl.appendChild(assets);

// Create the entitys we gonna use
const occluderEntity = document.createElement('a-entity');
occluderEntity.setAttribute('mindar-face-target', 'anchorIndex: 168');
occluderEntity.innerHTML = `
  <a-gltf-model mindar-face-occluder position="0 -0.3 0.15" rotation="0 0 0" scale="0.065 0.065 0.065" src="#headModel"></a-gltf-model>
`;

const hatEntity = document.createElement('a-entity');
hatEntity.setAttribute('mindar-face-target', 'anchorIndex: 10');
hatEntity.innerHTML = `
  <a-gltf-model rotation="10 10 0" position="-0.1 0.3 -1" scale="0.5 0.5 0.8" src="#chrismasHat2"></a-gltf-model>
`;

// Add entitys created to the scene
sceneEl.appendChild(occluderEntity);
sceneEl.appendChild(hatEntity);

// Add Camera
const camera = document.createElement('a-camera');
camera.setAttribute('active', 'false');
camera.setAttribute('position', '0 0 0');
sceneEl.appendChild(camera);

// Add the scene to HTML container
document.getElementById('scene-container').appendChild(sceneEl);

// Event trigger when the main scene is already loaded
sceneEl.addEventListener('loaded', () => {

  // Init MINDAR
  const mindarThree = new MindARThree({
    container: sceneEl,
  });

  const { scene: threeScene, camera: threeCamera, renderer } = mindarThree;

  if (isMobile) {
    renderer.setPixelRatio(window.devicePixelRatio * 0.75); // Reducir la resolución en móviles
  } else {
    renderer.setPixelRatio(window.devicePixelRatio); // Resolución completa en escritorio
  }

  // Create Loader for the FaceMesh
  const textureLoader = new THREE.TextureLoader();
  // Import Filter
  const blushTexture = textureLoader.load(`${baseUrl}/filter.png`);

  const faceMesh = mindarThree.addFaceMesh();

  faceMesh.material = new THREE.MeshBasicMaterial({
    map: blushTexture, // filter here
    transparent: true,
  });

  threeScene.add(faceMesh);

  // Add Logos to the scene (imported from logos.js)
  threeScene.add(topLeftLogo);
  threeScene.add(bottomCenterLogo);

  // Create Snowflakes (Imported from snow.js)
  const snowFlakes = new SnowFlakes({ snowfall: isMobile ? 500 : 1500 });

  threeScene.add(snowFlakes);

  // Start animation and init the whole scene
  const start = async () => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      snowFlakes.update(); // Actualizar nieve
      renderer.render(threeScene, threeCamera);
    });
  };

  start();
});
