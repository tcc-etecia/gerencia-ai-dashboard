// Proteger acesso ao dashboard
if (window.location.pathname.includes("dashboard.html")) {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
      // se não tiver login, volta para tela inicial
      window.location.href = "index.html";
    } else {
      const user = JSON.parse(usuarioLogado);
      document.querySelector("h1").innerText = `📊 Dashboard - Bem-vindo, ${user.nome}`;
    }
  }
  

// ----------------------------
// FUNÇÕES AUXILIARES
// ----------------------------
function getData(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  }
  function salvarData(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
  }
  
  // ----------------------------
  // TROCA DE SEÇÕES
  // ----------------------------
  function mostrarSecao(id) {
    document.querySelectorAll(".secao").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    if (id === "produtos") atualizarTabelaProdutos();
    if (id === "estoque") atualizarEstoque();
    if (id === "financeiro") atualizarFinanceiro();
    if (id === "relatorios") gerarRelatorios();
  }
  
  // ----------------------------
  // PRODUTOS
  // ----------------------------
  const produtoForm = document.getElementById("produtoForm");
  if (produtoForm) {
    produtoForm.addEventListener("submit", e => {
      e.preventDefault();
      const nome = document.getElementById("produtoNome").value;
      const preco = parseFloat(document.getElementById("produtoPreco").value);
      const qtd = parseInt(document.getElementById("produtoQtd").value);
  
      const produtos = getData("produtos");
      produtos.push({ nome, preco, qtd, vendidos: 0 });
      salvarData("produtos", produtos);
  
      produtoForm.reset();
      atualizarTabelaProdutos();
    });
  }
  
  function atualizarTabelaProdutos() {
    const tabela = document.getElementById("tabelaProdutos");
    const produtos = getData("produtos");
    tabela.innerHTML = `
      <tr><th>Produto</th><th>Preço</th><th>Qtd</th><th>Ações</th></tr>
    `;
    produtos.forEach((p, i) => {
      tabela.innerHTML += `
        <tr>
          <td>${p.nome}</td>
          <td>R$ ${p.preco.toFixed(2)}</td>
          <td>${p.qtd}</td>
          <td>
            <button onclick="venderProduto(${i})">Vender</button>
            <button onclick="removerProduto(${i})">Excluir</button>
          </td>
        </tr>
      `;
    });
  }
  
  function venderProduto(i) {
    const produtos = getData("produtos");
    if (produtos[i].qtd > 0) {
      produtos[i].qtd--;
      produtos[i].vendidos++;
      salvarData("produtos", produtos);
      atualizarTabelaProdutos();
    } else {
      alert("❌ Estoque zerado!");
    }
  }
  
  function removerProduto(i) {
    const produtos = getData("produtos");
    produtos.splice(i, 1);
    salvarData("produtos", produtos);
    atualizarTabelaProdutos();
  }
  
  // ----------------------------
  // ESTOQUE
  // ----------------------------
  function atualizarEstoque() {
    const produtos = getData("produtos");
    let totalEstoque = 0, totalValor = 0, totalVendidos = 0;
  
    produtos.forEach(p => {
      totalEstoque += p.qtd;
      totalValor += p.qtd * p.preco;
      totalVendidos += p.vendidos * p.preco;
    });
  
    const perdas = totalEstoque === 0 ? "Nenhuma" : "Possível perda com vencimento";
    document.getElementById("estoqueInfo").innerHTML = `
      🔹 Produtos em estoque: ${totalEstoque}<br>
      🔹 Valor em estoque: R$ ${totalValor.toFixed(2)}<br>
      🔹 Lucro acumulado com vendas: R$ ${totalVendidos.toFixed(2)}<br>
      🔹 Perdas: ${perdas}
    `;
  }
  
  // ----------------------------
  // FINANCEIRO
  // ----------------------------
  const financeiroForm = document.getElementById("financeiroForm");
  if (financeiroForm) {
    financeiroForm.addEventListener("submit", e => {
      e.preventDefault();
      const desc = document.getElementById("financeiroDesc").value;
      const valor = parseFloat(document.getElementById("financeiroValor").value);
      const tipo = document.getElementById("financeiroTipo").value;
  
      const movs = getData("financeiro");
      movs.push({ desc, valor, tipo, data: new Date().toLocaleDateString() });
      salvarData("financeiro", movs);
  
      financeiroForm.reset();
      atualizarFinanceiro();
    });
  }
  
  function atualizarFinanceiro() {
    const lista = document.getElementById("listaFinanceiro");
    const movs = getData("financeiro");
    lista.innerHTML = "";
    movs.forEach(m => {
      lista.innerHTML += `<li>${m.data} - ${m.tipo === "pagar" ? "🔴" : "🟢"} ${m.desc} - R$ ${m.valor.toFixed(2)}</li>`;
    });
  }
  
  // ----------------------------
  // RELATÓRIOS
  // ----------------------------
  function gerarRelatorios() {
    const produtos = getData("produtos");
  
    // Vendas semanais simuladas
    const vendas = [0, 0, 0, 0, 0, 0, 0]; // dom-sab
    produtos.forEach(p => {
      for (let i = 0; i < p.vendidos; i++) {
        const dia = Math.floor(Math.random() * 7);
        vendas[dia] += p.preco;
      }
    });
  
    const ctx = document.getElementById("graficoVendas").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        datasets: [{
          label: "Vendas (R$)",
          data: vendas,
          backgroundColor: "rgba(0,123,255,0.7)"
        }]
      }
    });
  
    // Estoque médio
    let qtdTotal = 0, qtdVendida = 0;
    produtos.forEach(p => {
      qtdTotal += p.qtd;
      qtdVendida += p.vendidos;
    });
    const estoqueMedio = qtdVendida > 0 ? (qtdTotal / qtdVendida).toFixed(2) : qtdTotal;
    document.getElementById("estoqueMedio").innerText = `📦 Estoque médio: ${estoqueMedio}`;
  }

   // --- LOGIN (novo, com validação) ---
  const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;

    const usuarios = getData("usuarios");
    const msgEl = document.getElementById("loginMensagem");

    // gera o hash da senha digitada
    const senhaHash = await hashPassword(senha);

    // procura usuário cadastrado
    const user = usuarios.find(u => u.email === email && u.senhaHash === senhaHash);

    if (user) {
      localStorage.setItem("usuarioLogado", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      msgEl.textContent = "❌ Email ou senha inválidos.";
    }
  });
}


  // hashing simples (SHA-256) antes de salvar
