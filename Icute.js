/********************************************************
 *     __  ___      _________
 *    / /_/ | | __ / / _____/
 *   /   __/| |/ |/ / /
 *  / /\ \  |  /|  / /____
 * /_/  \_\ |_/ |_/\_____/
 * ---------------------------------------------------
 * WebGL Renderer Module
 * 
 * @overview
 * This module is a constructor that creates an
 * object for managing a webgl context.
 * 
 * __NOTE__: This project is a module designed
 * to be imported into a KA webpage project.
 * The module factory code does not execute here.
 * Only the splash screen code is run.
 * 
 * ===================================================
 * @author_profile
 *   https://www.khanacademy.org/profile/MKaelin368
 * 
 * Copyright (c) MKaelin368 (KWC) K-SOFT 2018-2021
 * All rights reserved.
 * 
 * @time_taken_to_create 4 months
 * @date_released 8/5/21
 * @last_modified 8/5/21
 ********************************************************/
(function (root, deps, factory, splash) {
    /* jshint ignore: start */
    if (typeof define === "function" && define.amd) {
        // -- AMD - register as an anonymous module --
        define(deps, factory);
    }
    else if (typeof exports === "object" &&
             typeof module !== "undefined"
    ) {
        // -- CommonJS, requireJS, etc. --
        module.exports = factory(root, require(deps[1]));
    }
    else if (typeof root === "object" &&
             root.window === root
    ) {
        // -- browser globals --
        root.WebGLRenderer = factory(root, root.DOMUtils);
    }
    else {
        // -- KA Processing environment --
        splash();
    }
    /* jshint ignore: end */
}
(this, ["globals", "dom"],
function (global, dom_utils) {

// -- gets the current time in milliseconds --
var now = global.Date.now ?
    function () { return global.Date.now(); } :
    function () { return +(new global.Date()); };

// -- for assigning properties to another object --
var assignProperties = (
function /*assignProperties*/(dst, src) {
    for (var key in src) {
        if (Object.prototype
            .hasOwnProperty.call(src, key)
        ) {
            dst[key] = src[key];
        }
    }
    return dst;
});

// -- for mapping type constants to names --
var typeToName = (
function /*typeToName*/(gl, type) {
    switch (type) {
        case gl.BYTE:
        return "byte";
        case gl.UNSIGNED_BYTE:
        return "unsigned-byte";
        case gl.SHORT:
        return "short";
        case gl.UNSIGNED_SHORT:
        return "unsigned-short";
        case gl.INT:
        return "int";
        case gl.UNSIGNED_INT:
        return "unsigned-int";
        case gl.FLOAT:
        return "float";
        // ---------------------------------
        case gl.FLOAT_VEC2:
        return "float-vec2";
        case gl.FLOAT_VEC3:
        return "float-vec3";
        case gl.FLOAT_VEC4:
        return "float-vec4";
        case gl.INT_VEC2:
        return "int-vec2";
        case gl.INT_VEC3:
        return "int-vec3";
        case gl.INT_VEC4:
        return "int-vec4";
        case gl.BOOL:
        return "bool";
        case gl.BOOL_VEC2:
        return "bool-vec2";
        case gl.BOOL_VEC3:
        return "bool-vec3";
        case gl.BOOL_VEC4:
        return "bool-vec4";
        case gl.FLOAT_MAT2:
        return "float-mat2";
        case gl.FLOAT_MAT3:
        return "float-mat3";
        case gl.FLOAT_MAT4:
        return "float-mat4";
        case gl.SAMPLER_2D:
        return "sampler-2d";
        case gl.SAMPLER_CUBE:
        return "sampler-cube";
        // ---------------------------------
        default:
        return "unknown";
    }
});

// -- for mapping a type to valid attribute type --
var typeToAttribType = (
function /*typeToAttribType*/(gl, type) {
    switch (type) {
        case gl.UNSIGNED_INT:
        return gl.UNSIGNED_SHORT;
        case gl.INT:
        case gl.INT_VEC2:
        case gl.INT_VEC3:
        case gl.INT_VEC4:
        case gl.FLOAT_VEC2:
        case gl.FLOAT_VEC3:
        case gl.FLOAT_VEC4:
        case gl.FLOAT_MAT2:
        case gl.FLOAT_MAT3:
        case gl.FLOAT_MAT4:
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
        return gl.FLOAT;
        case gl.BOOL:
        case gl.BOOL_VEC2:
        case gl.BOOL_VEC3:
        case gl.BOOL_VEC4:
        return gl.BYTE;
    }
    return type;
    /**
     * __NOTE__: Because `gl.vertexAttribPointer()`
     * can only accept some types for its `type`
     * parameter, this is needed to map all types
     * to accepted types. Types mapped may not
     * handle the original types correctly.
     */
});

// -- context attribute defaults --
var defaultContextAttributes = {
    // -- has alpha buffer --
    "alpha": false,
    // -- performs anti-aliasing --
    "antialias": false,
    // -- has depth buffer with at least 16 bits --
    "depth": true,
    // -- has context fail if device is too slow --
    "failIfMajorPerformanceCaveat": true,
    // -- assumes colors have pre-multiplied alpha --
    "premultipliedAlpha": false,
    // -- buffers will not automatically be cleared --
    "preserveDrawingBuffer": false,
    // -- has a stencil buffer with at least 8 bits --
    "stencil": false
};

// ---------------------------------------------

// -- for populating supported context objects --
var checkContextNames = (
function /*checkContextNames*/(
    types, list, index
) {
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var canvas = dom_utils.newElement("canvas");
        try {
            var gl = canvas.getContext(type);
            if (gl) {
                list.push(type);
                index[type] = true;
            }
        }
        catch (err) { /* ignoring */ }
    }
});

// -- webgl 1 context name list and index objects --
var supportedWebGL1Types = [];
var supportedWebGL1TypeIndex = {};
checkContextNames([
        "experimental-webgl", "webgl", "webkit-3d"
    ],
    supportedWebGL1Types,
    supportedWebGL1TypeIndex);

// -- webgl 2 context name list and index objects --
var supportedWebGL2Types = [];
var supportedWebGL2TypeIndex = {};
checkContextNames([
        "experimental-webgl2", "webgl2"
    ],
    supportedWebGL2Types,
    supportedWebGL2TypeIndex);


// -- for querying if a name is a supported context --
var isSupportedContext = (
function /*isSupportedContext*/(type) {
    return !!(
        supportedWebGL2TypeIndex[type] ||
        supportedWebGL1TypeIndex[type]);
});

// -- for querying if any webgl is supported --
var isWebGLSupported = (
function /*isWebGLSupported*/() {
    return supportedWebGL1Types.length > 0;
});

// -- for querying if webgl 2 is supported --
var isWebGL2Supported = (
function /*isWebGL2Supported*/() {
    return supportedWebGL2Types.length > 0;
});

// ---------------------------------------------

// -- for getting a webgl 1 context --
var getWebGL1Context = (
function /*initWebGL1Context*/(canvas, attribs) {
    return !isWebGLSupported() ? null :
        canvas.getContext(supportedWebGL1Types[0]);
});

// -- for getting a webgl 2 context --
var getWebGL2Context = (
function /*initWebGL2Context*/(canvas, attribs) {
    return !isWebGL2Supported() ? null :
        canvas.getContext(supportedWebGL2Types[0]);
});

// ---------------------------------------------

// -- for initializing a webgl context --
var initContext = (
function /*initContext*/() {
    
    // -- webgl context --
    var gl = null;
    
    // -- argument pointers --
    var canvas;
    var version;
    var attributes;
    
    // -- assigns arguments to pointers --
    if (arguments.length > 2) {
        canvas = arguments[0];
        version = +arguments[1];
        attributes = arguments[2];
    }
    else if (arguments[1]) {
        if (typeof arguments[0] === "object") {
            if (arguments[0].nodeType) {
                canvas = arguments[0];
                if (typeof arguments[1] === "object") {
                    attributes = arguments[1];
                }
                else {
                    version = +arguments[1];
                }
            }
        }
        else {
            version = +arguments[0];
            if (typeof arguments[1] === "object" &&
                !arguments[1].nodeType
            ) {
                attributes = arguments[1];
            }
        }
    }
    else if (arguments[0]) {
        if (typeof arguments[0] === "object") {
            if (arguments[0].nodeType) {
                canvas = arguments[0];
            }
            else {
                attributes = arguments[0];
            }
        }
        else {
            version = +arguments[0];
        }
    }
    
    // -- creates a new canvas element --
    if (!canvas) {
        canvas = dom_utils.newElement("canvas");
    }
    
    // -- context attributes configuration object --
    var conf = {};
    
    // -- assigns defaults to configuration object --
    assignProperties(conf, defaultContextAttributes);
    
    // -- assigns attributes to config object --
    if (attributes) {
        assignProperties(conf, attributes);
    }
    
    if (version === 2) {
        gl = getWebGL2Context(canvas, conf);
    }
    else if (version === 1) {
        gl = getWebGL1Context(canvas, conf);
    }
    else {
        gl = getWebGL2Context(canvas, conf) ||
             getWebGL1Context(canvas, conf);
    }
    
    // -- if available webgl isn't supported --
    if (!gl) {
        throw new global.Error(
            "Unable to initialize " +
            (version === 2 ? "WebGL2" : "WebGL") +
            ". Your browser or device " +
            "may not support it.");
    }
    
    return gl;
    
});

// -- for initializing the target array buffer --
var initArrayBuffer = (
function /*initArrayBuffer*/(
    gl, src_or_size, usage
) {
    /**
     * __NOTE__: The target array buffer binding
     * needs a buffer to be assigned before
     * calling `gl.bufferData()` or 
     * `gl.vertexAttribPointer()`.
     */
    
    // -- creates array buffer data store --
    switch (usage) {
        case gl.DYNAMIC_DRAW:
        gl.bufferData(gl.ARRAY_BUFFER,
            src_or_size, gl.DYNAMIC_DRAW);
        /**
         * __NOTE__: A dynamic array buffer is
         * intended to have its contents redefined
         * repeatedly and drawn often.
         */
        break;
        case gl.STREAM_DRAW:
        gl.bufferData(gl.ARRAY_BUFFER,
            src_or_size, gl.STREAM_DRAW);
        /**
         * __NOTE__: A stream array buffer is
         * intended to have its contents defined
         * once and drawn at most a few times.
         */
        break;
        default: // -- gl.STATIC_DRAW --
        gl.bufferData(gl.ARRAY_BUFFER,
            src_or_size, gl.STATIC_DRAW);
        /**
         * __NOTE__: A static array buffer is
         * intended to have its contents defined
         * once and drawn often.
         */
    }
});

// -- for initializing the target element array buffer --
var initElementArrayBuffer = (
function /*initElementArrayBuffer*/(
    gl, src_or_size, usage
) {
    // -- creates element array buffer data store --
    switch (usage) {
        case gl.DYNAMIC_DRAW:
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            src_or_size, gl.DYNAMIC_DRAW);
        /**
         * __NOTE__: A dynamic element array is
         * intended to have its contents redefined
         * repeatedly and drawn often.
         */
        break;
        case gl.STREAM_DRAW:
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            src_or_size, gl.STREAM_DRAW);
        /**
         * __NOTE__: A stream element array is
         * intended to have its contents defined
         * once and drawn at most a few times.
         */
        break;
        default: // -- gl.STATIC_DRAW --
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            src_or_size, gl.STATIC_DRAW);
        /**
         * __NOTE__: A static element array is
         * intended to have its contents defined
         * once and drawn often.
         */
    }
    /**
     * __NOTE__: When `src_or_size` is an array
     * it should be an unsigned integer array
     * (i.e. Uint16Array) since it will be
     * specifying indices.
     */
});

