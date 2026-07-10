import sys

effects = [
    ("blueprint", "background-color: #003366; background-image: linear-gradient(#004488 1px, transparent 1px), linear-gradient(90deg, #004488 1px, transparent 1px); background-size: 20px 20px; box-shadow: inset 0 0 20px #000; font-family: monospace;"),
    ("sepia", "filter: sepia(0.8) contrast(1.2) brightness(0.9);"),
    ("flames", "background: linear-gradient(to top, #ff4500 0%, #ff8c00 20%, transparent 40%); animation: pe-flame-flicker 0.1s infinite alternate;"),
    ("rain", "background-image: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%); animation: pe-rain-fall 0.5s linear infinite;"),
    ("smoke", "background: radial-gradient(circle at 50% 100%, rgba(100,100,100,0.5) 0%, transparent 60%); animation: pe-smoke-rise 4s ease-in-out infinite alternate;"),
    ("bubbles", "background: radial-gradient(circle at 50% 100%, rgba(0,255,255,0.2) 0%, transparent 30%); animation: pe-bubbles-rise 3s linear infinite;"),
    ("hearts", "background-image: radial-gradient(circle, rgba(255,0,100,0.3) 10%, transparent 20%); background-size: 50px 50px; animation: pe-float-up 4s linear infinite;"),
    ("snow", "background-image: radial-gradient(circle, #fff 10%, transparent 20%); background-size: 30px 30px; animation: pe-snow-fall 3s linear infinite;"),
    ("matrix", "background-color: #000; color: #0f0; background-image: linear-gradient(rgba(0, 255, 0, 0.2) 1px, transparent 1px); background-size: 100% 4px; animation: pe-scanline 2s linear infinite;"),
    ("glitch", "animation: pe-glitch-anim 2s infinite;"),
    ("cyberpunk", "background: linear-gradient(45deg, #ff00ff 0%, #00ffff 100%); box-shadow: inset 0 0 20px rgba(0,0,0,0.8); mix-blend-mode: color-burn;"),
    ("stars", "background-color: #000; background-image: radial-gradient(circle, #fff 10%, transparent 20%); background-size: 10px 10px; animation: pe-twinkle 2s infinite;"),
    ("clouds", "background: linear-gradient(to bottom, #87CEEB 0%, #fff 100%); animation: pe-cloud-drift 10s linear infinite;"),
    ("ocean", "background: linear-gradient(to bottom, #006994 0%, #000 100%); animation: pe-wave 5s ease-in-out infinite alternate;"),
    ("lava", "background: linear-gradient(to bottom, #ff0000 0%, #ff7f00 100%); animation: pe-lava-flow 3s ease-in-out infinite alternate;"),
    ("thunder", "animation: pe-thunder-flash 5s infinite;"),
    ("fireflies", "background-image: radial-gradient(circle, rgba(173,255,47,0.8) 10%, transparent 30%); background-size: 40px 40px; animation: pe-firefly-blink 2s infinite alternate;"),
    ("confetti", "background-image: linear-gradient(45deg, red 25%, transparent 25%, transparent 75%, red 75%, red), linear-gradient(45deg, red 25%, transparent 25%, transparent 75%, red 75%, red); background-size: 20px 20px; background-position: 0 0, 10px 10px; animation: pe-confetti-fall 2s linear infinite;"),
    ("butterflies", "background: radial-gradient(circle, rgba(255,105,180,0.5) 10%, transparent 40%); animation: pe-flutter 1s infinite alternate;"),
    ("bats", "background: radial-gradient(circle, rgba(0,0,0,0.8) 10%, transparent 40%); animation: pe-flutter 0.5s infinite alternate; filter: grayscale(1);"),
    ("ghosts", "background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 40%); animation: pe-float-up 5s ease-in-out infinite;"),
    ("leaves", "background: radial-gradient(circle, rgba(210,105,30,0.6) 10%, transparent 40%); animation: pe-snow-fall 4s linear infinite;"),
    ("sakura", "background: radial-gradient(circle, rgba(255,192,203,0.7) 10%, transparent 40%); animation: pe-snow-fall 5s linear infinite;"),
    ("sparks", "background: radial-gradient(circle, rgba(255,215,0,0.8) 5%, transparent 20%); animation: pe-spark-fly 0.5s infinite alternate;"),
    ("hologram", "background: linear-gradient(180deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.4) 50%, rgba(0,255,255,0.1) 100%); animation: pe-hologram-scan 3s linear infinite; opacity: 0.8;"),
    ("vhs", "filter: contrast(1.5) saturate(1.5) hue-rotate(5deg); animation: pe-vhs-jitter 0.1s infinite;"),
    ("crt", "background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 100%); background-size: 100% 4px; background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);"),
    ("neon-pulse", "box-shadow: inset 0 0 20px #ff00ff, 0 0 20px #ff00ff; animation: pe-neon-pulse-anim 1.5s infinite alternate;"),
    ("void", "background-color: #050010; background: radial-gradient(circle at 50% 50%, #1a0033 0%, #000 100%); animation: pe-void-pulse 5s infinite alternate;"),
    ("aurora", "background: linear-gradient(45deg, #00ff87 0%, #60efff 100%); opacity: 0.4; mix-blend-mode: overlay; animation: pe-aurora-shift 8s infinite alternate;"),
    ("strobe", "animation: pe-strobe-flash 0.1s infinite;"),
    ("disco", "background-image: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); opacity: 0.2; animation: pe-disco-spin 2s linear infinite;"),
    ("gold-dust", "background-image: radial-gradient(circle, rgba(255,215,0,0.6) 10%, transparent 20%); background-size: 15px 15px; animation: pe-twinkle 1.5s infinite;"),
    ("blood-moon", "background: radial-gradient(circle at 50% 20%, #8b0000 0%, #2a0000 50%, #000 100%);"),
    ("underwater", "background: linear-gradient(to bottom, #001f3f 0%, #001122 100%); box-shadow: inset 0 0 50px rgba(0,150,255,0.2); animation: pe-wave 6s infinite alternate;"),
    ("toxic", "background: radial-gradient(ellipse at 50% 100%, rgba(57,255,20,0.3) 0%, transparent 70%); animation: pe-toxic-glow 2s infinite alternate;"),
    ("radioactive", "background-color: #111; background-image: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 20px, rgba(173,255,47,0.1) 20px, rgba(173,255,47,0.1) 40px);"),
    ("shatter", "background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.5) 50%, transparent 55%); background-size: 100px 100px;"),
    ("mirror", "background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);"),
    ("ink", "background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 100%); animation: pe-ink-spread 5s forwards;"),
    ("paper", "background-color: #f4f4f4; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjRmNGY0Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+');"),
    ("wood", "background-color: #8b5a2b; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);"),
    ("metal", "background: linear-gradient(to right, #7d7e7d 0%, #0e0e0e 100%);"),
    ("leather", "background-color: #3b2f2f; background-image: radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px); background-size: 4px 4px;"),
    ("hacker", "background-color: #000; color: #0f0; border: 1px solid #0f0; font-family: 'Courier New', Courier, monospace; box-shadow: 0 0 10px #0f0;"),
    ("rainbow-swirl", "background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); animation: pe-disco-spin 4s linear infinite; mix-blend-mode: overlay;"),
    ("diamond", "background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.8) 100%); box-shadow: inset 0 0 20px rgba(255,255,255,0.5);")
]

