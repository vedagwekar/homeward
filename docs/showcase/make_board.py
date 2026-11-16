# Builds the scrapbook board: one set of cut-out pieces, written twice.
#   docs/showcase/board.html    the whole 38 x 27 in board with every piece in place (the map)
#   docs/showcase/cutouts.html  the same pieces on letter pages, with cut lines, to print and paste
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
S = OUT = HERE  # run with: python3 docs/showcase/make_board.py, then print both HTML files to PDF from Chrome
qr = lambda n: re.sub(r'<\?xml[^>]*\?>', '', open(HERE + f"trifold-assets/qr-{n}.svg").read())
proj = json.load(open(HERE + "../../web/mock/projects.json"))[0]
inr = lambda n: "₹" + f"{n:,}"

LOGO = '<svg class="logo" viewBox="0 0 64 64"><path d="M5 30 Q13 29 17 25 L32 8 L47 25 Q51 29 59 30" fill="none" stroke="#b2472a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="36" width="36" height="8" rx="4" fill="#b2472a"/><rect x="14" y="48" width="36" height="8" rx="4" fill="#b2472a"/></svg>'

def house(stage):
    """A flat little house that fills in stage by stage; parts not built yet are dashed outlines."""
    on = lambda n: stage >= n
    solid = lambda n, fill: f'fill="{fill}" stroke="#261d17" stroke-width="2"' if on(n) else 'fill="none" stroke="#b9ae9f" stroke-width="2" stroke-dasharray="5 4"'
    s = '<svg viewBox="0 0 140 100" class="house">'
    s += '<line x1="6" y1="90" x2="134" y2="90" stroke="#261d17" stroke-width="2"/>'
    s += f'<rect x="20" y="78" width="100" height="12" {solid(1, "#a2482b")}/>'
    s += f'<rect x="28" y="44" width="84" height="34" {solid(2, "#f1ead9")}/>'
    s += f'<polygon points="16,44 70,14 124,44" {solid(3, "#b2472a")}/>'
    s += f'<rect x="63" y="56" width="14" height="22" {solid(4, "#3b2a1f")}/><rect x="36" y="52" width="16" height="13" {solid(4, "#405b78")}/><rect x="88" y="52" width="16" height="13" {solid(4, "#405b78")}/>'
    if on(5): s += '<circle cx="118" cy="26" r="7" fill="none" stroke="#a87b24" stroke-width="3"/><path d="M123 31 l12 12 m-4 -4 l4 -4 m-9 -1 l4 -4" stroke="#a87b24" stroke-width="3" fill="none"/>'
    return s + '</svg>'

STAGES = [("Foundation", "Steel checked before the concrete pour."), ("Walls", "Straight, level, built to plan."), ("Roof slab", "Roof steel checked before the pour."), ("Finishing", "Doors, windows and a water test."), ("Handover", "Keys to Amma. Deposit back later.")]

def stage_card(i):
    st = proj["stages"][i]
    name, note = STAGES[i]
    return f'''<div class="paper polaroidish"><div class="num">{i+1}</div><h3>{name}</h3>{house(i+1)}<div class="amt">{inr(st["amount"])}</div><p>{note}</p><div class="stamp">LOCKED &nbsp;/&nbsp; PAID</div></div>'''

def rupee_chart():
    rows, tot = "", dict(s=0, w=0, b=0, h=0)
    top = max(s["amount"] for s in proj["stages"])
    for i, st in enumerate(proj["stages"]):
        lab = st["amount"] - st["materials"]; held = round(lab * 0.1)
        w = next((p["amount"] for p in st["payouts"] if p["to"] == "Labour"), 0)
        b = next((p["amount"] for p in st["payouts"] if p["to"] == "Builder"), 0) - held
        tot["s"] += st["materials"]; tot["w"] += w; tot["b"] += b; tot["h"] += held
        seg = lambda v, c: f'<i class="{c}" style="width:{v/top*100:.2f}%"></i>'
        rows += f'<div class="bar-row"><b>{STAGES[i][0]}</b><div class="bar">{seg(st["materials"],"s")}{seg(w,"w")}{seg(b,"b")}{seg(held,"h")}</div><span>{inr(st["amount"])}</span></div>'
    assert sum(tot.values()) == 1500000 and tot == dict(s=465000, w=310500, b=621000, h=103500), tot
    return f'''<div class="paper"><div class="tape"></div><div class="kick">Amma's yes: one Stellar transaction pays them all</div>
<h2>Where every rupee of the ₹1,500,000 goes</h2>{rows}
<div class="legend"><span><i class="s"></i><b>{inr(tot["s"])}</b> suppliers, paid when a stage opens</span><span><i class="w"></i><b>{inr(tot["w"])}</b> workers, paid in full</span><span><i class="b"></i><b>{inr(tot["b"])}</b> builder, after the checks</span><span><i class="h"></i><b>{inr(tot["h"])}</b> held back from the builder</span></div></div>'''