// -- for initializing a new WebGLShader object --
var initShader = (
function /*initShader*/(gl, type, sourceCode) {
    
    // -- creates WebGLShader object --
    var shader = gl.createShader(type);
    
    // -- sets the shader object source code --
    gl.shaderSource(shader, sourceCode);
    
    // -- compiles the shader --
    gl.compileShader(shader);
    
    // -- if shader didn't compile successfully --
    if (!gl.getShaderParameter(shader,
        gl.COMPILE_STATUS)
    ) {
        
        // -- shader log info --
        var info = gl.getShaderInfoLog(shader);
        
        // -- releases shader object --
        gl.deleteShader(shader);
        
        throw new global.Error("An error occurred " +
            "compiling a webgl shader: " + info);
        
    }
    
    return shader;
});

// -- for initializing a new WebGLProgram object --
var initProgram = (
function /*initProgram*/(
    gl, shaders, attribNames, locs
) {
    
    // -- creates a WebGLProgram object --
    var program = gl.createProgram();
    
    // -- attaches shaders to program --
    for (var i = 0; i < shaders.length; i++) {
        gl.attachShader(program, shaders[i]);
    }
    
    if (attribNames) {
        for (var j = 0; j < attribNames.length; j++) {
            gl.bindAttribLocation(program,
                locs ? locs[j] : j, attribNames[j]);
        }
    }
    
    // -- links program to webgl context --
    gl.linkProgram(program);
    
    /**
     * __NOTE__: A list of active uniforms
     * is created when `gl.linkProgram()`
     * is called. This list can contain more
     * than one uniform with the same name if
     * all the same name uniforms were declared
     * as different types in the shader.
     */
    
    /**
     * __NOTE__: Linking a program to the
     * webgl context completes the process
     * of preparing the GPU code for the
     * program's shaders.
     */
    
    // -- if linking the program failed --
    if (!gl.getProgramParameter(program,
        gl.LINK_STATUS)
    ) {
        
        // -- program log info --
        var info = gl.getProgramInfoLog(program);
        
        // -- releases program object --
        gl.deleteProgram(program);
        
        throw new global.Error("Unable to link " +
            "webgl program: " + info);
        
    }
    
    return program;
});

