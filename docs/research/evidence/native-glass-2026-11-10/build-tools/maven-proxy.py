import http.server, pathlib, urllib.parse, hashlib, subprocess, threading, time
ROOT=pathlib.Path('/tmp/lenso-native-net/maven-cache');ROOT.mkdir(exist_ok=True)
locks={}; guard=threading.Lock()
class Handler(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_HEAD(self):self.serve(False)
 def do_GET(self):self.serve(True)
 def serve(self,body):
  parsed=urllib.parse.urlsplit(self.path);host,sep,path=parsed.path.lstrip('/').partition('/')
  if host not in ['repo.maven.apache.org','repo1.maven.org','dl.google.com','plugins.gradle.org','plugins-artifacts.gradle.org','repo.reactnative.dev','maven.google.com','central.sonatype.com','oss.sonatype.org']:
   self.send_error(403);return
  url='https://'+host+'/'+path+('?' + parsed.query if parsed.query else '')
  name=hashlib.sha256(url.encode()).hexdigest();dest=ROOT/name;part=ROOT/(name+'.partial')
  original=url
  if host in ['repo.maven.apache.org','repo1.maven.org']:
   url='https://maven.aliyun.com/repository/central/'+path.removeprefix('maven2/')
  elif host=='plugins.gradle.org':
   url='https://maven.aliyun.com/repository/gradle-plugin/'+path.removeprefix('m2/')
  elif host in ['dl.google.com','maven.google.com']:
   url='https://maven.aliyun.com/repository/google/'+path.removeprefix('dl/android/maven2/').removeprefix('android/maven2/')

  with guard:lock=locks.setdefault(name,threading.Lock())
  with lock:
   if not dest.exists():
    success=False
    for attempt in range(10):
     args=['/usr/bin/curl','--http1.1','-fsSL','--connect-timeout','12','--max-time','60','--speed-time','15','--speed-limit','1024']
     if part.exists() and part.stat().st_size:args+=['-C','-']
     r=subprocess.run([*args,url,'-o',str(part)],capture_output=True)
     if r.returncode==0:
      part.rename(dest);success=True;print('CACHED',host+'/'+path,flush=True);break
     if r.returncode==22:

      if url!=original and host not in ['dl.google.com','maven.google.com']:
       url=original;continue
      print('NOT_FOUND',host+'/'+path,flush=True);self.send_error(404);return
     if r.returncode==33 and part.exists():part.unlink()
     print('RETRY',attempt+1,r.returncode,host+'/'+path,flush=True);time.sleep(0.5)
    if not success:self.send_error(502);return
  try:
   self.send_response(200);self.send_header('Content-Length',str(dest.stat().st_size));self.end_headers()
   if body:
    with dest.open('rb') as f:
     while chunk:=f.read(1024*1024):self.wfile.write(chunk)
  except (BrokenPipeError,ConnectionResetError):pass
http.server.ThreadingHTTPServer(('127.0.0.1',18791),Handler).serve_forever()
