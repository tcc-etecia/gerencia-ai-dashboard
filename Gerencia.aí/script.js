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

    // Login sem validação (entra direto no dashboard)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // cria usuário genérico só para sessão
    const usuarioFake = { nome: "Usuário Teste", email: "teste@teste.com" };
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioFake));
    window.location.href = "dashboard.html";
  });
}

  