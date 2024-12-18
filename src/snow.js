import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';

// Crear la escena A-Frame desde JS
const sceneEl = document.createElement('a-scene');
sceneEl.setAttribute('mindar-face', '');
sceneEl.setAttribute('embedded', '');
sceneEl.setAttribute('color-space', 'sRGB');
sceneEl.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
sceneEl.setAttribute('device-orientation-permission-ui', 'enabled: false');

// Agregar los assets dinámicamente
const assets = document.createElement('a-assets');
assets.innerHTML = `
  <a-asset-item id="headModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/sparkar/headOccluder.glb"></a-asset-item>
  <a-asset-item id="chrismasHat" src="http://localhost:3000/hat.glb"></a-asset-item>
  <a-asset-item id="chrismasHat2" src="http://localhost:3000/gorro.gltf"></a-asset-item>
  <a-asset-item id="filter" src="http://localhost:3000/last-filter.png"></a-asset-item>
`;
sceneEl.appendChild(assets);

// Crear las entidades de A-Frame
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

// Agregar entidades a la escena
sceneEl.appendChild(occluderEntity);
sceneEl.appendChild(hatEntity);

// Agregar cámara
const camera = document.createElement('a-camera');
camera.setAttribute('active', 'false');
camera.setAttribute('position', '0 0 0');
sceneEl.appendChild(camera);

// Agregar la escena al contenedor
document.getElementById('scene-container').appendChild(sceneEl);

sceneEl.addEventListener('loaded', () => {
    // Inicializar MindAR y FaceMesh
    const mindarThree = new MindARThree({
        container: sceneEl,
    });

    const { scene: threeScene, camera: threeCamera, renderer } = mindarThree;

    // Crear FaceMesh
    const textureLoader = new THREE.TextureLoader();
    // Obtener el host actual
    const baseUrl = window.location.origin;
    const blushTexture = textureLoader.load(`${baseUrl}/filter.png`);
    // Cargar texturas de los logos
    const topLeftLogoTexture = textureLoader.load(`${baseUrl}/logo_brand.png`);
    const bottomCenterLogoTexture = textureLoader.load(`${baseUrl}/name-brand.png`);

    // Crear el logo superior izquierdo
    const topLeftLogo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.15, 0.15), // Tamaño del plano
        new THREE.MeshBasicMaterial({ map: topLeftLogoTexture, transparent: true })
    );

    // Crear el logo inferior central
    const bottomCenterLogo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.1), // Tamaño del plano
        new THREE.MeshBasicMaterial({ map: bottomCenterLogoTexture, transparent: true })
    );

    // Posicionar los logos
    topLeftLogo.position.set(-0.42, 0.17, -1);    // Arriba a la izquierda
    bottomCenterLogo.position.set(0, -0.16, -1); // Abajo en el centro

    // Añadir los logos a la escena principal
    threeScene.add(topLeftLogo);
    threeScene.add(bottomCenterLogo);

    const faceMesh = mindarThree.addFaceMesh();
    faceMesh.material = new THREE.MeshBasicMaterial({
        map: blushTexture,
        transparent: true,
    });

    threeScene.add(faceMesh);
    function createFrostPlane() {
        const frostMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
            varying vec2 vUv;
      
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
            fragmentShader: `
            varying vec2 vUv;
      
            void main() {
              float edgeThickness = 0.05; // Grosor del borde
              float distanceToEdge = min(vUv.x, min(1.0 - vUv.x, min(vUv.y, 1.0 - vUv.y)));
              float edgeMask = smoothstep(edgeThickness, edgeThickness * 2.0, distanceToEdge);
      
              vec3 iceColor = vec3(0.8, 0.9, 1.0); // Color de hielo
              gl_FragColor = vec4(iceColor, 1.0 - edgeMask);
            }
          `,
            transparent: true
        });

        // Crear el plano y posicionarlo frente a la cámara
        const frostPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), frostMaterial);
        frostPlane.position.set(0, 0, -1); // Justo frente a la cámara

        return frostPlane;
    }


    // Crear y posicionar el frostPlane
    const frostPlane = createFrostPlane();

    threeScene.add(frostPlane);

    class SnowFlakes extends THREE.Object3D {
        constructor(params) {
            super();
            this.snowList = []; // Lista de partículas
            const length = params.snowfall || 500; // Número de partículas

            const textureLoader = new THREE.TextureLoader();

            // Cargar las texturas de los copos
            const textures = [
                textureLoader.load('https://dl.dropbox.com/s/13ec3ht27adnu1l/snowflake1.png?dl=0'),
                textureLoader.load('https://dl.dropbox.com/s/cs17pph4bu096k7/snowflake3.png?dl=0'),
                textureLoader.load('https://dl.dropbox.com/s/plwtcfvokuoz931/snowflake4.png?dl=0'),
                textureLoader.load('https://dl.dropbox.com/s/uhh77omqdwqo2z5/snowflake5.png?dl=0'),
                textureLoader.load('http://localhost:3000/logo_brand.png'),
            ];

            // Crear geometrías y materiales separados para cada textura
            const geometries = [];
            const materials = [];

            textures.forEach((texture) => {
                const geometry = new THREE.BufferGeometry();
                const vertices = [];

                // Generar posiciones aleatorias para las partículas
                for (let i = 0; i < length / textures.length; i++) {
                    vertices.push(
                        Math.random() * 10 - 5, // x
                        Math.random() * 10,     // y
                        Math.random() * 10 - 5  // z
                    );
                }

                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometries.push(geometry);

                const material = new THREE.PointsMaterial({
                    size: 0.15,
                    map: texture,
                    transparent: true,
                    opacity: 0.8,
                    depthTest: false,
                    blending: THREE.AdditiveBlending,
                });

                materials.push(material);
            });

            // Crear partículas para cada textura
            for (let i = 0; i < textures.length; i++) {
                const particles = new THREE.Points(geometries[i], materials[i]);
                this.add(particles);
                this.snowList.push(particles); // Guardar para actualizar más tarde
            }
        }

        update() {
            // Mover las partículas hacia abajo
            this.snowList.forEach((particles) => {
                const positions = particles.geometry.attributes.position.array;

                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] -= 0.05; // Movimiento en Y
                    if (positions[i] < -5) {
                        positions[i] = 10; // Reiniciar en la parte superior
                        positions[i - 1] = Math.random() * 10 - 5; // Nueva posición X
                        positions[i + 1] = Math.random() * 10 - 5; // Nueva posición Z
                    }
                }

                particles.geometry.attributes.position.needsUpdate = true;
            });
        }
    }


    // CREACIÓN Y RENDERIZADO DE NIEVE
    const snowFlakes = new SnowFlakes({ snowfall: 1500 });
    threeScene.add(snowFlakes);

    // Bucle de animación
    const start = async () => {
        await mindarThree.start();
        renderer.setAnimationLoop(() => {
            snowFlakes.update(); // Actualizar nieve
            renderer.render(threeScene, threeCamera);
        });
    };

    start();
});
