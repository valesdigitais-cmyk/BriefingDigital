/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */
var FORM_ID = 'z93lk74gyum';
var forminit = new Forminit();

var THEME_KEY = 'pa-welcomes-theme';

var TEMPLATE_INFO = {
    'google': {
        '500':  { nome: 'Google 500€',   anuncios: 5,  categorias: 2, temEmail: false, maxImagens: 0,  temTipo: false, icon: 'G' },
        '1000': { nome: 'Google 1000€',  anuncios: 8,  categorias: 3, temEmail: false, maxImagens: 0,  temTipo: false, icon: 'G' },
        '1500': { nome: 'Google 1500€+', anuncios: 12, categorias: 4, temEmail: false, maxImagens: 0,  temTipo: true,  icon: 'G' }
    },
    'meta': {
        '500':  { nome: 'Meta 500€',   anuncios: 5,  categorias: 2, temEmail: true, maxImagens: 5,  temTipo: false, icon: 'M' },
        '1000': { nome: 'Meta 1000€',  anuncios: 8,  categorias: 3, temEmail: true, maxImagens: 8,  temTipo: false, icon: 'M' },
        '1500': { nome: 'Meta 1500€+', anuncios: 12, categorias: 4, temEmail: true, maxImagens: 12, temTipo: true,  icon: 'M' }
    }
};

var templateAtual = { plataforma: null, valor: null };

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function $(id) { return document.getElementById(id); }

/* ============================================================
   THEME TOGGLE
   ============================================================ */
(function initTheme() {
    var btn = $('themeToggleBtn');
    if (!btn) return;

    var iconEl = btn.querySelector('.theme-icon');
    var labelEl = btn.querySelector('.theme-label');

    function updateLabel() {
        var isDark = document.body.classList.contains('dark-mode');
        if (iconEl) iconEl.textContent = isDark ? '☀️' : '🌙';
        if (labelEl) labelEl.textContent = isDark ? 'Modo claro' : 'Modo noturno';
        btn.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo noturno');
    }

    if (localStorage.getItem(THEME_KEY) === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateLabel();

    btn.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        var current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem(THEME_KEY, current);
        updateLabel();
    });
})();

/* ============================================================
   SELECIONAR TEMPLATE
   ============================================================ */
