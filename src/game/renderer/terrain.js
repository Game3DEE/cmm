import * as THREE from 'three'
import { conv_565 } from '../../utils.js'

const mapScale = 256

export function createMapGeometry(map) {
    // Create a plane with divisions as base for map heightfield
    const geo = new THREE.PlaneBufferGeometry(
        map.size * mapScale, map.size * mapScale,
        map.size - 1, map.size - 1
    );

    // Lay it flat
    geo.rotateX(-Math.PI / 2);

    const half = (map.size * mapScale) / 2
    geo.translate(half, 0, half)

    // Set heights based on heightfield
    for (let i = 0; i < map.size * map.size; i++) {
        geo.attributes.position.setY(i, map.heightMap[i] * map.yScale);
    }

    // Compute normals for lighting
    geo.computeVertexNormals();

    // Return a non-indexed version of the geometry, since we're going to need
    // to generate the UVs for the texture atlas mapping
    return geo.toNonIndexed();
}

// Create a texture atlas for all terrain textures
// this makes it possible to simply use UV assignments per "square"
// in the terrain to render the correct textures
// (and since it is all in one texture it helps prevent re-binding of textures)
export function createTextureAtlas(rsc) {
    const terrainTexSize = 128
/*
    // Make sure atlas texture size is okay
    let textureDim = 0

	if (rsc.textureCount > 0) textureDim = 1
	if (rsc.textureCount > 1) textureDim = 4
	if (rsc.textureCount > 4) textureDim = 16
	if (rsc.textureCount > 16) textureDim = 64
	if (rsc.textureCount > 64) textureDim = 256

    textureDim = Math.floor(Math.sqrt(textureDim))
*/
    const textureDim = Math.ceil(Math.sqrt(rsc.textureCount));

    // Calculate W/H of atlas (we make a square texture atlas)
    const atlasSize = textureDim * terrainTexSize // width/height of atlas tex

    // allocate data
    const data = new Uint16Array(atlasSize * atlasSize)

    // Now go over all textures...
    for (let i = 0; i < rsc.textureCount; i++) {
        // Determine where in the atlas grid this texture should go
        let top = Math.floor(i / textureDim)
        let left = Math.floor(i % textureDim)
        // ... and the actual byte offset in our data
        let outOffset = top * atlasSize * terrainTexSize + left * terrainTexSize
        // Now go over the texture and decode the 16 bit texture into our 24 bit one
        const srcOffset = i * terrainTexSize * terrainTexSize
        for (let y = 0; y < terrainTexSize; y++) {
            for (let x = 0; x < terrainTexSize; x++) {
                const pixel = rsc.textures[srcOffset + y * terrainTexSize + x]
                data[outOffset++] = conv_565(pixel)
            }
            outOffset -= terrainTexSize
            outOffset += atlasSize
        }
    }

    // Done! Now simply create a ThreeJS texture from the data
    const tex = new THREE.DataTexture(data, atlasSize, atlasSize, THREE.RGBFormat, THREE.UnsignedShort565Type)
    tex.internalFormat = 'RGB565' // is this required because of WGL2?
    console.log(rsc.textureCount, textureDim, atlasSize, tex)
    tex.needsUpdate = true

    return tex;
}

