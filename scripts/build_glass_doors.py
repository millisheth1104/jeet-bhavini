#!/usr/bin/env python3
"""Build pixel-perfect SVG assets for the luxury glass conservatory doors.

Matches the reference image:
- Arched top with decorative lotus motifs
- Geometric brass mullions with gold studs and rosettes
- Central hexagonal cartouche with intertwined J & B monogram
- Left door (0 to 260) and Right door (260 to 520) in 520x960 coordinate space.
- Outer arch frame and side fluted columns
"""

import math
import pathlib

OUT = pathlib.Path("assets/generated")
OUT.mkdir(parents=True, exist_ok=True)

# Coords
WIDTH = 560
HEIGHT = 980
CX = WIDTH / 2  # 280
TOP_Y = 30
SPRING_Y = 320
BOTTOM_Y = 960
ARCH_R = CX - 30  # 250

def make_monogram_svg():
    # An intertwined J and B calligraphic monogram in gold
    return """
    <g class="monogram" id="monogramFull">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF5D6"/>
          <stop offset="25%" stop-color="#E5BA55"/>
          <stop offset="50%" stop-color="#B8861B"/>
          <stop offset="75%" stop-color="#F2CE72"/>
          <stop offset="100%" stop-color="#8A5A05"/>
        </linearGradient>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8A6318"/>
          <stop offset="30%" stop-color="#FFDF85"/>
          <stop offset="50%" stop-color="#FFF4D0"/>
          <stop offset="70%" stop-color="#DCA532"/>
          <stop offset="100%" stop-color="#7A530F"/>
        </linearGradient>
        <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FFDF85" flood-opacity="0.4"/>
        </filter>
      </defs>
    </g>
    """