ROUTE = '''<svg viewBox="0 0 700 80" class="route"><path d="M16 58 Q200 -22 392 58" fill="none" stroke="#b2472a" stroke-width="3.5" stroke-dasharray="9 7"/><path d="M392 58 Q540 4 668 50" fill="none" stroke="#b2472a" stroke-width="3.5" stroke-dasharray="9 7"/><circle cx="16" cy="58" r="10" fill="#261d17"/><circle cx="392" cy="58" r="10" fill="#261d17"/><path d="M654 62 v-16 l16 -13 l16 13 v16 z" fill="#b2472a"/></svg>
<div class="route-names"><span><b>Anil</b>Toronto</span><span><b>Meera</b>Dubai, his sister</span><span><b>Amma</b>near Thrissur</span></div>'''

P = {}  # id -> (width in, height in, html)
P["L1"] = (7.8, 5.0, f'''<div class="paper"><div class="tape"></div>{ROUTE}<div class="huge">13,500 km</div><h3>between Anil's money and the walls it pays for.</h3><p class="green">With Homeward, Anil knows where every rupee goes.</p><small>Anil, Meera and Amma are our demo family.</small></div>''')
P["L2"] = (7.0, 2.6, '''<div class="paper sticky"><p class="hand quote">"Easy to send money. Very, very hard to get money back."</p><small>A father in Canada who built a house in India. One of 16 people we interviewed: 15 engineers and one family.</small></div>''')
P["L3"] = (7.8, 6.2, '''<div class="paper blush"><div class="tape"></div><div class="kick">When money goes before the check</div>
<div class="bignum red">₹3,452,000</div><h3>paid for a house in Wayanad, left unfinished and leaking.</h3>
<p><b class="mid">₹40,000</b> awarded by the commission.</p><small>The paid figure is the owner's brother's, who ran the build. Indian Express, Aug 2026.</small>
<hr><div class="bignum red sm">₹829,000</div><h3>refund ordered in Telangana, where escrow paid out without proper checks.</h3><p class="hand">Holding money isn't enough.</p><small>Consumer commission, Sep 2026.</small></div>''')
P["L4"] = (7.8, 4.8, '''<div class="paper sage"><div class="tape"></div><div class="kick">The bigger picture</div><p>In 2023, families abroad sent home to Kerala</p>
<div class="bignum">₹342,690,000,000</div><h3>to renovate houses and shops: <span class="red">CA$5.2 billion.</span></h3>
<small>15.8% of ₹2,168,930,000,000 received (Kerala Migration Survey 2023). CA$ at ₹66.</small>
<hr><div class="split"><div class="bignum sm">23.2%</div><p>of Kerala's income is money sent from abroad.<br><small>Share of net state domestic product, Kerala Migration Survey 2023.</small></p></div></div>''')
P["L5"] = (7.0, 2.4, '''<div class="paper kraft"><div class="kick">Who it's for</div><h3>A son or daughter in Canada or the Gulf, paying for a parent's house in Kerala.</h3><small>Parents, builders and engineers use Homeward free.</small></div>''')

P["C1"] = (10.2, 3.4, f'''<div class="paper title"><div class="wm">{LOGO}<b>homeward</b></div><h1>The builder isn't paid until an engineer checks the work and Amma says yes.</h1></div>''')
P["C2"] = (4.2, 3.2, '''<div class="paper kraft"><div class="tape"></div><div class="kick">Today's code</div><div class="slot">HW-____-____</div><p class="hand">Write it. Hold it up. We film it.</p><small>It proves the clip is new.</small></div>''')
P["C3"] = (3.4, 3.2, '''<div class="paper tag"><div class="hole"></div><div class="kick">The team</div><p><b>Ved Agwekar<br>Youdis Acharya<br>Krishneet Singh<br>Rivan Dutta</b></p><small>University of Waterloo<br>Velocity × Stellar</small></div>''')
for i in range(5): P[f"S{i+1}"] = (3.4, 4.2, stage_card(i))
P["H"] = (10.2, 2.6, '''<div class="paper"><div class="kick">How each stage gets paid</div><div class="hands">
<div><i class="a">1</i><b>Lock</b>Anil and Meera lock the money</div><div><i class="b">2</i><b>Film</b>the builder, with today's code</div><div><i class="c">3</i><b>Check</b>an engineer with no stake</div><div><i class="d">4</i><b>Yes</b>Amma, or a second check</div><div><i class="e">5</i><b>Pay</b>one Stellar transaction</div></div></div>''')
P["T"] = (7.4, 2.6, '''<div class="paper sage"><div class="split"><div class="bignum sm">50</div><p><b>tests on our Stellar contract.</b><br>Three recorded Testnet runs. One transaction pays workers and builder together, and every payment is public.</p></div></div>''')
for k, (img, cap) in {"P1": ("amma.png", "Amma decides: Yes, or Check again."), "P2": ("engineer.png", "The engineer looks, ticks, decides."), "P3": ("home.png", "Anil sees every rupee.")}.items():
    P[k] = (5.1, 5.8, f'''<div class="polaroid"><div class="tape"></div><div class="shot"><img src="trifold-assets/{img}" alt=""></div><p class="hand">{cap}</p></div>''')
