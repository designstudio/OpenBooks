import { useEffect, useState } from "react";
import "./App.css";

type Page = "home" | "explore" | "library" | "addons" | "settings";
type ThemePreference = "system" | "light" | "dark";

const navigation: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Início", icon: "⌂" },
  { id: "explore", label: "Explorar", icon: "◎" },
  { id: "library", label: "Biblioteca", icon: "▤" },
  { id: "addons", label: "Add-ons", icon: "✧" },
  { id: "settings", label: "Configurações", icon: "⚙" },
];

const pages: Record<Page, { eyebrow: string; title: string; description: string }> = {
  home: { eyebrow: "BEM-VINDO AO OPENBOOKS", title: "Sua próxima história começa aqui.", description: "Descubra livros, organize sua biblioteca e leia do seu jeito." },
  explore: { eyebrow: "DESCOBRIR", title: "Explore novas histórias.", description: "Em breve, livros, autores e gêneros de um catálogo real." },
  library: { eyebrow: "SUA ESTANTE", title: "Sua biblioteca, suas histórias.", description: "Os livros que você adicionar ficarão organizados aqui." },
  addons: { eyebrow: "PERSONALIZE SUA EXPERIÊNCIA", title: "Conecte suas fontes.", description: "Gerencie extensões opcionais e fontes de leitura autorizadas." },
  settings: { eyebrow: "PREFERÊNCIAS", title: "Do seu jeito.", description: "Personalize a aparência do OpenBooks." },
};

function getSavedTheme(): ThemePreference {
  try {
    const saved = localStorage.getItem("openbooks:theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [theme, setTheme] = useState<ThemePreference>(getSavedTheme);
  const [search, setSearch] = useState("");
  const current = pages[page];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("openbooks:theme", theme);
    } catch {
      // App remains usable when storage is unavailable.
    }
  }, [theme]);

  const navigate = (next: Page) => {
    setPage(next);
    if (next !== "explore") setSearch("");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar glass" aria-label="Navegação principal">
        <button className="brand" onClick={() => navigate("home")} aria-label="OpenBooks — Início">
          <span className="brand-symbol" aria-hidden="true">◧</span>
          <span>OpenBooks</span>
        </button>
        <div className="sidebar-label">BIBLIOTECA DIGITAL</div>
        <nav className="navigation" aria-label="Seções">
          {navigation.map((item) => (
            <button
              className={`nav-item ${page === item.id ? "active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Alpha 0.1 · Local-first</span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar glass">
          <span className="topbar-location">OpenBooks <span aria-hidden="true">/</span> {navigation.find((item) => item.id === page)?.label}</span>
          <button className="topbar-action" onClick={() => navigate("settings")} aria-label="Abrir configurações" title="Configurações">⚙</button>
        </header>

        <main className="content" id="main-content">
          <div className="page-heading">
            <p className="eyebrow">{current.eyebrow}</p>
            <h1>{current.title}</h1>
            <p className="lead">{current.description}</p>
          </div>

          {page === "home" && (
            <div className="home-layout">
              <section className="feature-panel" aria-labelledby="home-feature-title">
                <div className="feature-copy">
                  <span className="feature-tag">SEU ESPAÇO DE LEITURA</span>
                  <h2 id="home-feature-title">Um universo de histórias. Uma biblioteca só sua.</h2>
                  <p>Encontre sua próxima leitura e mantenha tudo organizado em um único lugar.</p>
                  <button className="primary-button" onClick={() => navigate("explore")}>Explorar livros <span aria-hidden="true">→</span></button>
                </div>
                <div className="book-art" aria-hidden="true">
                  <div className="art-book art-book-back" />
                  <div className="art-book art-book-front"><span>OPEN<br />BOOKS</span><small>YOUR READING SPACE</small></div>
                </div>
              </section>
              <section className="section-block" aria-labelledby="continue-heading">
                <div className="section-heading"><h2 id="continue-heading">Continue lendo</h2><span>Seus livros aparecerão aqui</span></div>
                <div className="empty-block">
                  <span className="empty-icon" aria-hidden="true">▤</span>
                  <h3>Sua próxima leitura espera por você.</h3>
                  <p>Quando você abrir seu primeiro livro, poderá continuar de onde parou.</p>
                  <button className="secondary-button" onClick={() => navigate("library")}>Ir para biblioteca</button>
                </div>
              </section>
            </div>
          )}

          {page === "explore" && (
            <section className="section-block" aria-label="Pesquisar livros">
              <label className="field-label" htmlFor="book-search">Pesquisar livros ou autores</label>
              <input id="book-search" className="search-field" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, autor ou gênero..." />
              <div className="empty-block">
                <span className="empty-icon" aria-hidden="true">◎</span>
                <h2>{search.trim() ? "Pesquisa ainda não conectada" : "O catálogo está chegando."}</h2>
                <p>{search.trim() ? "A busca será conectada a fontes reais de metadados na próxima etapa." : "Aqui você poderá descobrir livros e explorar autores e gêneros."}</p>
              </div>
            </section>
          )}

          {page === "library" && (
            <section className="section-block">
              <div className="section-heading"><h2>Minha estante</h2><span>0 livros</span></div>
              <div className="empty-block">
                <span className="empty-icon" aria-hidden="true">▤</span>
                <h3>Sua biblioteca está vazia.</h3>
                <p>Seus livros, coleções e progresso de leitura aparecerão aqui.</p>
                <button className="secondary-button" onClick={() => navigate("explore")}>Explorar livros</button>
              </div>
            </section>
          )}

          {page === "addons" && (
            <section className="section-block">
              <div className="section-heading"><h2>Minhas extensões</h2><span>0 instaladas</span></div>
              <div className="empty-block">
                <span className="empty-icon" aria-hidden="true">✧</span>
                <h3>Nenhum add-on instalado.</h3>
                <p>O gerenciamento de extensões estará disponível em uma próxima etapa. O catálogo de livros funcionará independentemente dos add-ons.</p>
              </div>
            </section>
          )}

          {page === "settings" && (
            <section className="settings-panel" aria-labelledby="appearance-heading">
              <h2 id="appearance-heading">Aparência</h2>
              <p>Escolha como o OpenBooks aparece neste dispositivo.</p>
              <fieldset className="theme-options">
                <legend>Tema do aplicativo</legend>
                {(["system", "light", "dark"] as const).map((option) => (
                  <label className={`theme-option ${theme === option ? "selected" : ""}`} key={option}>
                    <input type="radio" name="theme" value={option} checked={theme === option} onChange={() => setTheme(option)} />
                    <span>{option === "system" ? "Sistema" : option === "light" ? "Claro" : "Escuro"}</span>
                  </label>
                ))}
              </fieldset>
              <p className="settings-note">As fontes e opções do leitor serão personalizáveis quando o e-reader estiver disponível.</p>
            </section>
          )}
        </main>
      </div>

      <nav className="mobile-nav glass" aria-label="Navegação principal mobile">
        {navigation.map((item) => (
          <button key={item.id} className={`mobile-item ${page === item.id ? "active" : ""}`} aria-current={page === item.id ? "page" : undefined} onClick={() => navigate(item.id)}>
            <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
