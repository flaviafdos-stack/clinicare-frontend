/**
 * CLINICARE - Dashboard com Supabase
 * Carrega dados reais do banco Supabase
 * Data: 06/03/2026
 */

// Verificar autenticação
checkAuth('admin');

// Data atual
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        console.log('📊 Carregando dados do dashboard...');

        // Testar conexão
        const health = await supabase.healthCheck();
        console.log('✅ Health check:', health);

        if (health.status !== 'healthy') {
            throw new Error('Banco de dados não está acessível');
        }

        // Carregar pacientes
        const pacientes = await supabase.getPacientes(1000);
        const totalPacientes = pacientes.length;

        // Carregar documentos
        const documentos = await supabase.getDocumentos(null, 100);

        // Dados calculados
        const consultasHoje = 0; // TODO: implementar agendamentos
        const receitaMensal = 0; // TODO: implementar financeiro
        const alertasEstoque = 0; // TODO: implementar estoque

        // Atualizar cards
        document.getElementById('totalPacientes').textContent = totalPacientes;
        document.getElementById('consultasHoje').textContent = consultasHoje;
        document.getElementById('receitaMensal').textContent = `R$ ${receitaMensal.toLocaleString('pt-BR')}`;
        document.getElementById('alertasEstoque').textContent = alertasEstoque;

        // Documentos recentes (últimos 5)
        const documentosRecentes = documentos.slice(0, 5);

        // Preencher tabela de consultas (com dados de exemplo por enquanto)
        const consultasTable = document.querySelector('#proximasConsultas tbody');
        consultasTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-calendar-alt" style="font-size: 24px; margin-bottom: 10px;"></i><br>
                    Sistema de agenda em desenvolvimento.<br>
                    <small>Use a aba "Agenda" para gerenciar consultas.</small>
                </td>
            </tr>
        `;

        // Preencher tabela de follow-ups (com dados de exemplo por enquanto)
        const followupsTable = document.querySelector('#followupsPendentes tbody');
        followupsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-users" style="font-size: 24px; margin-bottom: 10px;"></i><br>
                    Sistema de CRM em desenvolvimento.<br>
                    <small>Use a aba "CRM" para gerenciar follow-ups.</small>
                </td>
            </tr>
        `;

        // Criar gráfico de receita (dados de exemplo)
        const receitaCtx = document.getElementById('receitaChart').getContext('2d');
        new Chart(receitaCtx, {
            type: 'bar',
            data: {
                labels: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'],
                datasets: [{
                    label: 'Receita (R$)',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Sistema financeiro em desenvolvimento'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });

        // Criar gráfico de procedimentos (dados de exemplo)
        const procedimentosCtx = document.getElementById('procedimentosChart').getContext('2d');
        new Chart(procedimentosCtx, {
            type: 'doughnut',
            data: {
                labels: ['Em desenvolvimento'],
                datasets: [{
                    data: [100],
                    backgroundColor: ['rgba(37, 99, 235, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: 'Sistema de procedimentos em desenvolvimento'
                    }
                }
            }
        });

        console.log('✅ Dashboard carregado com sucesso!');
        console.log(`📊 Total de pacientes: ${totalPacientes}`);
        console.log(`📄 Total de documentos: ${documentos.length}`);

    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        
        // Mostrar mensagem de erro
        alert(`Erro ao carregar dados do dashboard:\n${error.message}\n\nVerifique a conexão com o banco de dados.`);
        
        // Carregar dados de exemplo se falhar
        loadMockData();
    }
}

// Carregar dados de exemplo (fallback)
function loadMockData() {
    console.log('⚠️ Carregando dados de exemplo (modo offline)');
    
    // Dados mock
    document.getElementById('totalPacientes').textContent = '0';
    document.getElementById('consultasHoje').textContent = '0';
    document.getElementById('receitaMensal').textContent = 'R$ 0';
    document.getElementById('alertasEstoque').textContent = '0';

    // Mensagem nas tabelas
    const emptyMessage = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 20px; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i><br>
                <strong>Banco de dados offline</strong><br>
                <small>Verifique a conexão com o Supabase.</small>
            </td>
        </tr>
    `;

    document.querySelector('#proximasConsultas tbody').innerHTML = emptyMessage;
    document.querySelector('#followupsPendentes tbody').innerHTML = emptyMessage;
}

// Funções auxiliares
function verDetalhes(nome) {
    alert(`Ver detalhes de: ${nome}`);
    // TODO: Implementar modal de detalhes
}

function realizarFollowup(nome) {
    alert(`Realizar follow-up com: ${nome}`);
    // TODO: Implementar modal de follow-up
}

// Carregar dados ao inicializar
loadDashboardData();