def generate_doors():
    # We will produce two standalone SVGs: door_left.svg and door_right.svg
    # Each door has its own viewBox:
    # Left Door: viewBox="0 0 250 960" (width 250, height 960, inner edge is at right: x=250)
    # Right Door: viewBox="0 0 250 960" (width 250, height 960, inner edge is at left: x=0)
    
    W = 250
    H = 960
    
    # Common defs for gradients and filters
    defs = """
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF8E0"/>
        <stop offset="20%" stop-color="#FFDE7A"/>
        <stop offset="45%" stop-color="#D69B22"/>
        <stop offset="75%" stop-color="#8C5E08"/>
        <stop offset="90%" stop-color="#FFDF80"/>
        <stop offset="100%" stop-color="#B37D14"/>
      </linearGradient>
      <linearGradient id="brassH" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#734E0A"/>
        <stop offset="25%" stop-color="#FCDA74"/>
        <stop offset="50%" stop-color="#FFF3C4"/>
        <stop offset="75%" stop-color="#CF9621"/>
        <stop offset="100%" stop-color="#6B4605"/>
      </linearGradient>
      <linearGradient id="brassV" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6B4605"/>
        <stop offset="25%" stop-color="#FCDA74"/>
        <stop offset="50%" stop-color="#FFF3C4"/>
        <stop offset="75%" stop-color="#CF9621"/>
        <stop offset="100%" stop-color="#734E0A"/>
      </linearGradient>
      <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="30%" stop-color="rgba(255,255,255,0.08)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.22)"/>
        <stop offset="70%" stop-color="rgba(255,255,255,0.05)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.25)"/>
      </linearGradient>
      <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.98)"/>
        <stop offset="85%" stop-color="rgba(255,252,242,0.95)"/>
        <stop offset="100%" stop-color="rgba(247,238,218,0.92)"/>
      </radialGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#E5BA55" flood-opacity="0.35"/>
      </filter>
    </defs>
    """

    # --- LEFT DOOR ---
    # Outer arch on top-left: from (250, 20) curving down to (20, 250), then straight down to (20, 940)
    # Inner straight edge on right: from (250, 940) straight up to (250, 20)
    # Hexagon center is at (250, 340).
    # Left hexagon vertices:
    # Top-center: (250, 230)
    # Top-left shoulder: (150, 285)
    # Bottom-left shoulder: (150, 395)
    # Bottom-center: (250, 450)
    
    left_glass_path = (
        "M 250 20 "
        "C 150 20, 30 110, 20 250 "
        "L 20 940 "
        "L 250 940 "
        "Z"
    )
    
    left_hex_outer = "250,225 145,282 145,398 250,455"
    left_hex_inner = "250,232 153,286 153,394 250,448"

    # Decorative lotus at top (around x=140, y=100)
    left_top_lotus = """
      <!-- Top Lotus Filigree -->
      <g transform="translate(150, 105)" stroke="url(#brassH)" stroke-width="2" fill="none">
        <!-- Central stem -->
        <line x1="0" y1="-30" x2="0" y2="70" />
        <!-- Lotus petals at top -->
        <path d="M 0 -35 C -15 -25, -15 -10, 0 0 C 15 -10, 15 -25, 0 -35 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M 0 -30 C -8 -20, -8 -8, 0 0 C 8 -8, 8 -20, 0 -30 Z" fill="#FFF8E7" />
        <path d="M -15 -20 C -25 -10, -20 5, 0 0" />
        <path d="M 15 -20 C 25 -10, 20 5, 0 0" />
        <!-- Chevrons / palms -->
        <path d="M -30 -5 C -15 10, 0 10, 0 10 C 0 10, 15 10, 30 -5" />
        <path d="M -35 15 C -15 30, 0 30, 0 30 C 0 30, 15 30, 35 15" />
        <path d="M -40 35 C -15 50, 0 50, 0 50 C 0 50, 15 50, 40 35" />
        <path d="M -42 55 C -15 70, 0 70, 0 70 C 0 70, 15 70, 42 55" />
      </g>
    """

    # Lower lotus at bottom (around x=140, y=830)
    left_bottom_lotus = """
      <!-- Lower Lotus Tracery -->
      <g transform="translate(150, 830)" stroke="url(#brassH)" stroke-width="2" fill="none">
        <path d="M -50 40 C -50 0, 50 0, 50 40" />
        <path d="M 0 -15 C -16 0, -14 18, 0 25 C 14 18, 16 0, 0 -15 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M -18 5 C -28 15, -22 25, 0 25" />
        <path d="M 18 5 C 28 15, 22 25, 0 25" />
        <circle cx="-50" cy="40" r="4" fill="url(#brassH)" />
        <circle cx="50" cy="40" r="4" fill="url(#brassH)" />
      </g>
    """

    # Grid lines on left door
    left_grid = """
      <!-- Vertical Mullions -->
      <line x1="85" y1="170" x2="85" y2="940" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="150" y1="40" x2="150" y2="228" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="150" y1="452" x2="150" y2="940" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="210" y1="20" x2="210" y2="230" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="210" y1="450" x2="210" y2="940" stroke="url(#brassV)" stroke-width="2.5" />

      <!-- Horizontal Rails -->
      <line x1="20" y1="280" x2="148" y2="280" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="20" y1="520" x2="250" y2="520" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="20" y1="640" x2="250" y2="640" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="20" y1="760" x2="250" y2="760" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="20" y1="880" x2="250" y2="880" stroke="url(#brassH)" stroke-width="3" />

      <!-- Rosettes and studs -->
      <circle cx="85" cy="280" r="5" fill="url(#brassH)" />
      <circle cx="85" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="85" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="85" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="85" cy="880" r="5" fill="url(#brassH)" />

      <circle cx="150" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="150" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="150" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="150" cy="880" r="5" fill="url(#brassH)" />

      <circle cx="210" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="210" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="210" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="210" cy="880" r="5" fill="url(#brassH)" />

      <!-- 4-petal floral rosette at (150, 640) -->
      <g transform="translate(150, 640) scale(0.9)" fill="#FFF4D0" stroke="url(#brassH)" stroke-width="1.5">
        <circle cx="0" cy="0" r="4" fill="url(#brassH)" />
        <path d="M 0 -14 C 4 -6, 6 -4, 14 0 C 6 4, 4 6, 0 14 C -4 6, -6 4, -14 0 C -6 -4, -4 -6, 0 -14 Z" />
      </g>
    """

    # Calligraphic J letter inside left hexagon
    # Centered around x=205, y=340
    left_j_monogram = """
      <!-- Calligraphic J Monogram -->
      <g id="letterJ" transform="translate(205, 340)" filter="url(#softGlow)">
        <!-- Flourishing top loop -->
        <path d="M -5 -65 C -25 -65, -45 -48, -45 -30 C -45 -12, -28 0, -10 -5 C 5 -10, 8 -28, -5 -32 C -18 -36, -26 -22, -26 -16" 
              fill="none" stroke="url(#goldGrad)" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Main graceful descending stroke and tail -->
        <path d="M -5 -65 C 10 -65, 20 -40, 16 0 C 12 40, 8 75, -8 82 C -24 88, -46 72, -42 50 C -38 30, -20 28, -12 36 C -5 44, -12 56, -22 55" 
              fill="none" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
        <!-- Fine secondary flourish hairline -->
        <path d="M -4 -62 C 8 -62, 16 -38, 13 0 C 10 38, 6 72, -8 78 C -22 84, -42 70, -38 52" 
              fill="none" stroke="#FFF8E0" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <!-- Intertwining link extending toward B across seam -->
        <path d="M 12 -10 C 22 -16, 36 -12, 45 -4" 
              fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
        <path d="M 16 20 C 28 26, 38 22, 45 14" 
              fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    """

    door_left_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%">
      {defs}
      
      <!-- Glass Base with Translucent Fill & Diagonal Sheen -->
      <path d="{left_glass_path}" fill="rgba(255,255,255,0.18)" stroke="none" />
      <path d="{left_glass_path}" fill="url(#glassSheen)" opacity="0.85" />

      <!-- Left Hexagon Medallion Half -->
      <g id="leftHexagon">
        <polygon points="{left_hex_outer}" fill="url(#hexGlow)" stroke="url(#brassH)" stroke-width="3" />
        <polygon points="{left_hex_inner}" fill="none" stroke="url(#goldGrad)" stroke-width="1.8" />
        <!-- Beveled edge along vertical split seam -->
        <line x1="250" y1="225" x2="250" y2="455" stroke="url(#brassV)" stroke-width="3" />
      </g>

      <!-- Monogram J -->
      {left_j_monogram}

      <!-- Lotus filigrees -->
      {left_top_lotus}
      {left_bottom_lotus}

      <!-- Grid mullions, rails, rosettes -->
      {left_grid}

      <!-- Heavy Outer Brass Arch Frame & Inner Meeting Stile -->
      <path d="{left_glass_path}" fill="none" stroke="url(#brassH)" stroke-width="6" />
      <!-- Vertical Meeting Stile (Inner Seam) -->
      <line x1="248" y1="20" x2="248" y2="940" stroke="url(#brassV)" stroke-width="5" />
      <line x1="250" y1="20" x2="250" y2="940" stroke="#FFF4D0" stroke-width="1.5" />
    </svg>"""

    # --- RIGHT DOOR ---
    # Outer arch on top-right: from (0, 20) curving down to (230, 250), then straight down to (230, 940)
    # Inner straight edge on left: from (0, 940) straight up to (0, 20)
    # Hexagon center is at (0, 340).
    # Right hexagon vertices:
    # Top-center: (0, 225)
    # Top-right shoulder: (105, 282)
    # Bottom-right shoulder: (105, 398)
    # Bottom-center: (0, 455)

    right_glass_path = (
        "M 0 20 "
        "C 100 20, 220 110, 230 250 "
        "L 230 940 "
        "L 0 940 "
        "Z"
    )

    right_hex_outer = "0,225 105,282 105,398 0,455"
    right_hex_inner = "0,232 97,286 97,394 0,448"

    right_top_lotus = """
      <!-- Top Lotus Filigree -->
      <g transform="translate(100, 105)" stroke="url(#brassH)" stroke-width="2" fill="none">
        <!-- Central stem -->
        <line x1="0" y1="-30" x2="0" y2="70" />
        <!-- Lotus petals at top -->
        <path d="M 0 -35 C -15 -25, -15 -10, 0 0 C 15 -10, 15 -25, 0 -35 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M 0 -30 C -8 -20, -8 -8, 0 0 C 8 -8, 8 -20, 0 -30 Z" fill="#FFF8E7" />
        <path d="M -15 -20 C -25 -10, -20 5, 0 0" />
        <path d="M 15 -20 C 25 -10, 20 5, 0 0" />
        <!-- Chevrons / palms -->
        <path d="M -30 -5 C -15 10, 0 10, 0 10 C 0 10, 15 10, 30 -5" />
        <path d="M -35 15 C -15 30, 0 30, 0 30 C 0 30, 15 30, 35 15" />
        <path d="M -40 35 C -15 50, 0 50, 0 50 C 0 50, 15 50, 40 35" />
        <path d="M -42 55 C -15 70, 0 70, 0 70 C 0 70, 15 70, 42 55" />
      </g>
    """

    right_bottom_lotus = """
      <!-- Lower Lotus Tracery -->
      <g transform="translate(100, 830)" stroke="url(#brassH)" stroke-width="2" fill="none">
        <path d="M -50 40 C -50 0, 50 0, 50 40" />
        <path d="M 0 -15 C -16 0, -14 18, 0 25 C 14 18, 16 0, 0 -15 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M -18 5 C -28 15, -22 25, 0 25" />
        <path d="M 18 5 C 28 15, 22 25, 0 25" />
        <circle cx="-50" cy="40" r="4" fill="url(#brassH)" />
        <circle cx="50" cy="40" r="4" fill="url(#brassH)" />
      </g>
    """

    right_grid = """
      <!-- Vertical Mullions -->
      <line x1="165" y1="170" x2="165" y2="940" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="100" y1="40" x2="100" y2="228" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="100" y1="452" x2="100" y2="940" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="40" y1="20" x2="40" y2="230" stroke="url(#brassV)" stroke-width="2.5" />
      <line x1="40" y1="450" x2="40" y2="940" stroke="url(#brassV)" stroke-width="2.5" />

      <!-- Horizontal Rails -->
      <line x1="102" y1="280" x2="230" y2="280" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="0" y1="520" x2="230" y2="520" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="0" y1="640" x2="230" y2="640" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="0" y1="760" x2="230" y2="760" stroke="url(#brassH)" stroke-width="2.5" />
      <line x1="0" y1="880" x2="230" y2="880" stroke="url(#brassH)" stroke-width="3" />

      <!-- Rosettes and studs -->
      <circle cx="165" cy="280" r="5" fill="url(#brassH)" />
      <circle cx="165" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="165" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="165" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="165" cy="880" r="5" fill="url(#brassH)" />

      <circle cx="100" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="100" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="100" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="100" cy="880" r="5" fill="url(#brassH)" />

      <circle cx="40" cy="520" r="5" fill="url(#brassH)" />
      <circle cx="40" cy="640" r="5" fill="url(#brassH)" />
      <circle cx="40" cy="760" r="5" fill="url(#brassH)" />
      <circle cx="40" cy="880" r="5" fill="url(#brassH)" />

      <!-- 4-petal floral rosette at (100, 640) -->
      <g transform="translate(100, 640) scale(0.9)" fill="#FFF4D0" stroke="url(#brassH)" stroke-width="1.5">
        <circle cx="0" cy="0" r="4" fill="url(#brassH)" />
        <path d="M 0 -14 C 4 -6, 6 -4, 14 0 C 6 4, 4 6, 0 14 C -4 6, -6 4, -14 0 C -6 -4, -4 -6, 0 -14 Z" />
      </g>
    """

    # Calligraphic B letter inside right hexagon
    # Centered around x=45, y=340
    right_b_monogram = """
      <!-- Calligraphic B Monogram -->
      <g id="letterB" transform="translate(45, 340)" filter="url(#softGlow)">
        <!-- Vertical spine of B with graceful serif -->
        <path d="M -30 -60 C -15 -60, -18 -45, -18 0 C -18 45, -14 62, -28 62" 
              fill="none" stroke="url(#goldGrad)" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Upper bowl -->
        <path d="M -18 -58 C -10 -58, 28 -56, 28 -24 C 28 0, 0 2, -16 2" 
              fill="none" stroke="url(#goldGrad)" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Lower bowl with extended flourishing loop -->
        <path d="M -16 2 C 2 2, 38 4, 38 32 C 38 62, -2 62, -24 62 C -36 62, -45 52, -35 44 C -25 36, -15 48, -26 58" 
              fill="none" stroke="url(#goldGrad)" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Hairline highlight inside bowls -->
        <path d="M -16 -54 C -8 -54, 24 -52, 24 -24 C 24 -2, 2 0, -14 0" 
              fill="none" stroke="#FFF8E0" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <path d="M -14 6 C 2 6, 34 8, 34 32 C 34 58, 0 58, -20 58" 
              fill="none" stroke="#FFF8E0" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
        <!-- Intertwining incoming strokes from J -->
        <path d="M -45 -4 C -36 -12, -25 -10, -18 -8" 
              fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
        <path d="M -45 14 C -38 22, -28 20, -18 14" 
              fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    """

    door_right_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%">
      {defs}
      
      <!-- Glass Base with Translucent Fill & Diagonal Sheen -->
      <path d="{right_glass_path}" fill="rgba(255,255,255,0.18)" stroke="none" />
      <path d="{right_glass_path}" fill="url(#glassSheen)" opacity="0.85" />

      <!-- Right Hexagon Medallion Half -->
      <g id="rightHexagon">
        <polygon points="{right_hex_outer}" fill="url(#hexGlow)" stroke="url(#brassH)" stroke-width="3" />
        <polygon points="{right_hex_inner}" fill="none" stroke="url(#goldGrad)" stroke-width="1.8" />
        <!-- Beveled edge along vertical split seam -->
        <line x1="0" y1="225" x2="0" y2="455" stroke="url(#brassV)" stroke-width="3" />
      </g>

      <!-- Monogram B -->
      {right_b_monogram}

      <!-- Lotus filigrees -->
      {right_top_lotus}
      {right_bottom_lotus}

      <!-- Grid mullions, rails, rosettes -->
      {right_grid}

      <!-- Heavy Outer Brass Arch Frame & Inner Meeting Stile -->
      <path d="{right_glass_path}" fill="none" stroke="url(#brassH)" stroke-width="6" />
      <!-- Vertical Meeting Stile (Inner Seam) -->
      <line x1="2" y1="20" x2="2" y2="940" stroke="url(#brassV)" stroke-width="5" />
      <line x1="0" y1="20" x2="0" y2="940" stroke="#FFF4D0" stroke-width="1.5" />
    </svg>"""

    # Write files
    (OUT / "door_left.svg").write_text(door_left_svg, encoding="utf-8")
    (OUT / "door_right.svg").write_text(door_right_svg, encoding="utf-8")
    print("Generated door_left.svg and door_right.svg")

