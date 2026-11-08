#version 300 es
// Ports packages/glass/src/{refraction,apple-material}.ts and materialContours.
// Retained adaptation: see NOTICE.md and the repository's THIRD_PARTY_NOTICES.md.
precision highp float;
uniform sampler2D source;
uniform vec2 size;
uniform vec4 material;
uniform int paintRim;
in vec2 uv;
in vec2 point;
flat in vec4 box;
flat in vec4 lens;
out vec4 color;
/* material-tone */
vec3 paint(vec3 c) {
  float amount=clamp((min(box.z,box.w)/material.w-60.)/60.,0.,1.);
  return calibratedTone(c,amount,0.,material.y);
}
float tail(float distance,float sigma) {
  float x=distance/(sqrt(2.)*sigma),t=1./(1.+.3275911*x);
  return (((((1.061405429*t-1.453152027)*t+1.421413741)*t-.284496736)*t+.254829592)*t)*exp(-x*x);
}
float signedDistance(vec2 p,float shift,float spread) {
  float r=max(0.,lens.x+spread);
  vec2 q=abs(p-vec2(shift,0))-(box.zw*.5+spread-r);
  return length(max(q,0.))+min(max(q.x,q.y),0.)-r;
}
float coverage(float d) { return clamp(.5-d*2./material.w,0.,1.); }
float contour(vec2 p) {
  float dpr=material.w;
  float outsideInner=1.-coverage(signedDistance(p,0.,-.5*dpr));
  float centre=coverage(signedDistance(p,0.,0.))*outsideInner;
  float left=coverage(signedDistance(p,-1.25*dpr,-.75*dpr))*outsideInner;
  float right=coverage(signedDistance(p,1.25*dpr,-.75*dpr))*outsideInner;
  return floor(255.*max(0.,1.-(centre+left+right)*(1.-166./255.))+.5)/255.;
}
float shade(float y,float height) {
  if(material.z>=2.) return 0.;
  bool dark=material.y==1., panel=material.z==1.;
  float peak=panel ? 0. : (dark ? 6.5 : 8.)/255.;
  float shadow=peak*exp(-pow((y/height-.2)/.3,2.));
  float reflection=panel&&dark
    ? (9.6*tail(y,2.6)+14.2*tail(height-y,5.9))/255.
    : (dark ? 26. : 40.)/255.*exp(-(height-y)/(10./3.));
  return floor(255.*(.5-shadow+reflection)+.5)/255.-.5;
}
void main() {
  float dpr=material.w;
  vec2 p=point-box.xy-box.zw*.5;
  vec2 q=abs(p)-(box.zw*.5-lens.x);
  vec2 outside=max(q,0.); float lengthOut=length(outside);
  float inside=lens.x-(lengthOut+min(max(q.x,q.y),0.));
  vec2 normal=lengthOut>0. ? outside/lengthOut*sign(p) : (q.x>q.y ? vec2(sign(p.x),0) : vec2(0,sign(p.y)));
  float shift=0.;
  if(inside>=0. && inside<lens.y) {
    float t=max(.001,inside/lens.y);
    float surface=pow(1.-pow(1.-t,4.),.25);
    float incident=atan(pow(1.-t,3.)/pow(surface,3.));
    shift=tan(incident-asin(sin(incident)/1.5))*(lens.z+surface*lens.y)*lens.w;
  }
  vec2 displacement=-normal*shift/size*vec2(1,-1);
  vec3 c=vec3(texture(source,uv+displacement*1.02).r,texture(source,uv+displacement).g,texture(source,uv+displacement*.98).b);
  if(material.y==1. && material.z<2.) c=max(c+contour(p)-1.,0.);
  c=clamp(paint(c)+shade((point.y-box.y)/dpr,box.w/dpr),0.,1.);
  float distance=inside/dpr;
  float glint=pow(max(-normal.y,0.),5.), reflected=pow(max(normal.y,0.),5.);
  float rim=exp(-pow((distance-.5)/.38,2.));
  float bloom=exp(-pow(distance/.22,2.));
  float alphaLight=clamp((rim*(.015+.25*glint+.05*reflected)+bloom*.02*glint)*.8,0.,1.);
  if(paintRim!=0) c=mix(c,vec3(1),alphaLight);
  color=vec4(c,clamp(inside+.5,0.,1.));
}
