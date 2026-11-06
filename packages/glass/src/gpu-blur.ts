// WebKit filter adaptation. SPDX-License-Identifier: LGPL-2.0-or-later.
// See THIRD_PARTY_NOTICES.md for source provenance.
// Integer box convolutions preserve WebKit's blur kernel and rounding.
import { computePipeline } from "./gpu-pipeline.js";

export async function createPrimaryBlur(
  device: GPUDevice,
  {
    source,
    destination,
    width: imageWidth,
    height: imageHeight,
    dpr,
    sigma,
  }: {
    source: GPUTexture;
    destination: GPUTexture;
    width: number;
    height: number;
    dpr: number;
    sigma: number;
  },
) {
  let kernel = Math.max(2, Math.floor(sigma * dpr * 0.75 * Math.sqrt(2 * Math.PI) + 0.5));
  if (kernel % 2 === 0) kernel++;
  if (kernel > 15)
    return createSeparableBlur(device, source, destination, imageWidth, imageHeight, kernel);
  const radius = (kernel - 1) / 2,
    width = kernel > 15 ? 8 : 16,
    height = kernel > 15 ? 4 : 8,
    paddedWidth = width + 2 * radius,
    paddedHeight = height + 2 * radius;
  const textures = Array.from({ length: 2 }, () =>
    device.createTexture({
      size: [imageWidth, imageHeight],
      format: "rgba8uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    }),
  );
  const regionBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const shader = (first: boolean, final: boolean) => `
 @group(0)@binding(0)var input:texture_2d<${first ? "f32" : "u32"}>;
 @group(0)@binding(1)var output:texture_storage_2d<${final ? "rgba8unorm" : "rgba8uint"},write>;
 @group(0)@binding(2)var<uniform> region:vec4u;
 var<workgroup> pixels:array<${kernel > 15 ? "u32" : "vec4u"},${paddedWidth * paddedHeight}>;
 var<workgroup> horizontal:array<vec4u,${width * paddedHeight}>;
 @compute @workgroup_size(${width},${height})
 fn main(@builtin(workgroup_id)group:vec3u,@builtin(local_invocation_id)local:vec3u,@builtin(local_invocation_index)index:u32) {
  let origin=vec2i(group.xy*vec2u(${width},${height})+vec2u(region.x,0));
  for(var i=index;i<${paddedWidth * paddedHeight};i+=${width * height}){
   let p=origin+vec2i(i32(i%${paddedWidth}),i32(i/${paddedWidth}))-vec2i(${radius});
   var value=vec4u(0);
   if(all(p>=vec2i(0))&&all(p<vec2i(${imageWidth},${imageHeight}))){let c=${first ? "vec4u(round(textureLoad(input,p,0)*255))" : "textureLoad(input,p,0)"};value=${first ? "select(vec4u((c.rgb*c.a+vec3u(127))/255,c.a),c,region.w==1u)" : "c"};}
   pixels[i]=${kernel > 15 ? "value.r|(value.g<<8u)|(value.b<<16u)|(value.a<<24u)" : "value"};
  }
  workgroupBarrier();
  for(var i=index;i<${width * paddedHeight};i+=${width * height}){
   let base=(i/${width})*${paddedWidth}+i%${width};var sum=vec4u(0);
   for(var x=0u;x<${kernel};x++){${kernel > 15 ? "let c=pixels[base+x];sum+=vec4u(c,c>>8u,c>>16u,c>>24u)&vec4u(255);" : "sum+=pixels[base+x];"}}
   horizontal[i]=sum;
  }
  workgroupBarrier();
  let p=origin+vec2i(local.xy);
  if(p.x>=i32(region.y)||p.y>=i32(region.z)){return;}
  var sum=vec4u(0);
  for(var y=0u;y<${kernel};y++){sum+=horizontal[(local.y+y)*${width}+local.x];}
  let value=(sum+vec4u(${Math.floor((kernel * kernel) / 2)}))/${kernel * kernel};
  textureStore(output,p,${final ? "vec4f(value)/255" : "value"});
 }`;
  const passes: { pipeline: GPUComputePipeline; group: GPUBindGroup }[] = [];
  try {
    const pipelines = await Promise.all(
      Array.from({ length: 3 }, (_, index) =>
        computePipeline(device, shader(index === 0, index === 2)),
      ),
    );
    for (let index = 0; index < 3; index++) {
      const pipeline = pipelines[index]!;
      const input = index === 0 ? source : textures[index - 1]!,
        out = index === 2 ? destination : textures[index]!;
      const group = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: input.createView() },
          { binding: 1, resource: out.createView() },
          { binding: 2, resource: { buffer: regionBuffer } },
        ],
      });
      passes.push({ pipeline, group });
    }
  } catch (error) {
    regionBuffer.destroy();
    for (const texture of textures) texture.destroy();
    throw error;
  }
  return {
    render(
      encoder: GPUCommandEncoder,
      region: { width: number; height: number; premultiplied: boolean },
    ) {
      const x = 0,
        end = region.width;
      device.queue.writeBuffer(
        regionBuffer,
        0,
        new Uint32Array([x, end, region.height, Number(region.premultiplied)]),
      );
      for (const { pipeline, group } of passes) {
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(Math.ceil((end - x) / width), Math.ceil(region.height / height));
        pass.end();
      }
    },
    dispose() {
      regionBuffer.destroy();
      for (const texture of textures) texture.destroy();
    },
  };
}

