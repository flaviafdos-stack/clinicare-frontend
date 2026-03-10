async function editarPaciente(id) {
    try {
        console.log('📝 Carregando paciente para edição:', id);
        console.log('🔍 Tipo do ID:', typeof id);
        console.log('🔍 Supabase disponível?', typeof supabase);
        console.log('🔍 Função getPacienteById disponível?', typeof supabase.getPacienteById);
        
        const paciente = await supabase.getPacienteById(id);
        
        console.log('📦 Resposta do Supabase:', paciente);
        
        if (!paciente) {
            console.error('❌ Paciente retornou null/undefined');
            alert('❌ Paciente não encontrado');
            return;
        }
        
        console.log('✅ Paciente encontrado:', paciente);
        pacienteAtual = paciente;
        
        // Preencher formulário
        console.log('📝 Preenchendo campos do formulário...');
        
        const campoNome = document.getElementById('pacNome');
        console.log('🔍 Campo pacNome existe?', !!campoNome);
        if (campoNome) campoNome.value = paciente.nome || '';
        
        const campoCpf = document.getElementById('pacCpf');
        if (campoCpf) campoCpf.value = paciente.cpf || '';
        
        const campoTelefone = document.getElementById('pacTelefone');
        if (campoTelefone) campoTelefone.value = paciente.telefone || '';
        
        const campoEmail = document.getElementById('pacEmail');
        if (campoEmail) campoEmail.value = paciente.email || '';
        
        const campoNascimento = document.getElementById('pacNascimento');
        if (campoNascimento) campoNascimento.value = paciente.data_nascimento || '';
        
        const campoEndereco = document.getElementById('pacEndereco');
        if (campoEndereco) campoEndereco.value = paciente.endereco || '';
        
        const campoCidade = document.getElementById('pacCidade');
        if (campoCidade) campoCidade.value = paciente.cidade || '';
        
        const campoCep = document.getElementById('pacCep');
        if (campoCep && paciente.cep) campoCep.value = paciente.cep;
        
        console.log('✅ Campos preenchidos');
        
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
        if (campoNome) {
            campoNome.dataset.pacienteId = paciente.id;
        }
        
        // Abrir modal (usando classe active)
        const modal = document.getElementById('modalPaciente');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Modal aberto');
        } else {
            console.error('❌ Modal não encontrado');
        }
        
        console.log('✅ Paciente carregado para edição:', paciente);
        
    } catch (error) {
        console.error('❌ Erro COMPLETO ao carregar paciente:', error);
        console.error('❌ Stack trace:', error.stack);
        console.error('❌ Mensagem:', error.message);
        alert('❌ Erro ao carregar dados do paciente. Veja o console para detalhes.');
    }
}
