// ===================================================================
// CLINICARE - GESTÃO DE PACIENTES
// Versão: 5.3.0 (09/03/2026) - CORRIGIDO
// Autor: Sistema CliniCare
// Descrição: Gestão completa de pacientes com Supabase + LGPD
// ===================================================================

console.log('✅ Módulo pacientes-supabase.js carregado');

// Verificar autenticação (com fallback)
if (typeof checkAuth === 'function') {
    checkAuth();
} else if (!localStorage.getItem('clinicare_user')) {
    console.warn('⚠️ Usuário não autenticado, redirecionando...');
    window.location.href = 'index.html';
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Inicializando módulo de pacientes...');
    carregarPacientes();
    
    // Eventos
    const btnNovo = document.getElementById('btnNovoPaciente');
    if (btnNovo) {
        btnNovo.addEventListener('click', abrirModalPaciente);
        console.log('✅ Botão "Novo Paciente" conectado');
    } else {
        console.error('❌ Botão btnNovoPaciente não encontrado');
    }
    
    const formPaciente = document.getElementById('formPaciente');
    if (formPaciente) {
        formPaciente.addEventListener('submit', salvarPaciente);
        console.log('✅ Formulário de paciente conectado');
    }
    
    const searchInput = document.getElementById('searchPaciente');
    if (searchInput) {
        searchInput.addEventListener('input', pesquisarPacientes);
        console.log('✅ Campo de busca conectado');
    }
});

// ===================================================================
// CARREGAR PACIENTES DO SUPABASE
// ===================================================================
async function carregarPacientes() {
    try {
        console.log('🔄 Carregando pacientes do Supabase...');
        
        // Verificar se SUPABASE_URL e SUPABASE_ANON_KEY estão disponíveis
        if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
            console.error('❌ Variáveis Supabase não encontradas');
            throw new Error('Configuração Supabase não disponível');
        }
        
        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/patients?select=*&order=created_at.desc`, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar pacientes: ${response.status}`);
        }

        const pacientes = await response.json();
        console.log(`✅ ${pacientes.length} pacientes carregados`);
        
        renderizarTabelaPacientes(pacientes);
        atualizarContador(pacientes.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar pacientes:', error);
        
        // Fallback para localStorage
        const pacientesLocal = JSON.parse(localStorage.getItem('clinicare_pacientes') || '[]');
        renderizarTabelaPacientes(pacientesLocal);
        atualizarContador(pacientesLocal.length);
    }
}

