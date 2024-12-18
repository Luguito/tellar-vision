import * as THREE from 'three';

export class SnowFlakes extends THREE.Object3D {
    baseUrl = window.location.origin;
    constructor(params) {
        super();
        this.snowList = []; // List of particles
        const length = params.snowfall || 500; // Number of particles

        const textureLoader = new THREE.TextureLoader();

        // Load snowflake textures
        const textures = [
            textureLoader.load('https://dl.dropbox.com/s/13ec3ht27adnu1l/snowflake1.png?dl=0'),
            textureLoader.load('https://dl.dropbox.com/s/cs17pph4bu096k7/snowflake3.png?dl=0'),
            textureLoader.load('https://dl.dropbox.com/s/plwtcfvokuoz931/snowflake4.png?dl=0'),
            textureLoader.load('https://dl.dropbox.com/s/uhh77omqdwqo2z5/snowflake5.png?dl=0'),
            textureLoader.load(`${this.baseUrl}/logo_brand.png`),
        ];

        // Create separate geometries and materials for each texture
        const geometries = [];
        const materials = [];

        textures.forEach((texture) => {
            const geometry = new THREE.BufferGeometry();
            const vertices = [];

            // Generate random positions for particles
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

        // Create particles for each texture
        for (let i = 0; i < textures.length; i++) {
            const particles = new THREE.Points(geometries[i], materials[i]);
            this.add(particles);
            this.snowList.push(particles); // Save for later updates
        }
    }

    update() {
        // Move particles downward
        this.snowList.forEach((particles) => {
            const positions = particles.geometry.attributes.position.array;

            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.05; // Movement in Y
                if (positions[i] < -5) {
                    positions[i] = 10; // Reset to the top
                    positions[i - 1] = Math.random() * 10 - 5; // New X position
                    positions[i + 1] = Math.random() * 10 - 5; // New Z position
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;
        });
    }
}
