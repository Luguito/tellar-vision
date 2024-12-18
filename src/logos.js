import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const baseUrl = window.location.origin;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Load logo textures
const topLeftLogoTexture = textureLoader.load(`${baseUrl}/logo_brand.png`);
const bottomCenterLogoTexture = textureLoader.load(`${baseUrl}/name-brand.png`);

// Create the top-left logo
const topLeftLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.15), // Plane size
    new THREE.MeshBasicMaterial({ map: topLeftLogoTexture, transparent: true })
);

// Create the bottom-center logo
const bottomCenterLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.1), // Plane size
    new THREE.MeshBasicMaterial({ map: bottomCenterLogoTexture, transparent: true })
);

// Position the logos
topLeftLogo.position.set(-0.42, 0.17, -1);    // Top-left
bottomCenterLogo.position.set(0, -0.16, -1); // Bottom-center

console.log(isMobile)
if (isMobile) {
    topLeftLogo.position.set(-0.15, 0.25, -1);
    bottomCenterLogo.position.set(0, -0.2, -1);
}

export { topLeftLogo, bottomCenterLogo };