function selecionarTemplate(plataforma, valor) {
    templateAtual.plataforma = plataforma;
    templateAtual.valor = valor;

    // Marcar card ativo
    var cards = document.querySelectorAll('.template-card');
    cards.forEach(function (card) {
        var match = card.dataset.platform === plataforma && card.dataset.budget === valor;
        card.classList.toggle('active', match);
    });

    var info = TEMPLATE_INFO[plataforma][valor];

    // Header do formulário
    $('formTitle').textContent = info.nome;
    $('formBadge').textContent = info.anuncios + ' anúncios · ' + info.categorias + ' categorias';
    $('formPlatformIcon').textContent = info.icon;

    // Hidden inputs
    $('selectedTemplate').value = info.nome;
    $('selectedPlatform').value = plataforma;
    $('selectedBudget').value = valor;
    $('selectedAds').value = info.anuncios;
    $('selectedCategories').value = info.categorias;

    // Campos dinâmicos
    $('campoTipo').style.display = info.temTipo ? 'block' : 'none';
    $('campo-email').style.display = info.temEmail ? 'block' : 'none';

    atualizarNotaLeads();

    // Aviso de imagens
    if (info.maxImagens > 0) {
        $('imageNotice').style.display = 'block';
        $('maxImagensTexto').textContent = info.maxImagens;
    } else {
        $('imageNotice').style.display = 'none';
    }

    // Categorias visíveis
    document.querySelectorAll('.categoria-group').forEach(function (group) {
        var catNum = parseInt(group.dataset.categoria, 10);
        group.style.display = catNum <= info.categorias ? 'block' : 'none';
    });

    // Categoria 1 sempre obrigatória; 2-4 opcionais
    var cat1 = document.querySelector('.categoria-group[data-categoria="1"] textarea');
    if (cat1) cat1.setAttribute('required', 'required');

    // Mostrar form e fazer scroll
    $('form-container').classList.add('show');
    $('form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

    limparCampos();
}

function voltarSelecao() {
    $('form-container').classList.remove('show');
    document.querySelectorAll('.template-card').forEach(function (c) {
        c.classList.remove('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   COPIAR DADOS
   ============================================================ */
function copiarDados() {
    var info = TEMPLATE_INFO[templateAtual.plataforma]?.[templateAtual.valor];
    if (!info) {
        alert('Selecione um template primeiro.');
        return;
    }

    var dados = {
        nif: $('nif').value.trim(),
        emailBeneficiario: $('emailBeneficiario').value.trim(),
        tipo: $('tipo').value,
        nome: $('nome').value.trim(),
        website: $('website').value.trim(),
        contacto: $('contacto').value.trim(),
        duracao: $('duracao').value.trim(),
        segmentacao: $('segmentacao').value.trim(),
        publico: $('publico').value.trim(),
        observacoes: $('observacoes').value.trim(),
        categorias: []
    };

    document.querySelectorAll('.categoria-group').forEach(function (group) {
        if (group.style.display === 'none') return;
        var ta = group.querySelector('textarea');
        if (ta && ta.value.trim()) dados.categorias.push(ta.value.trim());
    });

    // Validação mínima
    if (!dados.nif || !dados.emailBeneficiario || !dados.nome || !dados.website ||
        !dados.duracao || !dados.segmentacao || !dados.publico || dados.categorias.length === 0) {
        alert('Preencha todos os campos obrigatórios antes de copiar.');
        return;
    }

    var linha = '────────────────────────────────────────────';
    var texto = 'WELCOME ' + info.nome.toUpperCase() + '\n';
    texto += '════════════════════════════════════════════\n\n';

    texto += 'NIF                 : ' + dados.nif + '\n';
    texto += 'Email beneficiário  : ' + dados.emailBeneficiario + '\n';
    if (info.temTipo) texto += 'Tipo de campanha    : ' + dados.tipo + '\n';
    texto += 'Nome comercial      : ' + dados.nome + '\n';
    texto += 'Website/redes       : ' + dados.website + '\n';
    if (dados.contacto) texto += 'Contacto            : ' + dados.contacto + '\n';

    texto += linha + '\n';
    texto += 'Duração             : ' + dados.duracao + '\n';
    texto += 'Segmentação         : ' + dados.segmentacao + '\n';
    texto += 'Público-alvo        : ' + dados.publico + '\n';

    dados.categorias.forEach(function (cat, i) {
        var label = 'Categoria ' + (i + 1);
        var spaces = ' '.repeat(12 - label.length);
        texto += label + spaces + ': ' + cat + '\n';
    });

    texto += linha + '\n';
    texto += 'Anúncios            : ' + info.anuncios + '\n';
    texto += 'Categorias          : ' + info.categorias + '\n';

    if (dados.observacoes) {
        texto += linha + '\n';
        texto += 'OBSERVAÇÕES\n' + dados.observacoes + '\n';
    }

    texto += '\n════════════════════════════════════════════';
    texto += '\nCopiado via Welcomes · Páginas Amarelas';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto)
            .then(function () { mostrarFeedbackCopia(true); })
            .catch(function () { copiarFallback(texto); });
    } else {
        copiarFallback(texto);
    }
}

function copiarFallback(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        mostrarFeedbackCopia(true);
    } catch (e) {
        alert('Não foi possível copiar. Tente selecionar o texto manualmente.');
    }
    document.body.removeChild(ta);
}

function mostrarFeedbackCopia(sucesso) {
    var btn = $('copyDataBtn');
    var toast = $('copyToast');
    if (!btn || !toast) return;

    if (sucesso) {
        btn.textContent = '✓ Copiado!';
        toast.textContent = 'Copiado!';
        toast.classList.add('show');
        setTimeout(function () {
            btn.textContent = '📋 Copiar dados';
            toast.classList.remove('show');
        }, 2500);
    } else {
        toast.textContent = 'Erro ao copiar';
        toast.style.color = 'var(--accent-error)';
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
            toast.style.color = '';
        }, 2500);
    }
}

