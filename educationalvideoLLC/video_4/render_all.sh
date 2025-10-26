#!/bin/bash

# Render all scenes in video_4
echo "Rendering all video_4 scenes..."
echo ""

# Scene 1: Hook
echo "Rendering Hook scene..."
manim -pqh 00_hook.py Hook

# Scene 2: Intro
echo "Rendering Intro scene..."
manim -pqh 01_intro.py Intro

# Scene 3: Science
echo "Rendering Science scene..."
manim -pqh 02_science.py Science

# Scene 4: Tips
echo "Rendering Tips scene..."
manim -pqh 03_tips.py Tips

# Scene 5: Outro
echo "Rendering Outro scene..."
manim -pqh 04_outro.py Outro

echo ""
echo "All scenes rendered! Check the media/videos/video_4 folder"


