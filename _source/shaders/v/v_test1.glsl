varying vec2 vUv;
uniform float delta;
uniform float scale;
uniform float alpha;

void main()
{
    vUv = uv;
    vec3 p = position;

    p.z += sin(2.0 * p.y + delta) * 5.0;
    p.z += cos(2.0 * p.z + delta / 2.0) * 5.0;
    p.z += cos(2.0 * p.x + delta) * 5.0;
    p.x += sin(p.y + delta / 2.0) * 10.0;

    vec4 mvPosition = modelViewMatrix * vec4(scale * p, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}