// ---------------------------------------------

// -- creates an attribute info object from program --
var getProgramAttribInfo = (
function /*getProgramAttribInfo*/(gl, program) {
    var result = {};
    var n = gl.getProgramParameter(
        program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < n; i++) {
        var info = gl.getActiveAttrib(program, i);
        var attribLoc = gl.getAttribLocation(
            program, info.name);
        result[info.name] = {
            "loc": attribLoc,
            "type": info.type,
            "size": info.size
        };
    }
    return result;
});

// -- creates a uniform info object from program --
var getProgramUniformInfo = (
function /*getProgramUniformInfo*/(gl, program) {
    var result = {};
    var n = gl.getProgramParameter(
        program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
        var info = gl.getActiveUniform(program, i);
        var uniformLoc = gl.getUniformLocation(
            program, info.name);
        result[info.name] = {
            "loc": uniformLoc,
            "type": info.type,
            "size": info.size
        };
    }
    return result;
});

// -- gets program attributes info serialized --
var describeProgramAttribs = (
function /*describeProgramAttribs*/(gl, program) {
    var result = "", delimiter = "";
    var n = gl.getProgramParameter(
        program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < n; i++) {
        var info = gl.getActiveAttrib(program, i);
        var attribLoc = gl.getAttribLocation(
            program, info.name);
        result += (delimiter + "attribute: { " +
            "name: " + info.name + ", " +
            "loc: " + attribLoc + ", " +
            "type: " + typeToName(gl,
                info.type) + ", " +
            "size: " + info.size + " }");
        delimiter = "\n";
    }
    return result;
});

