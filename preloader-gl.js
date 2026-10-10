/* ==========================================================================
   OrlandoStudio™ — Preloader WebGL
   Luces "cinematográficas" del preloader de index.html dibujadas en un
   fragment shader: quemaduras de película, fugas de luz verticales que
   saturan a blanco, halo/bloom del sello, destello anamórfico, separación de
   color, tearing horizontal, textura de estampado y grano de película.
   Paleta limitada a los verdes de marca + blanco cálido.

   La línea de tiempo (en segundos) es la MISMA que la del script inline de
   #preloader en index.html: encendido 0,15–0,62 · ráfaga 1 ~0,4–0,85 ·
   frame invertido 1,09–1,15 · ráfaga 2 ~1,16–1,68 · limpio desde ~1,75 ·
   salida a los 2,0. Si se cambia una, cambiar la otra.

   Lo carga el script del <head> de index.html (solo si se va a mostrar el
   preloader) y arranca a prepararse apenas llega, en paralelo al parseo.
   OSPreloaderGLInit() → Promise<renderer|null>; OSPreloaderGLInit.cancel()
   corta la preparación si el preloader ya arrancó sin WebGL.
   renderer: canvas · render(segundos) · layout(rectDelSello) · destroy().
   null = sin WebGL o el shader no compiló (el preloader usa la versión DOM).
   ========================================================================== */
