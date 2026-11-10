// Generated from packages/glass/src/material-tone.ts. Do not edit.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
package expo.modules.lensoglass

internal const val LENSO_TONE = """
float lensoBrightness(float x,float size){
  float t=clamp(x,0.0,1.0)*8.0;
  if(t<1.0)return mix(mix(0.1254901961,0.1254901961,size),mix(0.2431372549,0.2313725490,size),t-0.0);
  if(t<2.0)return mix(mix(0.2431372549,0.2313725490,size),mix(0.3490196078,0.3254901961,size),t-1.0);
  if(t<3.0)return mix(mix(0.3490196078,0.3254901961,size),mix(0.4431372549,0.4000000000,size),t-2.0);
  if(t<4.0)return mix(mix(0.4431372549,0.4000000000,size),mix(0.5254901961,0.4588235294,size),t-3.0);
  if(t<5.0)return mix(mix(0.5254901961,0.4588235294,size),mix(0.5921568627,0.4941176471,size),t-4.0);
  if(t<6.0)return mix(mix(0.5921568627,0.4941176471,size),mix(0.6509803922,0.5058823529,size),t-5.0);
  if(t<7.0)return mix(mix(0.6509803922,0.5058823529,size),mix(0.6941176471,0.5019607843,size),t-6.0);
  if(t<8.0)return mix(mix(0.6941176471,0.5019607843,size),mix(0.7254901961,0.4745098039,size),t-7.0);
  return mix(0.7254901961,0.4745098039,size);
}
float lensoChroma(float x,float size){
  float t=clamp(x,0.0,1.0)*8.0;
  if(t<1.0)return mix(mix(1.2700000000,1.2700000000,size),mix(1.2200000000,1.1900000000,size),t-0.0);
  if(t<2.0)return mix(mix(1.2200000000,1.1900000000,size),mix(1.1800000000,1.1100000000,size),t-1.0);
  if(t<3.0)return mix(mix(1.1800000000,1.1100000000,size),mix(1.1300000000,1.0300000000,size),t-2.0);
  if(t<4.0)return mix(mix(1.1300000000,1.0300000000,size),mix(1.0800000000,0.9500000000,size),t-3.0);
  if(t<5.0)return mix(mix(1.0800000000,0.9500000000,size),mix(1.0300000000,0.8700000000,size),t-4.0);
  if(t<6.0)return mix(mix(1.0300000000,0.8700000000,size),mix(0.9800000000,0.7900000000,size),t-5.0);
  if(t<7.0)return mix(mix(0.9800000000,0.7900000000,size),mix(0.9400000000,0.7100000000,size),t-6.0);
  if(t<8.0)return mix(mix(0.9400000000,0.7100000000,size),mix(0.8900000000,0.6300000000,size),t-7.0);
  return mix(0.8900000000,0.6300000000,size);
}
float3 lensoLinear(float3 rgb,float contrast,float brightness,float saturation){
  float3 c=clamp((rgb-0.5)*contrast+0.5,0.0,1.0);
  c=clamp(c*brightness,0.0,1.0);
  float y=dot(c,float3(0.2126,0.7152,0.0722));
  return clamp(float3(y)+(c-float3(y))*saturation,0.0,1.0);
}
float3 lensoTone(float3 rgb,float size,float clarity,float dark){
  if(dark<0.5)return lensoLinear(rgb,mix(mix(0.3140000000,0.3070000000,size),0.7930000000,clarity),mix(mix(1.5110000000,1.5540000000,size),1.2050000000,clarity),mix(mix(2.0000000000,2.0810000000,size),1.1170000000,clarity));
  float y=dot(rgb,float3(0.2126,0.7152,0.0722));
  float b=lensoBrightness(y,size),g=lensoChroma(y,size);
  return mix(clamp(float3(b)+(rgb-float3(y))*g,0.0,1.0),lensoLinear(rgb,0.7930000000,1.2050000000,1.1170000000),clarity);
}
"""