// -- gets program uniforms info serialized --
var describeProgramUniforms = (
function /*describeProgramUniforms*/(gl, program) {
    var result = "", delimiter = "";
    var n = gl.getProgramParameter(
        program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
        var info = gl.getActiveUniform(
            program, i);
        var uniformLoc = gl.getUniformLocation(
            program, info.name);
        result += (delimiter + "uniform: { " +
            "name: " + info.name + ", " +
            "type: " + typeToName(gl, info.type) +
            ", " +
            "size: " + info.size + " }");
        delimiter = "\n";
    }
    return result;
});

// ---------------------------------------------

// @constructor
var WebGLRenderer = (
function /*WebGLRenderer*/() {
    
    // -- argument pointers --
    var canvas;
    var config;
    var contextAttribs;
    
    if (arguments[0] &&
        typeof arguments[0] === "object" &&
        arguments[0].nodeType === 1
    ) {
        canvas = arguments[0];
        config = arguments[1] || {};
        contextAttribs = arguments[2];
    }
    else {
        config = arguments[0] || {};
        contextAttribs = arguments[1];
    }
    
    // -- initializes a webgl context --
    this.gl = initContext(canvas,
        config.version, contextAttribs);
    
    // -- canvas associated with the webgl context --
    this.canvas = this.gl.canvas;
    
    this.id = config.id || "";
    
    // -- adds self-constructed canvas to dom body --
    if (!canvas) {
        var docElt = dom_utils.getBody() ||
                     dom_utils.getRoot();
        docElt.appendChild(this.canvas);
    }
    
    // -- sets the webgl output size and canvas size --
    if (config.width && config.height) {
        this.setDimensions(config.width, config.height);
    }
    else if (canvas) {
        this.setDimensions(canvas.clientWidth,
                           canvas.clientHeight);
    }
    else {
        this.setDimensions(global.innerWidth,
                           global.innerHeight);
    }
    
    // -- vertex shader source code --
    var vertexShaderSource = config.vertex ||
        (config.glslVersion === 3 ?
        "#version 300 es " +
            "/* GLSL version 3.00 (es profile) */\n" +
        "precision lowp float;\n" +
        "precision lowp int;\n" +
        "in vec2 a_VertPos;\n" +
        //"in vec3 a_VertColor;\n" +
        //"out vec3 v_VertColor;\n" +
        //"in vec2 a_TexCoord;\n" +
        //"out vec2 v_TexCoord;\n" +
        "void main() {\n" +
        //"    v_VertColor = a_VertColor;\n" +
        "    gl_Position = vec4(" +
                "a_VertPos, 0.0, 1.0);\n" +
        //"    v_TexCoord = a_TexCoord;" +
        "}" :
        "#version 100 /* GLSL version 1.00 */\n" +
        "precision lowp float;\n" +
        "precision lowp int;\n" +
        "attribute vec2 a_VertPos;\n" +
        //"attribute vec3 a_VertColor;\n" +
        //"varying vec3 v_VertColor;\n" +
        //"attribute vec2 a_TexCoord;\n" +
        //"varying vec2 v_TexCoord;\n" +
        "void main() {\n" +
        //"    v_VertColor = a_VertColor;\n" +
        "    gl_Position = vec4(" +
                "a_VertPos, 0.0, 1.0);\n" +
        //"    v_TexCoord = a_TexCoord;\n" +
        "}");
    
    // -- fragment shader source code --
    var fragmentShaderSource = config.fragment ||
        (config.glslVersion === 3 ?
        "#version 300 es " +
            "/* GLSL version 3.00 (es profile) */\n" +
        "precision lowp float;\n" +
        "precision lowp int;\n" +
        //"in vec3 v_VertColor;\n" +
        //"in vec2 v_TexCoord;\n" +
        "out vec4 v_FragColor;\n" +
        "void main() {\n" +
        //"    v_FragColor=vec4(v_VertColor,1.0);\n" +
        "    v_FragColor = vec4(0.0);\n" +
        "}" :
        "#version 100 /* GLSL version 1.00 */\n" +
        "precision lowp float;\n" +
        "precision lowp int;\n" +
        //"varying vec3 v_VertColor;\n" +
        //"varying vec2 v_TexCoord;\n" +
        "void main() {\n" +
        //"    gl_FragColor=vec4(v_VertColor,0.0);\n" +
        "    gl_FragColor = vec4(0.0);\n" +
        "}");
    
    /**
     * __NOTE__: Version 1.00 shader source code 
     * cannot be combined with version 3.00 es
     * shader source code.
     */
    
    // -- initializes shaders --
    var vertexShader = initShader(this.gl,
        this.gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = initShader(this.gl,
        this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    // -- new program created from shader sources --
    this.program = initProgram(this.gl, [
        vertexShader, fragmentShader
    ]);
    
    // -- marks shaders for deletion --
    this.gl.deleteShader(fragmentShader);
    this.gl.deleteShader(vertexShader);
    
    // -- map of shader vertex attribute info --
    this.attributes = getProgramAttribInfo(
        this.gl, this.program);
    
    // -- map of shader uniform info --
    this.uniforms = getProgramUniformInfo(
        this.gl, this.program);
    
    // -- adds program to the webgl state --
    this.gl.useProgram(this.program);
    
    // -- sets render mode --
    this.renderMode = this.gl.TRIANGLES;
    
    // -- vertex buffer object (VBO) --
    this.vbo = {};
    
    // -- makes renderer handle rasterization --
    if (config.raster) {
        
        /*
        // -- sets texture coordinate buffer --
        this.setVertexBuffer("texCoords",
            new global.Float32Array([
                0.0, 0.0,   1.0, 0.0,   0.0, 1.0,
                0.0, 1.0,   1.0, 0.0,   1.0, 1.0
            ]));
        
        // -- binds and enables texture attribute --
        this.setVertexBufferAttrib("texCoords",
            "a_TexCoord", 2, true);
        */
        
        // -- sets plane shape to render to --
        this.setVertexBuffer("vertices",
            new global.Float32Array([
                -1.0, -1.0,   1.0, -1.0,  -1.0,  1.0,
                -1.0,  1.0,   1.0, -1.0,   1.0,  1.0
            ]));
        
        // -- binds and enables position attribute --
        this.setVertexBufferAttrib("vertices",
            "a_VertPos", 2, true);
        
        // -- sets glsl dimensions uniform  --
        this.setUniform("u_Dimensions",
            this.getDimensions());
        
        // -- sets depth clearing value --
        this.gl.clearDepth(1.0);
        
    }
    
    // -- defines delta and elapsed time --
    this.elapsedTime = this.deltaTime = 0;
    
    // -- sets initialize and previous frame time --
    this.prevTime = this.initTime = now();
    
});

// -- sets constructor inheritance --
WebGLRenderer.prototype = (function (ctor, base) {
    if (Object.create) {
        return Object.create(base, {
            "constructor": {
                value: ctor,
                "writable": true,
                "enumerable": false,
                "configurable": true
            }
        });
    }
    else {
        var Surrogate = function () {};
        Surrogate.prototype = base;
        var result = new Surrogate();
        result.constructor = ctor;
        return result;
    }
}
(WebGLRenderer, Object.prototype));

// ---------------------------------------------

// -- sets constructor static methods --
assignProperties(WebGLRenderer, {
    isSupportedContext: isSupportedContext,
    isWebGLSupported: isWebGLSupported,
    isWebGL2Supported: isWebGL2Supported
});

// ---------------------------------------------

// -- for setting the context canvas width and height --
WebGLRenderer.prototype.setDimensions = (
function /*setDimensions*/(w, h) {
    
    // -- sets webgl canvas size --
    this.gl.canvas.width = Math.round(w);
    this.gl.canvas.height = (
        arguments.length > 2 ? 
            Math.round(h) : this.gl.canvas.width);
    
    // -- sets viewport position and size --
    this.gl.viewport(0, 0, this.gl.canvas.width,
                           this.gl.canvas.height);
    
    // -- sets clearing color --
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // -- fills webgl canvas with clearing color --
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
});

// -- for getting the context canvas width and height --
WebGLRenderer.prototype.getDimensions = (
function /*getDimensions*/() {
    return new global.Int32Array([
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight
    ]);
});

// -- for getting the context width --
WebGLRenderer.prototype.getWidth = (
function /*getWidth*/() {
    return this.gl.drawingBufferWidth;
});

// -- for getting the context height --
WebGLRenderer.prototype.getHeight = (
function /*getHeight*/() {
    return this.gl.drawingBufferHeight;
});

// -- for setting the viewport position and size --
WebGLRenderer.prototype.setViewport = (
function /*setViewport*/(x, y, w, h) {
    this.gl.viewport(
        Math.round(x), Math.round(y),
        Math.round(w), Math.round(h));
});

// -- for getting the viewport position and size --
WebGLRenderer.prototype.getViewport = (
function /*getViewport*/() {
    // -- returns an Int32Array object --
    return this.gl.getParameter(this.gl.VIEWPORT);
});

// -----------------------------------------

// -- for defining a vertex buffer --
WebGLRenderer.prototype.setVertexBuffer = (
function /*setVertexBuffer*/(
    bufferName, src_or_size, usage
) {
    if (typeof bufferName !== "string") {
        return;
    }
    if (!this.hasVertexBuffer(bufferName)) {
        this.vbo[bufferName] = {
            "buffer": this.gl.createBuffer()
        };
    }
    var data = this.vbo[bufferName];
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,
        data.buffer);
    initArrayBuffer(this.gl, src_or_size, usage);
    if (typeof src_or_size === "number") {
        data.size = src_or_size;
        data.bytesPerElement = (
            global.Float32Array.BYTES_PER_ELEMENT);
    }
    else {
        data.size = src_or_size.length;
        data.bytesPerElement = (
            src_or_size.BYTES_PER_ELEMENT);
    }
    data.usage = usage || this.gl.STATIC_DRAW;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
});

// -- for binding a vertex buffer to an attribute --
WebGLRenderer.prototype.setVertexBufferAttrib = (
function /*setVertexBufferAttrib*/(
    bufferName, attribName, eltCompCount,
    eltsNormalized, eltStride, startOffset
) {
    /**
     * __NOTE__: The array buffer needs to be
     * initialized before calling this.
     */
    if (!this.hasVertexBuffer(bufferName) ||
        !this.hasAttrib(attribName)
    ) {
        return;
    }
    var attrib = this.attributes[attribName];
    var data = this.vbo[bufferName];
    data.attribName = attribName;
    data.elementComponentCount = eltCompCount || 3;
    data.elementCount = eltStride &&
        eltStride > data.elementComponentCount ?
        data.size / eltStride :
        data.size / data.elementComponentCount;
    
    this.elementCount = data.elementCount;
    
    data.elementType = typeToAttribType(this.gl,
        attrib.type);
    data.elementsNormalized = !!eltsNormalized;
    data.stride = eltStride && eltStride > 0 ?
        eltStride : 0;
    data.start = startOffset && startOffset > 0 ?
        startOffset : 0;
    data.drawStart = 0;
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,
        data.buffer);
    
    this.gl.enableVertexAttribArray(attrib.loc);
    this.gl.vertexAttribPointer(
        attrib.loc,
        data.elementComponentCount,
        data.elementType,
        data.elementsNormalized,
        data.stride * data.bytesPerElement,
        data.start * data.bytesPerElement);
    
    /**
     * __NOTE__: `gl.vertexAttribPointer()`
     * binds the current bound array buffer
     * to an attribute and specifies its layout.
     * Afterwords, accessing the attribute will
     * then return data from the vertex buffer.
     */
    
    /**
     * __NOTE__: The fifth parameter of
     * `gl.vertexAttribPointer()` specifies
     * the offset in bytes between the
     * beginning of consecutive vertex
     * attributes. It cannot be larger than
     * 255. If the stride is 0, the next
     * vertex attribute follows immediately
     * after the current vertex.
     */
    
    // -- discards array buffer binding --
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
});

