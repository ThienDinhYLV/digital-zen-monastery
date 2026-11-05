# Digital Zen Monastery V1.4 — Asset provenance & limitations

## Included media

1. `public/assets/monk-rigged.glb`: independently generated in this project by `tools/generate_monk.py`. A self-contained glTF 2.0 with 11-joint skeleton, 55 skinned mesh primitives and a looping idle animation. This is **NOT a photorealistic, scan-based, or professionally hand-sculpted character**. Model fidelity remains stylised and is **NOT production accepted**.
2. `src/backplate.webp` and `public/assets/sanctuary-backplate.webp`: cropped from the project's **user-approved AI-generated concept image** from the prior conversation. The backplate provides a scenic 2D layer, **not fully volumetric 3D scenery**. It cannot be described as a complete cinematic 3D environment.
3. `public/icons/`: original programmatically authored minimalist lotus icons for this project.
4. Pavilion, terrain, water, instanced foliage, lighting: runtime procedural Three.js. Higher-density foliage and natural materials are an improvement over the icosahedron-only V1.3. These are **still engineering-created assets**, not purchased/scanned production assets.

## Replacement pipeline — professional quality gate

To replace this rigged research mesh with a licensed professional character:

- Obtain an original sculpt (or licensed 3D scan) with clear commercial web redistribution permission; retain licence, creator, and source URL in this file.
- Prepare clean retopology, PBR maps (base color/normal/roughness), 11+ bone rig, skin weights, idle/sitting/standing/gesture animations and facial shape keys or suitable morph targets.
- Export glTF 2.0 GLB with animation clips. Compress texture images to KTX2 only if runtime support (`KTX2Loader`) is added and browser-tested.
- Budget < 4 MB for mobile GLB initially; check actual memory/frame time before claiming a performance target.
- Run `npm test`, `npm run build` and Safari iPhone device tests.
- Replace `public/assets/monk-rigged.glb`, retaining or updating the `breathing-idle` animation. Existing app checks for bones and clips before accepting the asset.

**Do not call this character photorealistic or a completed professional monk until the above asset is actually delivered and inspected.**
