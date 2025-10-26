#!/bin/bash
# Render all video_5 scenes in order

echo "🎬 Rendering Video 5: Prisoner's Dilemma (Extended Edition)"
echo "=============================================="

cd /Users/jae/educationalvideoLLC

echo "📹 Scene 1/8: Hook"
manim -pqh video_5/00_hook.py Hook

echo "📹 Scene 2/8: PD Basics"
manim -pqh video_5/01_pd_basics.py PDBasics

echo "📹 Scene 3/8: Iterated PD"
manim -pqh video_5/02_iterated_pd.py IteratedPD

echo "📹 Scene 4/8: Axelrod Tournaments"
manim -pqh video_5/03_axelrod.py Axelrod

echo "📹 Scene 5/8: Noise & Generosity"
manim -pqh video_5/04_noise_generosity.py NoiseGenerosity

echo "📹 Scene 6/8: Strategy Ecology"
manim -pqh video_5/06_ecology.py StrategyEcology

echo "📹 Scene 7/8: Real-World Cases"
manim -pqh video_5/07_cases.py RealWorldCases

echo "📹 Scene 8/8: Conclusion"
manim -pqh video_5/05_conclusion.py PDConclusion

echo ""
echo "✅ All scenes rendered!"
echo "📂 Output: media/videos/"