// -- for querying if a vertex buffer is defined --
WebGLRenderer.prototype.hasVertexBuffer = (
function /*hasVertexBuffer*/(bufferName) {
    return typeof bufferName === "string" &&
        this.vbo[bufferName];
});

// -----------------------------------------

// -- for defining the element buffer --
WebGLRenderer.prototype.setElementArray = (
function /*setElementArray*/(
    src_or_size, usage
) {
    var data = this.elementArray = {
        "buffer": this.gl.createBuffer()
    };
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,
        data.buffer);
    initElementArrayBuffer(this.gl, src_or_size, usage);
    if (typeof src_or_size === "number") {
        data.size = src_or_size;
        data.bytesPerElement = (
            global.Int16Array.BYTES_PER_ELEMENT);
    }
    else {
        data.size = src_or_size.length;
        data.bytesPerElement = (
            src_or_size.BYTES_PER_ELEMENT);
    }
    data.elementCount = data.size;
    data.elementType = this.gl.UNSIGNED_SHORT;
    data.offset = 0;
    data.usage = usage || this.gl.STATIC_DRAW;
});

// -- for removing the element buffer --
WebGLRenderer.prototype.destroyElementArray = (
function /*removeElementArray*/() {
    this.gl.bindBuffer(
        this.gl.ELEMENT_ARRAY_BUFFER, null);
    this.elementArray = null;
});