// ===================================================================
// RENDERIZAR TABELA DE PACIENTES
// ===================================================================
function renderizarTabelaPacientes(pacientes) {
    const tbody = document.querySelector('#tabelaPacientes tbody');
    
    if (!tbody) {
        console.error('❌ Elemento tbody não encontrado');
        return;
    }
    
    if (pacientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 60px 20px;">
                    <div class="empty-state">
                        <i class="fas fa-users" style="font-size: 64px; color: var(--gray-300); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--dark); margin-bottom: 10px;">Nenhum paciente cadastrado</h3>
                        <p style="color: var(--gray-600); font-size: 14px;">Clique em "Novo Paciente" para adicionar o primeiro</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pacientes.map(p => `
        <tr>
            <td><strong>${p.nome || p.name || '-'}</strong></td>
            <td>${p.cpf || '-'}</td>
            <td>${p.telefone || p.phone || '-'}</td>
            <td>${p.email || '-'}</td>
            <td>${formatarData(p.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editarPaciente('${p.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirPaciente('${p.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// ===================================================================
// ATUALIZAR CONTADOR
// ===================================================================
function atualizarContador(total) {
    const contador = document.getElementById('totalPacientes');
    if (contador) {
        contador.textContent = `${total} paciente${total !== 1 ? 's' : ''}`;
    }
}

// ===================================================================
// ABRIR MODAL DE CADASTRO/EDIÇÃO
// ===================================================================
function abrirModalPaciente(pacienteId = null) {
    console.log('🔓 Abrindo modal de paciente...');
    
    const modal = document.getElementById('modalPaciente');
    const form = document.getElementById('formPaciente');
    const titulo = document.getElementById('modalTitulo');
    
    if (!modal) {
        console.error('❌ Modal não encontrado');
        alert('❌ Erro: Modal não encontrado no HTML');
        return;
    }
    
    if (!form) {
        console.error('❌ Formulário não encontrado');
        return;
    }
    
    // Resetar formulário
    form.reset();
    
    // Desmarcar checkbox LGPD
    const checkboxLGPD = document.getElementById('consentimentoLGPD');
    if (checkboxLGPD) {
        checkboxLGPD.checked = false;
    }
    
    if (pacienteId) {
        titulo.textContent = 'Editar Paciente';
        carregarDadosPaciente(pacienteId);
    } else {
        titulo.textContent = '✨ Novo Paciente';
    }
    
    modal.classList.add('active');
    console.log('✅ Modal aberto com sucesso');
}

// ===================================================================
// SALVAR PACIENTE (CREATE/UPDATE)
// ===================================================================
async function salvarPaciente(event) {
    event.preventDefault();
    
    console.log('💾 Salvando paciente...');
    
    const form = event.target;
    const btnSalvar = form.querySelector('button[type="submit"]');
    const btnTextoOriginal = btnSalvar.innerHTML;
    
    // Validar campos obrigatórios
    const nome = document.getElementById('pacNome')?.value.trim();
    const telefone = document.getElementById('pacTelefone')?.value.trim();
    const consentimentoLGPD = document.getElementById('consentimentoLGPD')?.checked;
    
    if (!nome || !telefone) {
        alert('❌ Preencha os campos obrigatórios: Nome e Telefone');
        return;
    }
    
    if (!consentimentoLGPD) {
        alert('❌ Você precisa aceitar a Política de Privacidade (LGPD) para continuar');
        return;
    }
    
    // Mostrar loading
    btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btnSalvar.disabled = true;
    
    try {
        const pacienteData = {
            nome: nome,
            cpf: document.getElementById('pacCpf')?.value.trim() || null,
            data_nascimento: document.getElementById('pacNascimento')?.value || null,
            telefone: telefone,
            email: document.getElementById('pacEmail')?.value.trim() || null,
            cep: document.getElementById('pacCep')?.value.trim() || null,
            endereco: document.getElementById('pacEndereco')?.value.trim() || null,
            cidade: document.getElementById('pacCidade')?.value.trim() || null,
            consentimento_lgpd: true,
            data_consentimento: new Date().toISOString(),
            finalidade_dados: 'Cadastro e acompanhamento clínico'
        };
        
        console.log('📤 Enviando para Supabase:', pacienteData);
        
        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/patients`, {
            method: 'POST',
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(pacienteData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ${response.status}`);
        }
        
        const novoPaciente = await response.json();
        console.log('✅ Paciente salvo com sucesso:', novoPaciente);
        
        // Salvar também no localStorage (backup)
        const pacientesLocal = JSON.parse(localStorage.getItem('clinicare_pacientes') || '[]');
        pacientesLocal.push(novoPaciente[0] || novoPaciente);
        localStorage.setItem('clinicare_pacientes', JSON.stringify(pacientesLocal));
        
        // Fechar modal e recarregar lista
        fecharModal();
        carregarPacientes();
        
        alert('✅ Paciente cadastrado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar paciente:', error);
        alert(`❌ Erro ao salvar paciente: ${error.message}\n\nTente novamente ou contate o suporte.`);
    } finally {
        btnSalvar.innerHTML = btnTextoOriginal;
        btnSalvar.disabled = false;
    }
}

// ===================================================================
// EDITAR PACIENTE
// ===================================================================
async function editarPaciente(pacienteId) {
    try {
        console.log('✏️ Carregando paciente para edição:', pacienteId);
        
        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/patients?id=eq.${pacienteId}&select=*`, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar paciente');
        }
        
        const pacientes = await response.json();
        const paciente = pacientes[0];
        
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }
        
        // Preencher formulário
        document.getElementById('pacNome').value = paciente.nome || '';
        document.getElementById('pacCpf').value = paciente.cpf || '';
        document.getElementById('pacNascimento').value = paciente.data_nascimento || '';
        document.getElementById('pacTelefone').value = paciente.telefone || '';
        document.getElementById('pacEmail').value = paciente.email || '';
        document.getElementById('pacCep').value = paciente.cep || '';
        document.getElementById('pacEndereco').value = paciente.endereco || '';
        document.getElementById('pacCidade').value = paciente.cidade || '';
        document.getElementById('consentimentoLGPD').checked = true;
        
        // Abrir modal
        abrirModalPaciente(pacienteId);
        
    } catch (error) {
        console.error('❌ Erro ao editar paciente:', error);
        alert('❌ Erro ao carregar dados do paciente');
    }
}

// ===================================================================
// EXCLUIR PACIENTE
// ===================================================================
async function excluirPaciente(pacienteId) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este paciente?\n\nEsta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        console.log('🗑️ Excluindo paciente:', pacienteId);
        
        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/patients?id=eq.${pacienteId}`, {
            method: 'DELETE',
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir paciente');
        }
        
        console.log('✅ Paciente excluído com sucesso');
        carregarPacientes();
        alert('✅ Paciente excluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao excluir paciente:', error);
        alert('❌ Erro ao excluir paciente');
    }
}

// ===================================================================
// FECHAR MODAL
// ===================================================================
function fecharModal() {
    const modal = document.getElementById('modalPaciente');
    if (modal) {
        modal.classList.remove('active');
        console.log('🔒 Modal fechado');
    }
}

// ===================================================================
// PESQUISAR PACIENTES
// ===================================================================
function pesquisarPacientes(event) {
    const termo = event.target.value.toLowerCase().trim();
    const linhas = document.querySelectorAll('#tabelaPacientes tbody tr');
    
    let resultados = 0;
    
    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        const match = texto.includes(termo);
        linha.style.display = match ? '' : 'none';
        if (match) resultados++;
    });
    
    console.log(`🔍 Busca: "${termo}" - ${resultados} resultado(s)`);
}

// ===================================================================
// FORMATAR DATA
// ===================================================================
function formatarData(dataISO) {
    if (!dataISO) return '-';
    
    try {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR');
    } catch (error) {
        return '-';
    }
}

// ===================================================================
// EXPORTAR FUNÇÕES GLOBAIS
// ===================================================================
window.abrirModalPaciente = abrirModalPaciente;
window.salvarPaciente = salvarPaciente;
window.editarPaciente = editarPaciente;
window.excluirPaciente = excluirPaciente;
window.fecharModal = fecharModal;
window.pesquisarPacientes = pesquisarPacientes;
window.carregarPacientes = carregarPacientes;

console.log('✅ Módulo pacientes-supabase.js inicializado com sucesso!');
console.log('✅ Funções exportadas: abrirModalPaciente, salvarPaciente, editarPaciente, excluirPaciente, fecharModal');
