// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

attribute vec4 aPosition;

varying vec4 vColor;

float floor_emu1(float value) {
  return value - mod(value, 1.0);
}

vec3 floor_emu(vec3 value) {
  return vec3(
	  floor_emu1(value.x),
	  floor_emu1(value.y),
	  floor_emu1(value.z));
}

void main()
{
   gl_Position = aPosition;
   vec2 texcoord = vec2(aPosition.xy * 0.5 + vec2(0.5, 0.5));
   vec4 color = vec4(
       texcoord,
       texcoord.x * texcoord.y,
       (1.0 - texcoord.x) * texcoord.y * 0.5 + 0.5);
   vColor = vec4(
       floor_emu(color.xyz * 8.0 - vec3(4, 4, 4)) / 8.0 + vec3(0.5, 0.5, 0.5),
       1);
}




