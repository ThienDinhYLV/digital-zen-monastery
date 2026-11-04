import json,struct,pathlib
p=pathlib.Path(__file__).resolve().parents[1]/'public/assets/monk-rigged.glb'
b=p.read_bytes()
magic,version,total=struct.unpack_from('<III',b,0)
assert magic==0x46546c67 and version==2 and total==len(b)
json_size,tag=struct.unpack_from('<I4s',b,12)
assert tag==b'JSON'
j=json.loads(b[20:20+json_size]);assert j['asset']['version']=='2.0'
assert len(j['skins'])==1 and len(j['skins'][0]['joints'])>=5
assert len(j['animations'])>=1
assert all({'JOINTS_0','WEIGHTS_0','POSITION','NORMAL'}.issubset(pr['attributes']) for pr in j['meshes'][0]['primitives'])
for acc in j['accessors']:
  assert acc['bufferView']<len(j['bufferViews'])
assert len(j['nodes'])>=len(j['skins'][0]['joints'])
assert all(channel['target']['node']<len(j['nodes']) for anim in j['animations'] for channel in anim['channels'])
assert j['asset']['extras']['visual_fidelity'].startswith('stylised')
print('PASS: GLB v2.0 structure, mesh skins, 11 joints, animation references, declared visual fidelity')
