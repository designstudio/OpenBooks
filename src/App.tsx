import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./App.css";

type Page = "home" | "explore" | "library" | "addons" | "settings";
type Theme = "system" | "light" | "dark";
type IconName = Page | "search" | "arrow" | "book" | "close" | "chevron";

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="M3 10 12 3l9 7v10h-6v-7H9v7H3z"/></>,
  explore: <><circle cx="11" cy="11" r="7.5"/><path d="m16.5 16.5 5 5"/></>,
  library: <><rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><path d="m16 5 3-1 3 15-3 1z"/></>,
  addons: <><path d="M9 3h6v5h5v6h-5v7H9v-7H4V8h5z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  search: <><circle cx="11" cy="11" r="7.5"/><path d="m16.5 16.5 5 5"/></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
  book: <><path d="M12 5C9 3 6 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zm0 0v15"/></>,
  close: <><path d="M5 5 19 19M19 5 5 19"/></>,
  chevron: <><path d="m9 6 6 6-6 6"/></>,
};

function Icon({ name, size = 20 }: {name: IconName; size?: number}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}
type Book = { id: string; title: string; author: string; isbn: string; note: string; description: string; color: string };
const books: Book[] = [
  { id:"pride", title:"Orgulho e Preconceito",author:"Jane Austen",isbn:"9780141439518",note:"Romance · Clássico",description:"Elizabeth Bennet e Fitzwilliam Darcy protagonizam uma história sobre orgulho, primeiras impressões e convenções sociais.",color:"#586e6c" },
  { id:"none",title:"E Não Sobrou Nenhum",author:"Agatha Christie",isbn:"9780007422135",note:"Mistério · Suspense",description:"Dez desconhecidos chegam a uma ilha isolada, onde acusações e mortes transformam sua estadia em um enigma.",color:"#963f48" },
  { id:"1984",title:"1984",author:"George Orwell",isbn:"9780451524935",note:"Distopia · Ficção",description:"Winston Smith vive numa sociedade de vigilância e repressão em que até a verdade é controlada.",color:"#52616c" },
  { id:"dune",title:"Duna",author:"Frank Herbert",isbn:"9780441172719",note:"Ficção científica",description:"Paul Atreides chega a Arrakis, planeta desértico no centro de conflitos políticos e ecológicos.",color:"#8e7058" },
  { id:"frankenstein",title:"Frankenstein",author:"Mary Shelley",isbn:"9780141439471",note:"Terror · Clássico",description:"A criação de Victor Frankenstein questiona os limites da ciência e a responsabilidade de quem cria vida.",color:"#445c57" },
  { id:"dracula",title:"Drácula",author:"Bram Stoker",isbn:"9780141439846",note:"Terror · Gótico",description:"O conde Drácula chega à Inglaterra e atrai um grupo determinado a enfrentar sua influência sombria.",color:"#6b424b" }
];
const sections: {title:string; ids:string[]}[] = [
 {title:"Histórias para descobrir",ids:["pride","none","1984","dune","frankenstein","dracula"]},
 {title:"Mistério e imaginação",ids:["none","frankenstein","dracula","1984"]},
 {title:"Clássicos para revisitar",ids:["pride","1984","frankenstein","dracula"]},
];
const nav: {id:Page;label:string}[] = [
 {id:"home",label:"Início"},{id:"explore",label:"Buscar"},{id:"library",label:"Estante"},{id:"addons",label:"Add-ons"},{id:"settings",label:"Ajustes"}
];
function Cover({book,hero=false}:{book:Book;hero?:boolean}) {
 const [failed,setFailed]=useState(false);
 return <div className={hero?"cover-shell hero-cover":"cover-shell"} style={{background:book.color}}>
   {failed?<div className="cover-fallback"><span>{book.title}</span><small>{book.author}</small></div>:<img alt={`Capa de ${book.title}`} src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`} loading={hero?"eager":"lazy"} onError={()=>setFailed(true)}/>}
 </div>;
}
function loadTheme():Theme { try {const v=localStorage.getItem("openbooks:theme");return v==="dark"||v==="light"?v:"system";}catch{return "system";}}
function App(){
 const [page,setPage]=useState<Page>("home");
 const [theme,setTheme]=useState<Theme>(loadTheme);
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState<Book|null>(null);
 const featured=books[1];
 const results=books.filter(b=>`${b.title} ${b.author} ${b.note}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem("openbooks:theme",theme);}catch{/* optional */}},[theme]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setSelected(null)};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[]);
 const changePage=(next:Page)=>{setPage(next);setSelected(null)};
 return <div className="app-shell">
   <aside className="side-rail glass" aria-label="Navegação principal">
     <button className="brand-button" aria-label="OpenBooks — início" title="OpenBooks" onClick={()=>changePage("home")}><Icon name="book" size={23}/></button>
     <nav className="rail-buttons" aria-label="Seções">
       {nav.map(item=><button key={item.id} className={`rail-button ${page===item.id?"active":""}`} aria-label={item.label} title={item.label} aria-current={page===item.id?"page":undefined} onClick={()=>changePage(item.id)}><Icon name={item.id} size={21}/></button>)}
     </nav>
   </aside>
   <div className="page-shell">
     <header className="top-header">
       <button className="mobile-logo" onClick={()=>changePage("home")}><Icon name="book" size={20}/> OpenBooks</button>
       <span className="desktop-logo">OpenBooks <span className="breadcrumb">/ {nav.find(item=>item.id===page)?.label}</span></span>
       <div className="header-actions"><button title="Buscar livros" aria-label="Buscar livros" onClick={()=>changePage("explore")}><Icon name="search"/></button><button title="Configurações" aria-label="Configurações" onClick={()=>changePage("settings")}><Icon name="settings"/></button></div>
     </header>
     <main id="main-content">
       {page==="home"&&<>
         <section className="hero-banner" style={{"--hero-color":featured.color} as React.CSSProperties} aria-labelledby="featured-heading">
           <div className="hero-ambient" aria-hidden="true"/>
           <div className="hero-copy">
             <span className="overline">EM DESTAQUE · VITRINE DE DEMONSTRAÇÃO</span>
             <h1 id="featured-heading">{featured.title}</h1>
             <p className="genre">{featured.note} · {featured.author}</p>
             <p className="hero-description">{featured.description}</p>
             <button className="hero-cta" onClick={()=>setSelected(featured)}>Ver detalhes <Icon name="arrow" size={18}/></button>
           </div>
           <button className="featured-art" aria-label={`Ver detalhes de ${featured.title}`} onClick={()=>setSelected(featured)}><Cover book={featured} hero/></button>
           <div className="hero-bottom-fade" aria-hidden="true"/>
         </section>
         <div className="catalog-body"><p className="demo-disclaimer">Prévia de layout com obras conhecidas e capas do Open Library. O catálogo e o leitor ainda não estão conectados.</p>
           {sections.map(section=><section className="shelf" key={section.title} aria-label={section.title}><div className="shelf-header"><h2>{section.title}</h2><Icon name="chevron" size={17}/></div><div className="shelf-scroller">{section.ids.map(id=>{const book=books.find(b=>b.id===id)!;return <button className="book-tile" key={id} onClick={()=>setSelected(book)}><Cover book={book}/><span className="tile-title">{book.title}</span><span className="tile-author">{book.author}</span></button>})}</div></section>)}
         </div>
       </>}
       {page==="explore"&&<div className="inner-page"><h1>Encontre sua próxima leitura.</h1><p className="muted">Busque nesta amostra enquanto preparamos a integração ao catálogo.</p><label className="search-box glass"><Icon name="search"/><span className="sr-only">Pesquisar obras ou autores</span><input type="search" value={query} placeholder="Título, autor ou gênero..." onChange={e=>setQuery(e.target.value)}/></label><p className="demo-disclaimer">Pesquisa local de demonstração · {results.length} resultados</p>{results.length?<div className="explore-grid">{results.map(b=><button className="book-tile" key={b.id} onClick={()=>setSelected(b)}><Cover book={b}/><span className="tile-title">{b.title}</span><span className="tile-author">{b.author}</span></button>)}</div>:<div className="empty-state"><Icon name="search" size={33}/><h2>Nenhum resultado nesta amostra</h2><p>A busca completa estará disponível após a integração ao catálogo.</p></div>}</div>}
       {page==="library"&&<div className="inner-page"><h1>Sua estante.</h1><p className="muted">Um lugar para guardar todas as suas histórias.</p><div className="empty-state"><Icon name="library" size={38}/><h2>Sua estante está vazia.</h2><p>Seus livros e seu progresso de leitura aparecerão aqui.</p><button className="soft-cta" onClick={()=>changePage("explore")}>Explorar livros <Icon name="arrow" size={16}/></button></div></div>}
       {page==="addons"&&<div className="inner-page"><h1>Seus add-ons.</h1><p className="muted">Fontes de leitura opcionais, gerenciadas por você.</p><div className="empty-state"><Icon name="addons" size={38}/><h2>Nenhuma extensão instalada.</h2><p>Instalação e gerenciamento de add-ons serão adicionados em uma etapa futura.</p></div></div>}
       {page==="settings"&&<div className="inner-page"><h1>Configurações.</h1><p className="muted">Uma experiência do seu jeito.</p><section className="settings-card"><h2>Aparência</h2><p>Escolha o tema do aplicativo.</p><fieldset className="theme-choices"><legend>Tema</legend>{(["system","light","dark"] as const).map(option=><label key={option} className={theme===option?"selected":""}><input type="radio" name="theme" value={option} checked={theme===option} onChange={()=>setTheme(option)}/><span>{option==="system"?"Sistema":option==="light"?"Claro":"Escuro"}</span></label>)}</fieldset><p className="settings-caption">As opções de fonte Noto Serif e Castoro serão incorporadas ao e-reader.</p></section></div>}
     </main>
   </div>
   <nav className="bottom-bar glass" aria-label="Navegação inferior">{nav.map(item=><button key={item.id} aria-current={page===item.id?"page":undefined} className={page===item.id?"active":""} onClick={()=>changePage(item.id)}><Icon name={item.id}/><span>{item.label}</span></button>)}</nav>
   {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="book-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-heading"><button className="dialog-close" aria-label="Fechar detalhes" onClick={()=>setSelected(null)}><Icon name="close"/></button><Cover book={selected} hero/><div className="dialog-copy"><span className="overline">DEMONSTRAÇÃO · DETALHES</span><h2 id="detail-heading">{selected.title}</h2><p className="muted">{selected.author} · {selected.note}</p><p>{selected.description}</p><p className="dialog-note">A leitura e a disponibilidade dependem das próximas integrações; esta tela não oferece downloads.</p></div></section></div>}
 </div>;
}
export default App;
