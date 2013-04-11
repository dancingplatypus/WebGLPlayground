uniform float time;

uniform float view_cam_fov;
uniform float view_cam_h;
uniform float view_cam_w;
uniform float view_cam_dx;
uniform float view_cam_dy;
uniform vec2  view_cam_p0;
uniform vec2  view_cam_pf;

varying vec2 vPosition;

float shiftsin(float p)
{
  return 0.5 * sin(p) + 0.5;
}

void main(void)
{
    float PI = 3.14159265358979323846264;
    float colorx, colory, colorz;

    colorx = fract(shiftsin(vPosition.x * 50.0) * shiftsin(vPosition.y * 50.0) * shiftsin(time / 300.0 + 0.6 * PI));
    colory = fract(shiftsin(vPosition.x * 50.0 + PI/3.0) * shiftsin(vPosition.y * 50.0 + PI / 3.0) * shiftsin(time / 300.0));;
    colorz = fract(shiftsin(vPosition.x * 50.0 + 2.0 * PI / 3.0) * shiftsin(vPosition.y * 50.0 + 2.0 * PI/3.0) * shiftsin(time / 300.0 + 1.3 * PI));

    colorx += 0.3 * sin(length(vPosition) * PI * 5.0 - time / 200.0) + 0.3;
    colory += 0.3 * sin(length(vPosition) * PI * 5.0 - time / 300.0 + 0.2 * PI) + 0.3;
    colorz += 0.3 * sin(length(vPosition) * PI * 5.0 - time / 500.0 + 0.4 * PI) + 0.3;

    colorx = clamp(colorx, 0.0, 1.0);
    colory = clamp(colory, 0.0, 1.0);
    colorz = clamp(colorz, 0.0, 1.0);

    gl_FragColor = vec4(colorx, colory, colorz, 1.0);
}