// PWA Controle de Pacientes
class PatientManager {
    constructor() {
        this.patients = this.loadPatients();
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPWA();
        this.setupFormMasks();
        this.renderPatients();
        this.updateDashboard();
        this.showTab('dashboard');
    }

    // PWA Setup
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Install prompt
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'flex';
        });

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Patient form
        document.getElementById('patientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePatient();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.resetForm();
            this.showTab('patients');
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderPatients();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderPatients();
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editPatientBtn').addEventListener('click', () => {
            this.editCurrentPatient();
        });

        document.getElementById('deletePatientBtn').addEventListener('click', () => {
            this.deleteCurrentPatient();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Close modal on outside click
        document.getElementById('patientModal').addEventListener('click', (e) => {
            if (e.target.id === 'patientModal') {
                this.closeModal();
            }
        });
    }

    // Form Masks
    setupFormMasks() {
        const cpfInput = document.getElementById('cpf');
        const phoneInput = document.getElementById('phone');

        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\\D/g, '');
            value = value.replace(/(\\d{3})(\\d)/, '$1.$2');
            value = value.replace(/(\\d{3})(\\d)/, '$1.$2');
            value = value.replace(/(\\d{3})(\\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\\D/g, '');
            value = value.replace(/(\\d{2})(\\d)/, '($1) $2');
            value = value.replace(/(\\d{5})(\\d)/, '$1-$2');
            e.target.value = value;
        });
    }

    // Tab Navigation
    showTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Reset form if switching away from add-patient
        if (tabName !== 'add-patient') {
            this.resetForm();
        }
    }

    // Patient CRUD Operations
    savePatient() {
        const formData = new FormData(document.getElementById('patientForm'));
        const patient = {
            id: this.currentEditingId || Date.now().toString(),
            fullName: formData.get('fullName'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            firstConsultation: formData.get('firstConsultation'),
            nextConsultation: formData.get('nextConsultation'),
            status: formData.get('status'),
            observations: formData.get('observations'),
            createdAt: this.currentEditingId ? 
                this.patients.find(p => p.id === this.currentEditingId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validation
        if (!patient.fullName || !patient.cpf || !patient.status) {
            this.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Check for duplicate CPF
        const existingPatient = this.patients.find(p => 
            p.cpf === patient.cpf && p.id !== patient.id
        );
        if (existingPatient) {
            this.showToast('Já existe um paciente com este CPF.', 'error');
            return;
        }

        // Save patient
        if (this.currentEditingId) {
            const index = this.patients.findIndex(p => p.id === this.currentEditingId);
            this.patients[index] = patient;
            this.showToast('Paciente atualizado com sucesso!');
        } else {
            this.patients.push(patient);
            this.showToast('Paciente cadastrado com sucesso!');
        }

        this.savePatients();
        this.renderPatients();
        this.updateDashboard();
        this.resetForm();
        this.showTab('patients');
    }

    editPatient(id) {
        const patient = this.patients.find(p => p.id === id);
        if (!patient) return;

        this.currentEditingId = id;
        
        // Fill form
        document.getElementById('fullName').value = patient.fullName || '';
        document.getElementById('cpf').value = patient.cpf || '';
        document.getElementById('email').value = patient.email || '';
        document.getElementById('phone').value = patient.phone || '';
        document.getElementById('firstConsultation').value = patient.firstConsultation || '';
        document.getElementById('nextConsultation').value = patient.nextConsultation || '';
        document.getElementById('status').value = patient.status || 'Ativo';
        document.getElementById('observations').value = patient.observations || '';

        // Update form title
        document.getElementById('formTitle').textContent = 'Editar Paciente';
        
        this.showTab('add-patient');
    }

    deletePatient(id) {
        if (confirm('Tem certeza que deseja excluir este paciente?')) {
            this.patients = this.patients.filter(p => p.id !== id);
            this.savePatients();
            this.renderPatients();
            this.updateDashboard();
            this.showToast('Paciente excluído com sucesso!');
        }
    }

    resetForm() {
        document.getElementById('patientForm').reset();
        this.currentEditingId = null;
        document.getElementById('formTitle').textContent = 'Adicionar Novo Paciente';
    }

    // Render Functions
    renderPatients() {
        const container = document.getElementById('patientsList');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        let filteredPatients = this.patients.filter(patient => {
            const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm) ||
                                patient.cpf.includes(searchTerm) ||
                                (patient.email && patient.email.toLowerCase().includes(searchTerm));
            
            const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        if (filteredPatients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>${this.patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Nenhum paciente encontrado'}</h3>
                    <p>${this.patients.length === 0 ? 'Adicione seu primeiro paciente para começar' : 'Tente ajustar os filtros de busca'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredPatients.map(patient => `
            <div class="patient-card" onclick="patientManager.showPatientDetails('${patient.id}')">
                <div class="patient-header">
                    <div>
                        <div class="patient-name">${patient.fullName}</div>
                        <div class="patient-cpf">${patient.cpf}</div>
                    </div>
                    <span class="patient-status status-${patient.status.toLowerCase()}">
                        ${patient.status}
                    </span>
                </div>
                <div class="patient-info">
                    ${patient.email ? `
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${patient.email}</span>
                        </div>
                    ` : ''}
                    ${patient.phone ? `
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>${patient.phone}</span>
                        </div>
                    ` : ''}
                    ${patient.nextConsultation ? `
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Próxima: ${this.formatDate(patient.nextConsultation)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateDashboard() {
        const total = this.patients.length;
        const active = this.patients.filter(p => p.status === 'Ativo').length;
        const inactive = this.patients.filter(p => p.status === 'Inativo').length;

        document.getElementById('totalPatients').textContent = total;
        document.getElementById('activePatients').textContent = active;
        document.getElementById('inactivePatients').textContent = inactive;
    }

    // Modal Functions
    showPatientDetails(id) {
        const patient = this.patients.find(p => p.id === id);
        if (!patient) return;

        this.currentEditingId = id;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="patient-details">
                <div class="detail-group">
                    <strong>Nome Completo:</strong>
                    <span>${patient.fullName}</span>
                </div>
                <div class="detail-group">
                    <strong>CPF:</strong>
                    <span>${patient.cpf}</span>
                </div>
                ${patient.email ? `
                    <div class="detail-group">
                        <strong>Email:</strong>
                        <span>${patient.email}</span>
                    </div>
                ` : ''}
                ${patient.phone ? `
                    <div class="detail-group">
                        <strong>Celular:</strong>
                        <span>${patient.phone}</span>
                    </div>
                ` : ''}
                ${patient.firstConsultation ? `
                    <div class="detail-group">
                        <strong>Primeira Consulta:</strong>
                        <span>${this.formatDate(patient.firstConsultation)}</span>
                    </div>
                ` : ''}
                ${patient.nextConsultation ? `
                    <div class="detail-group">
                        <strong>Próxima Consulta:</strong>
                        <span>${this.formatDate(patient.nextConsultation)}</span>
                    </div>
                ` : ''}
                <div class="detail-group">
                    <strong>Status:</strong>
                    <span class="patient-status status-${patient.status.toLowerCase()}">${patient.status}</span>
                </div>
                ${patient.observations ? `
                    <div class="detail-group">
                        <strong>Observações:</strong>
                        <span>${patient.observations}</span>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('patientModal').classList.add('active');
    }

    editCurrentPatient() {
        this.closeModal();
        this.editPatient(this.currentEditingId);
    }

    deleteCurrentPatient() {
        this.closeModal();
        this.deletePatient(this.currentEditingId);
    }

    closeModal() {
        document.getElementById('patientModal').classList.remove('active');
        this.currentEditingId = null;
    }

    // Utility Functions
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');

        messageEl.textContent = message;
        
        if (type === 'error') {
            toast.classList.add('error');
            icon.className = 'toast-icon fas fa-exclamation-circle';
        } else {
            toast.classList.remove('error');
            icon.className = 'toast-icon fas fa-check-circle';
        }

        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Data Persistence
    loadPatients() {
        const stored = localStorage.getItem('patients');
        return stored ? JSON.parse(stored) : [];
    }

    savePatients() {
        localStorage.setItem('patients', JSON.stringify(this.patients));
    }

    // Export to Excel
    exportToExcel() {
        if (this.patients.length === 0) {
            this.showToast('Não há pacientes para exportar.', 'error');
            return;
        }

        // Create CSV content
        const headers = [
            'Nome Completo',
            'CPF',
            'Email',
            'Celular',
            'Primeira Consulta',
            'Próxima Consulta',
            'Status',
            'Observações'
        ];

        const csvContent = [
            headers.join(','),
            ...this.patients.map(patient => [
                `"${patient.fullName || ''}"`,
                `"${patient.cpf || ''}"`,
                `"${patient.email || ''}"`,
                `"${patient.phone || ''}"`,
                `"${patient.firstConsultation ? this.formatDate(patient.firstConsultation) : ''}"`,
                `"${patient.nextConsultation ? this.formatDate(patient.nextConsultation) : ''}"`,
                `"${patient.status || ''}"`,
                `"${patient.observations || ''}"`
            ].join(','))
        ].join('\\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Lista de pacientes exportada com sucesso!');
    }
}

// CSS for patient details modal
const modalStyles = `
    .patient-details {
        display: grid;
        gap: 1rem;
    }
    
    .detail-group {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.5rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .detail-group:last-child {
        border-bottom: none;
    }
    
    .detail-group strong {
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .detail-group span {
        color: var(--text-primary);
    }
    
    @media (max-width: 480px) {
        .detail-group {
            grid-template-columns: 1fr;
            gap: 0.25rem;
        }
    }
`;

// Add modal styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
const patientManager = new PatientManager();

