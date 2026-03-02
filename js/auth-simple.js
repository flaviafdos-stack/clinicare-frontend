/**
 * SISTEMA DE AUTENTICAÇÃO SIMPLIFICADO - CLINICARE
 * Integrado com backend Railway
 */

// Credenciais padrão (fallback)
const CREDENCIAIS_FALLBACK = {
    'admin@clinicare.com': {
        senha: 'admin123',
        nome: 'Administrador',
        role: 'admin',
        id: 'admin-001'
    },
    'paciente@email.com': {
        senha: 'paciente123',
        nome: 'Ana Paciente',
        role: 'paciente',
        id: 'pac-001'
    }
};

let currentLoginType = 'admin';

// Alternar entre tabs de login
function switchTab(type) {
    currentLoginType = type;
    
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    console.log(`📋 Tipo de login: ${type}`);
}

// Mostrar notificação
function showNotification(mensagem, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <strong>${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}</strong>
        ${mensagem}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Login com backend
async function loginComBackend(email, senha) {
    try {
        console.log('🌐 Tentando login com backend...');
        
        const response = await API.login(email, senha);
        
        if (response.success && response.user) {
            console.log('✅ Login no backend bem-sucedido!');
            return {
                success: true,
                user: response.user
            };
        }
        
        throw new Error('Resposta inválida do backend');
        
    } catch (error) {
        console.warn('⚠️ Erro no backend, usando fallback:', error.message);
        return null;
    }
}

// Login com fallback local
function loginComFallback(email, senha) {
    console.log('🔄 Usando autenticação local (fallback)');
    
    const credencial = CREDENCIAIS_FALLBACK[email];
    
    if (!credencial) {
        return {
            success: false,
            error: 'Usuário não encontrado'
        };
    }
    
    if (credencial.senha !== senha) {
        return {
            success: false,
            error: 'Senha incorreta'
        };
    }
    
    return {
        success: true,
        user: {
            id: credencial.id,
            name: credencial.nome,
            email: email,
            role: credencial.role
        }
    };
}

// Handler principal de login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    console.log('🔐 Iniciando login...');
    showNotification('Autenticando...', 'info');
    
    try {
        // Tentar login com backend primeiro
        let resultado = await loginComBackend(email, senha);
        
        // Se backend falhar, usar fallback
        if (!resultado) {
            resultado = loginComFallback(email, senha);
        }
        
        if (resultado.success) {
            // Salvar sessão
            sessionStorage.setItem('clinicare_session', JSON.stringify({
                user: resultado.user,
                timestamp: new Date().toISOString()
            }));
            
            localStorage.setItem('clinicare_user', JSON.stringify(resultado.user));
            
            showNotification(`Bem-vindo(a), ${resultado.user.name}!`, 'success');
            
            // Redirecionar
            setTimeout(() => {
                if (resultado.user.role === 'paciente') {
                    window.location.href = 'portal-paciente.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
            
        } else {
            showNotification(resultado.error || 'Credenciais inválidas', 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
    }
}

// Verificar se já está logado
function checkAuth() {
    const session = sessionStorage.getItem('clinicare_session');
    
    if (session) {
        try {
            const data = JSON.parse(session);
            console.log('✅ Usuário já autenticado:', data.user.name);
            
            // Se estiver na página de login, redirecionar
            if (window.location.pathname.includes('index.html') || 
                window.location.pathname === '/') {
                
                if (data.user.role === 'paciente') {
                    window.location.href = 'portal-paciente.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
            
            return data.user;
        } catch (e) {
            console.error('Erro ao verificar sessão:', e);
        }
    }
    
    return null;
}

// Logout
function logout() {
    sessionStorage.removeItem('clinicare_session');
    localStorage.removeItem('clinicare_user');
    showNotification('Logout realizado com sucesso!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema de autenticação carregado');
    
    // Verificar autenticação
    checkAuth();
});

console.log('✅ auth-simple.js carregado');
