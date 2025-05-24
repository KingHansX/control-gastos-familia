// Variables globales
let transactions = [];
let currentSection = 'dashboard';
let isMenuOpen = false;

// Elementos del DOM
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const contentWrapper = document.querySelector('.content-wrapper');
const themeToggle = document.getElementById('themeToggle');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setupEventListeners();
    showSection(currentSection);
    updateDashboard();
});

// Configuración de event listeners
function setupEventListeners() {
    // Menú lateral
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Cerrar menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMenu();
        }
    });
    
    // Navegación
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').dataset.section;
            showSection(section);
            closeMenu();
        });
    });

    // Cambio de tema
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Formularios
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) incomeForm.addEventListener('submit', handleIncomeSubmit);
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) expenseForm.addEventListener('submit', handleExpenseSubmit);
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);

    // Filtros
    const startDate = document.getElementById('startDate');
    if (startDate) startDate.addEventListener('change', updateTransactionsTable);
    const endDate = document.getElementById('endDate');
    if (endDate) endDate.addEventListener('change', updateTransactionsTable);
    const filterPerson = document.getElementById('filterPerson');
    if (filterPerson) filterPerson.addEventListener('change', updateTransactionsTable);
    const filterType = document.getElementById('filterType');
    if (filterType) filterType.addEventListener('change', updateTransactionsTable);
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) filterCategory.addEventListener('change', updateTransactionsTable);

    // Exportar datos
    const exportData = document.getElementById('exportData');
    if (exportData) exportData.addEventListener('click', exportToCSV);
}

// Funciones de navegación
function toggleMenu() {
    if (isMenuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    mainNav.classList.add('active');
    contentWrapper.classList.add('nav-active');
    isMenuOpen = true;
    menuToggle.innerHTML = '<i class="fas fa-times"></i>';
}

function closeMenu() {
    mainNav.classList.remove('active');
    contentWrapper.classList.remove('nav-active');
    isMenuOpen = false;
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-wrapper > section').forEach(section => {
        section.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        currentSection = sectionId;
        
        // Actualizar la navegación activa
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Actualizar contenido específico de la sección
        switch(sectionId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'transactions':
                updateTransactionsTable();
                break;
            case 'reports':
                updateReports();
                break;
        }
    }
}

// Funciones de tema
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark ? 
        '<i class="fas fa-sun"></i> Modo Claro' : 
        '<i class="fas fa-moon"></i> Modo Oscuro';
    localStorage.setItem('darkTheme', isDark);
}

// Funciones de manejo de datos
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Funciones de manejo de formularios
function handleIncomeSubmit(e) {
    e.preventDefault();
    const income = {
        id: Date.now(),
        type: 'ingreso',
        date: document.getElementById('incomeDate').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        category: document.getElementById('incomeSource').value,
        description: document.getElementById('incomeDescription').value,
        person: document.getElementById('incomePerson').value
    };
    
    transactions.push(income);
    saveTransactions();
    updateTransactionsTable();
    updateDashboard();
    e.target.reset();
    showSection('dashboard');
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const expense = {
        id: Date.now(),
        type: 'gasto',
        date: document.getElementById('date').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        person: document.getElementById('person').value
    };
    
    transactions.push(expense);
    saveTransactions();
    updateTransactionsTable();
    updateDashboard();
    e.target.reset();
    showSection('dashboard');
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const settings = {
        currency: document.getElementById('currency').value,
        dateFormat: document.getElementById('dateFormat').value
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    updateAllDisplays();
}

// Funciones de actualización de UI
function updateDashboard() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= firstDayOfMonth);
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'gasto')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = monthlyIncome - monthlyExpenses;

    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);

    updateBalanceChart();
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const person = document.getElementById('filterPerson').value;
    const type = document.getElementById('filterType').value;
    const category = document.getElementById('filterCategory').value;

    let filteredTransactions = transactions;

    if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
    }
    if (person) {
        filteredTransactions = filteredTransactions.filter(t => t.person === person);
    }
    if (type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    if (category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }

    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.type === 'ingreso' ? 'Ingreso' : 'Gasto'}</td>
            <td class="${transaction.type === 'ingreso' ? 'income' : 'expense'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td>${transaction.category}</td>
            <td>${transaction.person}</td>
            <td>${transaction.description}</td>
            <td>
                <button onclick="deleteTransaction(${transaction.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateReports() {
    updateExpensesByCategoryChart();
    updateIncomeBySourceChart();
    updateMonthlyBalanceChart();
}

