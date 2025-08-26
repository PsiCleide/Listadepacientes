document.addEventListener("DOMContentLoaded", () => {
    const patientForm = document.getElementById("patientForm");
    const patientsList = document.getElementById("patientsList");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const patientModal = document.getElementById("patientModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modalBody = document.getElementById("modalBody");
    const editPatientBtn = document.getElementById("editPatientBtn");
    const deletePatientBtn = document.getElementById("deletePatientBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const formTitle = document.getElementById("formTitle");
    const exportBtn = document.getElementById("exportBtn"); // Botão de exportar

    let patients = JSON.parse(localStorage.getItem("patients")) || [];
    let editingPatientId = null;

    // PWA Install Button
    let deferredPrompt;
    const installBtn = document.getElementById("installBtn");

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = "block";
    });

    installBtn.addEventListener("click", () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the A2HS prompt");
                } else {
                    console.log("User dismissed the A2HS prompt");
                }
                deferredPrompt = null;
                installBtn.style.display = "none";
            });
        }
    });

    // Toast Notification
    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        const toastMessage = toast.querySelector(".toast-message");
        const toastIcon = toast.querySelector(".toast-icon");

        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;

        if (type === "success") {
            toastIcon.className = "toast-icon fas fa-check-circle";
        } else if (type === "error") {
            toastIcon.className = "toast-icon fas fa-times-circle";
        } else if (type === "info") {
            toastIcon.className = "toast-icon fas fa-info-circle";
        }

        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    }

    // Save Patient
    patientForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(patientForm);
        const patient = Object.fromEntries(formData.entries());

        // Format CPF and Phone
        patient.cpf = patient.cpf.replace(/\D/g, "");
        patient.phone = patient.phone.replace(/\D/g, "");

        if (editingPatientId) {
            patients = patients.map((p) =>
                p.id === editingPatientId ? { ...p, ...patient } : p
            );
            showToast("Paciente atualizado com sucesso!");
            editingPatientId = null;
            formTitle.textContent = "Adicionar Novo Paciente";
        } else {
            patient.id = Date.now(); // Simple unique ID
            patients.push(patient);
            showToast("Paciente adicionado com sucesso!");
        }
        localStorage.setItem("patients", JSON.stringify(patients));
        patientForm.reset();
        renderPatients();
        updateDashboard();
        switchTab("patients"); // Go back to patients list after saving
    });

    // Cancel Edit
    cancelBtn.addEventListener("click", () => {
        patientForm.reset();
        editingPatientId = null;
        formTitle.textContent = "Adicionar Novo Paciente";
        switchTab("patients");
    });

    // Render Patients
    function renderPatients() {
        const filteredPatients = patients.filter((patient) => {
            const searchTerm = searchInput.value.toLowerCase();
            const matchesSearch =
                patient.fullName.toLowerCase().includes(searchTerm) ||
                patient.cpf.includes(searchTerm) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm));

            const matchesStatus =
                statusFilter.value === "all" ||
                patient.status === statusFilter.value;

            return matchesSearch && matchesStatus;
        });

        patientsList.innerHTML = "";
        if (filteredPatients.length === 0) {
            patientsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>Nenhum paciente encontrado</h3>
                    <p>Ajuste seus filtros ou adicione um novo paciente.</p>
                </div>
            `;
            return;
        }

        filteredPatients.forEach((patient) => {
            const patientCard = document.createElement("div");
            patientCard.className = `patient-card ${patient.status.toLowerCase()}`;
            patientCard.innerHTML = `
                <div class="patient-header">
                    <h3>${patient.fullName}</h3>
                    <span class="status-badge ${patient.status.toLowerCase()}">${patient.status}</span>
                </div>
                <div class="patient-details">
                    <p><i class="fas fa-id-card"></i> CPF: ${formatCpf(patient.cpf)}</p>
                    ${patient.email ? `<p><i class="fas fa-envelope"></i> ${patient.email}</p>` : ""}
                    ${patient.phone ? `<p><i class="fas fa-phone"></i> ${formatPhone(patient.phone)}</p>` : ""}
                    ${patient.firstConsultation ? `<p><i class="fas fa-calendar-alt"></i> Primeira: ${formatDate(patient.firstConsultation)}</p>` : ""}
                    ${patient.nextConsultation ? `<p><i class="fas fa-calendar-check"></i> Próxima: ${formatDate(patient.nextConsultation)}</p>` : ""}
                    ${patient.observations ? `<p><i class="fas fa-comment-dots"></i> Observações: ${patient.observations}</p>` : ""}
                </div>
                <div class="patient-actions">
                    <button class="btn btn-icon btn-delete" data-id="${patient.id}" title="Excluir Paciente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            patientsList.appendChild(patientCard);

            // Add event listener for card click to open modal
            patientCard.addEventListener("click", (e) => {
                // Prevent modal from opening when delete button is clicked
                if (e.target.closest(".btn-delete")) {
                    return;
                }
                openPatientModal(patient);
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent card click event
                const patientId = parseInt(e.currentTarget.dataset.id);
                deletePatient(patientId);
            });
        });
    }

    // Open Patient Details Modal
    function openPatientModal(patient) {
        modalBody.innerHTML = `
            <p><strong>Nome Completo:</strong> ${patient.fullName}</p>
            <p><strong>CPF:</strong> ${formatCpf(patient.cpf)}</p>
            ${patient.email ? `<p><strong>Email:</strong> ${patient.email}</p>` : ""}
            ${patient.phone ? `<p><strong>Celular:</strong> ${formatPhone(patient.phone)}</p>` : ""}
            ${patient.firstConsultation ? `<p><strong>Primeira Consulta:</strong> ${formatDate(patient.firstConsultation)}</p>` : ""}
            ${patient.nextConsultation ? `<p><strong>Próxima Consulta:</strong> ${formatDate(patient.nextConsultation)}</p>` : ""}
            <p><strong>Status:</strong> ${patient.status}</p>
            ${patient.observations ? `<p><strong>Observações:</strong> ${patient.observations}</p>` : ""}
        `;
        editPatientBtn.dataset.id = patient.id;
        deletePatientBtn.dataset.id = patient.id;
        patientModal.style.display = "flex";
    }

    // Close Modal
    closeModalBtn.addEventListener("click", () => {
        patientModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === patientModal) {
            patientModal.style.display = "none";
        }
    });

    // Edit Patient
    editPatientBtn.addEventListener("click", (e) => {
        const patientId = parseInt(e.currentTarget.dataset.id);
        const patientToEdit = patients.find((p) => p.id === patientId);

        if (patientToEdit) {
            for (const key in patientToEdit) {
                if (patientForm.elements[key]) {
                    patientForm.elements[key].value = patientToEdit[key];
                }
            }
            editingPatientId = patientId;
            formTitle.textContent = "Editar Paciente";
            patientModal.style.display = "none";
            switchTab("add-patient");
        }
    });

    // Delete Patient (from modal)
    deletePatientBtn.addEventListener("click", (e) => {
        const patientId = parseInt(e.currentTarget.dataset.id);
        deletePatient(patientId);
        patientModal.style.display = "none";
    });

    // Delete Patient (common function)
    function deletePatient(id) {
        if (confirm("Tem certeza que deseja excluir este paciente?")) {
            patients = patients.filter((p) => p.id !== id);
            localStorage.setItem("patients", JSON.stringify(patients));
            renderPatients();
            updateDashboard();
            showToast("Paciente excluído com sucesso!", "error");
        }
    }

    // Search and Filter
    searchInput.addEventListener("input", renderPatients);
    statusFilter.addEventListener("change", renderPatients);

    // Dashboard Update
    function updateDashboard() {
        document.getElementById("totalPatients").textContent = patients.length;
        document.getElementById("activePatients").textContent =
            patients.filter((p) => p.status === "Ativo").length;
        document.getElementById("inactivePatients").textContent =
            patients.filter((p) => p.status === "Inativo").length;
    }

    // Export to Excel (CSV)
    exportBtn.addEventListener("click", () => {
        if (patients.length === 0) {
            showToast("Nenhum paciente para exportar.", "info");
            return;
        }

        const headers = [
            "Nome Completo",
            "CPF",
            "Email",
            "Celular (WhatsApp)",
            "Data da Primeira Consulta",
            "Data da Próxima Consulta",
            "Status",
            "Observações",
        ];

        const csvRows = [];
        csvRows.push(headers.join(";")); // Add headers

        patients.forEach((patient) => {
            const row = [
                `"${patient.fullName.replace(/"/g, "\"")}"`,
                `"${formatCpf(patient.cpf)}"`,
                `"${patient.email ? patient.email.replace(/"/g, "\"") : ""}"`,
                `"${patient.phone ? formatPhone(patient.phone) : ""}"`,
                `"${patient.firstConsultation ? formatDate(patient.firstConsultation) : ""}"`,
                `"${patient.nextConsultation ? formatDate(patient.nextConsultation) : ""}"`,
                `"${patient.status}"`,
                `"${patient.observations ? patient.observations.replace(/"/g, "\"") : ""}"`,
            ];
            csvRows.push(row.join(";"));
        });

        const csvString = csvRows.join("\n");
        // Adiciona o BOM para UTF-8
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pacientes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Dados exportados com sucesso!");
    });

    // Tab Switching
    const navTabs = document.querySelectorAll(".nav-tab");
    const tabContents = document.querySelectorAll(".tab-content");

    navTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });

    function switchTab(targetTab) {
        navTabs.forEach((tab) => {
            tab.classList.remove("active");
            if (tab.dataset.tab === targetTab) {
                tab.classList.add("active");
            }
        });

        tabContents.forEach((content) => {
            content.classList.remove("active");
            if (content.id === targetTab) {
                content.classList.add("active");
            }
        });

        // Update dashboard when switching to it
        if (targetTab === "dashboard") {
            updateDashboard();
        }
        // Render patients when switching to patients list
        if (targetTab === "patients") {
            renderPatients();
        }
    }

    // Initial render
    renderPatients();
    updateDashboard();

    // Helper functions for formatting
    function formatCpf(cpf) {
        cpf = String(cpf).replace(/\D/g, ""); // Remove all non-digits
        cpf = cpf.padStart(11, '0'); // Ensure 11 digits, pad with 0s if less
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatPhone(phone) {
        phone = String(phone).replace(/\D/g, ""); // Remove all non-digits
        if (phone.length === 11) {
            return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (phone.length === 10) {
            return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone; // Return as is if not 10 or 11 digits
    }

    // Input masks
    document.getElementById("cpf").addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = value;
    });

    document.getElementById("phone").addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        e.target.value = value;
    });

    function formatDate(dateString) {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    }
});

