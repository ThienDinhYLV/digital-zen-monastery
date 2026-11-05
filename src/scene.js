import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const color=(s)=>new THREE.Color(s);
const material=(hex,roughness=.86,other={})=>new THREE.MeshStandardMaterial({color:hex,roughness,...other});
const paleWood=material('#886a4d',.87), darkWood=material('#4f4036',.93), roof=material('#625748',.91), cream=material('#e5d6b1',.93), soil=material('#718774',.98);
function shapeBox(parent,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;parent.add(o);return o;}
function ellipse(parent,rx,ry,rz,m,x,y,z,detail=20){const o=new THREE.Mesh(new THREE.SphereGeometry(1,detail,14),m);o.scale.set(rx,ry,rz);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function branch(parent,points,width,mat){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,10,width,8,false),mat);mesh.castShadow=true;parent.add(mesh);}

export function createSanctuary(canvas,{onReady,onError}={}){
  const mobile=matchMedia('(max-width: 800px)').matches;
  const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,depth:true,powerPreference:'low-power'});
  renderer.setClearColor(0,0); renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  let quality=mobile?'eco':'balanced';
  const resize=()=>{const w=window.innerWidth,h=window.innerHeight; renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality==='eco'?1:1.55));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<600?58:46;camera.updateProjectionMatrix();};
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#b5c9b8',.014);
  const camera=new THREE.PerspectiveCamera(46,1,.1,145);
  const sun=new THREE.DirectionalLight('#fff0cb',2.65);sun.position.set(-7,19,-1);sun.castShadow=!mobile;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;scene.add(sun);
  scene.add(new THREE.HemisphereLight('#edf8eb','#647362',2.5));
  const land=new THREE.Group();scene.add(land);
  const terrain=new THREE.PlaneGeometry(64,42,56,40);terrain.rotateX(-Math.PI/2);
  const positions=terrain.attributes.position;for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);
    const valley=-.37+Math.min(1.7,Math.pow(Math.max(0,Math.abs(x)-8)/17,1.4))*1.2;
    positions.setY(i,valley+Math.sin(x*.43+z*.12)*.08+Math.cos(z*.3-x*.16)*.05);
  }terrain.computeVertexNormals();const floor=new THREE.Mesh(terrain,soil);floor.position.z=-4.5;floor.receiveShadow=true;land.add(floor);
  // Real geometry for the reflecting water, foliage and pavilion; backdrop is explicitly a cinematic 2D scenic plate.
  const pondShape=new THREE.Shape();pondShape.ellipse(.3,-.6,5.1,2.35,0,Math.PI*2,false,0);
  const pondGeo=new THREE.ShapeGeometry(pondShape,80);pondGeo.rotateX(-Math.PI/2);
  const pondMat=new THREE.MeshPhysicalMaterial({color:'#7caaa6',transparent:true,opacity:.74,roughness:.17,metalness:.06,clearcoat:.8,clearcoatRoughness:.1,side:THREE.DoubleSide,depthWrite:false});
  const pond=new THREE.Mesh(pondGeo,pondMat);pond.position.set(.6,-.30,-2.4);pond.receiveShadow=true;land.add(pond);
  const shimmer=new THREE.Mesh(new THREE.RingGeometry(1.18,1.22,80),new THREE.MeshBasicMaterial({color:'#e8e3c7',transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide}));shimmer.rotation.x=-Math.PI/2;shimmer.scale.set(3.8,1.9,1);shimmer.position.set(1,-.28,-2.15);land.add(shimmer);
  // Minimalist timber pavilion, lower roof and wide eaves; no exaggerated temple ornaments.
  const pav=new THREE.Group();pav.position.set(-2.3,0,-8.4);land.add(pav);
  shapeBox(pav,8.8,.28,5.6,paleWood,0,.15,0);
  for(const x of [-3.9,3.9])for(const z of [-2.3,2.3]){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,3.4,18),darkWood);post.position.set(x,1.92,z);post.castShadow=true;pav.add(post);
  }
  for(const z of [-2.35,2.35])shapeBox(pav,8.7,.24,.22,darkWood,0,3.56,z);
  // Architectural roof: curved twin facets rather than primitive cones.
  function roofFacet(side){const v=[],f=[];const seg=20;for(let i=0;i<=seg;i++){
      const t=i/seg,xx=side*(.02+t*5.25);const yy=4.55-1.04*Math.pow(t,.86)+.14*Math.pow(t,4);
      for(const z of [-3.3,3.3])v.push(xx,yy,z);
    }for(let i=0;i<seg;i++){const a=i*2;f.push(a,a+1,a+2,a+1,a+3,a+2)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(f);geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#6b5f4e',roughness:.91,side:THREE.DoubleSide}));m.castShadow=true;pav.add(m);
  }roofFacet(1);roofFacet(-1);
  shapeBox(pav,10.5,.12,.13,darkWood,0,3.48,-3.3);
  shapeBox(pav,10.5,.12,.13,darkWood,0,3.48,3.3);
  for(let i=-5;i<=5;i++){shapeBox(pav,.035,.05,5.8,paleWood,i*.82,3.46,-.05);}
  shapeBox(pav,7.7,2.75,.10,cream,0,1.65,-2.47);
  for(let i=-3;i<=3;i++)shapeBox(pav,.048,2.75,.06,darkWood,i*1.04,1.66,-2.41);
  shapeBox(pav,2.7,2.55,.12,darkWood,0,1.53,-2.36);
  shapeBox(pav,2.4,2.27,.05,material('#9f9e88'),0,1.54,-2.27);
  shapeBox(pav,1.7,.13,.18,cream,0,2.95,-2.18);
  // deck benches, pebble pathways, lotus pads
  for(let i=-2;i<=2;i++){shapeBox(pav,.76,.12,1.55,paleWood,i*1.45,.29,1.14);}
  const stone=material('#b3aa92',.99);let seed=12345;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<39;i++){
    const xx=-6+(rand()*10.6),zz=1+rand()*9;
    if(xx>-2&&zz<5)continue;
    const r=.14+rand()*.31;const o=ellipse(land,r*.9,r*.2,r*1.1,stone,xx,-.14,zz,14);o.rotation.y=rand()*Math.PI;
  }
  const lilyMat=material('#527a62',.77,{side:THREE.DoubleSide});
  for(let i=0;i<8;i++){
    const a=rand()*Math.PI*2,r=Math.sqrt(rand());const leaf=new THREE.Mesh(new THREE.CircleGeometry(.15+rand()*.15,28),lilyMat);leaf.rotation.x=-Math.PI/2;leaf.position.set(1.1+Math.cos(a)*3.4*r,-.274,-3+Math.sin(a)*1.4*r);land.add(leaf);
  }
  const treeTrunk=material('#625444',1),treeColors=['#46664c','#64805b','#6d8660','#3c644c','#7b8d6b'];
  // More than 700 instanced leaf clusters: low draw calls for iPhone.
  const foliageGeometry=new THREE.IcosahedronGeometry(.21,2);
  const foliage=new THREE.InstancedMesh(foliageGeometry,material('#ffffff',.99,{vertexColors:false}),1050);foliage.castShadow=!mobile;const dummy=new THREE.Object3D();let leafCount=0;
  function tree(x,z,h){const base=-.25,curvature=(rand()-.5)*.45;
    branch(land,[[x,base,z],[x+curvature*.3,h*.43,z],[x+curvature,h*.8,z+.12]],.075*h,treeTrunk);
    const cx=x+curvature,cy=base+h*.86,cz=z+.12;
    const offshoots=4+Math.floor(rand()*3);
    for(let b=0;b<offshoots;b++){
      const a=b*2*Math.PI/offshoots+(rand()-.5)*.4;
      const dx=Math.cos(a)*h*.35,dz=Math.sin(a)*h*.35;
      branch(land,[[cx,cy-.15,cz],[cx+dx*.55,cy+h*.12,cz+dz*.55],[cx+dx,cy+h*.23,cz+dz]],.027*h,treeTrunk);
      const per=22;for(let k=0;k<per&&leafCount<foliage.count;k++){
        const phi=rand()*Math.PI*2;const ct=(rand()-.5)*2;
        const spread=(.30+rand()*.42)*h;
        dummy.position.set(cx+dx+Math.cos(phi)*spread,cy+h*.23+ct*spread*.55,cz+dz+Math.sin(phi)*spread);
        const scale=.38+rand()*.83;dummy.scale.set(scale*1.55,scale*.85,scale*1.15);dummy.rotation.set(rand()*.8,rand()*Math.PI,rand()*.5);dummy.updateMatrix();
        foliage.setMatrixAt(leafCount,dummy.matrix);foliage.setColorAt(leafCount,color(treeColors[Math.floor(rand()*treeColors.length)]));leafCount++;
      }
    }
  }
  [[-12,-7,5.5],[-10,-13,5.0],[-9,1,4.5],[-13,5,6],[9,-10,5.5],[12,-5,7],[9,4,4.5],[14,9,7],[2,-17,5.5]].forEach(([x,z,h])=>tree(x,z,h));
  foliage.count=leafCount;foliage.instanceMatrix.needsUpdate=true;if(foliage.instanceColor)foliage.instanceColor.needsUpdate=true;land.add(foliage);
  // Mossy stone edges, ferns, and a slender walking trail.
  const fernMat=material('#66805a');for(let i=0;i<44;i++){
    const x=(rand()-.5)*24,z=-13+rand()*21;
    if(Math.abs(x)<5&&z>-4&&z<3)continue;
    const blade=new THREE.Mesh(new THREE.ConeGeometry(.05+rand()*.08,.35+rand()*.65,7),fernMat);blade.position.set(x,.1,z);blade.rotation.z=(rand()-.5)*.7;land.add(blade);
  }
  const monkHolder=new THREE.Group();monkHolder.position.set(3.1,-.11,2.1);monkHolder.rotation.y=-.22;monkHolder.scale.setScalar(1.23);scene.add(monkHolder);
  const stage=ellipse(scene,1.33,.14,.9,material('#a88a68',.98),3.1,-.17,2.1,40);
  let mixer=null,assetVerified=false;
  const assetUrl=`${import.meta.env.BASE_URL}assets/monk-rigged.glb`;
  new GLTFLoader().load(assetUrl,gltf=>{
    const model=gltf.scene;const uniqueBones=new Set();model.traverse(node=>{if(node.isSkinnedMesh)node.skeleton?.bones?.forEach(b=>uniqueBones.add(b.uuid));node.frustumCulled=false;node.castShadow=true;});
    const bones=uniqueBones.size;if(!bones||!gltf.animations?.length){onError?.('GLB chưa có cấu trúc xương hoặc hoạt ảnh hợp lệ.');return;}
    monkHolder.add(model);assetVerified=true;
    mixer=new THREE.AnimationMixer(model);const idle=gltf.animations.find(c=>/breath|idle/i.test(c.name))||gltf.animations[0];mixer.clipAction(idle).play();
    onReady?.({bones,animations:gltf.animations.map(a=>a.name),assetUrl});
  },undefined,e=>onError?.('Không thể tải mô hình 3D có hệ xương: '+e.message));
  const targets={
    home:{pos:[7.5,4.1,14.5],look:[.3,1.45,-3]},
    meditation:{pos:[5.2,3.4,10.3],look:[2.5,1.35,.6]},
    dharma:{pos:[-2.8,4.0,12.6],look:[-2.0,1.5,-7.7]},
    library:{pos:[-.6,4.1,13.5],look:[-2.4,1.9,-8]},
    room:{pos:[2.1,3.5,11.8],look:[-2.4,1.35,-7.1]},
    garden:{pos:[9.7,4.4,10],look:[1,1.1,-3.2]},
    teacher:{pos:[5.0,2.95,7.9],look:[3.1,1.6,2.1]},
    about:{pos:[7.5,4.1,14.5],look:[.3,1.45,-3]}
  };
  const focus={...targets.home};let active='home';
  function setFocus(view){active=view;Object.assign(focus,targets[view]||targets.home);}
  let stopped=false;const clock=new THREE.Clock(),currentLook=new THREE.Vector3(...focus.look);
  camera.position.set(...focus.pos);camera.lookAt(...focus.look);resize();window.addEventListener('resize',resize);
  function animate(){if(stopped)return;requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.07);mixer?.update(dt);
    const goalPos=new THREE.Vector3(...focus.pos),goalLook=new THREE.Vector3(...focus.look),f=prefersReduced?1:1-Math.exp(-dt*1.05);
    camera.position.lerp(goalPos,f);currentLook.lerp(goalLook,f);camera.lookAt(currentLook);
    if(!prefersReduced){const t=clock.elapsedTime;pondMat.opacity=.73+Math.sin(t*.55)*.035;shimmer.material.opacity=.08+Math.sin(t*.48)*.035;}
    renderer.render(scene,camera);
  }animate();
  return {setFocus,quality(){quality=quality==='balanced'?'eco':'balanced';renderer.shadowMap.enabled=quality!=='eco'&&!mobile;resize();return quality;},get state(){return {assetVerified,quality};},destroy(){stopped=true;window.removeEventListener('resize',resize);renderer.dispose();}};
}
