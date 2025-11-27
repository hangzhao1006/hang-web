document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('glCanvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.warn('WebGL 不支持，背景水波效果将被禁用');
        return;
    }

    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    // 画布大小跟窗口同步
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // --- 着色器 ---
    const vertexShaderSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // 模拟着色器
    const simulationShaderSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_force;
        uniform float u_radius;

        void main() {
            vec2 pixel = 1.0 / u_resolution;
            vec2 uv = v_uv;

            float left = texture2D(u_texture, uv + vec2(-pixel.x, 0.0)).r;
            float right = texture2D(u_texture, uv + vec2(pixel.x, 0.0)).r;
            float top = texture2D(u_texture, uv + vec2(0.0, pixel.y)).r;
            float bottom = texture2D(u_texture, uv + vec2(0.0, -pixel.y)).r;

            float val = (left + right + top + bottom) / 2.0 - texture2D(u_texture, uv).g;
            val *= 0.98;

            vec2 aspectRatio = vec2(u_resolution.x / u_resolution.y, 1.0);
            float dist = distance(uv * aspectRatio, u_mouse * aspectRatio);
            if (dist < u_radius) {
                val += u_force * smoothstep(u_radius, 0.0, dist);
            }

            gl_FragColor = vec4(val, texture2D(u_texture, uv).r, 0.0, 1.0);
        }
    `;

    // 渲染着色器 - 输出扭曲的透明覆盖层
    const renderShaderSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D u_heightMap;
        uniform vec2 u_resolution;

        void main() {
            vec2 uv = v_uv;
            vec2 pixel = 1.0 / u_resolution;

            float val = texture2D(u_heightMap, uv).r;
            float val_h = texture2D(u_heightMap, uv + vec2(pixel.x, 0.0)).r;
            float val_v = texture2D(u_heightMap, uv + vec2(0.0, pixel.y)).r;

            vec3 normal = normalize(vec3(val - val_h, val - val_v, 0.02));

            // 计算高光
            vec3 lightDir = normalize(vec3(-0.5, 1.0, 1.0));
            vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 80.0);

            // 输出半透明的高光效果
            vec3 rippleColor = vec3(0.7, 0.85, 1.0) * spec;
            float alpha = spec * 0.4;

            gl_FragColor = vec4(rippleColor, alpha);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    function createProgram(gl, vsSource, fsSource) {
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    }

    function createFloatTexture(width, height) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    }

    const simProgram = createProgram(gl, vertexShaderSource, simulationShaderSource);
    const renderProgram = createProgram(gl, vertexShaderSource, renderShaderSource);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const texWidth = window.innerWidth;
    const texHeight = window.innerHeight;

    const textureA = createFloatTexture(texWidth, texHeight);
    const textureB = createFloatTexture(texWidth, texHeight);

    const framebufferA = gl.createFramebuffer();
    const framebufferB = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureA, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureB, 0);

    const uSimLocs = {
        res: gl.getUniformLocation(simProgram, 'u_resolution'),
        mouse: gl.getUniformLocation(simProgram, 'u_mouse'),
        force: gl.getUniformLocation(simProgram, 'u_force'),
        radius: gl.getUniformLocation(simProgram, 'u_radius'),
        tex: gl.getUniformLocation(simProgram, 'u_texture')
    };

    const uRenderLocs = {
        res: gl.getUniformLocation(renderProgram, 'u_resolution'),
        heightMap: gl.getUniformLocation(renderProgram, 'u_heightMap')
    };

    let mouseX = -1000, mouseY = -1000, lastMouseX = -1000, lastMouseY = -1000;
    let isMouseDown = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('mousedown', () => (isMouseDown = true));
    window.addEventListener('mouseup', () => (isMouseDown = false));

    let frameCount = 0;

    // 启用混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function render() {
        let dx = mouseX - lastMouseX;
        let dy = mouseY - lastMouseY;
        let speed = Math.sqrt(dx * dx + dy * dy);
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        let force = Math.min(speed * 0.02, 0.3);
        if (isMouseDown) force = Math.max(force, 0.2);

        let radius = 0.025 + Math.min(speed * 0.0005, 0.04);

        const glMouseX = mouseX / window.innerWidth;
        const glMouseY = 1.0 - mouseY / window.innerHeight;

        // Pass 1: Simulation
        gl.useProgram(simProgram);
        const writeFB = frameCount % 2 === 0 ? framebufferB : framebufferA;
        const readTex = frameCount % 2 === 0 ? textureA : textureB;

        gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB);
        gl.viewport(0, 0, texWidth, texHeight);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, readTex);
        gl.uniform1i(uSimLocs.tex, 0);

        gl.uniform2f(uSimLocs.res, texWidth, texHeight);
        gl.uniform2f(uSimLocs.mouse, glMouseX, glMouseY);
        gl.uniform1f(uSimLocs.force, force);
        gl.uniform1f(uSimLocs.radius, radius);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const posLocSim = gl.getAttribLocation(simProgram, 'a_position');
        gl.enableVertexAttribArray(posLocSim);
        gl.vertexAttribPointer(posLocSim, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Pass 2: Render
        gl.useProgram(renderProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        const heightMapTex = frameCount % 2 === 0 ? textureB : textureA;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, heightMapTex);
        gl.uniform1i(uRenderLocs.heightMap, 0);

        gl.uniform2f(uRenderLocs.res, canvas.width, canvas.height);

        const posLocRender = gl.getAttribLocation(renderProgram, 'a_position');
        gl.enableVertexAttribArray(posLocRender);
        gl.vertexAttribPointer(posLocRender, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        frameCount++;
        requestAnimationFrame(render);
    }

    render();
});
