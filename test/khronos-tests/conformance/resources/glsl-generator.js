GLSLGenerator = (function() {

var vertexShaderTemplate = [
  "attribute vec4 aPosition;",
  "",
  "varying vec4 vColor;",
  "",
  "$(emu)",
  "",
  "void main()",
  "{",
  "   gl_Position = aPosition;",
  "   vec2 texcoord = vec2(aPosition.xy * 0.5 + vec2(0.5, 0.5));",
  "   vec4 color = vec4(",
  "       texcoord,",
  "       texcoord.x * texcoord.y,",
  "       (1.0 - texcoord.x) * texcoord.y * 0.5 + 0.5);",
  "   $(test)",
  "}"
].join("\n");

var fragmentShaderTemplate = [
  "#if defined(GL_ES)",
  "precision mediump float;",
  "#endif",
  "",
  "varying vec4 vColor;",
  "",
  "$(emu)",
  "",
  "void main()",
  "{",
  "   $(test)",
  "}"
].join("\n");

var baseVertexShader = [
  "attribute vec4 aPosition;",
  "",
  "varying vec4 vColor;",
  "",
  "void main()",
  "{",
  "   gl_Position = aPosition;",
  "   vec2 texcoord = vec2(aPosition.xy * 0.5 + vec2(0.5, 0.5));",
  "   vColor = vec4(",
  "       texcoord,",
  "       texcoord.x * texcoord.y,",
  "       (1.0 - texcoord.x) * texcoord.y * 0.5 + 0.5);",
  "}"
].join("\n");

var baseFragmentShader = [
  "#if defined(GL_ES)",
  "precision mediump float;",
  "#endif",
  "",
  "varying vec4 vColor;",
  "",
  "void main()",
  "{",
  "   gl_FragColor = vColor;",
  "}"
].join("\n");

var types = [
  { type: "float",
    code: [
      "float $(func)_emu($(args)) {",
      "  return $(func)_base(value$(extraArgs));",
      "}"].join("\n")
  },
  { type: "vec2",
    code: [
      "vec2 $(func)_emu($(args)) {",
      "  return vec2(",
      "      $(func)_base(value.x$(extraArgsX)),",
      "      $(func)_base(value.y$(extraArgsY)));",
      "}"].join("\n")
  },
  { type: "vec3",
    code: [
      "vec3 $(func)_emu($(args)) {",
      "  return vec3(",
      "      $(func)_base(value.x$(extraArgsX)),",
      "      $(func)_base(value.y$(extraArgsY)),",
      "      $(func)_base(value.z$(extraArgsZ)));",
      "}"].join("\n")
  },
  { type: "vec4",
    code: [
      "vec4 $(func)_emu($(args)) {",
      "  return vec4(",
      "      $(func)_base(value.x$(extraArgsX)),",
      "      $(func)_base(value.y$(extraArgsY)),",
      "      $(func)_base(value.z$(extraArgsZ)),",
      "      $(func)_base(value.w$(extraArgsW)));",
      "}"].join("\n")
  }
];


var replaceRE = /\$\((\w+)\)/g;

var replaceParams = function(str, params) {
  return str.replace(replaceRE, function(str, p1, offset, s) {
    if (params[p1] === undefined) {
      throw "unknown string param '" + p1 + "'";
    }
    return params[p1];
  });
};

var generateReferenceShader = function(
    shaderInfo, template, params, typeInfo, test) {
  var input = shaderInfo.input;
  var output = shaderInfo.output;
  var feature = params.feature;
  var testFunc = params.testFunc;
  var emuFunc = params.emuFunc;
  var args = params.args || "$(type) value";
  var type = typeInfo.type;
  var typeCode = typeInfo.code;

  var extraArgs = params.extraArgs || "";
  var extraArgsX = params.needXYZW ? (extraArgs + ".x") : extraArgs;
  var extraArgsY = params.needXYZW ? (extraArgs + ".y") : extraArgs;
  var extraArgsZ = params.needXYZW ? (extraArgs + ".z") : extraArgs;
  var extraArgsW = params.needXYZW ? (extraArgs + ".w") : extraArgs;

  test = replaceParams(test, {
    input: input,
    output: output,
    func: feature + "_emu"
  });
  emuFunc = replaceParams(emuFunc, {
    func: feature
  });
  args = replaceParams(args, {
    type: type
  });
  typeCode = replaceParams(typeCode, {
    func: feature,
    type: type,
    args: args,
    extraArgs: extraArgs,
    extraArgsX: extraArgsX,
    extraArgsY: extraArgsY,
    extraArgsZ: extraArgsZ,
    extraArgsW: extraArgsW,
  });
  var shader = replaceParams(template, {
    emu: emuFunc + "\n\n" + typeCode,
    test: test
  });
  return shader;
};

var generateTestShader = function(
    shaderInfo, template, params, test) {
  var input = shaderInfo.input;
  var output = shaderInfo.output;
  var feature = params.feature;
  var testFunc = params.testFunc;

  test = replaceParams(test, {
    input: input,
    output: output,
    func: feature
  });
  var shader = replaceParams(template, {
    emu: '',
    test: test
  });
  return shader;
};

var makeImage = function(canvas) {
  var img = document.createElement('img');
  img.src = canvas.toDataURL();
  return img;
};

var runFeatureTest = function(params) {
  if (window.initNonKhronosFramework) {
    window.initNonKhronosFramework(false);
  }

  wtu = WebGLTestUtils;
  gridRes = params.gridRes;

  description("Testing GLSL feature: " + params.feature);

  var width = 32;
  var height = 32;

  var console = document.getElementById("console");
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var gl = wtu.create3DContext(canvas);
  if (!gl) {
    testFailed("context does not exist");
    finishTest();
    return;
  }

  var canvas2d = document.createElement('canvas');
  canvas2d.width = width;
  canvas2d.height = height;
  var ctx = canvas2d.getContext("2d");
  var imgData = ctx.getImageData(0, 0, width, height);

  var shaderInfos = [
    { type: "vertex",
      input: "color",
      output: "vColor",
      vertexShaderTemplate: vertexShaderTemplate,
      fragmentShaderTemplate: baseFragmentShader
    },
    { type: "fragment",
      input: "vColor",
      output: "gl_FragColor",
      vertexShaderTemplate: baseVertexShader,
      fragmentShaderTemplate: fragmentShaderTemplate
    }
  ];
  for (var ss = 0; ss < shaderInfos.length; ++ss) {
    var shaderInfo = shaderInfos[ss];
    var tests = params.tests;
    // Test vertex shaders
    for (var ii = 0; ii < tests.length; ++ii) {
      var type = types[ii];
      debug("");
      var str = replaceParams(params.testFunc, {
        func: params.feature,
        type: type.type,
        arg0: type.type
      });
      debug("Testing: " + str + " in " + shaderInfo.type + " shader");

      var referenceVertexShaderSource = generateReferenceShader(
          shaderInfo,
          shaderInfo.vertexShaderTemplate,
          params,
          type,
          tests[ii]);
      var referenceFragmentShaderSource = generateReferenceShader(
          shaderInfo,
          shaderInfo.fragmentShaderTemplate,
          params,
          type,
          tests[ii]);
      var testVertexShaderSource = generateTestShader(
          shaderInfo,
          shaderInfo.vertexShaderTemplate,
          params,
          tests[ii]);
      var testFragmentShaderSource = generateTestShader(
          shaderInfo,
          shaderInfo.fragmentShaderTemplate,
          params,
          tests[ii]);

      debug("");
      addShaderSource(
          "reference vertex shader", referenceVertexShaderSource);
      addShaderSource(
          "reference fragment shader", referenceFragmentShaderSource);
      addShaderSource(
          "test vertex shader", testVertexShaderSource);
      addShaderSource(
          "test fragment shader", testFragmentShaderSource);
      debug("");

      var refData = draw(
          canvas, referenceVertexShaderSource, referenceFragmentShaderSource);
      var refImg = makeImage(canvas);
      var testData = draw(
          canvas, testVertexShaderSource, referenceFragmentShaderSource);
      var testImg = makeImage(canvas);

      reportResults(refData, refImg, testData, testImg);
    }
  }

  finishTest();

  function addShaderSource(label, source) {
    var div = document.createElement("div");
    var s = document.createElement("pre");
    s.className = "shader-source";
    s.style.display = "none";
    s.appendChild(document.createTextNode(source));
    var l = document.createElement("a");
    l.href = "show-shader-source";
    l.appendChild(document.createTextNode(label));
    l.addEventListener('click', function() {
        s.style.display = (s.style.display == 'none') ? 'block' : 'none';
        return false;
      }, false);
    div.appendChild(l);
    div.appendChild(s);
    console.appendChild(div);
  }

  function reportResults(refData, refImage, testData, testImage) {
    var same = true;
    for (var yy = 0; yy < height; ++yy) {
      for (var xx = 0; xx < width; ++xx) {
        var offset = (yy * width + xx) * 4;
        var imgOffset = ((height - yy - 1) * width + xx) * 4;
        imgData.data[imgOffset + 0] = 0;
        imgData.data[imgOffset + 1] = 0;
        imgData.data[imgOffset + 2] = 0;
        imgData.data[imgOffset + 3] = 255;
        if (refData[offset + 0] != testData[offset + 0] ||
            refData[offset + 1] != testData[offset + 1] ||
            refData[offset + 2] != testData[offset + 2] ||
            refData[offset + 3] != testData[offset + 3]) {
          imgData.data[imgOffset] = 255;
          same = false;
        }
      }
    }

    var diffImg = null;
    if (!same) {
      ctx.putImageData(imgData, 0, 0);
      diffImg = makeImage(canvas2d);
    }

    var div = document.createElement("div");
    div.className = "testimages";
    insertImg(div, "ref", refImg);
    insertImg(div, "test", testImg);
    if (diffImg) {
      insertImg(div, "diff", diffImg);
    }
    div.appendChild(document.createElement('br'));

    function insertImg(element, caption, img) {
      var div = document.createElement("div");
      div.appendChild(img);
      var label = document.createElement("div");
      label.appendChild(document.createTextNode(caption));
      div.appendChild(label);
      element.appendChild(div);
    }

    console.appendChild(div);

    if (!same) {
      testFailed("images are different");
    } else {
      testPassed("images are the same");
    }

    console.appendChild(document.createElement('hr'));
  }

  function draw(canvas, vsSource, fsSource) {
    var program = wtu.loadProgram(gl, vsSource, fsSource);

    var posLoc = gl.getAttribLocation(program, "aPosition");
    setupQuad(gl, posLoc);

    gl.useProgram(program);
    gl.clearColor(0, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, gridRes * gridRes * 6, gl.UNSIGNED_SHORT, 0);
    wtu.glErrorShouldBe(gl, gl.NO_ERROR, "no errors from draw");

    var img = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return img;
  }

  function setupQuad(gl, positionLocation) {
    var objects = [];

    var vertsAcross = gridRes + 1;
    var numVerts = vertsAcross * vertsAcross;
    var positions = new Float32Array(numVerts * 3);
    var indices = new Uint16Array(6 * gridRes * gridRes);

    var poffset = 0;

    for (var yy = 0; yy <= gridRes; ++yy) {
      for (var xx = 0; xx <= gridRes; ++xx) {
        positions[poffset + 0] = -1 + 2 * xx / gridRes;
        positions[poffset + 1] = -1 + 2 * yy / gridRes;
        positions[poffset + 2] = 0;

        poffset += 3;
      }
    }

    var tbase = 0;
    for (var yy = 0; yy < gridRes; ++yy) {
      var index = yy * vertsAcross;
      for (var xx = 0; xx < gridRes; ++xx) {
        indices[tbase + 0] = index + 0;
        indices[tbase + 1] = index + 1;
        indices[tbase + 2] = index + vertsAcross;
        indices[tbase + 3] = index + vertsAcross;
        indices[tbase + 4] = index + 1;
        indices[tbase + 5] = index + vertsAcross + 1;

        index += 1;
        tbase += 6;
      }
    }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    objects.push(buf);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    objects.push(buf);

    return objects;
  }
};

return {
  runFeatureTest: runFeatureTest,

  none: false
};

}());