css = "/* Generated Profile Effects */\n"
for name, style in effects:
    css += f".profile-effect-{name} {{ {style} }}\n"

css += """
@keyframes pe-flame-flicker { 0% { opacity: 0.8; transform: translateY(2px); } 100% { opacity: 1; transform: translateY(-2px); } }
@keyframes pe-rain-fall { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
@keyframes pe-smoke-rise { 0% { opacity: 0.5; transform: scale(1); } 100% { opacity: 0.8; transform: scale(1.1) translateY(-10px); } }
@keyframes pe-bubbles-rise { 0% { background-position: 0 100px; } 100% { background-position: 0 0; } }
@keyframes pe-float-up { 0% { background-position: 0 100px; opacity: 0; } 50% { opacity: 1; } 100% { background-position: 0 0; opacity: 0; } }
@keyframes pe-snow-fall { 0% { background-position: 0 -100px; } 100% { background-position: 0 100px; } }
@keyframes pe-scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
@keyframes pe-glitch-anim { 0%, 100% { transform: none; filter: none; } 10% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); } 20% { transform: translate(2px, -2px); filter: hue-rotate(-90deg); } }
@keyframes pe-twinkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes pe-cloud-drift { 0% { background-position: 0 0; } 100% { background-position: 200px 0; } }
@keyframes pe-wave { 0% { background-position: 0 0; } 100% { background-position: 50px 20px; } }
@keyframes pe-lava-flow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(20deg); } }
@keyframes pe-thunder-flash { 0%, 95%, 98%, 100% { background-color: transparent; } 96%, 99% { background-color: rgba(255,255,255,0.8); } }
@keyframes pe-firefly-blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
@keyframes pe-confetti-fall { 0% { background-position: 0 0, 10px 10px; } 100% { background-position: 0 100px, 10px 110px; } }
@keyframes pe-flutter { 0% { transform: translateX(-5px); } 100% { transform: translateX(5px); } }
@keyframes pe-spark-fly { 0% { opacity: 1; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(0.5) translateY(-20px); } }
@keyframes pe-hologram-scan { 0% { background-position: 0 -100%; } 100% { background-position: 0 200%; } }
@keyframes pe-vhs-jitter { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(1px); } }
@keyframes pe-neon-pulse-anim { 0% { box-shadow: inset 0 0 10px #ff00ff, 0 0 10px #ff00ff; } 100% { box-shadow: inset 0 0 30px #ff00ff, 0 0 30px #ff00ff; } }
@keyframes pe-void-pulse { 0% { filter: brightness(0.8); } 100% { filter: brightness(1.2); } }
@keyframes pe-aurora-shift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(60deg); } }
@keyframes pe-strobe-flash { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
@keyframes pe-disco-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pe-toxic-glow { 0% { opacity: 0.5; } 100% { opacity: 0.9; } }
@keyframes pe-ink-spread { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
"""

with open('src/profile-decor.css', 'w') as f:
    f.write(css)

