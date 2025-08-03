// Configuración de Tailwind CSS
tailwind.config = {
    theme: {
        extend: {
            animation: {
                'spin-slow': 'spin 2s linear infinite',
            }
        }
    }
}

// Variables globales para el procesamiento
let isProcessing = false;
let currentEmailIndex = 0;
let currentPhaseIndex = 0;

// Función para iniciar el procesamiento
function startProcessing() {
    isProcessing = true;
    simulateProcessing();
}

// Función para pausar el procesamiento
function pauseProcessing() {
    isProcessing = false;
}

// Función para reiniciar el procesamiento
function resetProcessing() {
    isProcessing = false;
    currentEmailIndex = 0;
    currentPhaseIndex = 0;
    location.reload();
}

// Función principal de simulación de procesamiento
function simulateProcessing() {
    if (!isProcessing) return;

    const emailItems = document.querySelectorAll('.bg-gray-50.rounded-xl');
    const statusElements = document.querySelectorAll('[class*="px-4 py-1 rounded-full"]');
    const progressBars = document.querySelectorAll('[class*="bg-gradient-to-r from-blue-400 to-cyan-400"]');
    const phaseIcons = document.querySelectorAll('[class*="w-5 h-5 rounded-full"]');

    // Simular progreso
    setTimeout(() => {
        if (currentEmailIndex < emailItems.length) {
            const currentEmail = emailItems[currentEmailIndex];
            const currentStatus = statusElements[currentEmailIndex];
            const currentProgress = progressBars[currentEmailIndex];
            
            // Cambiar estado a procesando
            if (currentStatus.classList.contains('bg-yellow-100')) {
                currentStatus.textContent = 'Procesando';
                currentStatus.className = 'px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
            }

            // Simular fases
            const phases = currentEmail.querySelectorAll('.bg-white.p-3.rounded-lg');
            if (currentPhaseIndex < phases.length) {
                const phaseIcon = phases[currentPhaseIndex].querySelector('[class*="w-5 h-5 rounded-full"]');
                phaseIcon.className = 'w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs animate-spin-slow';
                phaseIcon.textContent = '⟳';
                
                setTimeout(() => {
                    phaseIcon.className = 'w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs';
                    phaseIcon.textContent = '✓';
                    currentPhaseIndex++;
                    
                    // Actualizar barra de progreso
                    const progress = ((currentPhaseIndex) / phases.length) * 100;
                    currentProgress.style.width = progress + '%';
                    
                    if (currentPhaseIndex >= phases.length) {
                        // Completar correo
                        currentStatus.textContent = 'Completado';
                        currentStatus.className = 'px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
                        currentEmailIndex++;
                        currentPhaseIndex = 0;
                        
                        // Actualizar estadísticas
                        updateStats();
                    }
                }, 1000);
            }
        }
        
        if (isProcessing) {
            simulateProcessing();
        }
    }, 2000);
}

// Función para actualizar las estadísticas
function updateStats() {
    const completedEmails = document.querySelectorAll('[class*="bg-green-100 text-green-800"]').length;
    const totalEmails = document.querySelectorAll('.bg-gray-50.rounded-xl').length;
    const pendingEmails = totalEmails - completedEmails;
    
    document.getElementById('completedEmails').textContent = completedEmails;
    document.getElementById('pendingEmails').textContent = pendingEmails;
}

// Función para agregar un nuevo correo dinámicamente
function addNewEmail(emailAddress, phases) {
    const progressSection = document.querySelector('.p-8');
    const emailCount = document.querySelectorAll('.bg-gray-50.rounded-xl').length + 1;
    
    const newEmailHTML = `
        <div class="bg-gray-50 rounded-xl p-6 mb-6 border-l-4 border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-1">Correo #${emailCount} - ${emailAddress}</h3>
                    <small class="text-gray-600">Esperando en cola...</small>
                </div>
                <span class="px-4 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" style="width: 0%;"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${phases.map(phase => `
                    <div class="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3">
                        <div class="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">○</div>
                        <span class="text-sm">${phase}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    progressSection.insertAdjacentHTML('beforeend', newEmailHTML);
    updateStats();
}

// Función para limpiar todos los correos
function clearAllEmails() {
    const emailItems = document.querySelectorAll('.bg-gray-50.rounded-xl');
    emailItems.forEach(item => item.remove());
    updateStats();
}

// Función para exportar datos del dashboard
function exportDashboardData() {
    const emailItems = document.querySelectorAll('.bg-gray-50.rounded-xl');
    const data = {
        totalEmails: emailItems.length,
        completedEmails: document.querySelectorAll('[class*="bg-green-100 text-green-800"]').length,
        pendingEmails: document.querySelectorAll('[class*="bg-yellow-100 text-yellow-800"]').length,
        processingEmails: document.querySelectorAll('[class*="bg-blue-100 text-blue-800"]').length,
        emails: []
    };
    
    emailItems.forEach((item, index) => {
        const emailInfo = {
            id: index + 1,
            address: item.querySelector('h3').textContent.split(' - ')[1],
            status: item.querySelector('[class*="px-4 py-1 rounded-full"]').textContent,
            progress: item.querySelector('[class*="bg-gradient-to-r from-blue-400 to-cyan-400"]').style.width,
            phases: Array.from(item.querySelectorAll('.bg-white.p-3.rounded-lg')).map(phase => ({
                name: phase.querySelector('span').textContent,
                status: phase.querySelector('[class*="w-5 h-5 rounded-full"]').className.includes('bg-green-500') ? 'completed' : 
                        phase.querySelector('[class*="w-5 h-5 rounded-full"]').className.includes('bg-blue-500') ? 'processing' : 'pending'
            }))
        };
        data.emails.push(emailInfo);
    });
    
    // Crear archivo de descarga
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar estadísticas
    updateStats();
    
    // Agregar event listeners para botones adicionales si existen
    const exportButton = document.getElementById('exportBtn');
    if (exportButton) {
        exportButton.addEventListener('click', exportDashboardData);
    }
    
    const clearButton = document.getElementById('clearBtn');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllEmails);
    }
    
    console.log('Dashboard de envío de correos inicializado correctamente');
}); 