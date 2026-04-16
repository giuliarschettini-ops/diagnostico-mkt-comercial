// ===== Sovereign Consultant — App Logic =====

const TOTAL_STEPS = 6; // 0=welcome, 1-4=blocos, 5=result
let currentStep = 0;
let diagnosisData = {};

// ===== Navigation =====
function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`[data-step="${n}"]`);
  if (target) { target.classList.add('active'); }
  currentStep = n;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const pct = currentStep === 0 ? 0 : Math.round((currentStep / 4) * 100);
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-pct');
  const wrap = document.getElementById('progress-wrap');
  if (fill) fill.style.width = Math.min(pct, 100) + '%';
  if (label) label.textContent = Math.min(pct, 100) + '%';
  if (wrap) wrap.style.display = (currentStep === 0 || currentStep === 5) ? 'none' : 'block';
}

function nextStep() {
  collectCurrentStep();
  saveToStorage();
  if (currentStep === 4) {
    submitDiagnosis();
  } else {
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 0) showStep(currentStep - 1);
}

// ===== Data Collection =====
function val(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.type === 'checkbox') return el.checked;
  return el.value || '';
}

function radioVal(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function checkboxVals(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(c => c.value);
}

function scaleVal(id) {
  const wrap = document.getElementById(id);
  if (!wrap) return '';
  const sel = wrap.querySelector('.scale-btn.selected');
  return sel ? sel.dataset.value : '';
}

function collectCurrentStep() {
  switch (currentStep) {
    case 0:
      diagnosisData.empresa = val('empresa');
      diagnosisData.responsavel = val('responsavel');
      diagnosisData.telefone = val('telefone');
      diagnosisData.email = val('email');
      diagnosisData.segmento = val('segmento');
      break;
    case 1:
      diagnosisData.num_vendedores = val('num-vendedores');
      diagnosisData.estrutura_time = val('estrutura-time');
      diagnosisData.ferramenta_crm = val('ferramenta-crm');
      diagnosisData.crm_preenchimento = scaleVal('crm-scale');
      diagnosisData.taxa_conversao = val('taxa-conversao');
      diagnosisData.sem_taxa = val('sem-taxa');
      diagnosisData.problema_funil = val('problema-funil');
      break;
    case 2:
      diagnosisData.canais = checkboxVals('canais');
      diagnosisData.canal_outro_texto = val('canal-outro-texto');
      diagnosisData.trafego_pago = radioVal('trafego_pago');
      diagnosisData.investimento_mensal = val('investimento-mensal');
      diagnosisData.origem_leads = val('origem-leads');
      diagnosisData.conhece_cac = val('conhece-cac');
      diagnosisData.cac_valor = val('cac-valor');
      diagnosisData.conhece_cpl = val('conhece-cpl');
      diagnosisData.cpl_valor = val('cpl-valor');
      diagnosisData.comunicacao_instagram = val('comunicacao-instagram');
      break;
    case 3:
      diagnosisData.metas_mensais = radioVal('metas');
      diagnosisData.metas_descricao = val('metas-descricao');
      diagnosisData.acompanha_semanal = val('acompanha-semanal');
      diagnosisData.conhece_mrr = radioVal('mrr');
      diagnosisData.mrr_valor = val('mrr-valor');
      diagnosisData.conhece_churn = radioVal('churn');
      diagnosisData.churn_valor = val('churn-valor');
      diagnosisData.ticket_medio = val('ticket-medio');
      diagnosisData.arr_ultimo_ano = val('arr-ultimo-ano');
      diagnosisData.arr_meta = val('arr-meta');
      diagnosisData.base_decisao = radioVal('decisao');
      break;
    case 4:
      diagnosisData.acompanha_perda = radioVal('acompanha_perda');
      diagnosisData.decisao_campanhas = radioVal('decisao_campanhas');
      diagnosisData.reativacao_inativos = radioVal('reativacao_inativos');
      diagnosisData.mapeia_origens = radioVal('mapeia_origens');
      diagnosisData.sabe_conversao_origem = radioVal('sabe_conversao_origem');
      diagnosisData.mkt_alinhado = radioVal('mkt_alinhado');
      diagnosisData.pos_venda = radioVal('pos_venda');
      break;
  }
}

// ===== Persistence =====
function saveToStorage() {
  try { localStorage.setItem('sovereign_diagnosis', JSON.stringify(diagnosisData)); } catch(e) {}
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('sovereign_diagnosis');
    if (saved) diagnosisData = JSON.parse(saved);
  } catch(e) {}
}