(function () {
  "use strict";

  var VERT =
    "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;",
    "uniform float uT;",
    "uniform vec4 uRect;",      /* sello: x, y (desde abajo), ancho, alto en px del canvas */
    "uniform sampler2D uLogo;",
    "uniform sampler2D uGlow;", /* sello desenfocado, cubre el rect x1.6 */

    "const vec3 BG    = vec3(.106,.153,.173);", /* --bg-dark-2 */
    "const vec3 DEEP  = vec3(.141,.200,.227);", /* --deep */
    "const vec3 PAPER = vec3(.953,.949,.953);", /* --bg */
    "const vec3 BRAND = vec3(0.,.514,.345);",   /* --brand */
    "const vec3 BRAND2= vec3(0.,.655,.439);",   /* --brand-2 */
    "const vec3 MINT  = vec3(.761,.863,.686);", /* --mint */
    "const vec3 HOT   = vec3(1.,.985,.95);",

    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    "  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*vn(p);p=p*2.03+17.1;a*=.5;}return v;}",
    "float env(float t,float a,float b,float c,float d){return smoothstep(a,b,t)*(1.-smoothstep(c,d,t));}",
    "float logo(vec2 uv){vec2 q=step(vec2(0.),uv)*step(uv,vec2(1.));return texture2D(uLogo,uv).a*q.x*q.y;}",

    /* Rampa de temperatura de la luz: verde profundo → brand-2 → menta → blanco. */
    "vec3 heat(float h){",
    "  vec3 c=mix(BRAND*.6,BRAND2,smoothstep(0.,.55,h));",
    "  c=mix(c,MINT,smoothstep(.55,1.2,h));",
    "  c=mix(c,HOT,smoothstep(1.2,2.1,h));",
    "  return c*h;}",

    "void main(){",
    "  vec2 fc=gl_FragCoord.xy, uv=fc/uRes;",
    "  float asp=uRes.x/uRes.y, t=uT;",
    "  float fr=floor(t*24.), boil=floor(t*12.);",

    /* Envolventes de la línea de tiempo */
    "  float b1=env(t,.40,.47,.62,.86);",
    "  float b2=env(t,1.15,1.21,1.42,1.70)*1.3;",
    "  float burst=max(b1,b2);",
    "  float clean=1.-smoothstep(1.6,1.9,t);",
    "  float fl=0.;",                                  /* parpadeo de neón */
    "  if(t>=.15){float r=h21(vec2(floor(t*30.),3.1));fl=t<.62?(r>.42?1.:.12+r*.5):1.;}",
    "  float rough=t<.15?1.:max(0.,1.-(t-.15)/1.3);",
    "  rough=max(rough,b2*.45);",
    "  float flash=step(1.09,t)*step(t,1.15);",

    /* Sello: textura de estampado que hierve a 12 fps + tearing en ráfagas */
    "  vec2 luv=(fc-uRect.xy)/uRect.zw;",
    "  vec2 dn=vec2(vn(luv*42.+boil*7.3),vn(luv*42.+boil*3.1+11.))-.5;",
    "  vec2 l0=luv+dn*.018*rough;",
    "  float row=floor(luv.y*26.+boil*3.);",
    "  float tear=(h21(vec2(row,boil))-.5)*step(.72,h21(vec2(row*1.7,boil+1.)))*burst*.07;",
    "  l0.x+=tear;",
    "  float sp=.003+burst*.02;",
    "  float aM=logo(l0);",
    "  float aG=logo(l0+vec2(sp,sp*.25));",
    "  float aT=logo(l0-vec2(sp,-sp*.2));",
    "  float g=texture2D(uGlow,(luv-.5)/1.6+.5).a;",

    /* Fondo: pared de hormigón sutil + viñeta */
    "  vec2 c=(uv-.5)*vec2(asp,1.);",
    "  float wall=vn(c*9.)*.6+vn(c*80.)*.4;",
    "  vec3 col=BG*(.5+.5*smoothstep(1.2,.2,length(c)))*(.82+.36*wall);",

    /* Fugas de luz verticales: bandas orgánicas que suben y queman a blanco */
    "  float xs=uv.x*max(asp,1.3);",                  /* en pantallas angostas mantiene la densidad de columnas */
    "  float band=fbm(vec2(xs*2.6+t*.25,t*.45+fr*.002+3.));",
    "  band=pow(smoothstep(.38,.82,band),2.);",
    "  float flow=fbm(vec2(xs*7.,uv.y*1.4-t*2.6));",
    "  float rise=smoothstep(-.15,.55,1.-uv.y+flow*.45);",
    "  float thin=pow(vn(vec2(xs*26.+7.,t*.9)),14.)*2.6;",
    "  float leak=(band*(.35+1.1*flow)*rise+thin*rise)*(burst*2.3+.07*clean);",
    /* quemadura de película: entra por una esquina al inicio y por la otra en la ráfaga 2 */
    "  float bn=fbm(uv*3.2+t*.8);",
    "  float burnA=smoothstep(.75,0.,length((uv-vec2(.1,.92))*vec2(asp,1.))+.35*bn)*env(t,0.,.1,.3,.75)*1.6;",
    "  float burnB=smoothstep(.85,0.,length((uv-vec2(.95,.05))*vec2(asp,1.))+.4*bn)*b2*1.3;",

    /* Halo del sello (bloom) */
    "  float on=fl*smoothstep(.12,.16,t);",
    "  col+=BRAND2*g*on*(.55+burst*.9);",
    "  col+=BRAND*g*g*on*.6;",

    /* Sello + separación de color */
    "  float s1=clamp((t-.70)/.52,0.,1.), s2=clamp((t-1.23)/.55,0.,1.);",
    "  float d=luv.x+luv.y*.35;",
    "  float spec=smoothstep(.07,0.,abs(d-mix(-.4,1.7,s1)))+smoothstep(.07,0.,abs(d-mix(-.4,1.7,s2)));",
    "  vec3 lc=PAPER+MINT*spec*.9+HOT*spec*.6;",
    "  col=mix(col,lc,aM*on);",
    "  col+=BRAND2*aG*burst*on*1.3+MINT*aT*burst*on*.9;",

    /* Overspray de stencil: salpicado de aerosol alrededor del sello al
       aparecer y en las ráfagas; se limpia cuando el sello se asienta. */
    "  float spk=step(.92,h21(floor(fc*.5)+boil*7.));",
    "  float spray=spk*smoothstep(.04,.32,g)*(1.-aM)*on*(env(t,.15,.22,.75,1.25)+burst*.6);",
    "  col+=mix(MINT,PAPER,.55)*spray*.75;",

    /* Luces sobre todo (como luz real que pasa por delante del lente) */
    "  col+=heat(leak+burnA+burnB);",

    /* Destello anamórfico horizontal en el centro del sello */
    "  vec2 lc0=uRect.xy+uRect.zw*.5;",
    "  float fy=exp(-abs(fc.y-lc0.y)/(uRes.y*.0035));",
    "  float fx=exp(-abs(fc.x-lc0.x)/(uRes.x*.32));",
    "  float fl2=fy*fx*(burst*1.1+env(t,1.55,1.62,1.7,1.98)*.9);",
    "  col+=mix(MINT,HOT,.5)*fl2+BRAND2*fy*fx*.25*fl2;",

    /* Frame invertido */
    "  col=mix(col,mix(PAPER,DEEP,aM),flash);",

    /* Hot spots desaturan a blanco + compresión suave de altas luces */
    "  float lum=dot(col,vec3(.3,.59,.11));",
    "  col=mix(col,vec3(lum),smoothstep(1.,2.2,lum)*.6);",
    "  col=mix(col,.82+.18*(1.-exp(-(col-.82)*4.)),step(.82,col));",

    /* Grano de película + scanlines suaves */
    "  col+=(h21(fc*.71+fr*13.17)-.5)*.075;",
    "  col*=.985+.015*sin(fc.y*2.1);",
    "  gl_FragColor=vec4(col,1.);",
    "}"
  ].join("\n");

  /* Compilar el shader puede tardar 100–200 ms (más en Windows/ANGLE). Con
     KHR_parallel_shader_compile se compila en otro hilo y acá solo se
     consulta si terminó, así la página no se traba mientras tanto. */
  function compile(gl, cb) {
    var prog = gl.createProgram();
    [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]].forEach(function (d) {
      var sh = gl.createShader(d[0]);
      gl.shaderSource(sh, d[1]);
      gl.compileShader(sh);
      gl.attachShader(prog, sh);
    });
    gl.linkProgram(prog);
    var ext = gl.getExtension("KHR_parallel_shader_compile");
    (function check() {
      if (ext && !gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR)) return requestAnimationFrame(check);
      cb(gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null);
    })();
  }

  function texture(gl, unit, source) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  /* Blur de caja separable sobre el canal alfa (3 pasadas ≈ gaussiano).
     Se hace en JS porque ctx.filter no está en todos los Safari. */
  function blurAlpha(ctx, size, radius) {
    var img = ctx.getImageData(0, 0, size, size), d = img.data;
    var a = new Float32Array(size * size), b = new Float32Array(size * size);
    var i, x, y, k, acc, n = radius * 2 + 1;
    for (i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
    for (var pass = 0; pass < 3; pass++) {
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
        acc = 0;
        for (k = -radius; k <= radius; k++) acc += a[y * size + Math.min(size - 1, Math.max(0, x + k))];
        b[y * size + x] = acc / n;
      }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
        acc = 0;
        for (k = -radius; k <= radius; k++) acc += b[Math.min(size - 1, Math.max(0, y + k)) * size + x];
        a[y * size + x] = acc / n;
      }
    }
    for (i = 0; i < a.length; i++) { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = a[i]; }
    ctx.putImageData(img, 0, 0);
  }

  /* El SVG del sello solo trae viewBox: Firefox no lo rasteriza en canvas
     sin width/height, así que se los agregamos antes de cargarlo. */
  function loadLogo(url, px, cb) {
    var fail = function () { cb(null); };
    if (!window.fetch) return fail();
    fetch(url).then(function (r) { return r.text(); }).then(function (svg) {
      svg = svg.replace(/<svg\b/, '<svg width="' + px + '" height="' + Math.round(px * 409.02 / 407) + '"');
      var img = new Image();
      img.onload = function () { cb(img); };
      img.onerror = fail;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }).catch(fail);
  }

  var LOGO = "assets/brand/OrlandoDesignCO_Negativo.svg";
  var cancelled = false;

  function init(cb) {
    var canvas = document.createElement("canvas");
    canvas.className = "pl-gl";
    var gl;
    try {
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "high-performance" });
    } catch (e) {}
    if (!gl) return cb(null);

    /* Shader y sello se preparan en paralelo; se sigue cuando están los dos. */
    var prog, img, pending = 2;
    compile(gl, function (p) { prog = p; if (--pending === 0) setup(); });
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var px = Math.min(1400, Math.round(Math.max(innerWidth, innerHeight) * dpr * .6));
    loadLogo(LOGO, px, function (i) { img = i; if (--pending === 0) setup(); });

    function setup() {
      if (cancelled || !prog || !img) {
        var lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
        return cb(null);
      }
      gl.useProgram(prog);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      var U = {};
      ["uRes", "uT", "uRect", "uLogo", "uGlow"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

      /* Resolución: DPR hasta 1,5 y como máximo ~2,2 Mpx; si los primeros
         frames vienen lentos se baja (ver render). */
      var scale = 1, rect = null, slow = 0, frames = 0, last = 0;
      function size() {
        var w = innerWidth, h = innerHeight;
        var s = Math.min(dpr, Math.sqrt(2.2e6 / (w * h))) * scale;
        canvas.width = Math.max(1, Math.round(w * s));
        canvas.height = Math.max(1, Math.round(h * s));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        if (rect) setRect(rect);
      }
      function setRect(r) {
        rect = r;
        var k = canvas.width / innerWidth;
        gl.uniform4f(U.uRect, r.left * k, (innerHeight - r.bottom) * k, r.width * k, r.height * k);
      }

      var lw = px, lh = Math.round(px * 409.02 / 407);
      var lc = document.createElement("canvas");
      lc.width = lw; lc.height = lh;
      lc.getContext("2d").drawImage(img, 0, 0, lw, lh);

      var G = 160, gc = document.createElement("canvas");
      gc.width = gc.height = G;
      var gx = gc.getContext("2d");
      gx.drawImage(img, G * .1875, G * .1875, G * .625, G * .625); /* 1/1.6 del lienzo */
      blurAlpha(gx, G, 7);

      texture(gl, 0, lc);
      texture(gl, 1, gc);
      gl.uniform1i(U.uLogo, 0);
      gl.uniform1i(U.uGlow, 1);
      size();
      window.addEventListener("resize", size);
      gl.drawArrays(gl.TRIANGLES, 0, 3); /* primer draw de calentamiento */

      cb({
        canvas: canvas,
        layout: setRect,
        render: function (sec) {
          var now = performance.now();
          if (last && frames < 12) {
            frames++;
            if (now - last > 24) slow++;
            if (slow > 5 && scale > .5) { scale *= .7; slow = 0; frames = 0; size(); }
          }
          last = now;
          gl.uniform1f(U.uT, sec);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        },
        destroy: function () {
          window.removeEventListener("resize", size);
          var ext = gl.getExtension("WEBGL_lose_context");
          if (ext) ext.loseContext();
        }
      });
    }
  }

  window.OSPreloaderGLInit = function () {
    return new Promise(function (res) { init(res); });
  };
  window.OSPreloaderGLInit.cancel = function () { cancelled = true; };
})();
