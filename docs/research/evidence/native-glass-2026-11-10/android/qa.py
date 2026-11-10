import subprocess,xml.etree.ElementTree as E,pathlib,re,json
adb='/Users/leosouthey/Library/Android/sdk/platform-tools/adb';out=pathlib.Path('output/native-glass-2026-11-10/android');results=[]
def call(*args):return subprocess.check_output([adb,*args])
def dump(name):
 call('shell','uiautomator','dump','/sdcard/lenso.xml');data=call('shell','cat','/sdcard/lenso.xml');(out/(name+'.xml')).write_bytes(data);return E.fromstring(data)
def find(root,label):
 nodes=[n for n in root.iter('node') if n.get('content-desc')==label];return nodes[0] if nodes else next(n for n in root.iter('node') if n.get('text')==label)
def xy(n):
 a=list(map(int,re.findall(r'\d+',n.get('bounds'))));return (a[0]+a[2])//2,(a[1]+a[3])//2
r=dump('initial')
def tap(label):
 global r
 x,y=xy(find(r,label));call('shell','input','tap',str(x),str(y));r=dump('after-'+str(len(results)))
def texts():return [n.get('text') for n in r.iter('node') if n.get('text')]
def shot(name):(out/(name+'.png')).write_bytes(call('exec-out','screencap','-p'))
tap('Notifications');assert find(r,'Notifications').get('checked')!='true';results.append('switch accepted off')
n=next(n for n in r.iter('node') if n.get('content-desc')=='Notifications');assert n.get('checked')=='false'
n=find(r,'Level');x,y=xy(n);call('shell','input','swipe',str(x),str(y),str(x+190),str(y),'450');r=dump('slider-accepted');value=next(x for x in texts() if x.startswith('Level '));assert value!='Level 42';results.append('slider accepted '+value)
tap('Continue');assert 'Actions 1' in texts();results.append('button callback once')
tap('Hold controlled values');before=value
tap('Notifications');n=next(n for n in r.iter('node') if n.get('content-desc')=='Notifications');assert n.get('checked')=='false';results.append('switch rejected proposal restored')
n=find(r,'Level');x,y=xy(n);call('shell','input','swipe',str(x),str(y),str(x-190),str(y),'450');r=dump('slider-rejected');assert before in texts();results.append('slider rejected proposal retained '+before)
shot('light');tap('Use dark appearance');shot('dark');results.append('dark appearance toggled')
tap('Reduce transparency');shot('opaque');assert find(r,'Restore transparency') is not None;results.append('opaque fallback toggled')
tap('Restore transparency');tap('Use light appearance');shot('restored');
call('shell','input','swipe','8','1600','8','700','500');r=dump('backdrop-scrolled');shot('backdrop-scrolled');results.append('independent backdrop scroll performed')
(out/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