/* ============================================================
   VALIDAR E SUBMETER
   ============================================================ */
async function validarESubmeter(event) {
    if (event) event.preventDefault();

    var plataforma = templateAtual.plataforma;
    var valor = templateAtual.valor;

    if (!plataforma || !valor) {
        alert('Selecione um template primeiro.');
        return;
    }

    var info = TEMPLATE_INFO[plataforma][valor];
    var isValid = true;

    var campos = ['nif', 'emailBeneficiario', 'nome', 'website', 'duracao', 'segmentacao', 'publico'];
    if (info.temTipo) campos.push('tipo');
    if (info.temEmail) campos.push('email');
    campos.push('categoria1');

    campos.forEach(function (campo) {
        var input = $(campo);
        var errMsg = $('err-' + campo);
        if (!input || !errMsg) return;

        if (!input.value.trim()) {
            input.classList.add('error');
            errMsg.classList.add('show');
            isValid = false;
        } else {
            input.classList.remove('error');
            errMsg.classList.remove('show');
        }
    });

    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        var firstError = document.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    $('emailSubject').value = 'Welcome ' + info.nome + ' - NIF: ' + $('nif').value.trim();

    var btn = $('sendBtn');
    btn.textContent = 'A enviar...';
    btn.disabled = true;

    var toast = $('toastMsg');
    toast.textContent = 'A enviar...';
    toast.classList.remove('error');
    toast.classList.add('show');

    var form = $('mainForm');
    try {
        var result = await forminit.submit(FORM_ID, new FormData(form));
        if (result.error) throw result.error;

        toast.textContent = 'Enviado com sucesso!';
        toast.classList.remove('error');
        toast.classList.add('show');
        limparCampos(true);
    } catch (error) {
        toast.textContent = (error && error.message) ? error.message : 'Não foi possível enviar. Tente novamente.';
        toast.classList.add('error', 'show');
    } finally {
        btn.textContent = 'Enviar por e-mail';
        btn.disabled = false;
    }
}

function limparCampos(preservarToast) {
    document.querySelectorAll('#mainForm input:not([type="hidden"]), #mainForm select, #mainForm textarea').forEach(function (input) {
        input.value = '';
        input.classList.remove('error');
    });
    document.querySelectorAll('.error-msg').forEach(function (err) {
        err.classList.remove('show');
    });
    atualizarNotaLeads();

    if (!preservarToast) {
        var toast = $('toastMsg');
        if (toast) toast.classList.remove('show', 'error');
    }

    var btn = $('sendBtn');
    if (btn) {
        btn.textContent = 'Enviar por e-mail';
        btn.disabled = false;
    }
}

function atualizarNotaLeads() {
    var tipo = $('tipo');
    var nota = $('notaLeads');
    if (tipo && nota) {
        nota.style.display = tipo.value === 'Geração de Leads' ? 'block' : 'none';
    }
}

/* ============================================================
   NORMALIZAÇÃO AUTOMÁTICA DE WEBSITE
   ============================================================ */
function normalizarWebsite() {
    var input = $('website');
    if (!input) return;
    var val = input.value.trim();
    if (val && !/^https?:\/\//i.test(val)) {
        if (val.includes('.') && !val.includes(' ')) {
            input.value = 'https://' + val;
        }
    }
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    var tipo = $('tipo');
    if (tipo) tipo.addEventListener('change', atualizarNotaLeads);

    var form = $('mainForm');
    if (form) form.addEventListener('submit', validarESubmeter);

    var website = $('website');
    if (website) website.addEventListener('blur', normalizarWebsite);
});