def generate_portal_frame():
    # Outer frame: 640 x 1000.
    # Doors will sit inside from x=70 to x=570 (width 500, height 960).
    # Left fluted pillar: x=10 to x=66
    # Right fluted pillar: x=574 to x=630
    # Top arch pediment: spandrels on top left and top right
    
    frame_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 1000" width="100%" height="100%">
      <defs>
        <linearGradient id="frameGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF8E0"/>
          <stop offset="25%" stop-color="#FCDA74"/>
          <stop offset="50%" stop-color="#CF9621"/>
          <stop offset="75%" stop-color="#8C5E08"/>
          <stop offset="100%" stop-color="#DCA532"/>
        </linearGradient>
        <linearGradient id="pillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8A6318"/>
          <stop offset="20%" stop-color="#FFFDF7"/>
          <stop offset="50%" stop-color="#E5BA55"/>
          <stop offset="80%" stop-color="#FFFDF7"/>
          <stop offset="100%" stop-color="#6B4605"/>
        </linearGradient>
        <linearGradient id="spandrelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C27A58"/>
          <stop offset="40%" stop-color="#E09F7A"/>
          <stop offset="70%" stop-color="#AD5E3B"/>
          <stop offset="100%" stop-color="#8F4625"/>
        </linearGradient>
        <filter id="frameShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Outer Spandrel Arch Pediment -->
      <g filter="url(#frameShadow)">
        <!-- Top spandrel fill -->
        <path d="M 10 20 L 630 20 L 630 290 C 630 290, 600 80, 480 50 C 400 30, 340 45, 320 25 C 300 45, 240 30, 160 50 C 40 80, 10 290, 10 290 Z" 
              fill="url(#spandrelGrad)" stroke="url(#frameGold)" stroke-width="4" />
        
        <!-- Ornate Painted Cusped Arch Trim -->
        <path d="M 68 290 C 70 140, 180 38, 320 38 C 460 38, 570 140, 572 290" 
              fill="none" stroke="url(#frameGold)" stroke-width="8" stroke-linecap="round" />
        <path d="M 64 290 C 66 136, 178 32, 320 32 C 462 32, 574 136, 576 290" 
              fill="none" stroke="#FFF8E0" stroke-width="2" />
        
        <!-- Cusps/Scallops along the arch edge -->
        <path d="M 70 290 
                 C 75 250, 95 240, 100 215 
                 C 110 175, 140 160, 160 130 
                 C 185 95, 230 75, 270 52 
                 C 295 38, 310 32, 320 28 
                 C 330 32, 345 38, 370 52 
                 C 410 75, 455 95, 480 130 
                 C 500 160, 530 175, 540 215 
                 C 545 240, 565 250, 570 290" 
              fill="none" stroke="#FFF4D0" stroke-width="3" />
      </g>

      <!-- Left Fluted Column / Pilaster (x=10 to x=66) -->
      <g id="leftPillar">
        <rect x="12" y="250" width="52" height="730" fill="#FDFBF7" stroke="url(#frameGold)" stroke-width="3" />
        <!-- Flutes -->
        <line x1="20" y1="260" x2="20" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="28" y1="260" x2="28" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="38" y1="260" x2="38" y2="970" stroke="url(#pillarGrad)" stroke-width="4" />
        <line x1="48" y1="260" x2="48" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="56" y1="260" x2="56" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <!-- Base and Capital moldings -->
        <rect x="8" y="240" width="60" height="14" fill="url(#frameGold)" rx="2" />
        <rect x="8" y="974" width="60" height="16" fill="url(#frameGold)" rx="2" />
      </g>

      <!-- Right Fluted Column / Pilaster (x=574 to x=630) -->
      <g id="rightPillar">
        <rect x="576" y="250" width="52" height="730" fill="#FDFBF7" stroke="url(#frameGold)" stroke-width="3" />
        <!-- Flutes -->
        <line x1="584" y1="260" x2="584" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="592" y1="260" x2="592" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="602" y1="260" x2="602" y2="970" stroke="url(#pillarGrad)" stroke-width="4" />
        <line x1="612" y1="260" x2="612" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <line x1="620" y1="260" x2="620" y2="970" stroke="url(#pillarGrad)" stroke-width="3" />
        <!-- Base and Capital moldings -->
        <rect x="572" y="240" width="60" height="14" fill="url(#frameGold)" rx="2" />
        <rect x="572" y="974" width="60" height="16" fill="url(#frameGold)" rx="2" />
      </g>
    </svg>"""
    (OUT / "glass_portal_frame.svg").write_text(frame_svg, encoding="utf-8")
    print("Generated glass_portal_frame.svg")

if __name__ == "__main__":
    generate_doors()
    generate_portal_frame()