P["M"] = (10.2, 4.6, rupee_chart())
P["D"] = (7.4, 4.6, '''<div class="paper kraft"><div class="tape"></div><div class="kick">The builder's deposit</div><div class="bignum sm">₹75,000</div><p>5%, held in the contract.</p><h3>Why would he agree?</h3><ul><li>The money is locked before each stage</li><li>Materials are paid up front</li><li>One payment straight after the checks</li></ul><p>He gets it back at the end. <b class="red">If he walks off, the family keeps it.</b></p></div>''')
P["E"] = (10.2, 2.4, '''<div class="paper plain"><p class="hand closing">The engineer passed it. Amma pressed yes. Now Anil knows the wall is real.</p></div>''')
P["K"] = (7.4, 2.6, '''<div class="paper dark"><div class="kick">Live on Stellar Testnet</div><p class="mono">CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2</p><p><b>Demo limits:</b> our server signs for each role, and our admin can settle a disputed claim. The contract checks the rules. A person checks the concrete.</p></div>''')

P["R1"] = (7.8, 4.6, f'''<div class="paper"><div class="tape"></div><div class="huge sm">Try to break it.</div><div class="qrs"><div>{qr("app")}<p><b>Play every role.</b> Real Stellar Testnet payments.</p></div><div>{qr("contract")}<p><b>See the contract</b> and every payment.</p></div></div><p class="hand">Play the builder: send an old clip, or no code. Does our AI check notice?</p></div>''')
P["R2"] = (7.8, 5.4, '''<div class="paper"><div class="tape"></div><div class="kick">What Anil and Meera pay</div>
<table><tr><td>Locked for the build</td><td>₹1,500,000</td></tr><tr><td>Our fee, 1.5%<br><small>covers the engineer's six video reviews</small></td><td>₹22,500</td></tr><tr><td>Site visits before concrete is poured<br><small>our estimate</small></td><td>about ₹9,000</td></tr><tr class="total"><td>Total</td><td>₹1,531,500</td></tr></table>
<p>All in, with the cost of sending the money: <b>about 3% to 4%</b> by digital transfer, 6% to 9% by bank.</p>
<div class="callout"><b>Eight Kerala engineers quoted ₹500 to ₹1,200</b> for one video review.</div></div>''')
P["R3"] = (7.8, 4.6, '''<div class="paper sage"><div class="tape"></div><div class="kick">Does it pay?</div><div class="split"><div class="huge">200</div><h3>builds a year to break even. About four a week, on ₹3,000,000 builds.</h3></div>
<table><tr><td>Builds a year that fit us, in Kerala</td><td>6,850</td></tr><tr><td>We need</td><td>2.9% of them</td></tr><tr><td>With four more Indian states</td><td>3.4× the market</td></tr></table>
<small>On ₹1,500,000 builds the fee barely covers its costs, so we start bigger. Apart from the engineers' quotes, these are our estimates.</small></div>''')
tick, dash = '<td class="y">✓</td>', '<td class="n">–</td>'
rows = [("Checks each stage", "yyny"), ("Pays the builder only after checks", "nnny"), ("Second engineer on request", "nnny"), ("Siblings fund together", "nnny"), ("Public payment record", "nnny")]
P["R4"] = (7.8, 4.4, '<div class="paper"><div class="kick">Why not a bank escrow?</div><p>In Telangana, escrow paid out without proper checks. ₹829,000 had to be refunded.</p><table class="cmp"><tr><th></th><th>Hire an engineer</th><th>Inspection firm</th><th>Escrow</th><th class="us">Homeward</th></tr>' + "".join(f'<tr><td>{n}</td>' + "".join(tick if c == "y" else dash for c in m) + '</tr>' for n, m in rows) + '</table><small>From what each offers publicly.</small></div>')
P["R5"] = (7.8, 3.6, '''<div class="paper sticky"><div class="kick">What isn't real yet</div><p><b>Demo:</b> our server signs every role; our admin opens stages and picks engineers. <b>Simulated:</b> money in, rupees out, texts.</p><p><b>Still to prove:</b> families paying the fee, builders accepting a deposit, site visit prices, a licensed partner to hold money.</p><p class="hand">Next: ten Kerala families.</p></div>''')

