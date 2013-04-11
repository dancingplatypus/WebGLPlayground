#ifdef GL_ES
precision highp float;
#endif

uniform float delta;
uniform float alpha;
varying vec2  vUv;

void main(void)
{
    vec2 position = vUv;
    float red = 1.0;
    float green = 0.25 + sin(delta) * 0.25;
    float blue = 0.0;
    vec3 rgb = vec3(red, green, blue);
    vec4 color = vec4(rgb, alpha);
    gl_FragColor = color;
}