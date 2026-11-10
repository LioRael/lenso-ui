#!/usr/bin/env python3
import argparse, json, re
from pathlib import Path
from collections import Counter
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('image')
parser.add_argument('hierarchy')
parser.add_argument('--label',default='Continue')
parser.add_argument('--output')
parser.add_argument('--button-id')
args=parser.parse_args()
im=Image.open(args.image).convert('RGB')
text=Path(args.hierarchy).read_text()
window=re.search(r'Window[^\n]*\{\{([\d.-]+), ([\d.-]+)\}, \{([\d.-]+), ([\d.-]+)\}\}',text)
if not window: raise SystemExit('No window frame in actual AX hierarchy')
scale=im.width/float(window.group(3))
pattern=r"StaticText[^\n]*\{\{([\d.-]+), ([\d.-]+)\}, \{([\d.-]+), ([\d.-]+)\}\}[^\n]*label: '"+re.escape(args.label)+"'"
if args.button_id:
    anchor=re.search(r"Button[^\n]*identifier: '"+re.escape(args.button_id)+r"'[^\n]*\n",text)
    if not anchor: raise SystemExit('No observed button identifier')
    text=text[anchor.end():]
match=re.search(pattern,text)
if not match: raise SystemExit('No observed title StaticText frame')
x,y,w,h=map(float,match.groups())
box=tuple(round(v*scale) for v in (x,y,x+w,y+h))
counts=Counter(im.crop(box).getdata())
core={rgb:n for rgb,n in counts.items() if rgb[1]>=235 and rgb[2]>=235 and rgb[0]>=80}
total=sum(core.values())
neutral=sum(n for rgb,n in core.items() if min(rgb)>=235 and max(rgb)-min(rgb)<=12)
cyan=sum(n for rgb,n in core.items() if min(rgb[1:])-rgb[0]>=35)
result={'image':args.image,'observed_title_frame':[x,y,w,h],'pixel_box':box,'core_pixel_count':total,'neutral_white_pixels':neutral,'cyan_pixels':cyan,'neutral_white_fraction':neutral/max(total,1),'dominant_core_colors':Counter(core).most_common(6)}
result['passes_neutral_white']=total>=100 and result['neutral_white_fraction']>=.8 and cyan/max(total,1)<.1
out=json.dumps(result,indent=2)
print(out)
if args.output:Path(args.output).write_text(out+'\n')
raise SystemExit(0 if result['passes_neutral_white'] else 1)
