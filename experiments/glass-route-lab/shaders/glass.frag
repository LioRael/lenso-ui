#version 300 es
precision highp float;
uniform sampler2D source;
uniform vec2 size;
uniform vec4 material;
in vec2 uv;
in vec2 point;
flat in vec4 box;
flat in vec4 lens;
out vec4 color;
float lum(vec3 c) { return dot(c,vec3(.3,.59,.11)); }
vec3 setLum(vec3 c,float target) {
  c+=target-lum(c); float l=lum(c), low=min(c.r,min(c.g,c.b)), high=max(c.r,max(c.g,c.b));
  if(low<0.) c=l+(c-l)*l/(l-low);
  if(high>1.) c=l+(c-l)*(1.-l)/(high-l);
  return c;
}
vec3 paint(vec3 c) {
  if(material.x==26.) {
    if(material.y==1.) {
      vec3 burnt=max(vec3(0),1.-(1.-c)/.8);
      vec3 base=mix(c,burnt,material.z==0. ? .5 : 1.);
      return mix(c,base*.4*.94+.06,.67);
    }
    if(material.z==1.) return min(c/.85,1.)*.4+vec3(245./255.)*.6;
    return min(max(vec3(0),1.-(1.-(c*.35+.65))/(221./255.)),vec3(.969970703125));
  }
  if(material.z==1.) {
    if(material.y==0.) { c=c*.3+.7; return c*.9+min(c,vec3(191./255.))*.1; }
    c=mix(c,setLum(c,26./255.),.7);
    c=mix(c,setLum(c,26./255.),.9);
    return max(c,vec3(26./255.));
  }
  if(material.y==0.) { c=c*.5625+.41; return mix(c,setLum(c,248./255.),.2); }
  return clamp(c+.17*(.6-lum(c)),0.,1.);
}
void main() {
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
  float chroma=material.x==26. ? 0. : .02;
  vec3 c=vec3(texture(source,uv+displacement*(1.+chroma)).r,texture(source,uv+displacement).g,texture(source,uv+displacement*(1.-chroma)).b);
  c=paint(c);
  // A shared experimental rim, not a recovered Figma lighting kernel.
  float rim=exp(-max(inside,0.)/max(1.,material.w))*.12;
  c+=rim*dot(normal,normalize(vec2(-1,-1)));
  float alpha=smoothstep(0.,1.,inside);
  color=vec4(clamp(c,0.,1.),alpha);
}
