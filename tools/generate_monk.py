#!/usr/bin/env python3
"""Create a self-contained, independently authored, *stylised* skinned monk GLB.

No external models or licences are silently assumed. Not photorealistic.
Runtime Three.js skinning + glTF embedded rotation tracks verified in tests.
"""
import json, math, struct, pathlib
import numpy as np

OUT=pathlib.Path(__file__).resolve().parents[1]/'public/assets/monk-rigged.glb'
# joints are hierarchical bind pose in metres.
NAMES=['root','hips','spine','neck','head','shoulder_L','elbow_L','wrist_L','shoulder_R','elbow_R','wrist_R']
PARENTS=[-1,0,1,2,3,2,5,6,2,8,9]
LOCAL=[(0,0,0),(0,.72,0),(0,.63,0),(0,.64,0),(0,.24,0),(-.52,.34,0),(-.27,-.39,.16),(.18,-.30,.22),(.52,.34,0),(.27,-.39,.16),(-.18,-.30,.22)]
GLOBAL=[]
for i,t in enumerate(LOCAL):
    p=PARENTS[i]
    GLOBAL.append(np.array(t,dtype=np.float32)+(GLOBAL[p] if p>=0 else 0))
materials=[
 ('Ochre robe',(.61,.29,.095,1),.98),
 ('Saffron folds',(.81,.46,.15,1),.98),
 ('Soft cotton highlight',(.9,.59,.27,1),.98),
 ('Skin',(.53,.32,.22,1),.98),
 ('Facial details',(.21,.17,.14,1),1.0),
 ('Cushion',(.31,.23,.18,1),.99),
 ('Cushion seam',(.52,.36,.24,1),1.0),
]
meshes=[]
def append_mesh(name,verts,triangles,mat,joint,colors=None):
    v=np.asarray(verts,dtype=np.float32); tri=np.asarray(triangles,dtype=np.uint32)
    normal=np.zeros_like(v)
    for a,b,c in tri:
        no=np.cross(v[b]-v[a],v[c]-v[a]);normal[a]+=no;normal[b]+=no;normal[c]+=no
    normal/=np.maximum(np.linalg.norm(normal,axis=1,keepdims=True),1e-8)
    # Per-vertex blend weights; safely all to one bone for distinct cloth/limbs.
    j=np.zeros((len(v),4),dtype=np.uint16);j[:,0]=joint
    w=np.zeros((len(v),4),dtype=np.float32);w[:,0]=1
    meshes.append({'name':name,'v':v,'n':normal,'idx':tri.reshape(-1),'j':j,'w':w,'m':mat,'c':colors})

def param_ellipsoid(name,center,radii,material,joint,ring=32,seg=48,facial=False,drape=0):
    cx,cy,cz=center;rx,ry,rz=radii
    vs=[];fs=[]
    for i in range(ring+1):
        theta=math.pi*(i/ring)
        for k in range(seg+1):
            phi=math.pi*2*k/seg
            x=math.sin(theta)*math.cos(phi);y=math.cos(theta);z=math.sin(theta)*math.sin(phi)
            cheek=1.0
            if facial:
                cheek=.94+.07*max(y,-.45)-.12*max(-y,0)
                if z>.25 and abs(x)<.65: cheek+=.035
            fold= 1+ drape*(math.sin(phi*12+theta*8)*.45+math.sin(phi*19+theta*13)*.3)*max(.0,1-abs(y)*.5)
            vs.append((cx+rx*x*cheek*fold,cy+ry*y,cz+rz*z*fold))
    for i in range(ring):
        for j in range(seg):
            a=i*(seg+1)+j;b=a+seg+1
            fs.extend([(a,b,a+1),(a+1,b,b+1)])
    append_mesh(name,vs,fs,material,joint)

def tube(name,points,radii,material,joint,radseg=12):
    pts=np.array(points,float);vs=[];fs=[]
    for i,p in enumerate(pts):
        tang=pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]
        tang/=max(np.linalg.norm(tang),1e-8)
        ref=np.array([0,0,1.],float) if abs(tang[2])<.9 else np.array([0,1.,0],float)
        u=np.cross(tang,ref);u/=max(np.linalg.norm(u),1e-8);v=np.cross(tang,u)
        for s in range(radseg):
            a=2*math.pi*s/radseg;w=p+radii[i]*(math.cos(a)*u+math.sin(a)*v)
            vs.append(w)
    for i in range(len(pts)-1):
        for s in range(radseg):
            a=i*radseg+s;b=i*radseg+(s+1)%radseg;c=a+radseg;d=b+radseg
            fs.extend([(a,b,c),(b,d,c)])
    append_mesh(name,vs,fs,material,joint)

