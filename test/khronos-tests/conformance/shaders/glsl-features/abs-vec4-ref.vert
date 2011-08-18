// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

attribute vec4 aPosition;

varying vec4 vColor;

float abs_emu1(float value) {
  return value >= 0.0 ? value : -value;
}

vec4 abs_emu(vec4 value) {
  return vec4(
    abs_emu1(value.x),
    abs_emu1(value.y),
    abs_emu1(value.z),
    abs_emu1(value.w));
}

void main()
{
   gl_Position = aPosition;
   vec2 texcoord = vec2(aPosition.xy * 0.5 + vec2(0.5, 0.5));
   vec4 color = vec4(
       texcoord,
       texcoord.x * texcoord.y,
       (1.0 - texcoord.x) * texcoord.y * 0.5 + 0.5);
   vColor = abs_emu(color * 2.0 - vec4(1, 1, 1, 1));
}




