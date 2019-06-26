attribute vec4 a_Position;
attribute float a_Color;
varying float v_Color;
uniform mat4 u_vpMatrix;
uniform mat4 u_mMatrix;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main() {
    gl_Position = u_vpMatrix * u_mMatrix * a_Position;
    gl_PointSize = 10.0;
    v_TexCoord = a_TexCoord;
    v_Color = a_Color;
}
