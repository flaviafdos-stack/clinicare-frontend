/**
 * CLINICARE - Gestão de Pacientes com Supabase
 * CRUD completo de pacientes usando Supabase direto
 * Data: 06/03/2026
 */

// Verificar autenticação
checkAuth();

console.log('📋 Módulo de Pacientes carregado');

// Variáveis globais
let pacientesData = [];
let pacienteAtual = null;

/**
 * Carregar lista de pacientes
 */
async function carregarPacientes() {
    try {
        console.log('📥 Carregando pacientes do Supabase...');
        
        pacientesData = await supabase.getPacientes();
        
        console.log(`✅ ${pacientesData.length} pacientes carregados`);
        
        renderizarListaPacientes(pacientesData);
        
    } catch (error) {
        console.error('❌ Erro ao carregar pacientes:', error);
        alert(`Erro ao carregar pacientes:\n${error.message}`);
        
        // Tentar carregar do localStorage como fallback
        carregarPacientesLocal();
    }
}

/**
 * Renderizar lista de pacientes na tabela
 */
function renderizarListaPacientes(pacientes) {
    const tbody = document.querySelector('#tabelaPacientes tbody');
    
    if (!tbody) {
        console.warn('⚠️ Tabela de pacientes não encontrada');
        return;
    }
    
    if (pacientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-user-plus" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                    <p style="color: #666; margin: 0;">Nenhum paciente cadastrado</p>
                    <button onclick="abrirModalPaciente()" class="btn btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Cadastrar Primeiro Paciente
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pacientes.map(p => `
        <tr>
            <td>${p.nome || '-'}</td>
            <td>${p.cpf || '-'}</td>
            <td>${p.telefone || '-'}</td>
            <td>${p.email || '-'}</td>
            <td>${formatarData(p.created_at)}</td>
            <td>
                <button onclick="editarPaciente('${p.id}')" class="btn btn-sm btn-primary" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirPaciente('${p.id}')" class="btn btn-sm btn-danger" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Abrir modal de novo paciente
 */
function abrirModalPaciente() {
    pacienteAtual = null;
    
    // Limpar formulário
    const form = document.getElementById('formPaciente');
    if (form) {
        form.reset();
    }
    
    // Resetar título do modal
    const modalTitulo = document.getElementById('modalTitulo');
    if (modalTitulo) {
        modalTitulo.innerHTML = '<i class="fas fa-user"></i> Novo Paciente';
    }
    
    // Abrir modal usando classe active
    const modal = document.getElementById('modalPaciente');
    if (modal) {
        modal.classList.add('active');
    }
    
    console.log('✅ Modal aberto para novo paciente');
}

/**
 * Salvar paciente (criar ou atualizar)
 */
async function salvarPaciente(event) {
    if (event) event.preventDefault();
    
    try {
        // Coletar dados do formulário
        const formData = {
            nome: document.getElementById('pacNome')?.value,
            cpf: document.getElementById('pacCpf')?.value,
            telefone: document.getElementById('pacTelefone')?.value,
            email: document.getElementById('pacEmail')?.value,
            data_nascimento: document.getElementById('pacNascimento')?.value,
            endereco: document.getElementById('pacEndereco')?.value,
            cidade: document.getElementById('pacCidade')?.value,
            cep: document.getElementById('pacCep')?.value,
            consentimento_lgpd: document.getElementById('consentimentoLGPD')?.checked || false,
            data_consentimento: document.getElementById('consentimentoLGPD')?.checked ? new Date().toISOString() : null,
            finalidade_dados: 'Atendimento odontológico, gestão de prontuário clínico, comunicações relacionadas ao tratamento'
        };
        
        // Validação básica
        if (!formData.nome) {
            alert('❌ Nome é obrigatório');
            return;
        }
        
        if (!formData.telefone) {
            alert('❌ Telefone é obrigatório');
            return;
        }
        
        console.log('💾 Salvando paciente...', formData);
        
        if (pacienteAtual) {
            // Atualizar
            await supabase.updatePaciente(pacienteAtual.id, formData);
            console.log('✅ Paciente atualizado');
            alert('✅ Paciente atualizado com sucesso!');
        } else {
            // Criar
            const novoPaciente = await supabase.createPaciente(formData);
            console.log('✅ Paciente criado:', novoPaciente);
            alert('✅ Paciente cadastrado com sucesso!');
        }
        
        // Recarregar lista
        await carregarPacientes();
        
        // Fechar modal
        fecharModal();
        
    } catch (error) {
        console.error('❌ Erro ao salvar paciente:', error);
        alert(`Erro ao salvar paciente:\n${error.message}`);
    }
}

/**
 * Editar paciente
 */
async function editarPaciente(id) {
    try {
        console.log('📝 Carregando paciente para edição:', id);
        
        const paciente = await supabase.getPacienteById(id);
        
        if (!paciente) {
            alert('❌ Paciente não encontrado');
            return;
        }
        
        pacienteAtual = paciente;
        
        // Preencher formulário
        document.getElementById('pacNome').value = paciente.nome || '';
        document.getElementById('pacCpf').value = paciente.cpf || '';
        document.getElementById('pacTelefone').value = paciente.telefone || '';
        document.getElementById('pacEmail').value = paciente.email || '';
        document.getElementById('pacNascimento').value = paciente.data_nascimento || '';
        document.getElementById('pacEndereco').value = paciente.endereco || '';
        document.getElementById('pacCidade').value = paciente.cidade || '';
        if (paciente.cep) document.getElementById('pacCep').value = paciente.cep || '';
        
        // Marcar checkbox LGPD como checked
        const checkboxLGPD = document.getElementById('consentimentoLGPD');
        if (checkboxLGPD) {
            checkboxLGPD.checked = true;
        }
        
        // Alterar título do modal
        const modalTitulo = document.getElementById('modalTitulo');
        if (modalTitulo) {
            modalTitulo.innerHTML = '<i class="fas fa-edit"></i> Editar Paciente';
        }
        
        // Armazenar ID para atualização
        document.getElementById('pacNome').dataset.pacienteId = paciente.id;
        
        // Abrir modal (usando classe active)
        const modal = document.getElementById('modalPaciente');
        if (modal) {
            modal.classList.add('active');
        }
        
        console.log('✅ Paciente carregado para edição:', paciente);
        
    } catch (error) {
        console.error('❌ Erro ao carregar paciente:', error);
        alert('❌ Erro ao carregar dados do paciente. Tente novamente.');
    }
}

/**
 * Excluir paciente
 */
async function excluirPaciente(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este paciente?\nEsta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        console.log('🗑️ Excluindo paciente:', id);
        
        await supabase.deletePaciente(id);
        
        console.log('✅ Paciente excluído');
        alert('✅ Paciente excluído com sucesso!');
        
        // Recarregar lista
        await carregarPacientes();
        
    } catch (error) {
        console.error('❌ Erro ao excluir paciente:', error);
        alert(`Erro ao excluir paciente:\n${error.message}`);
    }
}

/**
 * Fechar modal
 */
function fecharModal() {
    const modal = document.getElementById('modalPaciente');
    if (modal) {
        modal.classList.remove('active');
    }
    pacienteAtual = null;
    
    // Limpar formulário
    const form = document.getElementById('formPaciente');
    if (form) {
        form.reset();
    }
    
    console.log('🔒 Modal fechado');
}

/**
 * Pesquisar pacientes
 */
function pesquisarPacientes() {
    const termo = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    if (!termo) {
        renderizarListaPacientes(pacientesData);
        return;
    }
    
    const resultados = pacientesData.filter(p => 
        (p.nome && p.nome.toLowerCase().includes(termo)) ||
        (p.cpf && p.cpf.includes(termo)) ||
        (p.telefone && p.telefone.includes(termo)) ||
        (p.email && p.email.toLowerCase().includes(termo))
    );
    
    renderizarListaPacientes(resultados);
}

/**
 * Carregar pacientes do localStorage (fallback)
 */
function carregarPacientesLocal() {
    console.log('⚠️ Modo fallback: carregando do localStorage');
    
    const localData = localStorage.getItem('clinicare_pacientes');
    if (localData) {
        try {
            pacientesData = JSON.parse(localData);
            renderizarListaPacientes(pacientesData);
        } catch (e) {
            console.error('Erro ao parsear localStorage:', e);
            pacientesData = [];
            renderizarListaPacientes([]);
        }
    } else {
        pacientesData = [];
        renderizarListaPacientes([]);
    }
}

/**
 * Formatar data
 */
function formatarData(dataISO) {
    if (!dataISO) return '-';
    
    try {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return '-';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botão de novo paciente
    const btnNovo = document.getElementById('btnNovoPaciente');
    if (btnNovo) {
        btnNovo.addEventListener('click', abrirModalPaciente);
    }
    
    // Formulário
    const form = document.getElementById('formPaciente');
    if (form) {
        form.addEventListener('submit', salvarPaciente);
    }
    
    // Campo de pesquisa
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', pesquisarPacientes);
    }
    
    // Carregar pacientes
    carregarPacientes();
});

// Exportar funções globais
window.abrirModalPaciente = abrirModalPaciente;
window.salvarPaciente = salvarPaciente;
window.editarPaciente = editarPaciente;
window.excluirPaciente = excluirPaciente;
window.fecharModal = fecharModal;
window.pesquisarPacientes = pesquisarPacientes;

console.log('✅ Módulo de Pacientes com Supabase inicializado');
