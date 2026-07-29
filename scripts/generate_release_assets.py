#!/usr/bin/env python3
"""Generate deterministic GAIA social and install PNG assets using only stdlib."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets"

COLORS = {
    "bg": (5, 10, 16),
    "panel": (7, 16, 25),
    "navy": (16, 38, 51),
    "cyan": (141, 233, 245),
    "cyan2": (78, 178, 199),
    "gold": (217, 189, 120),
    "ivory": (234, 241, 238),
    "muted": (145, 163, 170),
}

FONT = {
"A":["01110","10001","10001","11111","10001","10001","10001"],"B":["11110","10001","10001","11110","10001","10001","11110"],
"C":["01111","10000","10000","10000","10000","10000","01111"],"D":["11110","10001","10001","10001","10001","10001","11110"],
"E":["11111","10000","10000","11110","10000","10000","11111"],"F":["11111","10000","10000","11110","10000","10000","10000"],
"G":["01111","10000","10000","10111","10001","10001","01111"],"H":["10001","10001","10001","11111","10001","10001","10001"],
"I":["11111","00100","00100","00100","00100","00100","11111"],"J":["00111","00010","00010","00010","10010","10010","01100"],
"K":["10001","10010","10100","11000","10100","10010","10001"],"L":["10000","10000","10000","10000","10000","10000","11111"],
"M":["10001","11011","10101","10101","10001","10001","10001"],"N":["10001","11001","10101","10011","10001","10001","10001"],
"O":["01110","10001","10001","10001","10001","10001","01110"],"P":["11110","10001","10001","11110","10000","10000","10000"],
"Q":["01110","10001","10001","10001","10101","10010","01101"],"R":["11110","10001","10001","11110","10100","10010","10001"],
"S":["01111","10000","10000","01110","00001","00001","11110"],"T":["11111","00100","00100","00100","00100","00100","00100"],
"U":["10001","10001","10001","10001","10001","10001","01110"],"V":["10001","10001","10001","10001","10001","01010","00100"],
"W":["10001","10001","10001","10101","10101","10101","01010"],"X":["10001","10001","01010","00100","01010","10001","10001"],
"Y":["10001","10001","01010","00100","00100","00100","00100"],"Z":["11111","00001","00010","00100","01000","10000","11111"],
"0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],
"2":["01110","10001","00001","00010","00100","01000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],
"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","10000","11110","00001","00001","11110"],
"6":["01110","10000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],
"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00001","01110"],
" ":["00000"]*7,"-":["00000","00000","00000","11111","00000","00000","00000"],".":["00000","00000","00000","00000","00000","01100","01100"],
":":["00000","01100","01100","00000","01100","01100","00000"],"/":["00001","00010","00100","01000","10000","00000","00000"],
}

class Canvas:
    def __init__(self, width: int, height: int, color: tuple[int,int,int]):
        self.w, self.h = width, height
        self.pixels = bytearray(color * (width * height))

    def set(self, x: int, y: int, color: tuple[int,int,int]):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 3
            self.pixels[i:i+3] = bytes(color)

    def blend(self, x: int, y: int, color: tuple[int,int,int], alpha: float):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 3
            for n in range(3): self.pixels[i+n] = int(self.pixels[i+n]*(1-alpha)+color[n]*alpha)

    def rect(self, x0: int, y0: int, x1: int, y1: int, color: tuple[int,int,int], fill=True, width=1):
        if fill:
            for y in range(max(0,y0),min(self.h,y1)):
                start=(y*self.w+max(0,x0))*3; end=(y*self.w+min(self.w,x1))*3
                self.pixels[start:end]=bytes(color)*(max(0,min(self.w,x1)-max(0,x0)))
        else:
            for n in range(width):
                self.line(x0+n,y0+n,x1-n,y0+n,color); self.line(x0+n,y1-n,x1-n,y1-n,color)
                self.line(x0+n,y0+n,x0+n,y1-n,color); self.line(x1-n,y0+n,x1-n,y1-n,color)

    def line(self, x0: int, y0: int, x1: int, y1: int, color: tuple[int,int,int], width=1):
        dx=abs(x1-x0); sx=1 if x0<x1 else -1; dy=-abs(y1-y0); sy=1 if y0<y1 else -1; err=dx+dy
        while True:
            r=max(0,width//2)
            for yy in range(y0-r,y0+r+1):
                for xx in range(x0-r,x0+r+1): self.set(xx,yy,color)
            if x0==x1 and y0==y1: break
            e2=2*err
            if e2>=dy: err+=dy; x0+=sx
            if e2<=dx: err+=dx; y0+=sy

    def circle(self, cx: int, cy: int, radius: int, color: tuple[int,int,int], fill=False, width=1):
        if fill:
            for y in range(cy-radius,cy+radius+1):
                span=int(math.sqrt(max(0,radius*radius-(y-cy)*(y-cy))))
                self.rect(cx-span,y,cx+span+1,y+1,color,True)
        else:
            for r in range(radius-width+1,radius+1):
                steps=max(64,int(2*math.pi*r))
                prev=None
                for i in range(steps+1):
                    a=2*math.pi*i/steps; point=(round(cx+math.cos(a)*r),round(cy+math.sin(a)*r))
                    if prev: self.line(*prev,*point,color)
                    prev=point

    def ellipse(self, cx: int, cy: int, rx: int, ry: int, color: tuple[int,int,int], width=1):
        steps=max(80,int(2*math.pi*max(rx,ry))); prev=None
        for i in range(steps+1):
            a=2*math.pi*i/steps; point=(round(cx+math.cos(a)*rx),round(cy+math.sin(a)*ry))
            if prev: self.line(*prev,*point,color,width)
            prev=point

    def text(self, x: int, y: int, value: str, color: tuple[int,int,int], scale=2, spacing=1):
        cursor=x
        for char in value.upper():
            glyph=FONT.get(char,FONT[" "])
            for gy,row in enumerate(glyph):
                for gx,bit in enumerate(row):
                    if bit=='1': self.rect(cursor+gx*scale,y+gy*scale,cursor+(gx+1)*scale,y+(gy+1)*scale,color,True)
            cursor += (5+spacing)*scale

    def radial_glow(self, cx: int, cy: int, radius: int, color: tuple[int,int,int], strength=.35):
        x0=max(0,cx-radius); x1=min(self.w,cx+radius); y0=max(0,cy-radius); y1=min(self.h,cy+radius)
        for y in range(y0,y1):
            for x in range(x0,x1):
                d=math.hypot(x-cx,y-cy)/radius
                if d<1: self.blend(x,y,color,(1-d)*(1-d)*strength)

    def png(self, path: Path):
        raw=b''.join(b'\x00'+bytes(self.pixels[y*self.w*3:(y+1)*self.w*3]) for y in range(self.h))
        def chunk(kind: bytes, data: bytes):
            return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
        payload=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',self.w,self.h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
        path.write_bytes(payload)


def seal(canvas: Canvas, cx: int, cy: int, radius: int):
    canvas.radial_glow(cx,cy,int(radius*1.25),COLORS['cyan'],.18)
    canvas.circle(cx,cy,radius,COLORS['gold'],False,max(2,radius//38))
    canvas.circle(cx,cy,int(radius*.82),COLORS['cyan2'],False,max(1,radius//90))
    canvas.ellipse(cx,cy,int(radius*.82),int(radius*.34),COLORS['cyan2'])
    canvas.ellipse(cx,cy,int(radius*.34),int(radius*.82),COLORS['cyan2'])
    canvas.line(cx-int(radius*.82),cy,cx+int(radius*.82),cy,COLORS['navy'])
    canvas.line(cx,cy-int(radius*.82),cx,cy+int(radius*.82),COLORS['navy'])
    eye_rx=int(radius*.50); eye_ry=int(radius*.22)
    points=[]
    for i in range(41):
        t=math.pi*i/40; points.append((round(cx+math.cos(t)*eye_rx),round(cy-math.sin(t)*eye_ry)))
    for i in range(41):
        t=math.pi*i/40; points.append((round(cx-math.cos(t)*eye_rx),round(cy+math.sin(t)*eye_ry)))
    for a,b in zip(points,points[1:]+points[:1]): canvas.line(*a,*b,COLORS['gold'],max(2,radius//50))
    canvas.circle(cx,cy,int(radius*.20),COLORS['cyan'],False,max(2,radius//45))
    canvas.circle(cx,cy,max(3,int(radius*.055)),COLORS['ivory'],True)
    for angle in (-90,-40,40,90):
        x=round(cx+math.cos(math.radians(angle))*radius*.88); y=round(cy+math.sin(math.radians(angle))*radius*.88)
        canvas.circle(x,y,max(2,radius//35),COLORS['gold'],True)


def social_preview():
    c=Canvas(1200,630,COLORS['bg'])
    c.radial_glow(300,280,500,COLORS['navy'],.65); c.radial_glow(970,220,430,COLORS['navy'],.45)
    for x in range(0,1200,48): c.line(x,0,x,630,(11,28,38))
    for y in range(0,630,48): c.line(0,y,1200,y,(11,28,38))
    c.line(70,70,70,560,COLORS['gold'],3); c.line(70,70,170,70,COLORS['gold'],3); c.line(70,560,170,560,COLORS['gold'],3)
    seal(c,920,302,186)
    c.text(110,92,'GAIA',COLORS['gold'],14,1)
    c.text(116,205,'ATLAS',COLORS['ivory'],8,1)
    c.text(116,282,'THE WORLD IS INHABITED.',COLORS['cyan'],4,1)
    c.text(116,333,'GLOBAL POKEMON SURVEILLANCE AND NATURAL HISTORY',COLORS['ivory'],2,1)
    c.text(116,363,'EXACT CENSUS - LIVE MIGRATION - REGIONAL ECOLOGY',COLORS['muted'],2,1)
    c.rect(110,430,670,510,COLORS['panel'],True); c.rect(110,430,670,510,(48,86,99),False,2)
    metrics=[(132,'161','VERIFIED SPECIES'),(315,'5','ACTIVE TRACKS'),(488,'4','REGIONAL ECOSYSTEMS')]
    for x,value,label in metrics:
        c.text(x,446,value,COLORS['ivory'],4,1); c.text(x,486,label,COLORS['muted'],1,1)
    c.text(110,550,'GEOSPATIAL ANOMALY INTELLIGENCE AGENCY',COLORS['gold'],2,1)
    c.text(110,580,'CIVILIAN ACCESS NETWORK - RELEASE CANDIDATE 1',COLORS['muted'],1,1)
    c.png(OUT/'gaia-social-preview.png')


def icon(size: int, filename: str, maskable=False):
    c=Canvas(size,size,COLORS['panel'] if maskable else COLORS['bg'])
    c.radial_glow(size//2,size//2,int(size*.48),COLORS['navy'],.85)
    seal(c,size//2,size//2,int(size*(.32 if maskable else .39)))
    c.png(OUT/filename)


def generate_all():
    OUT.mkdir(parents=True,exist_ok=True)
    social_preview()
    icon(192,'gaia-icon-192.png')
    icon(512,'gaia-icon-512.png')
    icon(512,'gaia-icon-maskable-512.png',True)
    icon(180,'gaia-apple-touch-icon.png')
    print('GAIA RC1 social preview and install icons generated deterministically.')


if __name__=='__main__':
    generate_all()
