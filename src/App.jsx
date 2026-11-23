import React,{useEffect,useMemo,useState} from 'react';
import {AreaChart,Area,BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend} from 'recharts';
import {Activity,BarChart3,Compass,Gamepad2,Trophy,Tags,Building2,Swords,Search,Download,RefreshCw,ChevronDown,ArrowUpRight,Users,Star,DollarSign,Menu,X,SlidersHorizontal,ExternalLink,Monitor,CalendarDays,Flame,Target,Database} from 'lucide-react';

const NAV=[['Overview',Activity],['Explorer',Compass],['Leaderboards',Trophy],['Pricing Lab',DollarSign],['Genres',Tags],['Studios',Building2],['Versus',Swords]];
const C=['#22d3ee','#a78bfa','#84cc16','#fbbf24','#fb7185','#60a5fa','#2dd4bf'];
const fmt=(v)=>v==null?'—':new Intl.NumberFormat('en-US',{notation:v>=1e6?'compact':'standard',maximumFractionDigits:1}).format(v);
const money=(v)=>v==null?'—':v===0?'Free':'$'+Number(v).toFixed(2);
const pct=(a,b)=>b?Math.round(a/b*100):0;
const safe=(v)=>v==null?'':String(v);
const split=(v)=>safe(v).split(',').map(x=>x.trim()).filter(Boolean);
const avg=(a)=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const rating=(g)=>g.rev>0?g.pos/g.rev*100:null;
const year=(g)=>g.d?.slice(0,4)||'Unknown';
const tipStyle={background:'#111a32',border:'1px solid #293654',borderRadius:10,color:'#e8efff'};
function Stat({label,value,sub,icon:Icon,accent='cyan'}){return <div className="stat"><div className="stat-top"><span>{label}</span><span className={'stat-icon '+accent}><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>}
function Panel({title,sub,children,action}){return <section className="panel"><div className="panel-head"><div><h3>{title}</h3>{sub&&<p>{sub}</p>}</div>{action}</div>{children}</section>}
function ChartTip({active,payload,label}){if(!active||!payload?.length)return null;return <div className="chart-tip"><b>{label}</b>{payload.map((p,i)=><div key={i}><i style={{background:p.color}}/>{p.name}: <strong>{fmt(p.value)}</strong></div>)}</div>}
function App(){
 const [games,setGames]=useState([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 const [page,setPage]=useState('Overview'),[mobile,setMobile]=useState(false),[globalSearch,setGlobalSearch]=useState('');
 const [genre,setGenre]=useState('All genres'),[yearFilter,setYearFilter]=useState('All years');
 const [query,setQuery]=useState(''),[tag,setTag]=useState(''),[platform,setPlatform]=useState('Any'),[price,setPrice]=useState('Any'),[minRating,setMinRating]=useState(0),[sort,setSort]=useState('Most reviewed'),[view,setView]=useState('Cards'),[pageNo,setPageNo]=useState(1);
 const [board,setBoard]=useState('Most reviewed'),[topN,setTopN]=useState('25'),[selected,setSelected]=useState([]),[compareA,setCompareA]=useState(''),[compareB,setCompareB]=useState('');
 const [studioQuery,setStudioQuery]=useState('');
 const base = useMemo(() => {
  return games.filter(g => {
    const genreMatch =
      genre === 'All genres' || split(g.gen).includes(genre);

    const yearMatch =
      yearFilter === 'All years' || year(g) === yearFilter;

    return genreMatch && yearMatch;
  });
}, [games, genre, yearFilter]);

const genres = useMemo(() => {
  return [...new Set(games.flatMap(g => split(g.gen)))].sort();
}, [games]);

const years = useMemo(() => {
  return [...new Set(games.map(year).filter(y => y !== 'Unknown'))]
    .sort()
    .reverse();
}, [games]);

const filtered = useMemo(() => {
  return base.filter(g => {
    const search = query.toLowerCase();

    const searchMatch =
      !search ||
      safe(g.n).toLowerCase().includes(search) ||
      safe(g.dev).toLowerCase().includes(search) ||
      safe(g.pub).toLowerCase().includes(search);

    const tagMatch =
      !tag || safe(g.gen).toLowerCase().includes(tag.toLowerCase());

    const platformMatch =
      platform === 'Any' ||
      safe(g.plat).toLowerCase().includes(platform.toLowerCase());

    const priceMatch =
      price === 'Any' ||
      (price === 'Free' && g.p === 0) ||
      (price === '$0.01–$10' && g.p > 0 && g.p <= 10) ||
      (price === '$10–$30' && g.p > 10 && g.p <= 30) ||
      (price === '$30+' && g.p > 30);

    return searchMatch && tagMatch && platformMatch && priceMatch &&
      rating(g) >= minRating;
  });
}, [base, query, tag, platform, price, minRating]);
 useEffect(() => {
  (async () => {
    try {
      const r = await fetch('/data/test-games.json');

      if (!r.ok) {
        throw new Error('Dataset request failed (' + r.status + ')');
      }

      const data = await r.json();

      if (!Array.isArray(data)) {
        throw new Error('Dataset format is invalid: expected an array');
      }

      setGames(data);

      if (data.length) {
        setCompareA(String(data[0].id));
        setCompareB(String(data[1]?.id || data[0].id));
      }
    } catch (e) {
      setLoadError('Dataset loading failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  })();
}, []);
const sorted = useMemo(() => {
  const rows = Array.isArray(filtered) ? [...filtered] : [];

  return rows.sort((a, b) => {
    switch (sort) {
      case 'Most reviewed':
        return (Number(b.rev) || 0) - (Number(a.rev) || 0);

      case 'Best rated':
        return (rating(b) || 0) - (rating(a) || 0);

      case 'Peak players':
        return (Number(b.ccu) || 0) - (Number(a.ccu) || 0);

      case 'Price: low to high':
        return (Number(a.p) || 0) - (Number(b.p) || 0);

      case 'Newest':
        return safe(b.d).localeCompare(safe(a.d));

      default:
        return (Number(b.o2) || 0) - (Number(a.o2) || 0);
    }
  });
}, [filtered, sort]);

const top = (arr, key, n = 10) =>
  arr.slice()
    .sort((a, b) => (Number(b[key]) || 0) - (Number(a[key]) || 0))
    .slice(0, n);
 const rated=base.filter(g=>g.rev>=100&&rating(g)!=null);
 const kpis=useMemo(()=>({count:base.length,reviews:base.reduce((s,g)=>s+(g.rev||0),0),players:base.reduce((s,g)=>s+(g.o1||0),0),avgRating:avg(rated.map(rating)),free:pct(base.filter(g=>g.p===0).length,base.length),avgPrice:avg(base.filter(g=>g.p>0).map(g=>g.p))}),[base]);
 const yearly=useMemo(()=>{const m={};base.forEach(g=>{const y=year(g);if(y!=='Unknown'){m[y]??={year:y,releases:0,reviews:0};m[y].releases++;m[y].reviews+=g.rev||0}});return Object.values(m).sort((a,b)=>a.year.localeCompare(b.year)).slice(-15)},[base]);
 const genreData=useMemo(()=>{const m={};base.forEach(g=>split(g.gen).forEach(x=>{m[x]??={genre:x,games:0,reviews:0,rating:0,n:0};m[x].games++;m[x].reviews+=g.rev||0;if(rating(g)!=null){m[x].rating+=rating(g);m[x].n++}}));return Object.values(m).map(x=>({...x,rating:x.n?x.rating/x.n:0})).sort((a,b)=>b.games-a.games).slice(0,10)},[base]);
 const priceData=useMemo(()=>{const bins=[['Free',g=>g.p===0],['$0.01–5',g=>g.p>0&&g.p<=5],['$5–10',g=>g.p>5&&g.p<=10],['$10–20',g=>g.p>10&&g.p<=20],['$20–40',g=>g.p>20&&g.p<=40],['$40+',g=>g.p>40]];return bins.map(([name,fn])=>({name,count:base.filter(fn).length}))},[base]);
 const studios=useMemo(()=>{const m={};base.forEach(g=>split(g.dev).forEach(d=>{m[d]??={name:d,games:0,reviews:0,players:0,rating:0,n:0};m[d].games++;m[d].reviews+=g.rev||0;m[d].players+=g.o1||0;if(rating(g)!=null){m[d].rating+=rating(g);m[d].n++}}));return Object.values(m).map(x=>({...x,rating:x.n?x.rating/x.n:0})).sort((a,b)=>b.reviews-a.reviews)},[base]);
 const leaderboard=useMemo(()=>{let arr=base.filter(g=>g.rev>0);if(board==='Most reviewed')arr.sort((a,b)=>b.rev-a.rev);else if(board==='Best rated')arr=arr.filter(g=>g.rev>=100).sort((a,b)=>(rating(b)||0)-(rating(a)||0));else if(board==='Most played')arr.sort((a,b)=>(b.play||0)-(a.play||0));else if(board==='Peak players')arr.sort((a,b)=>(b.ccu||0)-(a.ccu||0));else if(board==='Biggest audience')arr.sort((a,b)=>(b.o2||0)-(a.o2||0));else if(board==='Hidden gems')arr=arr.filter(g=>g.rev>=20&&g.rev<=3000&&(rating(g)||0)>=90).sort((a,b)=>(rating(b)||0)-(rating(a)||0));else arr=arr.filter(g=>year(g)==='2025'||year(g)==='2026').sort((a,b)=>b.rev-a.rev);return arr.slice(0,Number(topN))},[base,board,topN]);
 const gameById=(id)=>games.find(g=>String(g.id)===String(id));
 const exportRows=(rows)=>{const cols=['id','n','d','p','rev','pos','neg','ccu','o1','o2','dev','pub','gen'];const csv=[cols.join(','),...rows.map(g=>cols.map(k=>'"'+safe(g[k]).replaceAll('"','""')+'"').join(','))].join('\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='pixelpulse-export.csv';a.click();URL.revokeObjectURL(a.href)};
 const reset=()=>{setQuery('');setTag('');setGenre('All genres');setYearFilter('All years');setPlatform('Any');setPrice('Any');setMinRating(0);setSort('Most reviewed');setPageNo(1)};
 const selectGame=(g)=>setSelected(s=>s.includes(g.id)?s.filter(x=>x!==g.id):s.length<2?[...s,g.id]:[s[1],g.id]);
 const GameCard=({g})=><article className="game-card"><div className="game-image" style={{backgroundImage:g.img?`linear-gradient(180deg,transparent,#10172c),url("${g.img}")`:''}}><span className="year-chip">{year(g)}</span><button className={'pick '+(selected.includes(g.id)?'picked':'')} onClick={()=>selectGame(g)} title="Add to compare"><Swords size={15}/></button></div><div className="game-info"><div className="game-title"><b>{g.n||'Untitled game'}</b><strong className={g.p===0?'free':''}>{money(g.p)}</strong></div><div className="muted tiny">{fmt(g.rev)} reviews · {rating(g)==null?'No rating':Math.round(rating(g))+'% positive'}</div><div className="chips">{split(g.gen).slice(0,2).map(x=><span key={x}>{x}</span>)}</div><div className="game-foot"><span><Users size={12}/> {fmt(g.o1)} owners</span><span><Flame size={12}/> {fmt(g.ccu)} peak CCU</span></div><a className="steam-link" href={`https://store.steampowered.com/app/${g.id}`} target="_blank" rel="noreferrer">Steam store <ExternalLink size={11}/></a></div></article>;
 const Table=({rows})=><div className="table-wrap"><table><thead><tr><th>Game</th><th>Release</th><th>Price</th><th>Reviews</th><th>Positive</th><th>Peak CCU</th><th>Owners (min)</th><th>Developer</th></tr></thead><tbody>{rows.map(g=><tr key={g.id}><td><div className="table-game"><img src={g.img||''} onError={e=>e.currentTarget.style.display='none'}/><span>{g.n}</span></div></td><td>{g.d||'—'}</td><td>{money(g.p)}</td><td>{fmt(g.rev)}</td><td>{rating(g)==null?'—':Math.round(rating(g))+'%'}</td><td>{fmt(g.ccu)}</td><td>{fmt(g.o1)}</td><td>{g.dev||'—'}</td></tr>)}</tbody></table></div>;
 const changePage=(p)=>{setPage(p);setMobile(false);window.scrollTo({top:0,behavior:'smooth'})};
 const pageTitle=page==='Overview'?'MARKET OVERVIEW':page.toUpperCase();
 const filteredSearch=globalSearch?games.filter(g=>safe(g.n).toLowerCase().includes(globalSearch.toLowerCase())).slice(0,5):[];
 if(loading)return <div className="loading-screen"><div className="logo-mark">✦</div><h2>PIXELPULSE</h2><div className="loader"/><p>Loading cleaned Steam catalogue…</p></div>;
 if(loadError)return <div className="loading-screen"><h2>DATA ENGINE OFFLINE</h2><p>{loadError}</p></div>;
 return <div className="app-shell">
 <aside className={'sidebar '+(mobile?'open':'')}><div className="brand"><div className="brand-mark">✦</div><div><b>PIXEL<span>PULSE</span></b><small>STEAM GAMES INTELLIGENCE</small></div><button className="mobile-close" onClick={()=>setMobile(false)}><X/></button></div><div className="side-label">WORKSPACE</div><nav>{NAV.map(([name,Icon])=><button key={name} onClick={()=>changePage(name)} className={page===name?'active':''}><Icon size={18}/><span>{name}</span>{name==='Overview'&&<i/>}</button>)}</nav><div className="side-bottom"><div className="data-status"><span className="live-dot"/><div><b>DATA ENGINE ONLINE</b><small>{fmt(games.length)} games indexed</small></div></div><div className="side-credit">PIXELPULSE BI <span>v1.0.0</span></div></div></aside>
 <main className="main"><header className="topbar"><button className="hamburger" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">WORKSPACE <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="global-search"><Search size={15}/><input placeholder="Search games…" value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)}/>{filteredSearch.length>0&&<div className="search-results">{filteredSearch.map(g=><button key={g.id} onClick={()=>{setGlobalSearch('');setQuery(g.n);changePage('Explorer')}}>{g.n}<small>{year(g)} · {money(g.p)}</small></button>)}</div>}</div><span className="avatar">PP</span></div></header>
 <div className="content"><div className="page-heading"><div><div className="eyebrow"><span/> STEAM MARKET INTELLIGENCE</div><h1>{pageTitle}</h1><p>{page==='Overview'?'A live analytical view of the cleaned Steam games catalogue.':page==='Explorer'?'Search, segment and inspect the catalogue with granular filters.':page==='Leaderboards'?'Rank games across seven different performance dimensions.':page==='Pricing Lab'?'Understand price positioning, free-to-play share and discount opportunities.':page==='Genres'?'Explore genre size, audience demand and player sentiment.':page==='Studios'?'Benchmark developers using reviews, audience and catalogue breadth.':'Put two games head-to-head across the metrics that matter.'}</p></div><div className="heading-actions"><span className="dataset-pill"><Database size={13}/> {fmt(base.length)} records in scope</span><button className="btn outline" onClick={()=>exportRows(base)}><Download size={15}/> Export data</button></div></div>
 <div className="global-filters"><label>GENRE<select value={genre} onChange={e=>setGenre(e.target.value)}><option>All genres</option>{genres.map(x=><option key={x}>{x}</option>)}</select></label><label>RELEASE YEAR<select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}><option>All years</option>{years.map(x=><option key={x}>{x}</option>)}</select></label><button className="clear-filter" onClick={()=>{setGenre('All genres');setYearFilter('All years')}}><RefreshCw size={13}/> Clear global filters</button></div>
 {page==='Overview'&&<><div className="stats-grid"><Stat label="GAMES IN CATALOGUE" value={fmt(kpis.count)} sub="Games in current filter scope" icon={Gamepad2}/><Stat label="TOTAL USER REVIEWS" value={fmt(kpis.reviews)} sub="Combined review volume" icon={Users} accent="purple"/><Stat label="EST. MIN OWNERS" value={fmt(kpis.players)} sub="Lower-bound owner estimates" icon={Activity} accent="green"/><Stat label="AVERAGE POSITIVE" value={kpis.avgRating.toFixed(1)+'%'} sub="Games with at least 100 reviews" icon={Star} accent="gold"/></div><div className="chart-grid"><Panel title="Catalogue releases" sub="New games released by year"><ResponsiveContainer width="100%" height={250}><AreaChart data={yearly}><defs><linearGradient id="fillC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={.32}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fill:'#8995b4',fontSize:11}}/><YAxis tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Area type="monotone" dataKey="releases" name="Releases" stroke="#22d3ee" fill="url(#fillC)" strokeWidth={2}/></AreaChart></ResponsiveContainer></Panel><Panel title="Genre distribution" sub="Top genres by number of games"><ResponsiveContainer width="100%" height={250}><BarChart data={genreData} layout="vertical" margin={{left:12}}><CartesianGrid stroke="#25304b" strokeDasharray="3 3" horizontal={false}/><XAxis type="number" tick={{fill:'#8995b4',fontSize:11}}/><YAxis type="category" dataKey="genre" width={90} tick={{fill:'#aeb8d0',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Bar dataKey="games" name="Games" fill="#a78bfa" radius={[0,5,5,0]}/></BarChart></ResponsiveContainer></Panel></div><div className="chart-grid"><Panel title="Price architecture" sub="Catalogue split by list price"><ResponsiveContainer width="100%" height={230}><BarChart data={priceData}><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fill:'#8995b4',fontSize:10}}/><YAxis tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Bar dataKey="count" name="Games" fill="#22d3ee" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel><Panel title="Most reviewed games" sub="Highest review volume in the current scope" action={<button className="text-btn" onClick={()=>changePage('Leaderboards')}>View leaderboard <ArrowUpRight size={13}/></button>}><div className="mini-ranking">{top(base,'rev',6).map((g,i)=><div className="mini-rank" key={g.id}><b className="rank-no">{String(i+1).padStart(2,'0')}</b><img src={g.img||''} onError={e=>e.currentTarget.style.visibility='hidden'}/><span>{g.n}<small>{year(g)} · {money(g.p)}</small></span><strong>{fmt(g.rev)}</strong></div>)}</div></Panel></div><div className="insight-strip"><div className="insight-icon"><Target/></div><div><b>Market snapshot</b><p>{kpis.free}% of games in the current scope are free-to-play. Paid games average {money(kpis.avgPrice)}. Use the global genre and year filters to segment every dashboard at once.</p></div></div></>}
 {page==='Explorer'&&<><div className="filter-panel"><div className="filter-grid"><label className="wide">SEARCH NAME / DEVELOPER / PUBLISHER<input placeholder="e.g. portal, valve, hades…" value={query} onChange={e=>{setQuery(e.target.value);setPageNo(1)}}/></label><label>TAG / CATEGORY<input placeholder="e.g. Roguelike" value={tag} onChange={e=>setTag(e.target.value)}/></label><label>PLATFORM<select value={platform} onChange={e=>setPlatform(e.target.value)}>{['Any','Windows','Mac','Linux'].map(x=><option>{x}</option>)}</select></label><label>PRICE<select value={price} onChange={e=>setPrice(e.target.value)}>{['Any','Free','$0.01–$10','$10–$30','$30+'].map(x=><option>{x}</option>)}</select></label><label>SORT BY<select value={sort} onChange={e=>setSort(e.target.value)}>{['Most reviewed','Best rated','Peak players','Price: low to high','Newest','Biggest audience'].map(x=><option>{x}</option>)}</select></label><label className="rating-filter">MIN. POSITIVE RATING <div className="range-row"><input type="range" min="0" max="100" value={minRating} onChange={e=>setMinRating(+e.target.value)}/><b>{minRating}%</b></div></label></div><div className="filter-bottom"><span>{fmt(filtered.length)} matching games</span><div><button className={view==='Cards'?'tab active-tab':'tab'} onClick={()=>setView('Cards')}>Cards</button><button className={view==='Table'?'tab active-tab':'tab'} onClick={()=>setView('Table')}>Table</button><button className="btn subtle" onClick={reset}><RefreshCw size={13}/> Reset</button><button className="btn primary" onClick={()=>exportRows(sorted)}><Download size={13}/> Export CSV</button></div></div></div>{selected.length>0&&<div className="compare-banner"><span><Swords size={16}/> {selected.length} game(s) selected for comparison</span><button className="btn primary" onClick={()=>{if(selected.length===2){setCompareA(String(selected[0]));setCompareB(String(selected[1]));changePage('Versus')}}}>Compare selected</button><button className="text-btn" onClick={()=>setSelected([])}>Clear</button></div>}{view==='Cards'?<div className="game-grid">{sorted.slice((pageNo-1)*24,pageNo*24).map(g=><GameCard key={g.id} g={g}/>)}</div>:<Table rows={sorted.slice((pageNo-1)*50,pageNo*50)}/>}<div className="pagination"><span>Page {pageNo} · showing {view==='Cards'?24:50} per page</span><div><button disabled={pageNo===1} onClick={()=>setPageNo(p=>p-1)}>Previous</button><button disabled={pageNo>=Math.ceil(sorted.length/(view==='Cards'?24:50))} onClick={()=>setPageNo(p=>p+1)}>Next</button></div></div></>}
 {page==='Leaderboards'&&<><div className="board-tabs">{['Most reviewed','Best rated','Most played','Peak players','Biggest audience','Hidden gems','Fresh hits'].map((x,i)=><button className={board===x?'selected':''} onClick={()=>setBoard(x)}>{['◉','★','◷','♨','♟','◇','▣'][i]} {x}</button>)}</div><div className="board-controls"><label>SHOW TOP<select value={topN} onChange={e=>setTopN(e.target.value)}>{['10','25','50','100'].map(x=><option>{x}</option>)}</select></label><span>{board} · {leaderboard.length} ranked games</span></div><Panel title={board.toUpperCase()} sub="Rankings update with the global genre and release-year filters"><div className="leader-list">{leaderboard.map((g,i)=><div className="leader-row" key={g.id}><b className="leader-num">{i+1}</b><img src={g.img||''} onError={e=>e.currentTarget.style.visibility='hidden'}/><div className="leader-name"><b>{g.n}</b><small>{split(g.gen).slice(0,2).join(' · ')} · {year(g)} · {money(g.p)}</small></div><strong>{board==='Best rated'?(rating(g)||0).toFixed(1)+'%':fmt(board==='Most reviewed'?g.rev:board==='Most played'?g.play:board==='Peak players'?g.ccu:board==='Biggest audience'?g.o2:g.rev)}</strong><div className="leader-bar"><i style={{width:(leaderboard[0]?(board==='Best rated'?(rating(g)||0)/(rating(leaderboard[0])||1):(g[board==='Most reviewed'?'rev':board==='Most played'?'play':board==='Peak players'?'ccu':board==='Biggest audience'?'o2':'rev']||0)/(leaderboard[0][board==='Most reviewed'?'rev':board==='Most played'?'play':board==='Peak players'?'ccu':board==='Biggest audience'?'o2':'rev']||1))*100:0)+'%'}}/></div></div>)}</div></Panel></>}
 {page==='Pricing Lab'&&<><div className="stats-grid"><Stat label="FREE-TO-PLAY SHARE" value={kpis.free+'%'} sub="Share of games with zero price" icon={Gamepad2}/><Stat label="AVERAGE PAID PRICE" value={money(kpis.avgPrice)} sub="Excludes free games" icon={DollarSign} accent="green"/><Stat label="PAID GAMES" value={fmt(base.filter(g=>g.p>0).length)} sub="Games with a positive list price" icon={Tags} accent="purple"/><Stat label="DISCOUNTED GAMES" value={fmt(base.filter(g=>g.off>0).length)} sub="Discount field greater than zero" icon={Flame} accent="gold"/></div><div className="chart-grid"><Panel title="Price band distribution" sub="How the catalogue is priced"><ResponsiveContainer width="100%" height={280}><BarChart data={priceData}><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fill:'#8995b4',fontSize:11}}/><YAxis tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Bar dataKey="count" name="Games" fill="#a78bfa" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></Panel><Panel title="Price vs. player sentiment" sub="Paid games grouped into price tiers"><ResponsiveContainer width="100%" height={280}><LineChart data={priceData.map((x,i)=>({...x,positive:avg(base.filter(g=>i===0?g.p===0:i===1?g.p>0&&g.p<=5:i===2?g.p>5&&g.p<=10:i===3?g.p>10&&g.p<=20:i===4?g.p>20&&g.p<=40:g.p>40).filter(g=>g.rev>=10).map(rating))}))}><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fill:'#8995b4',fontSize:10}}/><YAxis domain={[0,100]} tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Line dataKey="positive" name="Average positive %" stroke="#22d3ee" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></Panel></div><Panel title="Highest-priced games" sub="Top list prices in the selected catalogue"><Table rows={[...base].sort((a,b)=>(b.p||0)-(a.p||0)).slice(0,12)}/></Panel></>}
 {page==='Genres'&&<><div className="genre-grid">{genreData.map((g,i)=><button className="genre-tile" key={g.genre} onClick={()=>{setGenre(g.genre);changePage('Explorer')}}><span className="genre-index">GENRE / {String(i+1).padStart(2,'0')}</span><b>{g.genre}</b><div><strong>{fmt(g.games)}</strong><small>games</small></div><div className="genre-meter"><i style={{width:(g.games/(genreData[0]?.games||1)*100)+'%'}}/></div><small>{fmt(g.reviews)} reviews · {g.rating.toFixed(1)}% positive avg.</small></button>)}</div><div className="chart-grid"><Panel title="Genre catalogue size" sub="Top 10 genres by game count"><ResponsiveContainer width="100%" height={280}><BarChart data={genreData}><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="genre" tick={{fill:'#8995b4',fontSize:10}} interval={0} angle={-20} textAnchor="end" height={55}/><YAxis tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Bar dataKey="games" fill="#22d3ee" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel><Panel title="Genre sentiment" sub="Average positive review share (games with reviews)"><ResponsiveContainer width="100%" height={280}><BarChart data={genreData}><CartesianGrid stroke="#25304b" strokeDasharray="3 3"/><XAxis dataKey="genre" tick={{fill:'#8995b4',fontSize:10}} interval={0} angle={-20} textAnchor="end" height={55}/><YAxis domain={[0,100]} tick={{fill:'#8995b4',fontSize:11}}/><Tooltip content={<ChartTip/>} contentStyle={tipStyle}/><Bar dataKey="rating" fill="#84cc16" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel></div></>}
 {page==='Studios'&&<><div className="studio-search"><Search size={16}/><input placeholder="Find a developer…" value={studioQuery} onChange={e=>setStudioQuery(e.target.value)}/><span>{fmt(studios.length)} developers in scope</span></div><Panel title="Developer leaderboard" sub="Ranked by total reviews across games"><div className="studio-list">{studios.filter(s=>s.name.toLowerCase().includes(studioQuery.toLowerCase())).slice(0,100).map((s,i)=><div className="studio-row" key={s.name}><b className="rank-no">{i+1}</b><div className="studio-avatar">{s.name.slice(0,1).toUpperCase()}</div><div className="studio-name"><b>{s.name}</b><small>{s.games} games · {s.rating.toFixed(1)}% avg. positive</small></div><div className="studio-metric"><b>{fmt(s.reviews)}</b><small>reviews</small></div><div className="studio-metric"><b>{fmt(s.players)}</b><small>est. owners min</small></div></div>)}</div></Panel></>}
 {page==='Versus'&&<><div className="versus-select"><label>PLAYER ONE / GAME A<select value={compareA} onChange={e=>setCompareA(e.target.value)}>{games.map(g=><option value={g.id} key={g.id}>{g.n}</option>)}</select></label><div className="versus-mark">VS</div><label>PLAYER TWO / GAME B<select value={compareB} onChange={e=>setCompareB(e.target.value)}>{games.map(g=><option value={g.id} key={g.id}>{g.n}</option>)}</select></label></div>{compareA&&compareB&&(()=>{const a=gameById(compareA),b=gameById(compareB);if(!a||!b)return null;const metrics=[['Total reviews',a.rev,b.rev],['Positive rating',rating(a),rating(b)],['Peak CCU',a.ccu,b.ccu],['Owners (min)',a.o1,b.o1],['Price',a.p,b.p],['Average playtime',a.play,b.play],['Achievements',a.ach,b.ach],['Recommendations',a.rec,b.rec]];return <><div className="versus-cards"><div className="versus-card"><img src={a.img||''}/><h2>{a.n}</h2><p>{split(a.gen).slice(0,3).join(' · ')}</p><span>{year(a)} · {money(a.p)}</span></div><div className="versus-card"><img src={b.img||''}/><h2>{b.n}</h2><p>{split(b.gen).slice(0,3).join(' · ')}</p><span>{year(b)} · {money(b.p)}</span></div></div><Panel title="Head-to-head metrics" sub="Values are taken directly from the cleaned catalogue"><div className="versus-metrics">{metrics.map(([label,av,bv])=><div className="versus-metric"><div className="metric-value">{label==='Price'?money(av):label==='Positive rating'?(av==null?'—':av.toFixed(1)+'%'):fmt(av)}</div><div className="metric-track"><i className={(av||0)>=(bv||0)?'winner':''} style={{width:Math.max(0,Math.min(100,((av||0)/Math.max(1,av||0,bv||0))*100))+'%'}}/></div><b>{label}</b><div className="metric-track right"><i className={(bv||0)>(av||0)?'winner':''} style={{width:Math.max(0,Math.min(100,((bv||0)/Math.max(1,av||0,bv||0))*100))+'%'}}/></div><div className="metric-value right-value">{label==='Price'?money(bv):label==='Positive rating'?(bv==null?'—':bv.toFixed(1)+'%'):fmt(bv)}</div></div>)}</div></Panel></>})()}</>}
 <footer><span>PIXELPULSE BI <b>·</b> STEAM GAMES INTELLIGENCE</span><span>Analytics from the supplied cleaned dataset · {fmt(games.length)} unique App IDs</span></footer>
 </div></main></div>
}
export default App;
