"""Navier-Stokes (incompressible), 1080x1920, 24 fps, 20 s, manim 0.21. Spec and sources: ../SPEC.md
Render: manim -r 1080,1920 --fps 24 --disable_caching -o navier_stokes scene.py NavierStokes   (MiKTeX on PATH)
Every {{ }} group is a term that TransformMatchingTex can match.
"""
from manim import *

config.frame_height = 8
config.frame_width = 4.5  # portrait: -r 1080,1920 alone keeps the 16:9 frame width

BOARD = "#1e2b2c"
WHITE = "#f2efe4"
BLUE = "#8fcbea"
YELLOW = "#f3d66e"
GREEN = "#a7d99f"
ORANGE = "#f2b27c"
PINK = "#f1a1b4"
W = 4.0


def eq(tex, y, scale_w=W):
    m = MathTex(tex, color=WHITE).scale(0.8)
    if m.width > scale_w:
        m.scale_to_fit_width(scale_w)
    return m.move_to([0, y, 0])


class NavierStokes(Scene):
    def construct(self):
        self.camera.background_color = BOARD
        Y = lambda px: (960 - px) / 240
        cap_y = Y(1440)
        self.cap = None

        def cap(text, color=WHITE):
            c = Text(text, font_size=26, color=color).move_to([0, cap_y, 0])
            old, self.cap = self.cap, c
            return [Write(c)] if old is None else [ReplacementTransform(old, c)]

        cont = eq(r"\nabla\cdot\mathbf{u}=0", Y(380))
        # rho form: line 1 = rho (acceleration), line 2 = pressure, viscous, body force
        r1 = eq(r"{{\rho}} {{\bigl(}} {{\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}}} {{\bigr)}}", Y(560))
        r2 = eq(r"{{=}} {{-\nabla p}} {{+\mu\nabla^{2}\mathbf{u}}} {{+\rho\mathbf{f}}}", Y(810))
        # kinematic form (divided by rho)
        k1 = eq(r"{{\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}}}", Y(560))
        k2 = eq(r"{{=}} {{-\frac{1}{\rho}\nabla p}} {{+\nu\nabla^{2}\mathbf{u}}} {{+\mathbf{f}}}", Y(810))
        nu = eq(r"\nu=\frac{\mu}{\rho}", Y(1020), 1.6).set_x(-1.05)
        re = eq(r"\mathrm{Re}=\frac{UL}{\nu}", Y(1020), 1.6).set_x(1.05)

        c = (0, Y(1300), 0)
        field = ArrowVectorField(
            lambda p: np.array([-(p[1] - c[1]), p[0] - c[0], 0]) * 0.8,
            x_range=[-0.9, 0.9, 0.3], y_range=[c[1] - 0.45, c[1] + 0.45, 0.3], length_func=lambda n: 0.3 * np.tanh(n),
            colors=[BLUE, GREEN, YELLOW],
        )
        dot = Dot(point=[0.45, c[1], 0], color=PINK, radius=0.06)
        orbit = Circle(radius=0.45, arc_center=[0, c[1], 0]).move_to([0, c[1], 0])

        self.wait(0.2)
        self.play(Write(cont), *cap("the fluid keeps its volume"), run_time=1.0)             # 1.2
        self.wait(0.4)                                                                        # 1.6
        self.play(Write(r1), Write(r2), *cap("momentum balance"), run_time=1.6)               # 3.2
        self.wait(0.4)                                                                        # 3.6
        self.play(r1[2].animate.set_color(BLUE), *cap("acceleration of a parcel", BLUE), run_time=0.9)   # 4.5
        self.wait(0.3)                                                                        # 4.8
        self.play(r2[1].animate.set_color(YELLOW), *cap("pressure gradient", YELLOW), run_time=0.9)      # 5.7
        self.wait(0.3)                                                                        # 6.0
        self.play(r2[2].animate.set_color(GREEN), *cap("viscous diffusion", GREEN), run_time=0.9)        # 6.9
        self.wait(0.3)                                                                        # 7.2
        self.play(r2[3].animate.set_color(ORANGE), *cap("body force, e.g. gravity", ORANGE), run_time=0.9)  # 8.1
        self.wait(0.9)                                                                        # 9.0
        self.play(TransformMatchingTex(r1, k1), TransformMatchingTex(r2, k2), *cap("divide by rho"), run_time=2.0)  # 11.0
        self.wait(0.5)                                                                        # 11.5
        self.play(Write(nu), *cap("nu is the kinematic viscosity"), run_time=0.8)             # 12.3
        self.wait(0.7)                                                                        # 13.0
        self.play(Write(re), *cap("inertial / viscous forces", PINK), run_time=1.0)           # 14.0
        self.wait(0.5)                                                                        # 14.5
        self.play(FadeIn(field), FadeIn(dot), *cap("an example flow: rotation"), run_time=1.0)   # 15.5
        self.play(MoveAlongPath(dot, orbit), run_time=4.5, rate_func=linear)                  # 20.0
