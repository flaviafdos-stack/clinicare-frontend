/**
 * CLINICARE - Configuração Supabase Direto
 * Conexão direta com banco Supabase (sem backend intermediário)
 * Data: 06/03/2026 - VERSÃO DEBUG EDIÇÃO
 */

// Configuração do Supabase
const SUPABASE_CONFIG = {
    url: 'https://qcizwkxqcmwhoibwpnsb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjaXp3a3hxY213aG9pYndwbnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTA2MTIsImV4cCI6MjA4Nzk2NjYxMn0.o6PyEcLP5KCHz1x7bsDkkQiSlsO6mxTLfjPK1Pj_rTg'
};

console.log('✅ Supabase Config carregada:', SUPABASE_CONFIG.url);

/**
 * Cliente Supabase REST API
 */
class SupabaseClient {
    constructor() {
        this.baseUrl = `${SUPABASE_CONFIG.url}/rest/v1`;
        this.headers = {
            'apikey': SUPABASE_CONFIG.anonKey,
            'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * Requisição genérica
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            }
        };

        console.log(`🌐 Supabase Request: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Supabase Error:', response.status, errorText);
                throw new Error(`Supabase Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Supabase Response:', data);
            return data;

        } catch (error) {
            console.error('❌ Supabase Request Failed:', error);
            throw error;
        }
    }

    /**
     * PACIENTES
     */
    async getPacientes(limit = 100, offset = 0) {
        return this.request(`/patients?limit=${limit}&offset=${offset}&order=created_at.desc`);
    }

    async getPacienteById(id) {
        console.log('🔍 getPacienteById chamado com ID:', id);
        const url = `/patients?id=eq.${id}`;
        console.log('🔍 URL completa:', `${this.baseUrl}${url}`);
        
        const result = await this.request(url);
        
        console.log('📦 Resultado da query:', result);
        console.log('📊 Tipo do resultado:', typeof result);
        console.log('📊 É array?', Array.isArray(result));
        console.log('📊 Tamanho do array:', result?.length);
        console.log('📊 Primeiro elemento:', result?.[0]);
        
        return result[0] || null;
    }

    async createPaciente(data) {
        return this.request('/patients', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updatePaciente(id, data) {
        return this.request(`/patients?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deletePaciente(id) {
        return this.request(`/patients?id=eq.${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * DOCUMENTOS
     */
    async getDocumentos(pacienteId = null, limit = 100) {
        let endpoint = `/medical_records?limit=${limit}&order=created_at.desc`;
        if (pacienteId) {
            endpoint += `&patient_id=eq.${pacienteId}`;
        }
        return this.request(endpoint);
    }

    async getDocumentoById(id) {
        const result = await this.request(`/medical_records?id=eq.${id}`);
        return result[0] || null;
    }

    async createDocumento(data) {
        return this.request('/medical_records', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });
    }

    async updateDocumento(id, data) {
        return this.request(`/medical_records?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...data,
                updated_at: new Date().toISOString()
            })
        });
    }

    /**
     * CHECK-INS
     */
    async getCheckins(limit = 50) {
        return this.request(`/checkins?limit=${limit}&order=created_at.desc`);
    }

    async createCheckin(data) {
        return this.request('/checkins', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * LEADS WHATSAPP
     */
    async getLeads(limit = 100) {
        return this.request(`/leads_whatsapp?limit=${limit}&order=created_at.desc`);
    }

    async createLead(data) {
        return this.request('/leads_whatsapp', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateLead(id, data) {
        return this.request(`/leads_whatsapp?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * HEALTH CHECK
     */
    async healthCheck() {
        try {
            await this.request('/patients?limit=1');
            return {
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Instância global
const supabase = new SupabaseClient();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.supabase = supabase;
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    
    // Exportar variáveis individuais para compatibilidade
    window.SUPABASE_URL = SUPABASE_CONFIG.url;
    window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
}

console.log('✅ Supabase Client inicializado');
console.log('✅ SUPABASE_URL disponível:', window.SUPABASE_URL);
console.log('✅ SUPABASE_ANON_KEY disponível:', window.SUPABASE_ANON_KEY ? 'SIM' : 'NÃO');
