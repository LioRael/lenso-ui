#version 300 es
precision highp float;
layout(location=0) in vec4 rect;
layout(location=1) in vec4 shape;
uniform vec2 size;
uniform int full;
out vec2 uv;
out vec2 point;
flat out vec4 box;
flat out vec4 lens;
void main() {
  vec2 corners[6] = vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
  vec2 corner=corners[gl_VertexID];
  point=full==1 ? corner*size : rect.xy+corner*rect.zw;
  uv=vec2(point.x/size.x,1.-point.y/size.y);
  box=rect; lens=shape;
  gl_Position=vec4(point.x/size.x*2.-1.,1.-point.y/size.y*2.,0,1);
}
