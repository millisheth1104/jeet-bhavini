import math

def generate_exact_reference_svg():
    W = 500.0
    H = 860.0
    CX = W / 2.0  # 250.0
    CY = H / 2.0  # 430.0

    # The exact geometry matching the user reference card:
    # 1. Top Apex at (250, 42)
    # 2. Smooth Ogee Arch curve descending to (88, 246)
    # 3. Shoulder vertical step from (88, 246) to (88, 276)
    # 4. Shoulder horizontal step from (88, 276) out to (52, 276) with rounded corner
    # 5. Vertical straight edge from (46, 290) down to (46, 430)
    
    def get_top_left_contour(inset=0.0):
        # We compute an offset path by shrinking inward
        # Base anchor points for outer boundary:
        # Apex
        p_apex = (250.0, 42.0 + inset)
        
        # Ogee arch curve points (smooth graceful arch with inflection near apex)
        # Using cubic bezier segments:
        # Segment 1: Apex (250, 42) to mid-arch inflection (162, 114)
        # Segment 2: (162, 114) down to shoulder top (88, 246)
        
        # Shoulder points
        p_shoulder_top = (88.0 + inset * 0.7, 246.0 + inset * 0.7)
        p_shoulder_inner = (88.0 + inset, 276.0 - inset * 0.3)
        p_shoulder_outer = (52.0 + inset, 276.0 + inset * 0.3)
        p_vert_start = (46.0 + inset, 290.0)
        p_vert_mid = (46.0 + inset, 430.0)
        
        pts = []
        
        # Generate samples along ogee arch:
        # Point at apex
        pts.append(p_apex)
        
        # Cubic bezier 1: (250, 42) -> (220, 56) -> (190, 78) -> (162, 114)
        p0 = (250.0, 42.0 + inset)
        p1 = (220.0 + inset * 0.2, 54.0 + inset)
        p2 = (188.0 + inset * 0.4, 78.0 + inset * 0.9)
        p3 = (160.0 + inset * 0.6, 116.0 + inset * 0.8)
        
        # Cubic bezier 2: (162, 114) -> (130, 155) -> (104, 198) -> (88, 246)
        p4 = (132.0 + inset * 0.7, 154.0 + inset * 0.7)
        p5 = (104.0 + inset * 0.8, 198.0 + inset * 0.7)
        p6 = (88.0 + inset * 0.7, 246.0 + inset * 0.6)
        
        # Sample curve 1
        steps = 24
        for s in range(1, steps + 1):
            t = s / float(steps)
            x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
            y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
            pts.append((x, y))
            
        # Sample curve 2
        for s in range(1, steps + 1):
            t = s / float(steps)
            x = (1-t)**3 * p3[0] + 3*(1-t)**2*t * p4[0] + 3*(1-t)*t**2 * p5[0] + t**3 * p6[0]
            y = (1-t)**3 * p3[1] + 3*(1-t)**2*t * p4[1] + 3*(1-t)*t**2 * p5[1] + t**3 * p6[1]
            pts.append((x, y))
            
        # Shoulder vertical segment: (88, 246) down to (88, 276)
        sh_steps = 8
        for s in range(1, sh_steps + 1):
            t = s / float(sh_steps)
            sy = p6[1] + t * (p_shoulder_inner[1] - p6[1])
            sx = p_shoulder_inner[0]
            pts.append((sx, sy))
            
        # Shoulder horizontal step: (88, 276) out to (52, 276)
        h_steps = 10
        for s in range(1, h_steps + 1):
            t = s / float(h_steps)
            sx = p_shoulder_inner[0] + t * (p_shoulder_outer[0] - p_shoulder_inner[0])
            sy = p_shoulder_outer[1]
            pts.append((sx, sy))
            
        # Rounded corner transition from (52, 276) to (46, 290)
        c_steps = 6
        for s in range(1, c_steps + 1):
            t = s / float(c_steps)
            # Quadratic arc around corner
            cp = (46.0 + inset, 276.0 + inset * 0.3)
            x = (1-t)**2 * p_shoulder_outer[0] + 2*(1-t)*t * cp[0] + t**2 * p_vert_start[0]
            y = (1-t)**2 * p_shoulder_outer[1] + 2*(1-t)*t * cp[1] + t**2 * p_vert_start[1]
            pts.append((x, y))
            
        # Vertical straight side from (46, 290) to (46, 430)
        v_steps = 20
        for s in range(1, v_steps + 1):
            t = s / float(v_steps)
            vy = p_vert_start[1] + t * (p_vert_mid[1] - p_vert_start[1])
            pts.append((p_vert_mid[0], vy))
            
        return pts

    def build_full_polygon(inset=0.0):
        tl = get_top_left_contour(inset)
        # Top-right is mirror of top-left across CX=250
        tr = [(2 * CX - x, y) for x, y in tl]
        
        # Bottom-right is mirror of top-right across CY=430
        br = [(x, 2 * CY - y) for x, y in reversed(tr)]
        
        # Bottom-left is mirror of top-left across CY=430
        bl = [(2 * CX - x, y) for x, y in br]
        
        full = []
        full.extend(tr)
        full.extend(br[1:])
        full.extend(reversed(bl[:-1]))
        full.extend(reversed(tl[:-1]))
        
        # Clean duplicates
        clean = []
        for p in full:
            if not clean or math.hypot(p[0]-clean[-1][0], p[1]-clean[-1][1]) > 0.5:
                clean.append(p)
        return clean

    def poly_to_path_d(poly):
        if not poly:
            return ""
        d = [f"M {poly[0][0]:.2f} {poly[0][1]:.2f}"]
        for p in poly[1:]:
            d.append(f"L {p[0]:.2f} {p[1]:.2f}")
        d.append("Z")
        return " ".join(d)

    # Contours:
    # 1. Outer boundary (edge of the cream panel)
    outer_poly = build_full_polygon(inset=0.0)
    outer_d = poly_to_path_d(outer_poly)

    # 2. Mid contour (inner edge of Mughal floral band, inset 16px)
    mid_poly = build_full_polygon(inset=16.0)
    mid_d = poly_to_path_d(mid_poly)

    # 3. Gold band outer rule (inset 22px)
    gold_outer_poly = build_full_polygon(inset=21.0)
    gold_outer_d = poly_to_path_d(gold_outer_poly)

    # 4. Gold band inner rule (inset 31px)
    gold_inner_poly = build_full_polygon(inset=31.0)
    gold_inner_d = poly_to_path_d(gold_inner_poly)

    # Centerline for outer floral band (inset 8px)
    flower_poly = build_full_polygon(inset=8.0)
    cum_lens = [0.0]
    for i in range(len(flower_poly) - 1):
        d = math.hypot(flower_poly[i+1][0] - flower_poly[i][0], flower_poly[i+1][1] - flower_poly[i][1])
        cum_lens.append(cum_lens[-1] + d)
    total_len = cum_lens[-1]

    def point_at_dist(dist, poly, lens, tot):
        dist = dist % tot
        for i in range(len(lens) - 1):
            if lens[i] <= dist <= lens[i+1]:
                seg_len = lens[i+1] - lens[i]
                if seg_len < 0.001:
                    return poly[i], 0.0
                t = (dist - lens[i]) / seg_len
                p1 = poly[i]
                p2 = poly[i+1]
                x = p1[0] + t * (p2[0] - p1[0])
                y = p1[1] + t * (p2[1] - p1[1])
                angle = math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180.0 / math.pi
                return (x, y), angle
        return poly[0], 0.0

    # 5. Painted Mughal Florets matching reference image
    # Spacing ~ 16px along the centerline
    num_motifs = int(round(total_len / 15.6))
    motif_spacing = total_len / float(num_motifs)

    floret_elements = []
    for i in range(num_motifs):
        pos, ang = point_at_dist(i * motif_spacing, flower_poly, cum_lens, total_len)
        # Botanical painted Mughal floret:
        # Two horizontal leaves, central 3-lobed floret head in muted teal/slate
        floret_elements.append(
            f'<g transform="translate({pos[0]:.2f}, {pos[1]:.2f}) rotate({ang:.1f}) scale(0.85)">'
            # Central stem connector
            '<line x1="-7" y1="0" x2="7" y2="0" stroke="#52705E" stroke-width="0.75" opacity="0.65"/>'
            # Pair of spread leaves
            '<path d="M-2,0 Q-4,-2.8 -6,-1.2 Q-4,1.8 -1.5,0.5" fill="#4B6E5B"/>'
            '<path d="M2,0 Q4,-2.8 6,-1.2 Q4,1.8 1.5,0.5" fill="#4B6E5B"/>'
            # Flower head (3 rounded petals in slate-teal)
            '<circle cx="0" cy="-2.6" r="1.4" fill="#2E5452"/>'
            '<circle cx="-2.0" cy="-1.0" r="1.3" fill="#2E5452"/>'
            '<circle cx="2.0" cy="-1.0" r="1.3" fill="#2E5452"/>'
            # Coral flower center
            '<circle cx="0" cy="-0.8" r="0.9" fill="#B44B57"/>'
            '<circle cx="0" cy="-0.8" r="0.35" fill="#F0CE85"/>'
            '</g>'
        )

    # 6. Gold Star Chain along centerline of gold band (inset 26px)
    gold_poly = build_full_polygon(inset=26.0)
    gold_cum_lens = [0.0]
    for i in range(len(gold_poly) - 1):
        d = math.hypot(gold_poly[i+1][0] - gold_poly[i][0], gold_poly[i+1][1] - gold_poly[i][1])
        gold_cum_lens.append(gold_cum_lens[-1] + d)
    gold_total_len = gold_cum_lens[-1]

    # Spacing ~ 8.5px
    num_gold = int(round(gold_total_len / 8.5))
    gold_spacing = gold_total_len / float(num_gold)

    gold_motifs = []
    for i in range(num_gold):
        pos, ang = point_at_dist(i * gold_spacing, gold_poly, gold_cum_lens, gold_total_len)
        # Four-pointed gold cross star (✦)
        gold_motifs.append(
            f'<g transform="translate({pos[0]:.2f}, {pos[1]:.2f}) rotate({ang:.1f}) scale(0.85)">'
            # Connecting thread
            '<line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#CAA042" stroke-width="0.75" opacity="0.8"/>'
            # Four pointed star
            '<path d="M0,-2.6 L0.7,-0.7 L2.6,0 L0.7,0.7 L0,2.6 L-0.7,0.7 L-2.6,0 L-0.7,-0.7 Z" fill="#D4A742"/>'
            '<circle cx="0" cy="0" r="0.55" fill="#784E14"/>'
            '</g>'
        )

    # 7. Picot lace dots along the outer edge
    picot_poly = build_full_polygon(inset=0.0)
    picot_cum = [0.0]
    for i in range(len(picot_poly) - 1):
        d = math.hypot(picot_poly[i+1][0] - picot_poly[i][0], picot_poly[i+1][1] - picot_poly[i][1])
        picot_cum.append(picot_cum[-1] + d)
    picot_total = picot_cum[-1]
    
    num_picot = int(round(picot_total / 4.2))
    picot_spacing = picot_total / float(num_picot)
    picot_dots = []
    for i in range(num_picot):
        pos, _ = point_at_dist(i * picot_spacing, picot_poly, picot_cum, picot_total)
        picot_dots.append(f'<circle cx="{pos[0]:.2f}" cy="{pos[1]:.2f}" r="0.65" fill="#2E4A3A" opacity="0.6"/>')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(W)} {int(H)}" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <!-- Warm ivory card background matching physical invitation paper -->
    <radialGradient id="innerParchment" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FFFDF8" />
      <stop offset="65%" stop-color="#FAF5EB" />
      <stop offset="100%" stop-color="#F2EBE0" />
    </radialGradient>
    
    <!-- Paper drop shadow under the scalloped arch -->
    <filter id="archShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#28171E" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- 1. Scalloped Arch card body with shadow and warm ivory parchment fill -->
  <path d="{outer_d}" fill="url(#innerParchment)" filter="url(#archShadow)"/>

  <!-- 2. Floral Chintz Band Base (between outer and mid contour) -->
  <path d="{outer_d} {mid_d}" fill-rule="evenodd" fill="#FAF6ED" stroke="none" />

  <!-- 3. Outer & Mid contour rules in deep sage/bronze -->
  <path d="{outer_d}" fill="none" stroke="#2E4A3A" stroke-width="1.15" opacity="0.95" />
  <path d="{mid_d}" fill="none" stroke="#2E4A3A" stroke-width="0.95" opacity="0.9" />

  <!-- 4. Picot lace dots along the outer edge -->
  <g id="picotEdge">
    {''.join(picot_dots)}
  </g>

  <!-- 5. Miniature painted Mughal botanical florets along outer band -->
  <g id="floralChintzMotifs">
    {''.join(floret_elements)}
  </g>

  <!-- 6. Inner Gold Star-Chain Lace Band -->
  <path d="{gold_outer_d}" fill="none" stroke="#CAA042" stroke-width="0.75" opacity="0.85" />
  <path d="{gold_inner_d}" fill="none" stroke="#CAA042" stroke-width="0.75" opacity="0.85" />
  <g id="goldStarChain">
    {''.join(gold_motifs)}
  </g>
</svg>
'''
    return svg_content

if __name__ == '__main__':
    svg = generate_exact_reference_svg()
    out_path = 'assets/generated/card_frame_border.svg'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Updated exact reference SVG saved to {out_path} ({len(svg)} chars)")