// ===== Scale buttons =====
function initScaleButtons() {
  document.querySelectorAll('.scale-row').forEach(row => {
    row.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });
}



// ===== Claude API Integration =====
async function submitDiagnosis() {
  const overlay = document.getElementById('processing-overlay');
  overlay.classList.add('active');
  updateStatusCards(0);

  const prompt = buildPrompt();

  try {
    // Status: collecting
    updateStatusCards(1);
    await sleep(800);

    // Status: benchmarking
    updateStatusCards(2);

    const response = await fetch('/api/diagnose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro ao processar diagnóstico no servidor');
    }

    const data = await response.json();
    const text = data.text;

    // Status: report done
    updateStatusCards(3);
    await sleep(600);

    const parsed = parseResult(text);
    renderResult(parsed);
    hideOverlay();
    showStep(5);

  } catch (err) {
    hideOverlay();
    alert('Erro ao gerar diagnóstico: ' + err.message);
    console.error(err);
  }
}

function buildPrompt() {
  const d = diagnosisData;
  const canaisStr = (d.canais || []).join(', ') + (d.canal_outro_texto ? ` (Outro: ${d.canal_outro_texto})` : '');
  return `Você é um consultor sênior de operações comerciais e marketing, especialista no segmento de ${d.segmento || 'serviços'}. Analise as respostas abaixo de um diagnóstico comercial e gere um relatório estratégico.

DADOS DA EMPRESA:
- Empresa: ${d.empresa || 'Não informada'}
- Responsável: ${d.responsavel || 'Não informado'}
- Segmento: ${d.segmento || 'Não informado'}

BLOCO 1 — OPERAÇÃO COMERCIAL:
- Nº de vendedores: ${d.num_vendedores || 'Não informado'}
- Estrutura do time: ${d.estrutura_time || 'Não informado'}
- CRM utilizado: ${d.ferramenta_crm || 'Não informado'}
- Preenchimento CRM (1-5): ${d.crm_preenchimento || 'Não informado'}
- Taxa de conversão: ${d.taxa_conversao || 'Não informada'}${d.sem_taxa ? ' (não mapeada)' : '%'}
- Maior problema do funil: ${d.problema_funil || 'Não informado'}

BLOCO 2 — MARKETING E GERAÇÃO DE LEADS:
- Canais de aquisição ativos: ${canaisStr || 'Nenhum selecionado'}
- Investe em tráfego pago: ${d.trafego_pago || 'Não informado'}
- Investimento mensal em tráfego: R$ ${d.investimento_mensal || 'Não informado'}
- Origem principal dos leads: ${d.origem_leads || 'Não informada'}
- Conhece o CAC: ${d.conhece_cac || 'Não informado'}${d.cac_valor ? ` (R$ ${d.cac_valor})` : ''}
- Conhece o CPL: ${d.conhece_cpl || 'Não informado'}${d.cpl_valor ? ` (R$ ${d.cpl_valor})` : ''}
- Comunicação Instagram: ${d.comunicacao_instagram || 'Não informado'}

BLOCO 3 — GESTÃO E DADOS:
- Metas mensais definidas: ${d.metas_mensais || 'Não informado'}${d.metas_descricao ? ` — Estrutura: ${d.metas_descricao}` : ''}
- Acompanha resultados semanalmente: ${d.acompanha_semanal || 'Não informado'}
- Conhece MRR: ${d.conhece_mrr || 'Não informado'}${d.mrr_valor ? ` (R$ ${d.mrr_valor})` : ''}
- Conhece churn médio mensal: ${d.conhece_churn || 'Não informado'}${d.churn_valor ? ` (${d.churn_valor})` : ''}
- Ticket médio: R$ ${d.ticket_medio || 'Não informado'}
- ARR do último ano: R$ ${d.arr_ultimo_ano || 'Não informado'}
- Meta de ARR do ano atual: R$ ${d.arr_meta || 'Não informado'}
- Base de decisão: ${d.base_decisao || 'Não informado'}

BLOCO 4 — ANÁLISE DE OPERAÇÃO E ACOMPANHAMENTO:
- Acompanha motivos de perda: ${d.acompanha_perda || 'Não informado'}
- Decisão de campanhas é baseada em dados de perda: ${d.decisao_campanhas || 'Não informado'}
- Realiza campanhas de reativação de inativos: ${d.reativacao_inativos || 'Não informado'}
- Mapeia origens dos leads: ${d.mapeia_origens || 'Não informado'}
- Sabe quais origens têm maior conversão: ${d.sabe_conversao_origem || 'Não informado'}
- Investimento em MKT alinhado aos dados da operação: ${d.mkt_alinhado || 'Não informado'}
- Processo de pós-venda/retenção: ${d.pos_venda || 'Não informado'}

RESPONDA OBRIGATORIAMENTE no seguinte formato JSON (sem markdown, sem backticks, APENAS o JSON puro):
{
  "score": <número de 0 a 100>,
  "score_label": "<Crítico|Iniciante|Em Desenvolvimento|Bom|Excelente>",
  "resumo_executivo": "<2-3 parágrafos de análise geral>",
  "gargalos": [
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"}
  ],
  "quick_wins": [
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"}
  ],
  "prioridades": [
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"},
    {"titulo": "<título>", "descricao": "<descrição detalhada>"}
  ]
}`;
}