// Funciones de utilidad
function formatCurrency(amount) {
    const settings = JSON.parse(localStorage.getItem('settings')) || { currency: 'MXN' };
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: settings.currency
    }).format(amount);
}

function formatDate(dateString) {
    const settings = JSON.parse(localStorage.getItem('settings')) || { dateFormat: 'DD/MM/YYYY' };
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch(settings.dateFormat) {
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

function deleteTransaction(id) {
    if (confirm('¿Está seguro de que desea eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateTransactionsTable();
        updateDashboard();
    }
}

function exportToCSV() {
    const headers = ['Fecha', 'Tipo', 'Monto', 'Categoría', 'Persona', 'Descripción'];
    const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
            formatDate(t.date),
            t.type,
            t.amount,
            t.category,
            t.person,
            t.description
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacciones_${formatDate(new Date())}.csv`;
    link.click();
}

// Funciones de gráficos
function updateBalanceChart() {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
    }).reverse();

    const data = last6Months.map(date => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate >= monthStart && transDate <= monthEnd;
        });

        const income = monthTransactions
            .filter(t => t.type === 'ingreso')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            month: date.toLocaleString('es-ES', { month: 'short' }),
            income,
            expenses,
            balance: income - expenses
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: 'Ingresos',
                    data: data.map(d => d.income),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    fill: true
                },
                {
                    label: 'Gastos',
                    data: data.map(d => d.expenses),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true
                },
                {
                    label: 'Balance',
                    data: data.map(d => d.balance),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Balance de los últimos 6 meses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateExpensesByCategoryChart() {
    const canvas = document.getElementById('expensesByCategoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const expenses = transactions.filter(t => t.type === 'gasto');
    const categories = [...new Set(expenses.map(e => e.category))];
    
    const data = categories.map(category => {
        const total = expenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return { category, total };
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.total),
                backgroundColor: [
                    '#e74c3c',
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gastos por Categoría'
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.raw;
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateIncomeBySourceChart() {
    const canvas = document.getElementById('incomeBySourceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const incomes = transactions.filter(t => t.type === 'ingreso');
    const sources = [...new Set(incomes.map(i => i.category))];
    
    const data = sources.map(source => {
        const total = incomes
            .filter(i => i.category === source)
            .reduce((sum, i) => sum + i.amount, 0);
        return { source, total };
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.source),
            datasets: [{
                data: data.map(d => d.total),
                backgroundColor: [
                    '#27ae60',
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ingresos por Fuente'
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.raw;
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyBalanceChart() {
    const canvas = document.getElementById('monthlyBalanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const last12Months = Array.from({length: 12}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
    }).reverse();

    const data = last12Months.map(date => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate >= monthStart && transDate <= monthEnd;
        });

        const income = monthTransactions
            .filter(t => t.type === 'ingreso')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions
            .filter(t => t.type === 'gasto')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            month: date.toLocaleString('es-ES', { month: 'short' }),
            balance: income - expenses
        };
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Balance Mensual',
                data: data.map(d => d.balance),
                backgroundColor: data.map(d => d.balance >= 0 ? '#27ae60' : '#e74c3c')
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Balance Mensual'
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

// Inicializar tema
const savedTheme = localStorage.getItem('darkTheme');
if (savedTheme === 'true') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
} 