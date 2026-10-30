from PIL import Image
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT.parent/'generated_images';OUT=ROOT/'a/stage_props';OUT.mkdir(exist_ok=True)
sheets=[('exec-2203ec12-e4d7-43c5-9baa-b1cf0e6041a9.png',3,2,'jar lever_off plate_off torch_on stone_on chain_on'.split()),('exec-c1292314-7f22-4940-8449-39f26a496225.png',4,3,'jar_broken lever_on plate_on torch_off stone_off chain_off supply supply_burnt barricade barricade_broken bridge bridge_broken'.split()),('exec-c35d2a86-db37-481b-a7ea-c76c1c8910a8.png',3,3,'gate_open door_closed door_open bars_closed bars_open cave stairs_up stairs_down inner_gate'.split()),('exec-e697642b-246c-4e5c-9839-f85fe46217dc.png',3,3,'flag_red flag_blue beacon_on beacon_off boat_off trap npc1 npc2 npc3'.split()),('exec-c8af8f1b-50f4-4604-bc6c-6a3fb4d5838c.png',1,1,['tower']),('exec-a5bf5356-5cb2-4c75-954d-926e253241b3.png',1,1,['gate_closed']),('exec-93acb738-c4eb-4904-8377-6303d6eaff5e.png',1,1,['boat_on'])]
manifest={}
for file,cols,rows,names in sheets:
 im=Image.open(SRC/file).convert('RGBA');w,h=im.size
 for i,name in enumerate(names):
  c,r=i%cols,i//cols
  bounds=(round(c*w/cols),round(r*h/rows),round((c+1)*w/cols),round((r+1)*h/rows))
  if file.startswith('exec-c35'):
   xs=[0,600,980,w] if r==0 else [0,460,930,w];ys=[0,400,760,h]
   bounds=(xs[c],ys[r],xs[c+1],ys[r+1])
  tile=im.crop(bounds)
  # Crop only: alpha threshold identifies the painted body, excludes distant faint glow.
  box=tile.getchannel('A').point(lambda a:255 if a>100 else 0).getbbox()
  if not box:raise ValueError(name)
  tile=tile.crop(box);tile.thumbnail((384,384),Image.Resampling.LANCZOS)
  tile.save(OUT/(name+'.png'),optimize=True)
  manifest[name]={'width':tile.width,'height':tile.height,'source':file,'cell':i}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(len(manifest),'sprites')