// -----------------------------------------

// -- for setting if an attribute array is enabled --
WebGLRenderer.prototype.setAttribArrayEnabled = (
function /*setAttribArrayEnabled*/(
    attribName, flag
) {
    if (!this.hasAttrib(attribName)) {
        return;
    }
    this.gl[(flag ? "enableVertexAttribArray" :
                    "disableVertexAttribArray")]
        (this.attributes[attribName].loc);
    /**
     * __NOTE__: Attribute arrays
     * are disabled by default.
     */
});

// -- for querying if an attribute array is enabled --
WebGLRenderer.prototype.isAttribArrayEnabled = (
function /*isAttribArrayEnabled*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return false;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
});

// -- for getting the buffer bound to an attribute --
WebGLRenderer.prototype.getAttribBoundBuffer = (
function /*getAttribBoundBuffer*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
});

// -- for getting an attribute component length --
WebGLRenderer.prototype.getAttribElementSize = (
function /*getAttribElementSize*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_SIZE);
    /**
     * __NOTE__: This returns the number
     * of components per vertex attribute.
     * It will be 1, 2, 3, or 4.
     */
});

// -- for getting an attribute array type --
WebGLRenderer.prototype.getAttribArrayType = (
function /*getAttribArrayType*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_TYPE);
    /**
     * Possible returns:
     * 
     * gl.BYTE
     * gl.UNSIGNED_BYTE
     * gl.SHORT
     * gl.UNSIGNED_SHORT
     * gl.FLOAT
     */
});

