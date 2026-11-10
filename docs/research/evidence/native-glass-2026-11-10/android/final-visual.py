import subprocess,xml.etree.ElementTree as E,re,pathlib
adb='/Users/leosouthey/Library/Android/sdk/platform-tools/adb';out=pathlib.Path('output/native-glass-2026-11-10/android')
def run(*a):return subprocess.check_output([adb,*a])
def tap(label):
 run('shell','uiautomator','dump','/sdcard/lenso.xml');r=E.fromstring(run('shell','cat','/sdcard/lenso.xml'));n=next(n for n in r.iter('node') if n.get('content-desc')==label);b=list(map(int,re.findall(r'\d+',n.get('bounds'))));run('shell','input','tap',str((b[0]+b[2])//2),str((b[1]+b[3])//2))
def shot(name):
 run('shell','uiautomator','dump','/sdcard/lenso.xml');(out/(name+'.xml')).write_bytes(run('shell','cat','/sdcard/lenso.xml'));(out/(name+'.png')).write_bytes(run('exec-out','screencap','-p'))
run('shell','input','swipe','500','500','500','1800','500');shot('final-light');tap('Use dark appearance');shot('final-dark');tap('Reduce transparency');shot('final-opaque');tap('Restore transparency');tap('Use light appearance');shot('final-restored')
