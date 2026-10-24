import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Page = "home" | "explore" | "library" | "addons" | "settings";
type Theme = "system" | "light" | "dark";
type IconName = "home" | "explore" | "library" | "addons" | "settings" | "search" | "arrow" | "book" | "spark";

const icons: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
  explore: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
  library: <><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 4l4 1v15l-4-1z"/></>,
  addons: <><path d="M9 3h6v5h5v6h-5v7H9v-7H4V8h5z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m10 2-.5 2.2-2 .9-2-1.1-2.5 3 1.4 1.8-.5 2.2-2 1v3l2 1 .5 2.2L3 20l2.5 2 2-1.1 2 .9.5 2.2h4l.5-2.2 2-.9 2 1.1 2.5-3-1.4-1.8.5-2.2 2-1v-3l-2-1-.5-2.2L21 6l-2.5-2-2 1.1-2-.9L14 2z" transform="translate(0 -1) scale(1 .94)"/></>,
  search: <><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 5 5"/></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  book: <><path d="M12 5c-3.4-2-6.5-2-9-1v15c3-.8 6-.7 9 1 3-1.7 6-1.8 9-1V4c-2.5-1-5.6-1-9 1zm0 0v15"/></>,
  spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/></>,
};
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}
const nav: { id: Page; label: string; icon: IconName }[] = [
  { id: "home", label: "Início", icon: "home" },
  { id: "explore", label: "Explorar", icon: "explore" },
  { id: "library", label: "Estante", icon: "library" },
  { id: "addons", label: "Add-ons", icon: "addons" },
  { id: "settings", label: "Ajustes", icon: "settings" },
];
// Clearly labelled editorial samples, NOT catalog results, availability, or a user's library.
const samples = [
  { title: "Orgulho e Preconceito", author: "Jane Austen", isbn: "9780141439518", fallback: "PRIDE & PREJUDICE", color: "#6c8b8a" },
  { title: "E Não Sobrou Nenhum", author: "Agatha Christie", isbn: "9780007422135", fallback: "AND THEN THERE WERE NONE", color: "#a44850" },
  { title: "1984", author: "George Orwell", isbn: "9780451524935", fallback: "1984", color: "#354960" },
];
function BookCard({ book }: { book: (typeof samples)[number] }) {
  const [failed, setFailed] = useState(false);
  return <article className="book-card">
    <div className="book-cover" style={{ background: book.color }}>
      {!failed ? <img loading="lazy" src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`} alt={`Capa de ${book.title}`} onError={() => setFailed(true)} /> : <span className="cover-fallback">{book.fallback}</span>}
    </div>
    <h3>{book.title}</h3><p>{book.author}</p>
  </article>;
}
const titles: Record<Page, string> = {
  home: "Descubra sua próxima história.",
  explore: "Explore livros.",
  library: "Sua estante.",
  addons: "Seus add-ons.",
  settings: "Configurações.",
};
function savedTheme(): Theme {
  try {
    const value = localStorage.getItem("openbooks:theme");
    return value === "light" || value === "dark" ? value : "system";
  } catch { return "system"; }
}
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [theme, setTheme] = useState<Theme>(savedTheme);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => samples.filter((item) => `${item.title} ${item.author}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR").trim())), [query]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("openbooks:theme", theme); } catch { /* persistence optional */ }
  }, [theme]);

  return <div className="app">
    <aside className="desktop-rail" aria-label="Navegação">
      <button className="wordmark" onClick={() => setPage("home")} aria-label="OpenBooks, início"><span className="brand-mark"><Icon name="book" size={21}/></span><span>OpenBooks</span></button>
      <nav className="rail-nav" aria-label="Seções do aplicativo">
        {nav.map(item => <button key={item.id} className={`rail-link ${page === item.id ? "is-active" : ""}`} aria-current={page === item.id ? "page" : undefined} onClick={() => setPage(item.id)}><Icon name={item.icon}/><span>{item.label}</span></button>)}
      </nav>
      <span className="rail-caption">OpenBooks · Alpha 0.1</span>
    </aside>

    <div className="workspace">
      <header className="masthead">
        <button className="mobile-brand" onClick={() => setPage("home")}><span className="brand-mark"><Icon name="book" size={18}/></span> OpenBooks</button>
        <span className="desktop-heading">OpenBooks <span className="separator">/</span> {nav.find(item => item.id === page)?.label}</span>
        <button className="circle-action" title="Configurações" aria-label="Abrir configurações" onClick={() => setPage("settings")}><Icon name="settings" size={19}/></button>
      </header>

      <main className="stage" id="main-content">
        {(page === "home" || page === "explore") && <>
          <div className="search-bar glass">
            <Icon name="search" size={20}/>
            <label htmlFor="book-search" className="visually-hidden">Pesquisar livros ou autores na amostra</label>
            <input id="book-search" type="search" placeholder="Pesquisar livros ou autores..." value={query} onChange={e => setQuery(e.target.value)} />
            <button className="search-options" type="button" onClick={() => setPage("explore")} title="Explorar" aria-label="Ir para Explorar"><Icon name="explore" size={20}/></button>
          </div>
          <div className="section-title-row"><div><h1>{titles[page]}</h1><p className="subcopy">Livros para descobrir. Histórias para guardar.</p></div></div>
          <div className="sample-note"><Icon name="spark" size={15}/> Vitrine de demonstração · capas públicas do Open Library, ainda sem catálogo conectado</div>
          {filtered.length ? <section className="covers-grid" aria-label="Amostra visual de livros">{filtered.map(book => <BookCard key={book.isbn} book={book}/>)}</section> : <div className="quiet-empty"><Icon name="search" size={30}/><h2>Nenhum livro nesta amostra.</h2><p>A pesquisa completa chegará com a integração ao catálogo.</p><button className="soft-button" onClick={() => setQuery("")}>Limpar pesquisa</button></div>}
          <div className="below-grid"><h2>Seu espaço de leitura</h2><p>Em breve, livros recomendados e o progresso de suas leituras aparecerão aqui.</p><button className="text-link" onClick={() => setPage("library")}>Ver minha estante <Icon name="arrow" size={17}/></button></div>
        </>}

        {page === "library" && <><h1>{titles.library}</h1><p className="subcopy">Todos os seus livros em um só lugar.</p><div className="quiet-empty"><Icon name="library" size={35}/><h2>Uma estante esperando histórias.</h2><p>Quando você adicionar livros, eles aparecerão aqui.</p><button className="soft-button" onClick={() => setPage("explore")}>Explorar livros <Icon name="arrow" size={16}/></button></div></>}
        {page === "addons" && <><h1>{titles.addons}</h1><p className="subcopy">Gerencie fontes de leitura opcionais.</p><div className="quiet-empty"><Icon name="addons" size={35}/><h2>Suas extensões aparecerão aqui.</h2><p>O gerenciamento de add-ons será implementado em uma etapa futura.</p></div></>}
        {page === "settings" && <><h1>{titles.settings}</h1><p className="subcopy">Uma experiência de leitura do seu jeito.</p><section className="settings-card"><h2>Aparência</h2><p>Escolha a aparência da interface.</p><fieldset className="theme-picker"><legend>Tema</legend>{(["system","light","dark"] as const).map(t => <label key={t} className={`theme-choice ${theme === t ? "selected" : ""}`}><input type="radio" name="theme" checked={theme===t} onChange={()=>setTheme(t)}/><span>{t==="system"?"Sistema":t==="light"?"Claro":"Escuro"}</span></label>)}</fieldset><p className="settings-hint">As fontes Noto Serif e Castoro estarão disponíveis quando integrarmos o leitor.</p></section></>}
      </main>
    </div>

    <nav className="bottom-dock glass" aria-label="Navegação inferior">
      {nav.map(item => <button key={item.id} aria-current={page===item.id?"page":undefined} className={`dock-link ${page===item.id?"is-active":""}`} onClick={()=>setPage(item.id)}><Icon name={item.icon} size={21}/><span>{item.label}</span></button>)}
    </nav>
  </div>;
}