// -- for querying if an attribute array is normalized --
WebGLRenderer.prototype.isAttribArrayNormalized = (
function /*isAttribArrayNormalized*/(
    attribName
) {
    if (!this.hasAttrib(attribName)) {
        return false;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_NORMALIZED);
});

// -- for getting an attribute array stride --
WebGLRenderer.prototype.getAttribArrayStride = (
function /*getAttribArrayStride*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_STRIDE);
    /**
     * __NOTE__: Returns the number of bytes between
     * successive elements in the array.
     * 0 means that the elements are sequential.
     */
});

// -- for getting an attribute array offset --
WebGLRenderer.prototype.getAttribOffset = (
function /*getAttribOffset*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    // -- returns a GLintptr with attribute address --
    return this.gl.getVertexAttribOffset(
        this.attributes[attribName].loc,
        this.gl.VERTEX_ATTRIB_ARRAY_POINTER);
});

// -- for getting an attribute current value --
WebGLRenderer.prototype.getCurrentAttribValue = (
function /*getCurrentAttribValue*/(attribName) {
    if (!this.hasAttrib(attribName)) {
        return null;
    }
    // -- returns current value of the attribute --
    return this.gl.getVertexAttrib(
        this.attributes[attribName].loc,
        this.gl.CURRENT_VERTEX_ATTRIB);
    /**
     * __NOTE__: This returns a Float32Array
     * (with 4 elements) representing the
     * current value of the vertex attribute
     * at the given index.
     */
});

// -- for getting a description for attributes --
WebGLRenderer.prototype.describeAttribs = (
function /*describeAttribs*/() {
    return describeProgramAttribs(
        this.gl, this.program);
});

// -- for querying if an attribute is defined --
WebGLRenderer.prototype.hasAttrib = (
function /*hasAttrib*/(attribName) {
    return typeof attribName === "string" &&
        this.attributes[attribName];
});

// -----------------------------------------