# where each piece sits on the board (x, y in inches from the top left), its tilt, and its pitch cue
PLACE = {
 "L1": (0.75, 0.8, -0.6, None), "L2": (1.2, 6.25, 1.6, None), "L3": (0.75, 9.6, 0.5, 2), "L4": (0.75, 16.6, -0.5, None), "L5": (1.15, 22.3, 1.2, None),
 "C2": (9.95, 0.75, -1.2, 1), "C1": (14.35, 0.65, 0, None), "C3": (24.75, 0.8, 1.5, None),
 "S1": (9.95, 4.6, -0.8, None), "S2": (13.65, 4.6, 0.6, None), "S3": (17.35, 4.6, -0.4, None), "S4": (21.05, 4.6, 0.8, None), "S5": (24.75, 4.6, -0.6, None),
 "H": (9.95, 9.3, 0, 3), "T": (20.65, 9.3, 0.8, None),
 "P1": (10.3, 12.35, -1.8, 4), "P2": (16.5, 12.35, 1.0, None), "P3": (22.7, 12.35, -1.2, None),
 "M": (9.95, 18.75, 0, None), "D": (20.65, 18.75, 0.7, None), "E": (9.95, 23.85, -0.4, None), "K": (20.65, 23.85, 0, 5),
 "R1": (29.45, 0.8, 0.5, 7), "R2": (29.45, 5.85, -0.5, 6), "R3": (29.45, 11.7, 0.4, None), "R4": (29.45, 16.75, -0.3, None), "R5": (29.45, 21.6, 0.9, None),
}
SHEETS = [("p", ["L1", "R1"]), ("p", ["L3", "L2"]), ("p", ["L4", "L5"]), ("l", ["C1", "H"]), ("l", ["M", "E"]), ("l", ["S1", "S2", "S3", "C2", "C3"]), ("l", ["S4", "S5", "K"]), ("l", ["D"]), ("l", ["P1", "P2"]), ("p", ["P3", "R5"]), ("p", ["R2", "R3"]), ("p", ["R4", "T"])]
assert sorted(sum((s for _, s in SHEETS), [])) == sorted(P), "every piece must be on exactly one sheet"
PANEL = lambda k: {"L": "left panel", "R": "right panel"}.get(k[0], "centre panel")

CSS = open(S + "board.css").read()
def piece(k, style="", extra=""):
    w, h, html = P[k]
    return f'<section class="piece" id="{k}" style="width:{w}in;height:{h}in;{style}">{html}{extra}</section>'

board = "".join(piece(k, f"left:{x}in;top:{y}in;transform:rotate({r}deg);", f'<span class="cue">{c}</span>' if c else "") for k, (x, y, r, c) in PLACE.items())
open(OUT + "board.html", "w").write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Homeward board: where each piece goes</title>
<style>@page {{ size: 38in 27in; margin: 0; }}{CSS}</style></head><body class="board"><div class="surface"><div class="fold" style="left:9.375in"></div><div class="fold" style="left:28.625in"></div>{board}
<div class="legendbox">Numbers in circles: the order Ved touches the board in the pitch.</div></div></body></html>''')

sheets = ""
for n, (o, ids) in enumerate(SHEETS, 1):
    inner = "".join(f'<div class="cut">{piece(k)}<span class="label">{k} · {PANEL(k)} · {P[k][0]} × {P[k][1]} in</span></div>' for k in ids)
    sheets += f'<div class="sheet {"land" if o == "l" else "port"}"><div class="sheetno">Homeward cutouts · sheet {n} of {len(SHEETS)} · print at 100%, cut on the dashed lines</div>{inner}</div>'
open(OUT + "cutouts.html", "w").write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Homeward board: cutouts to print</title>
<style>@page {{ size: 8.5in 11in; margin: 0; }} @page land {{ size: 11in 8.5in; margin: 0; }}{CSS}</style></head><body class="sheets">{sheets}</body></html>''')
print("pieces", len(P), "sheets", len(SHEETS))
