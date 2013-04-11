uniform float time;

attribute vec3 in_ray;
attribute vec2 in_deflect;

varying vec2 vPosition;
varying vec2 vDeflect;
varying vec3 vRay;

void main(void)
{
    vPosition = position.xy;
    vDeflect = in_deflect;
    vRay = in_ray;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}