// Keep the horizontal sum unrounded. Rounding only after the vertical sum is
// exactly the same integer 2D box convolution, with much less repeated work.
async function createSeparableBlur(
  device: GPUDevice,
  source: GPUTexture,
  destination: GPUTexture,
  imageWidth: number,
  imageHeight: number,
  kernel: number,
) {
  const radius = (kernel - 1) / 2;
  const textures = ["rgba8uint", "rgba8uint", "rg32uint"].map((format) =>
    device.createTexture({
      size: [imageWidth, imageHeight],
      format: format as GPUTextureFormat,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    }),
  );
  const sums = textures[2]!;
  const regionBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const shader = (index: number) => {
    const horizontal = index % 2 === 0;
    const paddedWidth = horizontal ? 16 + 2 * radius : 16;
    const paddedHeight = horizontal ? 8 : 8 + 2 * radius;
    return `
@group(0)@binding(0)var input:texture_2d<${index === 0 ? "f32" : "u32"}>;
@group(0)@binding(1)var output:texture_storage_2d<${horizontal ? "rg32uint" : index === 5 ? "rgba8unorm" : "rgba8uint"},write>;
@group(0)@binding(2)var<uniform> region:vec4u;
var<workgroup> pixels:array<vec4u,${paddedWidth * paddedHeight}>;
@compute @workgroup_size(16,8)
fn main(@builtin(workgroup_id)group:vec3u,@builtin(local_invocation_id)local:vec3u,@builtin(local_invocation_index)index:u32){
 let origin=vec2i(group.xy*vec2u(16,8)+vec2u(region.x,0));
 for(var i=index;i<${paddedWidth * paddedHeight};i+=128u){
  let p=origin+vec2i(i32(i%${paddedWidth}),i32(i/${paddedWidth}))-vec2i(${horizontal ? radius : 0},${horizontal ? 0 : radius});
  var value=vec4u(0);
  if(all(p>=vec2i(0))&&all(p<vec2i(${imageWidth},${imageHeight}))){
   let c=${index === 0 ? "vec4u(round(textureLoad(input,p,0)*255))" : "textureLoad(input,p,0)"};
   value=${index === 0 ? "select(vec4u((c.rgb*c.a+vec3u(127))/255,c.a),c,region.w==1u)" : horizontal ? "c" : "vec4u(c.r&65535u,c.r>>16u,c.g&65535u,c.g>>16u)"};
  }
  pixels[i]=value;
 }
 workgroupBarrier();
 let p=origin+vec2i(local.xy);
 if(p.x>=i32(region.y)||p.y>=i32(region.z)){return;}
 var sum=vec4u(0);
 for(var i=0u;i<${kernel};i++){sum+=pixels[local.y*${paddedWidth}+local.x+i*${horizontal ? 1 : paddedWidth}];}
 ${
   horizontal
     ? "textureStore(output,p,vec4u(sum.r|(sum.g<<16u),sum.b|(sum.a<<16u),0,0));"
     : `let value=(sum+vec4u(${Math.floor((kernel * kernel) / 2)}))/${kernel * kernel};textureStore(output,p,${index === 5 ? "vec4f(value)/255" : "value"});`
 }
}`;
  };
  const dispose = () => {
    regionBuffer.destroy();
    for (const texture of textures) texture.destroy();
  };
  try {
    const pipelines = await Promise.all(
      Array.from({ length: 6 }, (_, index) => computePipeline(device, shader(index))),
    );
    const passes = pipelines.map((pipeline, index) => {
      const stage = Math.floor(index / 2);
      const input = index % 2 ? sums : stage === 0 ? source : textures[stage - 1]!;
      const output = index % 2 === 0 ? sums : stage === 2 ? destination : textures[stage]!;
      return {
        pipeline,
        group: device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: input.createView() },
            { binding: 1, resource: output.createView() },
            { binding: 2, resource: { buffer: regionBuffer } },
          ],
        }),
      };
    });
    return {
      render(
        encoder: GPUCommandEncoder,
        region: { width: number; height: number; premultiplied: boolean },
      ) {
        device.queue.writeBuffer(
          regionBuffer,
          0,
          new Uint32Array([0, region.width, region.height, Number(region.premultiplied)]),
        );
        for (const { pipeline, group } of passes) {
          const pass = encoder.beginComputePass();
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, group);
          pass.dispatchWorkgroups(Math.ceil(region.width / 16), Math.ceil(region.height / 8));
          pass.end();
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
