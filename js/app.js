/* =========================================================
   LOVYNNI — app.js
   Catálogo com 5 peças discretas + 2 novidades.
   ========================================================= */

/* Catálogo principal — 5 peças, elegantes e discretas */
const CATALOGO = [
  {
    id: 1, nome: "Vestido Vinho Midi", preco: 379.00,
    categoria: "vestidos",
    imagem: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
  },
  {
    id: 2, nome: "Blazer Estruturado", preco: 489.00,
    categoria: "blusas",
    imagem: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
  },
  {
    id: 3, nome: "Camisa Seda Bege", preco: 289.00,
    categoria: "blusas",
    imagem: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80"
  },
  {
    id: 4, nome: "Calça Alfaiataria Preta", preco: 429.00,
    categoria: "calcas",
    imagem: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"
  },
  {
    id: 5, nome: "Saia Vinho Plissada", preco: 259.00,
    categoria: "vestidos",
    imagem: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80"
  }
];

/* Novidades — 2 peças em destaque */
const NOVIDADES = [
  {
    id: 101, nome: "Vestido Renda Navy", preco: 549.00,
    categoria: "vestidos",
    imagem: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"
  },
  {
    id: 102, nome: "Tricot Azul Noite", preco: 319.00,
    categoria: "blusas",
    imagem: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"
  }
];

const PRODUTOS = [...CATALOGO, ...NOVIDADES];

/* ---------- ESTADO ---------- */
const state = {
  favoritos: JSON.parse(localStorage.getItem("lovynni:favoritos") || "[]"),
  sacola:    JSON.parse(localStorage.getItem("lovynni:sacola")    || "[]"),
  filtro:    "all",
  busca:     ""
};

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const salvar = () => {
  localStorage.setItem("lovynni:favoritos", JSON.stringify(state.favoritos));
  localStorage.setItem("lovynni:sacola",    JSON.stringify(state.sacola));
};

const formatarPreco = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- RENDER ---------- */
function criarCard(p) {
  const fav = state.favoritos.includes(p.id);
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'">
        <button class="fav-toggle ${fav ? "is-active" : ""}"
                data-fav="${p.id}" aria-label="Favoritar">
          ${fav ? "♥" : "♡"}
        </button>
      </div>
      <div class="product-info">
        <h3>${p.nome}</h3>
        <span class="price">${formatarPreco(p.preco)}</span>
      </div>
      <button class="add-to-cart" data-add="${p.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 8h16l1 13H3L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>
        </svg>
        ADICIONAR
      </button>
    </article>
  `;
}

function renderGrids() {
  const busca = state.busca.toLowerCase();
  const filtra = (lista) => lista.filter(p => {
    const okCat = state.filtro === "all" || p.categoria === state.filtro;
    const okBusca = !busca || p.nome.toLowerCase().includes(busca);
    return okCat && okBusca;
  });

  const cat = $("#catalogoGrid");
  if (cat) {
    const lista = filtra(CATALOGO);
    cat.innerHTML = lista.map(criarCard).join("");
    $("#emptyState").hidden = lista.length > 0;
  }

  const nov = $("#novidadesGrid");
  if (nov) nov.innerHTML = NOVIDADES.map(criarCard).join("");
}

function renderContadores() {
  $("#favoritesCount").textContent = state.favoritos.length;
  $("#cartCount").textContent = state.sacola.reduce((s, i) => s + i.qtd, 0);
}

/* ---------- AÇÕES ---------- */
function toggleFavorito(id) {
  id = Number(id);
  const i = state.favoritos.indexOf(id);
  if (i >= 0) state.favoritos.splice(i, 1);
  else state.favoritos.push(id);
  salvar(); renderGrids(); renderContadores();
  toast(i >= 0 ? "Removido dos favoritos" : "Adicionado aos favoritos");
}

function adicionarSacola(id) {
  id = Number(id);
  const item = state.sacola.find(i => i.id === id);
  if (item) item.qtd++;
  else state.sacola.push({ id, qtd: 1 });
  salvar(); renderContadores();
  toast("Adicionado à sacola");
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("is-visible"), 2200);
}

/* ---------- PAINEL LATERAL ---------- */
function abrirPainel(tipo) {
  const panel = $("#sidePanel");
  $("#panelTitle").textContent = tipo === "cart" ? "Sua sacola" : "Favoritos";
  const body = $("#panelBody");
  const foot = $("#panelFoot");

  if (tipo === "cart") {
    if (!state.sacola.length) {
      body.innerHTML = "<p>Sua sacola está vazia.</p>";
      foot.innerHTML = "";
    } else {
      body.innerHTML = state.sacola.map(i => {
        const p = PRODUTOS.find(x => x.id === i.id);
        if (!p) return "";
        return `<div class="panel-item">
          <span>${p.nome} × ${i.qtd}</span>
          <span>${formatarPreco(p.preco * i.qtd)}</span>
        </div>`;
      }).join("");
      const total = state.sacola.reduce((s, i) => {
        const p = PRODUTOS.find(x => x.id === i.id);
        return p ? s + p.preco * i.qtd : s;
      }, 0);
      foot.innerHTML = `<strong>Total: ${formatarPreco(total)}</strong>
        <button class="outline-button" style="width:100%;padding:1rem;border:1px solid var(--gold);color:var(--gold);letter-spacing:.25em;font-size:.7rem;">FINALIZAR (DEMO)</button>`;
    }
  } else {
    body.innerHTML = state.favoritos.length
      ? state.favoritos.map(id => {
          const p = PRODUTOS.find(x => x.id === id);
          if (!p) return "";
          return `<div class="panel-item"><span>${p.nome}</span>
                  <span>${formatarPreco(p.preco)}</span></div>`;
        }).join("")
      : "<p>Você ainda não favoritou nada.</p>";
    foot.innerHTML = "";
  }

  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  $("#backdrop").hidden = false;
}

function fecharPainel() {
  $("#sidePanel").classList.remove("is-open");
  $("#sidePanel").setAttribute("aria-hidden", "true");
  $("#backdrop").hidden = true;
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();

  /* Splash 2s */
  setTimeout(() => $("#splash").classList.add("is-hidden"), 2000);

  renderGrids();
  renderContadores();

  /* Delegação de eventos */
  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) return toggleFavorito(fav.dataset.fav);

    const add = e.target.closest("[data-add]");
    if (add) return adicionarSacola(add.dataset.add);
  });

  $("#favoritesBtn").addEventListener("click", () => abrirPainel("fav"));
  $("#cartBtn").addEventListener("click", () => abrirPainel("cart"));
  $("#panelClose").addEventListener("click", fecharPainel);
  $("#backdrop").addEventListener("click", fecharPainel);

  /* Busca expansível */
  const searchBar = $("#searchBar");
  $("#searchBtn").addEventListener("click", () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) $("#searchInput").focus();
  });
  $("#searchClose").addEventListener("click", () => {
    searchBar.hidden = true;
    state.busca = "";
    $("#searchInput").value = "";
    renderGrids();
  });
  $("#searchInput").addEventListener("input", (e) => {
    state.busca = e.target.value;
    renderGrids();
  });

  /* Filtros */
  $$(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.filtro = btn.dataset.filter;
      renderGrids();
    });
  });

  /* Navegação ativa */
  $$(".header-nav a").forEach(a => {
    a.addEventListener("click", () => {
      $$(".header-nav a").forEach(x => x.classList.remove("is-active"));
      a.classList.add("is-active");
    });
  });
});