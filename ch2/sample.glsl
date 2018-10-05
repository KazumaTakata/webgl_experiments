#ifdef GL_ES
        precision mediump float;
    #endif
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    float random (vec2 st) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898,78.233)))*
            43758.5453123);
     }   
    void main(){
   
    vec2 st = gl_FragCoord.xy/vec2(50, 50);
    vec2 ipos = floor(st);
    float rnd = random( ipos );
    gl_FragColor = vec4( vec3(rnd) , 1);

    }