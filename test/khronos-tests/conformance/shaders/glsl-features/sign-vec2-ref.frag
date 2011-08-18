// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#if defined(GL_ES)
precision mediump float;
#endif

varying vec4 vColor;

float sign_emu1(float value) {
  if (value == 0.0) return 0.0;
  return value > 0.0 ? 1.0 : -1.0;
}

vec2 sign_emu(vec2 value) {
  return vec2(
	  sign_emu1(value.x),
	  sign_emu1(value.y));
}

void main()
{
   gl_FragColor = vec4(
      sign_emu(vColor.xy * 2.0 - vec2(1, 1)) * 0.5 + vec2(0.5, 0.5),
      0,
      1);
}




