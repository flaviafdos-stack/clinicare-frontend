/**
 * CONFIGURAÇÃO DA API - CLINICARE
 * Conecta o frontend ao backend no Railway
 */

const API_CONFIG = {
    // URL do backend em produção
    BASE_URL: 'https://clinicare-backend-production.up.railway.app',
    
    // Endpoints disponíveis
    ENDPOINTS: {
        // Autenticação
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        
        // Pacientes
        patients: '/api/patients',
        patientById: (id) => `/api/patients/${id}`,
        
        // Agendamentos
        appointments: '/api/appointments',
        appointmentById: (id) => `/api/appointments/${id}`,
        
        // Health check
        health: '/health',
        status: '/'
    },
    
    // Configurações de requisição
    headers: {
        'Content-Type': 'application/json'
    },
    
    // Timeout (30 segundos)
    timeout: 30000
};

// Função helper para fazer requisições
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            }
        };
        
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

// Funções específicas da API
const API = {
    // Login
    login: async (email, password) => {
        return await apiRequest(API_CONFIG.ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    // Listar pacientes
    getPatients: async () => {
        return await apiRequest(API_CONFIG.ENDPOINTS.patients);
    },
    
    // Criar paciente
    createPatient: async (patientData) => {
        return await apiRequest(API_CONFIG.ENDPOINTS.patients, {
            method: 'POST',
            body: JSON.stringify(patientData)
        });
    },
    
    // Listar agendamentos
    getAppointments: async () => {
        return await apiRequest(API_CONFIG.ENDPOINTS.appointments);
    },
    
    // Health check
    checkHealth: async () => {
        return await apiRequest(API_CONFIG.ENDPOINTS.health);
    }
};

console.log('✅ API Config carregada:', API_CONFIG.BASE_URL);
