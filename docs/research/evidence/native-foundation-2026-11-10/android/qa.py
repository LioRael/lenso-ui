from pathlib import Path
import subprocess,xml.etree.ElementTree as E,re,json,time
adb='/Users/leosouthey/Library/Android/sdk/platform-tools/adb'
out=Path('/Users/leosouthey/.codex/worktrees/native-glass-delivery/lenso-ui/output/native-catalog-2026-11-10/android');out.mkdir(parents=True,exist_ok=True)
def call(*args):return subprocess.check_output([adb,*args])
lastRoot=None
def dump(name):
 global lastRoot
 call('shell','uiautomator','dump','/sdcard/lenso-catalog.xml');data=call('shell','cat','/sdcard/lenso-catalog.xml');(out/(name+'.xml')).write_bytes(data);lastRoot=E.fromstring(data);return lastRoot
def bounds(n):return list(map(int,re.findall(r'\d+',n.get('bounds',''))))
def find(r,label,cls=None):
 nodes=[n for n in r.iter('node')if(n.get('text')==label or n.get('content-desc')==label)and(cls is None or n.get('class','').endswith(cls))]
 return next((n for n in nodes if n.get('clickable')=='true'),nodes[0]if nodes else None)
def shot(name):(out/(name+'.png')).write_bytes(call('exec-out','screencap','-p'))
def tapnode(n):
 assert n is not None
 x,y,xx,yy=bounds(n);assert yy>y and xx>x
 call('shell','input','tap',str((x+xx)//2),str((y+yy)//2))
def viewport():
 views=[n for n in lastRoot.iter('node')if n.get('class','').endswith('ScrollView')and n.get('scrollable')=='true']
 assert views,'No observed scroll viewport'
 return bounds(views[-1])
def scroll(direction='down'):
 x,y,xx,yy=viewport()
 if direction=='down':
  start=yy-50;end=max(y+40,start-min(450,(yy-y)//3));duration='700'
 else:
  start=y+max(60,(yy-y)//4);end=yy-50;duration='350'
 call('shell','input','swipe',str(x+12),str(start),str(x+12),str(end),duration)
def seek(label,cls=None,limit=24):
 for i in range(limit):
  r=dump('seek');n=find(r,label,cls)
  if n is not None:
   x,y,xx,yy=bounds(n)
   vx,vy,vxx,vyy=viewport()
   if y>=vy and yy<=vyy and yy>y:return r,n
  scroll()
 raise AssertionError('Not visible: '+label)
def top():
 for _ in range(12):scroll('up')
 return dump('top')
if __name__=='__main__':
 r=dump('before-catalog');n=find(r,'Open native catalog');assert n is not None
 tapnode(n);r=dump('catalog-initial');shot('catalog-initial')
 print([(n.get('text'),n.get('content-desc'),n.get('class'),n.get('bounds'))for n in r.iter('node')if n.get('text')or n.get('content-desc')])
 for i in range(1,6):scroll();r=dump('catalog-scroll-'+str(i));shot('catalog-scroll-'+str(i))