// -- for assigning a value to a glsl uniform --
WebGLRenderer.prototype.setUniform = (
function /*setUniform*/(uniformName, value) {
    if (!this.hasUniform(uniformName)) {
        return;
    }
    var uniformLoc = this.uniforms[uniformName].loc;
    switch (this.uniforms[uniformName].type) {
        case this.gl.FLOAT:
        this.gl.uniform1f(uniformLoc, value);
        return;
        case this.gl.FLOAT_VEC2:
        this.gl.uniform2fv(uniformLoc, value);
        return;
        case this.gl.FLOAT_VEC3:
        this.gl.uniform3fv(uniformLoc, value);
        return;
        case this.gl.FLOAT_VEC4:
        this.gl.uniform4fv(uniformLoc, value);
        return;
        case this.gl.INT:
        case this.gl.BOOL:
        this.gl.uniform1i(uniformLoc, value);
        return;
        case this.gl.INT_VEC2:
        case this.gl.BOOL_VEC2:
        this.gl.uniform2iv(uniformLoc, value);
        return;
        case this.gl.INT_VEC3:
        case this.gl.BOOL_VEC3:
        this.gl.uniform3iv(uniformLoc, value);
        return;
        case this.gl.INT_VEC4:
        case this.gl.BOOL_VEC4:
        this.gl.uniform4iv(uniformLoc, value);
        return;
        case this.gl.FLOAT_MAT2:
        this.gl.uniformMatrix2fv(uniformLoc,
            false, value);
        return;
        case this.gl.FLOAT_MAT3:
        this.gl.uniformMatrix3fv(uniformLoc,
            false, value);
        return;
        case this.gl.FLOAT_MAT4:
        this.gl.uniformMatrix4fv(uniformLoc,
            false, value);
        return;
    }
    throw new global.Error("Unknown uniform type: " +
        this.uniforms[uniformName].type);
});

// -- for retrieving a value from a glsl uniform --
WebGLRenderer.prototype.getUniform = (
function /*getUniform*/(uniformName) {
    if (!this.hasUniform(uniformName)) {
        return;
    }
    return this.gl.getUniform(this.program,
        this.uniforms[uniformName].loc);
});

// -- for getting a description for uniforms --
WebGLRenderer.prototype.describeUniforms = (
function /*describeUniforms*/() {
    return describeProgramUniforms(
        this.gl, this.program);
});

// -- for querying if a uniform is defined --
WebGLRenderer.prototype.hasUniform = (
function /*hasUniform*/(uniformName) {
    return typeof uniformName === "string" &&
        this.uniforms[uniformName];
});

// -----------------------------------------

// -- for setting the clearing color value --
WebGLRenderer.prototype.setBackgroundColor = (
function /*setBackgroundColor*/(r, g, b, a) {
    this.gl.clearColor(r / 0xff, g / 0xff, b / 0xff,
        (a && a > 0 ? a / 0xff :
        (a === 0 ? 0.0 : 1.0)));
    /**
     * __NOTE__: Color channel values are clamped.
     */
});

// -- for setting the clearing color value --
WebGLRenderer.prototype.getBackgroundColor = (
function /*getBackgroundColor*/() {
    // -- returns a Float32Array object --
    return this.gl.getParameter(
        this.gl.COLOR_CLEAR_VALUE);
});

// -----------------------------------------

// -- for updating time and dimension uniforms --
WebGLRenderer.prototype.update = (
function /*update*/() {
    
    // -- current frame time --
    this.currTime = now();
    
    // -- calculates delta time --
    this.deltaTime = (
        this.currTime - this.prevTime) * 0.001;
    
    // -- calculates elapsed time --
    this.elapsedTime = (
        this.currTime - this.initTime) * 0.001;
    
    // -- sets the delta time uniform --
    this.setUniform("u_Delta", this.deltaTime);
        
    // -- sets the elapsed time uniform --
    this.setUniform("u_Time", this.elapsedTime);
    
    // -- sets glsl dimensions uniform  --
    this.setUniform("u_Dimensions",
        this.getDimensions());
    
    // -- updates previous time --
    this.prevTime = this.currTime;
    
});

// -- for rendering everything set --
WebGLRenderer.prototype.render = (
function /*render*/() {
    
    // -- ensures this program will be used --
    this.gl.useProgram(this.program);
    
    // -- clears all buffers --
    this.gl.clear(this.gl.COLOR_BUFFER_BIT |
                  this.gl.DEPTH_BUFFER_BIT |
                  this.gl.STENCIL_BUFFER_BIT);
    
    if (this.elementArray) {
        
        // -- draws array buffers using indices --
        this.gl.drawElements(this.renderMode,
            this.elementArray.elementCount,
            this.elementArray.elementType,
            this.elementArray.offset *
                this.elementArray.bytesPerElement);
        
    }
    else {
        
        // -- draws all set array buffers --
        this.gl.drawArrays(this.renderMode,
            0, this.elementCount);
        
    }
});

return WebGLRenderer;

}));



