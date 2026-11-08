#version 300 es
precision highp float;
uniform sampler2D source;
uniform vec2 stepSize;
uniform float sigma;
in vec2 uv;
out vec4 color;
void main() {
  vec4 sum=vec4(0); float total=0.;
  for(int i=-72;i<=72;i++) {
    if(abs(float(i))>ceil(sigma*3.)) continue;
    float weight=exp(-float(i*i)/(2.*sigma*sigma));
    sum+=texture(source,uv+float(i)*stepSize)*weight; total+=weight;
  }
  color=sum/total;
}