// Set up the UVs for our texture atlas based on the texture map
export function setupTerrainUV(geometry, map, atlasTexture, atlasTileSize) {
    // Get number of textures per row in our atlas
    const textureDim = atlasTexture.image.width / atlasTileSize;
    // size of one texture in our map in UV coordinates (they are 0...1)
    const uvStep = 1 / textureDim;
    const uv = geometry.attributes.uv;
    let uvidx = 0;
    // Loop through the entire map
    for (let y = 0; y < map.size - 1; y++) {
        for (let x = 0; x < map.size - 1; x++) {
            // Get the texture number
            const tidx = map.tex1Map[map.size * y + x];
            // get the rotation of the texture
            const rot = map.flags1[map.size * y + x] & 3;
            // calculate position of texture from atlas in UV coords
            const ty = Math.floor(tidx / textureDim) * uvStep;
            const tx = Math.floor(tidx % textureDim) * uvStep;
            // Okay, the code here gets a little messy, and could be optimised,
            // but at least it reads nicer then the Carnivores code itself :P

            // Four positions in uvmap to use
            const coords = [
                [0, 0],
                [0, uvStep],
                [uvStep, 0], // first triangle UV
                [uvStep, uvStep],
            ];
            // map coordinates to all 6 vertices used for this grid square
            let a = 0, b = 1, c = 2, d = 1, e = 3, f = 2;
            // ... and take rotation into account
            switch (rot) {
                case 0: break; // default no rotation
                case 1: // 90deg
                    a = 1; b = d = 3; c = f = 0; e = 2;
                    break;
                case 2: // 180deg
                    a = 3; b = d = 2; c = f = 1; e = 0;
                    break;
                case 3: // 270deg
                    a = 2; b = d = 0; c = f = 3; e = 1;
                    break;
            }
            // Okay, now simply set the UV for those 6 vertices
            uv.setX(uvidx + 0, tx + coords[a][0]);
            uv.setY(uvidx + 0, ty + coords[a][1]);
            uv.setX(uvidx + 1, tx + coords[b][0]);
            uv.setY(uvidx + 1, ty + coords[b][1]);
            uv.setX(uvidx + 2, tx + coords[c][0]);
            uv.setY(uvidx + 2, ty + coords[c][1]);

            uv.setX(uvidx + 3, tx + coords[d][0]);
            uv.setY(uvidx + 3, ty + coords[d][1]);
            uv.setX(uvidx + 4, tx + coords[e][0]);
            uv.setY(uvidx + 4, ty + coords[e][1]);
            uv.setX(uvidx + 5, tx + coords[f][0]);
            uv.setY(uvidx + 5, ty + coords[f][1]);

            // .. and move on
            uvidx += 6;
        }
    }

    // Tell ThreeJS we modified the UVs...
    uv.needsUpdate = true;
}

export function createLightMap(data, size) {
    //const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
    const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat, THREE.UnsignedByteType)
    tex.magFilter = tex.minFilter = THREE.LinearFilter
    tex.needsUpdate = true
    
    return tex
}

const vs = `
varying vec2 vUv;
varying vec2 vFog;
varying vec2 vShadowUv;

uniform vec2 fog_params;

#define MAX_R_VIEW 38.0 // halfed
#define TERRAIN_FOG_START 32.0 // halfed
#define TERRAIN_CELL_SIZE 256.0

#define DISABLE_FOG

const float terrain_fog_k = 1.0 / ((MAX_R_VIEW * TERRAIN_CELL_SIZE) - (TERRAIN_FOG_START * TERRAIN_CELL_SIZE));

void main() {
#ifdef DISABLE_FOG
    vFog = vec2(1.0, 1.0);
#else
    float vertex_dist = distance(cameraPosition, position);

    // transparent fog
	vFog.r = 1.0 - (vertex_dist - (TERRAIN_FOG_START * TERRAIN_CELL_SIZE)) * terrain_fog_k;
	vFog.r = clamp(vFog.r, 0.0, 1.0);

	// distant fog
	vFog.g = clamp((1.0 - (vertex_dist - fog_params.x) / (fog_params.y - fog_params.x)), 0.0, 1.0);
#endif

    vShadowUv = vec2(position.x / (TERRAIN_CELL_SIZE * TERRAIN_SIZE), position.z / (TERRAIN_CELL_SIZE * TERRAIN_SIZE));
	//out_textCoord_clouds = vec2(1.0 - (position.z / (TERRAIN_CELL_SIZE * 128.0)) - time, 1.0 - (position.x / (TERRAIN_CELL_SIZE * 128.0)) - time);

    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}`

const fs = `
uniform sampler2D atlasTexture;
uniform sampler2D shadowMap;
uniform vec3 skyColor;
varying vec2 vUv;
varying vec2 vFog;
varying vec2 vShadowUv;

void main( void ) {

    float shadow_color = texture2D(shadowMap, vShadowUv).r; // * texture2D(input_texture_clouds, out_textCoord_clouds).r;
	
	//vec3 diffuse = (input_light_color * shadow_color + input_shadows_color) * (texture2D(input_texture, out_textCoord).rgb);
    vec3 diffuse = shadow_color * texture2D( atlasTexture, vUv ).rgb;

    diffuse = mix(skyColor, diffuse, vFog.g);
	
	gl_FragColor = vec4(diffuse, vFog.r);
}
`

export class TerrainMaterial extends THREE.ShaderMaterial {
    constructor(atlas, lightMap, fogParams, skyColor, mapSize) {
        super({
            uniforms: {
                shadowMap: { value: lightMap },
                atlasTexture: { value: atlas },
                fog_params: { value: fogParams },
                skyColor: { value: skyColor },
            },
            defines: {
                'TERRAIN_SIZE': `${mapSize}.0`,
            },
            vertexShader: vs,
            fragmentShader: fs,
        })
    }
}
