import runpy,json,time
h=runpy.run_path('/tmp/lenso-native-catalog-android-qa.py',run_name='catalog_helpers')
call,dump,find,shot,tapnode,seek,top,scroll=[h[k]for k in ['call','dump','find','shot','tapnode','seek','top','scroll']]
out=h['out'];results=[]
def texts(r):return [n.get('text')for n in r.iter('node')if n.get('text')]
def tap(label,cls=None):
 r,n=seek(label,cls);tapnode(n);return dump('after-'+str(len(results)))
def expect_text(label):
 r,n=seek(label);assert n is not None;return r

def record(case,**extra):
 results.append({'case':case,'passed':True,**extra});(out/'results.json').write_text(json.dumps(results,indent=2)+'\n');print(results[-1],flush=True)
def edit(label,text,submit=False):
 r,n=seek(label,'EditText');tapnode(n);call('shell','input','keyevent','123');call('shell','input','text',text)
 r=dump('typed-'+label.replace(' ','-'));field=find(r,label,'EditText');assert field is not None
 value=field.get('text');call('shell','input','keyevent','66'if submit else'4');return value
try:
 r=dump('fresh-host')
 for _ in range(8):
  if find(r,'Open native catalog')is not None or find(r,'Back to Glass')is not None:break
  r=dump('wait-native-root')
 n=find(r,'Open native catalog')
 if n is None:
  top();r,n=seek('Back to Glass');tapnode(n);r,n=seek('Open native catalog')
 tapnode(n)
 top();expect_text('Native controls');shot('accepted-top-light')
 r=tap('Save settings');assert 'Actions 1'in texts(r);record('ordinary button invokes once')
 r,n=seek('Disabled action');assert n.get('enabled')=='false';tapnode(n);r=dump('disabled-button');assert'Actions 1'in texts(r);record('disabled button blocks callback')
 tap('Start loading');r,n=seek('Loading action, busy','Button');assert n.get('enabled')=='false';tapnode(n);r=dump('loading-button');assert'Actions 1'in texts(r);shot('accepted-loading');record('loading blocks callback and retains label')
 tap('Stop loading')
 assert edit('Name','X',submit=True)=='AdaX';expect_text('Name value: AdaX');record('native single-line editing accepted')
 assert edit('Notes','X')=='Bring notesX';expect_text('Notes value: Bring notesX');record('native multiline editing accepted')
 assert edit('Search notes','catalog',submit=True)=='catalog';expect_text('Search submitted: catalog');record('native search submission')
 r,n=seek('Read only','EditText');old=n.get('text');tapnode(n);call('shell','input','text','Z');r=dump('readonly-field');assert find(r,'Read only','EditText').get('text')==old;record('read-only field rejects edits')
 r,n=seek('Disabled field','EditText');old=n.get('text');tapnode(n);call('shell','input','text','Z');r=dump('disabled-field');assert find(r,'Disabled field','EditText').get('text')==old;record('disabled field rejects edits')
 tap('Push updates');expect_text('Delivery email,push');record('checkbox group accepts a value')
 tap('Business plan');expect_text('Plan business');record('radio group accepts a value')
 tap('Italic');expect_text('Format bold,italic');r,n=seek('Italic');assert n.get('checked')=='true';record('toggle group accepts a value and native checked state')
 top();r,n=seek('Name','EditText');held_name=n.get('text');expect_text('Name value: '+held_name)
 top();tap('Hold values');expect_text('Owner values: held')
 assert edit('Name','Z',submit=True)==held_name;expect_text('Name value: '+held_name);record('controlled native text rejects proposal', ownerValue=held_name)
 tap('Push updates');expect_text('Delivery email,push');r,n=seek('Push updates');assert n.get('checked')=='true';record('controlled checkbox rejects proposal')
 tap('Personal plan');expect_text('Plan business');record('controlled radio rejects proposal')
 tap('Italic');expect_text('Format bold,italic');record('controlled toggle rejects proposal')
 tap('Business');expect_text('Audience personal');record('controlled segmented choice rejects proposal')
 tap('Increase guests');expect_text('Guests 2');record('controlled stepper rejects proposal')
 top();tap('Allow values');r=tap('Business');expect_text('Audience business');record('segmented choice accepts proposal')
 tap('Unavailable','RadioButton');expect_text('Audience business');record('disabled segment cannot select')
 tap('Increase guests');expect_text('Guests 3');r,n=seek('Increase guests');assert n.get('enabled')=='false';record('stepper accepts maximum and disables increment')
 tap('Decrease guests');tap('Decrease guests');expect_text('Guests 1');r,n=seek('Decrease guests');assert n.get('enabled')=='false';record('stepper accepts minimum and disables decrement')
 top();tap('Disable groups');r,n=seek('Email updates');assert n.get('enabled')=='false';tapnode(n);expect_text('Delivery email,push');record('parent disabled dominates explicit child false')
 top();tap('Enable groups');top();tap('Use dark appearance');expect_text('Use light appearance');shot('accepted-top-dark')
 r,n=seek('Name','EditText');shot('accepted-fields-dark');record('dark native fields rendered')
 r,n=seek('Audience business');shot('accepted-system-dark');record('dark system controls rendered')
 r,n=seek('Caller StyleX color');shot('accepted-feedback-dark');record('caller StyleX and feedback rendered')
 top();tap('Use light appearance');top();tap('Back to Glass');expect_text('Open native catalog');shot('accepted-glass-return');record('return to original Glass fixture')
except Exception as e:
 dump('failure');shot('failure');(out/'failure.txt').write_text(repr(e));raise
print('PASS',len(results),'actual Android interaction assertions',flush=True)
