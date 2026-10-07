"""Route B of the Maxwell bake-off: the same storyboard as SPEC.md, in manim 0.21 (MathTex + TransformMatchingTex).
Render: manim -r 1080,1920 --fps 24 --disable_caching -o maxwell scene.py Maxwell   (MiKTeX must be on PATH)
Every {{ }} group is a term that TransformMatchingTex can match; the grouping is hand-made per equation.
"""
from manim import *

config.frame_height = 8
config.frame_width = 4.5  # portrait: -r 1080,1920 alone keeps the 16:9 frame width (14.2) and the picture comes out tiny

BOARD = "#1e2b2c"
WHITE = "#f2efe4"
BLUE = "#8fcbea"
YELLOW = "#f3d66e"
GREEN = "#a7d99f"
W = 4.0  # equation width in scene units (frame is 4.5 x 8)


def eq(tex, y, scale_w=W):
    m = MathTex(tex, color=WHITE)
    if m.width > scale_w:
        m.scale_to_fit_width(scale_w)
    return m.move_to([0, y, 0])


class Maxwell(Scene):
    def construct(self):
        self.camera.background_color = BOARD
        # y: scene units, 8 high; pixel y -> (960 - y_px) / 240
        Y = lambda px: (960 - px) / 240
        cap_y = Y(1440)
        self.cap = None

        def cap(text, color=WHITE):
            c = Text(text, font_size=26, color=color).move_to([0, cap_y, 0])
            old, self.cap = self.cap, c
            return [Write(c)] if old is None else [ReplacementTransform(old, c)]

        divB = eq(r"{{\nabla\cdot}} {{\mathbf{B}}} {{=}} {{0}}", Y(520))
        B = eq(r"{{\mathbf{B}}} {{=}} {{\nabla\times\mathbf{A}}}", Y(520))
        E = eq(r"{{\mathbf{E}}} {{=-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}}}", Y(860))
        gauss = eq(r"{{\nabla\cdot}} {{\mathbf{E}}} {{=\frac{\rho}{\varepsilon_0}}}", Y(760))
        gaussP = eq(r"{{\nabla\cdot}} {{\left(-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}\right)}} {{=\frac{\rho}{\varepsilon_0}}}", Y(760))
        amp = eq(r"{{\nabla\times}} {{\mathbf{B}}} {{=\mu_0}} {{\bigl(}} {{\mathbf{J}}} {{+\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}\bigr)}}", Y(1050))
        ampB = eq(r"{{\nabla\times}} {{\bigl(\nabla\times\mathbf{A}\bigr)}} {{=\mu_0}} {{\bigl(}} {{\mathbf{J}}} {{+\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}\bigr)}}", Y(1050))
        gauge = eq(r"\nabla\cdot\mathbf{A}+\frac{1}{c^{2}}\frac{\partial\varphi}{\partial t}=0", Y(430))
        wphi = eq(r"{{\Box\varphi}} {{=\frac{\rho}{\varepsilon_0}}}", Y(760))
        wA = eq(r"{{\Box\mathbf{A}}} {{=\mu_0}} {{\mathbf{J}}}", Y(1050))
        box = eq(r"\Box=\frac{1}{c^{2}}\frac{\partial^{2}}{\partial t^{2}}-\nabla^{2}", Y(1245), 3.2)
        box.set_color("#b9b8ad")
        # match the A/B pairs' height so the transforms do not rescale: same scale factor per pair is not forced; see the report.

        self.wait(0.2)
        self.play(Write(divB), *cap("no magnetic charges"), run_time=1.0)           # 1.2
        self.wait(0.6)                                                               # 1.8
        self.play(TransformMatchingTex(divB, B), *cap("so B is a curl of A", BLUE), run_time=0.8)  # 2.6
        self.wait(0.8)                                                               # 3.4
        self.play(Write(E), *cap("Faraday's law gives E"), run_time=1.4)             # 4.8
        self.wait(0.8)                                                               # 5.6
        self.play(FadeOut(B), FadeOut(E), FadeOut(self.cap), run_time=0.4); self.cap = None   # 6.0
        self.wait(0.2)                                                               # 6.2
        self.play(Write(gauss), *cap("Gauss's law"), run_time=1.0)                   # 7.2
        self.wait(0.2)                                                               # 7.4
        self.play(TransformMatchingTex(gauss, gaussP), *cap("swap E for its potentials", BLUE), run_time=0.9)  # 8.3
        self.wait(0.7)                                                               # 9.0
        self.play(Write(amp), *cap("Ampère–Maxwell law"), run_time=1.0)              # 10.0
        self.wait(0.3)                                                               # 10.3
        self.play(TransformMatchingTex(amp, ampB), *cap("swap B for its potential", BLUE), run_time=0.9)    # 11.2
        self.wait(1.1)                                                               # 12.3
        self.play(Write(gauge), *cap("choose the Lorenz gauge", YELLOW), run_time=1.0)   # 13.3
        self.play(Create(Underline(gauge, color=YELLOW, buff=0.12)), run_time=0.5)                                          # 13.8
        self.wait(2.2)                                                               # 16.0
        self.play(TransformMatchingTex(gaussP, wphi), TransformMatchingTex(ampB, wA), *cap("the wave equations", GREEN), run_time=1.0)  # 17.0
        self.wait(0.3)                                                               # 17.3
        self.play(Write(box), run_time=1.0)                                          # 18.3
        self.wait(1.7)                                                               # 20.0