function parseResult(text) {
  try {
    // Try to extract JSON from the response
    let json = text.trim();
    // Remove markdown code blocks if present
    json = json.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(json);
  } catch (e) {
    console.error('Parse error:', e, 'Raw text:', text);
    return {
      score: 0,
      score_label: 'Erro',
      resumo_executivo: 'Não foi possível processar o diagnóstico. Resposta da IA: ' + text.substring(0, 500),
      gargalos: [],
      quick_wins: [],
      prioridades: []
    };
  }
}

function renderResult(r) {
  const empresa = diagnosisData.empresa || 'Sua Empresa';

  // Score ring
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (r.score / 100) * circumference;
  document.getElementById('result-score-num').textContent = r.score;
  document.getElementById('result-score-label').textContent = r.score_label;
  document.getElementById('result-ring-fill').setAttribute('stroke-dasharray', circumference);
  document.getElementById('result-ring-fill').setAttribute('stroke-dashoffset', offset);

  // Header
  document.getElementById('result-empresa').textContent = empresa;

  // Executive summary
  document.getElementById('result-resumo').innerHTML = r.resumo_executivo.split('\n').filter(p=>p.trim()).map(p => `<p style="margin-bottom:1rem">${p}</p>`).join('');

  // Bottlenecks
  const gHTML = (r.gargalos || []).map(g => `
    <div class="result-item">
      <span style="color:var(--error);font-weight:800;font-size:1.25rem;line-height:1">!</span>
      <div><h4>${g.titulo}</h4><p>${g.descricao}</p></div>
    </div>
  `).join('');
  document.getElementById('result-gargalos').innerHTML = gHTML;

  // Quick wins
  const qHTML = (r.quick_wins || []).map(q => `
    <div class="result-item">
      <span class="material-symbols-outlined" style="color:var(--on-tertiary-container);font-size:1.25rem">check_circle</span>
      <div><h4>${q.titulo}</h4><p>${q.descricao}</p></div>
    </div>
  `).join('');
  document.getElementById('result-quickwins').innerHTML = qHTML;

  // Priorities
  const pHTML = (r.prioridades || []).map((p, i) => `
    <div class="priority-item">
      <span class="priority-num">0${i+1}</span>
      <div><h4>${p.titulo}</h4><p>${p.descricao}</p></div>
    </div>
  `).join('');
  document.getElementById('result-prioridades').innerHTML = pHTML;
}

// ===== Helpers =====
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function hideOverlay() {
  document.getElementById('processing-overlay').classList.remove('active');
}

function updateStatusCards(phase) {
  const cards = document.querySelectorAll('.status-card');
  cards.forEach((c, i) => {
    c.classList.remove('done', 'active', 'pending');
    if (i < phase) c.classList.add('done');
    else if (i === phase) c.classList.add('active');
    else c.classList.add('pending');
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  showStep(0);
  initScaleButtons();
});
