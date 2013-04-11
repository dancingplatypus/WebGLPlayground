uniform float time;

varying vec2 vPosition;
varying vec2 vDeflect;
varying vec3 vRay;

void main(void)
{
    gl_FragColor = vec4(1.0 - length(vRay), 0.0, 0.0, 1.0);
}