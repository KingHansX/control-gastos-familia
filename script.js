// Clase para manejar los gastos e ingresos
class FinanceManager {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.incomes = JSON.parse(localStorage.getItem('incomes')) || [];
        this.initializeEventListeners();
        this.updateUI();
        this.initializeTooltips();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Formulario de gastos
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Formulario de ingresos
        document.getElementById('incomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        // Filtros
        document.getElementById('startDate').addEventListener('change', () => this.updateUI());
        document.getElementById('endDate').addEventListener('change', () => this.updateUI());
        document.getElementById('filterPerson').addEventListener('change', () => this.updateUI());
        document.getElementById('filterType').addEventListener('change', () => this.updateUI());
        document.getElementById('filterCategory').addEventListener('change', () => this.updateUI());

        // Botón de descarga
        document.getElementById('downloadCSV').addEventListener('click', () => this.downloadCSV());

        // Inicializar tooltips
        this.initializeTooltips();
    }

    // Inicializar tooltips
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.dataset.tooltip;
                document.body.appendChild(tooltip);

                const rect = e.target.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + 5}px`;
                tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
                tooltip.style.opacity = '1';
            });

            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }

    // Agregar nuevo gasto
    addExpense() {
        const expense = {
            id: Date.now(),
            date: document.getElementById('date').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            person: document.getElementById('person').value,
            type: 'gasto'
        };

        this.expenses.push(expense);
        this.saveData();
        this.updateUI();
        this.showNotification('Gasto registrado exitosamente', 'success');
        document.getElementById('expenseForm').reset();
    }

    // Agregar nuevo ingreso
    addIncome() {
        const income = {
            id: Date.now(),
            date: document.getElementById('incomeDate').value,
            amount: parseFloat(document.getElementById('incomeAmount').value),
            source: document.getElementById('incomeSource').value,
            description: document.getElementById('incomeDescription').value,
            person: document.getElementById('incomePerson').value,
            type: 'ingreso'
        };

        this.incomes.push(income);
        this.saveData();
        this.updateUI();
        this.showNotification('Ingreso registrado exitosamente', 'success');
        document.getElementById('incomeForm').reset();
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateY(-100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Eliminar gasto
    deleteExpense(id) {
        if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveData();
            this.updateUI();
            this.showNotification('Gasto eliminado exitosamente', 'info');
        }
    }

    // Eliminar ingreso
    deleteIncome(id) {
        if (confirm('¿Está seguro de que desea eliminar este ingreso?')) {
            this.incomes = this.incomes.filter(income => income.id !== id);
            this.saveData();
            this.updateUI();
            this.showNotification('Ingreso eliminado exitosamente', 'info');
        }
    }

    // Guardar datos en localStorage
    saveData() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        localStorage.setItem('incomes', JSON.stringify(this.incomes));
    }

    // Obtener datos filtrados
    getFilteredData() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const person = document.getElementById('filterPerson').value;
        const type = document.getElementById('filterType').value;
        const category = document.getElementById('filterCategory').value;

        let filteredExpenses = [...this.expenses];
        let filteredIncomes = [...this.incomes];

        // Aplicar filtros de fecha
        if (startDate) {
            filteredExpenses = filteredExpenses.filter(item => item.date >= startDate);
            filteredIncomes = filteredIncomes.filter(item => item.date >= startDate);
        }
        if (endDate) {
            filteredExpenses = filteredExpenses.filter(item => item.date <= endDate);
            filteredIncomes = filteredIncomes.filter(item => item.date <= endDate);
        }

        // Aplicar filtro de persona
        if (person) {
            filteredExpenses = filteredExpenses.filter(item => item.person === person);
            filteredIncomes = filteredIncomes.filter(item => item.person === person);
        }

        // Aplicar filtro de tipo
        if (type === 'gasto') {
            filteredIncomes = [];
        } else if (type === 'ingreso') {
            filteredExpenses = [];
        }

        // Aplicar filtro de categoría/fuente
        if (category) {
            filteredExpenses = filteredExpenses.filter(item => item.category === category);
            filteredIncomes = filteredIncomes.filter(item => item.source === category);
        }

        return { expenses: filteredExpenses, incomes: filteredIncomes };
    }

    // Actualizar la interfaz de usuario
    updateUI() {
        const { expenses, incomes } = this.getFilteredData();
        this.updateExpensesTable(expenses);
        this.updateIncomesTable(incomes);
        this.updateSummary(expenses, incomes);
        this.updateCharts(expenses, incomes);
    }

    // Actualizar tabla de gastos
    updateExpensesTable(expenses) {
        const tbody = document.getElementById('expensesTableBody');
        tbody.innerHTML = '';

        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${expense.paymentMethod}</td>
                <td>${expense.person}</td>
                <td>
                    <button onclick="financeManager.deleteExpense(${expense.id})" class="delete-btn" data-tooltip="Eliminar este gasto">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);

            // Animar entrada
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    // Actualizar tabla de ingresos
    updateIncomesTable(incomes) {
        const tbody = document.getElementById('incomeTableBody');
        tbody.innerHTML = '';

        incomes.forEach(income => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.innerHTML = `
                <td>${income.date}</td>
                <td>$${income.amount.toFixed(2)}</td>
                <td>${income.source}</td>
                <td>${income.description}</td>
                <td>${income.person}</td>
                <td>
                    <button onclick="financeManager.deleteIncome(${income.id})" class="delete-btn" data-tooltip="Eliminar este ingreso">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);

            // Animar entrada
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    // Actualizar resumen
    updateSummary(expenses, incomes) {
        // Totales
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
        const balance = totalIncomes - totalExpenses;

        // Actualizar elementos del DOM con animación
        this.animateValue('monthlyExpenses', totalExpenses);
        this.animateValue('monthlyIncome', totalIncomes);
        this.animateValue('monthlyBalance', balance);
        
        const balanceElement = document.getElementById('monthlyBalance');
        balanceElement.className = balance >= 0 ? 'positive-balance' : 'negative-balance';
    }

    // Animar cambio de valor
    animateValue(elementId, newValue) {
        const element = document.getElementById(elementId);
        const start = parseFloat(element.textContent.replace('$', '')) || 0;
        const end = newValue;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * progress;
            element.textContent = `$${current.toFixed(2)}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Actualizar gráficos
    updateCharts(expenses, incomes) {
        // Datos para gráficos
        const expenseCategories = {};
        const incomeSources = {};
        const monthlyData = {
            expenses: {},
            incomes: {}
        };
        
        // Procesar gastos
        expenses.forEach(expense => {
            expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.amount;
            const month = expense.date.substring(0, 7);
            monthlyData.expenses[month] = (monthlyData.expenses[month] || 0) + expense.amount;
        });

        // Procesar ingresos
        incomes.forEach(income => {
            incomeSources[income.source] = (incomeSources[income.source] || 0) + income.amount;
            const month = income.date.substring(0, 7);
            monthlyData.incomes[month] = (monthlyData.incomes[month] || 0) + income.amount;
        });

        // Gráfico de pastel para ingresos
        const incomePieCtx = document.getElementById('incomePieChart').getContext('2d');
        if (window.incomePieChart instanceof Chart) {
            window.incomePieChart.destroy();
        }
        window.incomePieChart = new Chart(incomePieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(incomeSources),
                datasets: [{
                    data: Object.values(incomeSources),
                    backgroundColor: [
                        '#50c878',
                        '#98fb98',
                        '#90ee90',
                        '#32cd32',
                        '#228b22'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos por Fuente',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });

        // Gráfico de pastel para gastos
        const expensePieCtx = document.getElementById('expensePieChart').getContext('2d');
        if (window.expensePieChart instanceof Chart) {
            window.expensePieChart.destroy();
        }
        window.expensePieChart = new Chart(expensePieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(expenseCategories),
                datasets: [{
                    data: Object.values(expenseCategories),
                    backgroundColor: [
                        '#ff6b6b',
                        '#ff8c8c',
                        '#ffa07a',
                        '#ff6347',
                        '#ff4500'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Gastos por Categoría',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });

        // Gráfico de comparación
        const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
        if (window.comparisonChart instanceof Chart) {
            window.comparisonChart.destroy();
        }
        
        // Obtener todos los meses únicos
        const allMonths = [...new Set([
            ...Object.keys(monthlyData.expenses),
            ...Object.keys(monthlyData.incomes)
        ])].sort();

        window.comparisonChart = new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: allMonths,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: allMonths.map(month => monthlyData.incomes[month] || 0),
                        backgroundColor: '#50c878'
                    },
                    {
                        label: 'Gastos',
                        data: allMonths.map(month => monthlyData.expenses[month] || 0),
                        backgroundColor: '#ff6b6b'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparativa Ingresos vs Gastos',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Descargar datos como CSV
    downloadCSV() {
        const headers = ['Tipo', 'Fecha', 'Monto', 'Categoría/Fuente', 'Descripción', 'Método de Pago', 'Persona'];
        
        const csvContent = [
            headers.join(','),
            ...this.expenses.map(expense => [
                'Gasto',
                expense.date,
                expense.amount,
                expense.category,
                expense.description,
                expense.paymentMethod,
                expense.person
            ].join(',')),
            ...this.incomes.map(income => [
                'Ingreso',
                income.date,
                income.amount,
                income.source,
                income.description,
                '',
                income.person
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `finanzas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        this.showNotification('Archivo CSV descargado exitosamente', 'success');
    }
}

// Inicializar la aplicación
const financeManager = new FinanceManager(); 