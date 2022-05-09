var gl, program;

var quadverts = new Float32Array([
    -1.0,-1.0,
    +1.0,-1.0,
    -1.0,+1.0,
    
    -1.0,+1.0,
    +1.0,+1.0,
    +1.0,-1.0
])

var vertex_source = "\
attribute vec2 a_position;\
void main() {\
    gl_Position = vec4(a_position, 0.0, 1.0);\
}";

display = function(time){
    
    //clear
    gl.clearColor(1.0,0.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //Update uniform values
    var uniformLocation = gl.getUniformLocation(program, 'time');
    gl.uniform1f(uniformLocation, time/1000);
    
    var uniformLocation = gl.getUniformLocation(program, 'res');
    gl.uniform2f(uniformLocation, width, height);//Doesn't actually change, but whatevs
    
    //var uniformLocation = gl.getUniformLocation(program, 'mouse');
    //gl.uniform2f(uniformLocation, width - mouseX, mouseY);
    
    //draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    frame(display);
}

setup = function(){
    if (!source){console.log("No source"); return;}
    if (!canvas){console.log("No canvas"); return;}
    
    var attr = {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: true
    }
    
    //Grab a context
    gl = canvas.getContext('webgl',  attr)||canvas.getContext('experimental-webgl',  attr)||
         canvas.getContext('webgl2', attr)||canvas.getContext('experimental-webgl2', attr)
    
    if (!gl) {
        console.log("No WebGL context available.");
        return
    }
    //console.log("Got WebGL");
    
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    
    //Create shaders
    var fragment = gl.createShader(gl.FRAGMENT_SHADER)
    var vertex = gl.createShader(gl.VERTEX_SHADER)
    
    //load the source code
    gl.shaderSource(fragment, source)
    gl.shaderSource(vertex, vertex_source)
    
    
    //Compile 'em!
    gl.compileShader(vertex)
    if(!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.log("Vertex error:\n" + gl.getShaderInfoLog(vertex))
        return
    }
    
    gl.compileShader(fragment);
    if(!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        console.log("Fragment error:\n" + gl.getShaderInfoLog(fragment))
        return
    }
    
    //Link the shaders into a program
    program = gl.createProgram()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.useProgram(program)
    
    //Check for errors
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Linking Error: " + gl.getProgramInfoLog(program))
        return
    }
    
    //console.log("Compiled Shaders");
    
    //Load vertices
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, quadverts, gl.STATIC_DRAW)
    
    //Enable Vertex attribute
    var positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    //console.log("Vertices assigned")
    
    frame(display);
}


setup();