# Cushion and seated cross-legged robe with genuine modelling detail.
param_ellipsoid('Seat cushion',(0,.21,-.02),(1.01,.19,.64),5,1,ring=24)
for i in range(14):
    a=i/14*math.tau
    param_ellipsoid('Lap robe fold %02d'%i,(.78*math.cos(a),.4,.46*math.sin(a)),(.10,.14,.13),1 if i%3 else 0,1,ring=9,seg=12)
param_ellipsoid('Folded robe and legs',(0,.57,.12),(.94,.39,.65),0,1,drape=.085)
param_ellipsoid('Chest robe',(0,1.40,.01),(.66,.67,.45),0,2,drape=.055)
param_ellipsoid('Under-robe, right shoulder',(.38,1.78,.025),(.32,.29,.30),1,2,ring=22)
# diagonal garment strip draped over left shoulder and chest
for i in range(7):
    f=i/6
    tube('Diagonal sash ridge %d'%i,
      [(-.52+f*.52,1.94,.25+f*.22),(-.40+f*.42,1.76,.40+f*.15),(-.15+f*.20,1.54,.50),(.16+f*.24,1.25,.46)],
      [.039,.038,.035,.028],2 if i%2 else 1,2,radseg=10)
# Neck, head, mature sculptural geometry: not sphere-only, not scan quality.
param_ellipsoid('Neck',(0,1.96,.09),(.19,.23,.19),3,3,ring=20)
param_ellipsoid('Head and cheeks',(0,2.32,.14),(.38,.49,.345),3,4,ring=42,seg=64,facial=True)
param_ellipsoid('Chin',(0,2.04,.36),(.22,.13,.13),3,4,ring=14,seg=22)
for side in [-1,1]:
    param_ellipsoid('Ear %s'%side,(side*.385,2.32,.10),(.09,.145,.065),3,4,ring=18,seg=24)
    param_ellipsoid('Inner ear %s'%side,(side*.437,2.33,.135),(.025,.068,.025),4,4,ring=12)
    # older monk: subtle lowered eyelids, not cartoon circular eyes
    tube('Eyelid %s'%side,[(side*.095,2.33,.471),(side*.157,2.346,.463),(side*.227,2.335,.445)], [.012,.014,.011],4,4,radseg=8)
    tube('Brow %s'%side,[(side*.089,2.40,.471),(side*.16,2.423,.454),(side*.245,2.402,.435)], [.015,.014,.013],4,4,radseg=8)
    # cheeks with gentle wrinkles
    for j in range(2):
        tube('Smile fold %s%d'%(side,j),[(side*.19,2.21-j*.035,.459),(side*.225,2.17-j*.026,.433)], [.006,.005],3,4,radseg=7)
param_ellipsoid('Nose bridge',(0,2.262,.492),(.072,.125,.093),3,4,ring=22)
param_ellipsoid('Nose tip',(0,2.210,.572),(.094,.056,.072),3,4,ring=16)
tube('Gentle mouth',[(-.105,2.124,.469),(-.05,2.108,.484),(0,2.105,.489),(.05,2.108,.484),(.105,2.124,.469)], [.007]*5,4,4,radseg=8)
# sleeves and seated hands; upper and lower limbs are skinned to moving bones.
for side,upper,lower,wrist in [(-1,5,6,7),(1,8,9,10)]:
    shoulder=(side*.53,1.72,.02)
    elbow=(side*.75,1.25,.18)
    palm=(side*.25,.96,.65)
    tube('Outer sleeve %s'%side,[shoulder,(side*.69,1.51,.1),elbow],[.27,.245,.185],0 if side<0 else 1,upper,radseg=28)
    tube('Forearm %s'%side,[elbow,(side*.60,1.10,.39),palm],[.175,.13,.105],3,lower,radseg=22)
    param_ellipsoid('Hand %s'%side,palm,(.15,.085,.115),3,wrist,ring=18,seg=20)
    for f in range(3):
        x=side*(.25+(f-1)*.055)
        tube('Finger %s-%d'%(side,f),[(x,.95,.70),(x*.82,.92,.77)], [.023,.017],3,wrist,radseg=8)

# Build glTF 2.0 / GLB buffers without external resources.
chunks=[];views=[];accessors=[]
def put(blob,target=None):
    while sum(len(x) for x in chunks)%4:chunks.append(b'\0')
    off=sum(len(x) for x in chunks);chunks.append(blob)
    bv={'buffer':0,'byteOffset':off,'byteLength':len(blob)}
    if target: bv['target']=target
    views.append(bv);return len(views)-1