async function hashPassword(pw) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('cadastroNome').value.trim();
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    const confirmar = document.getElementById('cadastroConfirmar').value;
    const msgEl = document.getElementById('cadastroMensagem');

    if (senha !== confirmar) {
      msgEl.textContent = '❌ Senhas não conferem.';
      return;
    }

    const usuarios = getData('usuarios'); // usa mesma utilidade do seu script
    if (usuarios.some(u => u.email === email)) {
      msgEl.textContent = '❌ Email já cadastrado.';
      return;
    }

    const senhaHash = await hashPassword(senha);
    const cpfCnpj = document.getElementById('cadastroCpfCnpj').value.trim();
    const telefone = document.getElementById('cadastroTelefone').value.trim();
    usuarios.push({ nome, email, cpfCnpj, telefone, senhaHash });
    salvarData('usuarios', usuarios);
    msgEl.textContent = '✅ Cadastro realizado! Faça login.';
    cadastroForm.reset();
  });
}

function filtrarProdutos() {
  const filtro = document.getElementById("filtroProduto").value.toLowerCase();
  const linhas = document.querySelectorAll("#tabelaProdutos tr");

  linhas.forEach((linha, i) => {
    if (i === 0) return; // pula cabeçalho
    const nome = linha.cells[0].textContent.toLowerCase();
    linha.style.display = nome.includes(filtro) ? "" : "none";
  });
}

function exportarCSV() {
  const produtos = getData("produtos");
  if (produtos.length === 0) {
    alert("Nenhum produto cadastrado.");
    return;
  }

  let csv = "Produto,Preço,Quantidade,Vendidos\n";
  produtos.forEach(p => {
    csv += `${p.nome},${p.preco},${p.qtd},${p.vendidos}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "relatorio_produtos.csv";
  link.click();
}
 
// Função para mostrar/ocultar senha
function toggleSenha(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈"; // olho fechado
  } else {
    input.type = "password";
    btn.textContent = "👁️"; // olho aberto
  }
}

// MENU HAMBURGUER
function toggleMenu() {
  const menuLinks = document.querySelector('.menu-links');
  menuLinks.classList.toggle('ativo');
}

// ----------------------------
// MENU HAMBURGUER (mobile)
// ----------------------------
if (document.querySelector('.menu')) {
  function toggleMenu() {
    const menuLinks = document.querySelector('.menu-links');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (!menuLinks) return;
    menuLinks.classList.toggle('ativo');
    const expanded = menuLinks.classList.contains('ativo');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', expanded);
  }

  // Fecha o menu ao clicar em qualquer link (em mobile)
  document.querySelectorAll('.menu-links button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const menuLinks = document.querySelector('.menu-links');
        if (menuLinks) menuLinks.classList.remove('ativo');
        const toggleBtn = document.querySelector('.menu-toggle');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Fecha o menu ao clicar fora (em mobile)
  document.addEventListener('click', (e) => {
    const menu = document.querySelector('.menu');
    const menuLinks = document.querySelector('.menu-links');
    if (!menu || !menuLinks) return;
    if (window.innerWidth > 768) return;
    if (!menu.contains(e.target)) {
      menuLinks.classList.remove('ativo');
      const toggleBtn = document.querySelector('.menu-toggle');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ======================
// MENU HAMBURGUER
// ======================
function toggleMenu() {
  const menuLinks = document.querySelector('.menu-links');
  if (!menuLinks) {
    console.error('Elemento .menu-links não encontrado!');
    return;
  }
  menuLinks.classList.toggle('ativo');
}
