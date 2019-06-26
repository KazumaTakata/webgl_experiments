precision mediump float;
varying vec2 v_TexCoord;
varying float v_Color;
void main(){
    gl_FragColor =  vec4(v_Color,  0.3* v_Color, 0.3, 1.0);
}