def accessor(array,type_name,component,target=None,include_bounds=False):
    arr=np.ascontiguousarray(array)
    vi=put(arr.tobytes(),target)
    acc={'bufferView':vi,'componentType':component,'count':len(arr),'type':type_name}
    if include_bounds:
        acc['min']=arr.min(axis=0).tolist() if arr.ndim>1 else [float(arr.min())]
        acc['max']=arr.max(axis=0).tolist() if arr.ndim>1 else [float(arr.max())]
    accessors.append(acc);return len(accessors)-1

primitives=[]
for m in meshes:
    v=accessor(m['v'],'VEC3',5126,34962,True)
    n=accessor(m['n'],'VEC3',5126,34962)
    j=accessor(m['j'],'VEC4',5123,34962)
    w=accessor(m['w'],'VEC4',5126,34962)
    ix=accessor(m['idx'],'SCALAR',5125,34963)
    primitives.append({'attributes':{'POSITION':v,'NORMAL':n,'JOINTS_0':j,'WEIGHTS_0':w},'indices':ix,'material':m['m'],'mode':4,'extras':{'part':m['name']}})

nodes=[{'name':'MonkMesh','mesh':0,'skin':0}]
for i,(name,parent,loc) in enumerate(zip(NAMES,PARENTS,LOCAL)):
    nodes.append({'name':name,'translation':list(map(float,loc)),'children':[]})
for i,p in enumerate(PARENTS):
    if p>=0:nodes[p+1]['children'].append(i+1)
for n in nodes:
    if n.get('children')==[]:del n['children']
ibm=[]
for p in GLOBAL:
    mat=np.eye(4,dtype=np.float32);mat[:3,3]=-p
    ibm.append(mat.T.reshape(-1))
ibm=np.asarray(ibm,dtype=np.float32)
ibm_acc=accessor(ibm,'MAT4',5126)
anim_samplers=[];channels=[]
times=np.array([0.,2.,4.,6.,8.],dtype=np.float32)
time_acc=accessor(times,'SCALAR',5126,include_bounds=True)
for joint,axis,amplitude in [(2,'z',.018),(4,'z',.014),(6,'z',.009),(9,'z',-.009)]:
    angles=[0.,amplitude,0.,-amplitude,0.]
    rots=[]
    for a in angles:
        rots.append([0.,0.,math.sin(a/2),math.cos(a/2)])
    aout=accessor(np.array(rots,dtype=np.float32),'VEC4',5126)
    anim_samplers.append({'input':time_acc,'output':aout,'interpolation':'LINEAR'})
    channels.append({'sampler':len(anim_samplers)-1,'target':{'node':joint+1,'path':'rotation'}})
asset={'asset':{'version':'2.0','generator':'Digital Zen Monastery V1.4 custom original model generator','extras':{'visual_fidelity':'stylised mesh; not a photorealistic human scan'}},
  'scene':0,'scenes':[{'nodes':[0,1]}],'nodes':nodes,
  'meshes':[{'name':'Seated Monk — original skinned mesh','primitives':primitives}],
  'skins':[{'name':'Seated monk bone hierarchy','inverseBindMatrices':ibm_acc,'joints':list(range(1,len(NAMES)+1)),'skeleton':1}],
  'animations':[{'name':'breathing-idle','samplers':anim_samplers,'channels':channels}],
  'materials':[{'name':name,'pbrMetallicRoughness':{'baseColorFactor':list(col),'metallicFactor':0,'roughnessFactor':r},'doubleSided':True} for name,col,r in materials],
  'buffers':[{'byteLength':sum(map(len,chunks))}],'bufferViews':views,'accessors':accessors}
js=json.dumps(asset,ensure_ascii=False,separators=(',',':')).encode('utf-8');js+=b' ' *((4-len(js)%4)%4)
buff=b''.join(chunks);buff+=b'\0'*((4-len(buff)%4)%4)
asset['buffers'][0]['byteLength']=len(buff)
js=json.dumps(asset,ensure_ascii=False,separators=(',',':')).encode('utf-8');js+=b' '*((4-len(js)%4)%4)
total=12+8+len(js)+8+len(buff)
OUT.write_bytes(struct.pack('<III',0x46546c67,2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(buff),b'BIN\0')+buff)
print(f'Generated {OUT.name}: {OUT.stat().st_size/1024:.0f} KB, {len(primitives)} skinned mesh parts, {len(NAMES)} bones, 1 animation, {sum(len(m["v"]) for m in meshes)} vertices')
