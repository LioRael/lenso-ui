// Foreground recipe adapted from onlymoein/liquidglass, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified: synchronous GPU contour and pixel-area coverage.
import type { Shape } from "./optical-fields.js";

// Same signed-distance recipe and pixel-area coverage as foregroundRimPixels.
// One offscreen context serves every live rim; consumers copy the completed frame.
let renderer: ReturnType<typeof createRenderer> | null | undefined;
const owners = new Set<object>();
function createRenderer() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
  });
  if (!gl) return;
  const shader = (type: number, source: string) => {
    const node = gl.createShader(type)!;
    gl.shaderSource(node, source);
    gl.compileShader(node);
    return node;
  };
  const vertex = shader(
    gl.VERTEX_SHADER,
    `#version 300 es
    void main() {
      vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);
      gl_Position=vec4(p*2.0-1.0,0,1);
    }`,
  );
  const fragment = shader(
    gl.FRAGMENT_SHADER,
    `#version 300 es
    precision highp float;
    uniform vec2 size, resolution;
    uniform float radius, shine, clarity, panel, angle;
    out vec4 color;
    float distanceAt(vec2 p) {
      vec2 q=abs(p)-(size*.5-radius);
      return radius-length(max(q,0.0))-min(max(q.x,q.y),0.0);
    }
    vec2 sampleAt(vec2 p) {
      vec2 q=abs(p)-(size*.5-radius), o=max(q,0.0);
      float len=length(o), d=radius-len-min(max(q.x,q.y),0.0);
      if(d>24.0)return vec2(0);
      vec2 n=len>0.0?o/len*sign(p):(q.x>q.y?vec2(sign(p.x),0):vec2(0,sign(p.y)));
      float vertical=n.y*cos(angle)-n.x*sin(angle);
      float end=vertical*vertical, side=max(0.0,1.0-end), light=0.0, shade=0.0;
      if(d>=0.0) {
        float line=max(0.0,.39-.29*d);
        if(panel>0.5)light=end*(d<1.0?1.0:.55*exp(-(d-1.0)/1.8));
        else if(vertical<0.0) {
          light=end*(line+(d>1.0?.05*max(0.0,1.0-(d-1.0)/2.5):0.0));
          shade=end*.02*clamp((d-1.5)/1.5,0.0,1.0)*exp(-.5*pow((d-3.0)/4.0,2.0));
        } else if(vertical>0.0)light=end*line;
        shade+=side*.028*exp(-.5*pow(d/10.0,2.0));
      } else shade=(side*.75+end*.2)*clamp(1.0+d/.75,0.0,1.0);
      light=min(1.0,light*shine*(1.0+clarity*1.1));shade=min(1.0,shade*shine);
      float alpha=light+shade-light*shade;
      return alpha>0.0?vec2(light/(light+shade)*alpha,alpha):vec2(0);
    }
    void main() {
      vec2 pitch=(size+2.0)/resolution;
      vec2 p=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y)*pitch-1.0-size*.5;
      float d=distanceAt(p);
      if(d>24.0 || d < -1.5){color=vec4(0);return;}
      vec2 q=abs(p)-(size*.5-radius);
      int count=abs(d)<length(pitch)*.5?16:(d> -1.1 && d<1.7?4:1);
      int nx=q.x<=0.0 && q.y>=q.x?1:count, ny=q.y<=0.0 && q.x>q.y?1:count;
      vec2 sum=vec2(0);
      for(int y=0;y<16;y++) {
        if(y>=ny)break;
        for(int x=0;x<16;x++) {
          if(x>=nx)break;
          sum+=sampleAt(p+(vec2(float(x)+.5,float(y)+.5)/vec2(nx,ny)-.5)*pitch);
        }
      }
      sum/=float(nx*ny);
      color=vec4(vec3(sum.x),sum.y);
    }`,
  );
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return;
  }
  const uniforms = Object.fromEntries(
    ["size", "resolution", "radius", "shine", "clarity", "panel", "angle"].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );
  return {
    canvas,
    release() {
      canvas.width = canvas.height = 1;
    },
    paint(width: number, height: number, radius: number, shape: Shape, layout = { width, height }) {
      if (gl.isContextLost()) return;
      const columns = Math.ceil((width + 2) * 2),
        rows = Math.ceil((height + 2) * 2);
      // Reserve the resting panel in 128px steps; the viewport keeps the exact
      // animated pixel grid while the drawing buffer avoids per-frame reallocations.
      const capacityWidth = Math.ceil(Math.max(columns, (layout.width + 2) * 2) / 128) * 128;
      const capacityHeight = Math.ceil(Math.max(rows, (layout.height + 2) * 2) / 128) * 128;
      if (canvas.width < capacityWidth) canvas.width = capacityWidth;
      if (canvas.height < capacityHeight) canvas.height = capacityHeight;
      gl.viewport(0, 0, columns, rows);
      gl.useProgram(program);
      gl.uniform2f(uniforms["size"]!, width, height);
      gl.uniform2f(uniforms["resolution"]!, columns, rows);
      gl.uniform1f(uniforms["radius"]!, radius);
      gl.uniform1f(uniforms["shine"]!, Math.max(0, (shape.lightIntensity ?? 0.25) / 0.25));
      gl.uniform1f(
        uniforms["clarity"]!,
        shape.materialProfile === "clear" ? 1 : (shape.materialClarity ?? 0),
      );
      gl.uniform1f(
        uniforms["panel"]!,
        Number(shape.appleMode === "light" && shape.materialProfile === "medium"),
      );
      gl.uniform1f(uniforms["angle"]!, (shape.lightAngle * Math.PI) / 180);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return { canvas, width: columns, height: rows };
    },
  };
}

export function paintLiveRim(
  width: number,
  height: number,
  radius: number,
  shape: Shape,
  layout?: { width: number; height: number },
  owner?: object,
) {
  if (renderer === undefined) renderer = createRenderer() ?? null;
  const frame = renderer?.paint(width, height, radius, shape, layout);
  if (frame && owner) owners.add(owner);
  return frame;
}

export function releaseLiveRim(owner: object) {
  if (owners.delete(owner) && !owners.size) renderer?.release();
}
