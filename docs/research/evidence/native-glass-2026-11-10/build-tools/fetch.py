import pathlib,sys,subprocess,re,concurrent.futures,math,time,hashlib,os,fcntl
origin=sys.argv[1];url=origin.replace('https://repo.reactnative.dev/maven2/', 'https://maven.aliyun.com/repository/central/');out=pathlib.Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
url=url.replace('https://dl.google.com/android/repository/', 'https://redirector.gvt1.com/edgedl/android/repository/')
def curl(args):return subprocess.run(['/usr/bin/curl','--http1.1','-fsSL','--connect-timeout','12','--max-time','60',*args],capture_output=True)
head=curl(['-I',url]); sizes=re.findall(rb'content-length:\s*(\d+)',head.stdout,re.I)
if head.returncode or not sizes:raise RuntimeError('Could not read artifact length: '+url)
size=int(sizes[-1]);count=24 if size>256*1024*1024 else (8 if size>8*1024*1024 else 1);chunk=math.ceil(size/count)
folder=pathlib.Path('/tmp/lenso-native-net/ranges')/hashlib.sha256(origin.encode()).hexdigest();folder.mkdir(parents=True,exist_ok=True)
lock=(folder/'lock').open('w');fcntl.flock(lock.fileno(),fcntl.LOCK_EX)
known=out.stat().st_size if out.exists() else 0
for i in range(count):
 p=folder/str(i);start=i*chunk;length=min(chunk,size-start)
 if not p.exists() and known>start:
  with out.open('rb') as f:f.seek(start);p.write_bytes(f.read(min(length,known-start)))
def get(i):
 p=folder/str(i);start=i*chunk;end=min(size-1,start+chunk-1)
 temp=folder/(str(i)+'.new');headers=folder/(str(i)+'.headers')
 offset=p.stat().st_size if p.exists() else 0
 if temp.exists() and headers.exists() and f'content-range: bytes {start+offset}-' in headers.read_text().lower() and offset+temp.stat().st_size<=end-start+1:
  with p.open('ab') as f:f.write(temp.read_bytes())
  temp.unlink()
 for attempt in range(24):
  offset=p.stat().st_size if p.exists() else 0
  if offset==end-start+1:return p
  temp=folder/(str(i)+'.new');headers=folder/(str(i)+'.headers')
  r=curl(['-r',f'{start+offset}-{end}','-D',str(headers),url,'-o',str(temp)])
  if temp.exists() and f'content-range: bytes {start+offset}-' in headers.read_text().lower():
   with p.open('ab') as f:f.write(temp.read_bytes())
  if temp.exists():temp.unlink()
  if r.returncode not in [0,18,28,35,56,92]:print('range error',i,r.returncode,file=sys.stderr,flush=True)
  time.sleep(.2)
 raise RuntimeError('Incomplete range '+str(i))
with concurrent.futures.ThreadPoolExecutor(max_workers=count) as pool:parts=list(pool.map(get,range(count)))
complete=out.with_name(out.name+'.complete')
with complete.open('wb') as f:
 for p in parts:
  with p.open('rb') as src:
   while block:=src.read(1024*1024):f.write(block)
assert complete.stat().st_size==size
expected=sys.argv[3] if len(sys.argv)>3 else None
if expected is None:
 sha=curl([origin+'.sha1'])
 if sha.returncode==0:expected=sha.stdout.decode().strip().split()[0]
if expected and re.fullmatch('[0-9a-fA-F]{40}',expected):
 assert hashlib.sha1(complete.read_bytes()).hexdigest()==expected.lower(),'Artifact SHA1 mismatch'
os.replace(complete,out)
print('Verified complete artifact',url.rsplit('/',1)[-1],size,flush=True)
