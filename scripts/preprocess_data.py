"""Rebuild the compact runtime dataset from the supplied cleaned CSV archive."""
import zipfile, json, gzip
from pathlib import Path
import pandas as pd

ARCHIVE = Path('steam_games_clean.zip')
OUTPUT = Path('public/data/games.json.gz')
COLS = ['AppID','Name','Release date','Owners min','Owners max','Peak CCU','Price','Discount','DLC count','Metacritic score','Positive','Negative','Total reviews','Achievements','Recommendations','Average playtime forever','Developers','Publishers','Categories','Genres','Tags','Header image','Windows','Mac','Linux']
KEYS = ['id','n','d','o1','o2','ccu','p','off','dlc','meta','pos','neg','rev','ach','rec','play','dev','pub','cat','gen','tag','img','win','mac','lin']
def clean(v):
    if pd.isna(v): return None
    if hasattr(v, 'item'): v = v.item()
    if isinstance(v, float) and v.is_integer(): return int(v)
    return v
frames=[]
with zipfile.ZipFile(ARCHIVE) as z:
    for name in z.namelist():
        frames.append(pd.read_csv(z.open(name), usecols=lambda c: c in COLS, low_memory=False))
df=pd.concat(frames, ignore_index=True).drop_duplicates('AppID', keep='last')
records=[{k:clean(v) for k,v in zip(KEYS,row)} for row in df[COLS].itertuples(index=False, name=None)]
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_bytes(gzip.compress(json.dumps(records,separators=(',',':'),ensure_ascii=False).encode(), compresslevel=9, mtime=0))
print(f'Wrote {len(records):,} games to {OUTPUT}')
