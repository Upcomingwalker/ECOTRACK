class CarbonCalculator {
    constructor() {
        this.carbonFactors = {
            electricity: {
                us_average: 0.81,
                coal: 2.31,
                natural_gas: 0.96,
                renewable: 0
            },
            transportation: {
                gasoline: 19.6,
                diesel: 22.4,
                bus: 0.64,
                train: 0.41,
                bike: 0
            },
            waste: {
                landfill: 0.57,
                recycling: -0.5,
                compost: -0.3
            },
            diet: {
                beef: 60,
                pork: 12.1,
                chicken: 6.9,
                fish: 6.1,
                dairy: 3.2,
                vegetables: 2,
                fruits: 1.1
            },
            flights: {
                domestic_short: 0.255,
                domestic_long: 0.175,
                international: 0.195
            }
        };

        this.globalAverages = {
            us_footprint: 16,
            global_average: 4,
            target_2050: 2
        };

        this.recommendations = [
            {
                category: "energy",
                title: "Switch to LED bulbs",
                impact: "Save 0.5 tons CO2/year",
                cost: "$50-100 upfront"
            },
            {
                category: "transport",
                title: "Use public transport 2 days/week",
                impact: "Save 1.2 tons CO2/year",
                cost: "Transit pass: $50-150/month"
            },
            {
                category: "diet",
                title: "Reduce beef consumption by 50%",
                impact: "Save 0.8 tons CO2/year",
                cost: "Potential food savings"
            },
            {
                category: "waste",
                title: "Recycle all paper and plastic",
                impact: "Save 0.3 tons CO2/year",
                cost: "No additional cost"
            }
        ];

        this.emissions = {
            energy: 0,
            transport: 0,
            waste: 0,
            diet: 0,
            travel: 0
        };

        this.chart = null;
        this.currentTheme = 'light';
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        console.log('Initializing Carbon Calculator...');
        
        this.applyTheme();
        this.setupEventListeners();
        
        // Initialize calculations and display
        setTimeout(() => {
            this.setupChart();
            this.calculate();
            this.showRecommendations();
            this.updateFootprintDisplay();
        }, 100);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Theme toggle - Direct event binding
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked');
                this.toggleTheme();
            });
            console.log('Theme toggle listener added');
        } else {
            console.error('Theme toggle button not found');
        }

        // Category navigation - More robust event binding
        const categoryTabs = document.querySelectorAll('.category-tab');
        console.log('Found category tabs:', categoryTabs.length);
        
        categoryTabs.forEach((tab, index) => {
            const category = tab.getAttribute('data-category');
            console.log(`Setting up tab ${index}: ${category}`);
            
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Category tab clicked:', category);
                this.showCategory(category);
            });
        });

        // Form inputs - real-time calculation
        const formControls = document.querySelectorAll('.form-control');
        console.log('Found form controls:', formControls.length);
        
        formControls.forEach(input => {
            input.addEventListener('input', () => {
                console.log('Input changed:', input.id, input.value);
                this.calculate();
                this.updateFootprintDisplay();
            });
            
            input.addEventListener('change', () => {
                this.calculate();
                this.updateFootprintDisplay();
            });
        });

        // Action buttons
        const exportBtn = document.getElementById('export-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportReport();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCalculator();
            });
        }

        // Add help button and modal functionality
        this.addHelpButton();
        this.setupModalHandlers();
    }

    addHelpButton() {
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            // Check if help button already exists
            if (!document.getElementById('help-btn')) {
                const helpBtn = document.createElement('button');
                helpBtn.id = 'help-btn';
                helpBtn.className = 'btn btn--secondary';
                helpBtn.innerHTML = '❓ Help';
                helpBtn.setAttribute('aria-label', 'Show help');
                helpBtn.style.marginRight = 'var(--space-8)';
                
                helpBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Help button clicked');
                    this.showModal();
                });
                
                headerControls.insertBefore(helpBtn, headerControls.firstChild);
                console.log('Help button added');
            }
        }
    }

    setupModalHandlers() {
        // Close modal handlers
        const modalClose = document.querySelector('.modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');
        
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    toggleTheme() {
        console.log('Toggling theme from:', this.currentTheme);
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('New theme:', this.currentTheme);
        
        this.applyTheme();
        
        // Recreate chart with new theme
        setTimeout(() => {
            this.setupChart();
        }, 100);
    }

    applyTheme() {
        console.log('Applying theme:', this.currentTheme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
            console.log('Theme icon updated to:', themeIcon.textContent);
        }
        
        // Force CSS update
        document.documentElement.style.setProperty('--current-theme', this.currentTheme);
    }

    showCategory(category) {
        console.log('Showing category:', category);
        
        if (!category) {
            console.error('No category specified');
            return;
        }
        
        // Update active tab
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.classList.remove('active');
            console.log('Removed active from tab:', tab.getAttribute('data-category'));
        });
        
        const activeTab = document.querySelector(`[data-category="${category}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Added active to tab:', category);
        } else {
            console.error('Active tab not found for category:', category);
        }

        // Show corresponding section
        const inputCards = document.querySelectorAll('.input-card');
        inputCards.forEach(card => {
            card.classList.remove('active');
            card.style.display = 'none';
            console.log('Hidden card:', card.getAttribute('data-section'));
        });
        
        const activeSection = document.querySelector(`[data-section="${category}"]`);
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
            console.log('Showed section:', category);
            
            // Smooth scroll to the section
            setTimeout(() => {
                activeSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        } else {
            console.error('Active section not found for category:', category);
            console.log('Available sections:');
            document.querySelectorAll('.input-card').forEach(card => {
                console.log('  Section:', card.getAttribute('data-section'));
            });
        }
    }

    calculate() {
        try {
            // Energy calculations
            const electricityBill = this.getInputValue('electricity-bill');
            const energySource = this.getSelectValue('energy-source') || 'us_average';
            const gasBill = this.getInputValue('gas-bill');
            
            // Estimate kWh from bill (average $0.13/kWh in US)
            const estimatedKWh = electricityBill / 0.13 * 12; // Annual kWh
            const energyFactor = this.carbonFactors.electricity[energySource] || this.carbonFactors.electricity.us_average;
            const gasEmissions = gasBill * 12 * 0.0053; // Gas conversion factor
            
            this.emissions.energy = (estimatedKWh * energyFactor / 1000) + gasEmissions;
            
            // Transportation calculations
            const milesDriven = this.getInputValue('miles-driven');
            const vehicleMpg = this.getInputValue('vehicle-mpg') || 25;
            const fuelType = this.getSelectValue('fuel-type') || 'gasoline';
            const publicTransport = this.getInputValue('public-transport');
            
            let transportEmissions = 0;
            if (fuelType === 'electric') {
                const kWhPer100Miles = 30;
                transportEmissions = (milesDriven / 100) * kWhPer100Miles * energyFactor / 1000;
            } else {
                const gallonsUsed = milesDriven / vehicleMpg;
                const fuelFactor = this.carbonFactors.transportation[fuelType] || this.carbonFactors.transportation.gasoline;
                transportEmissions = gallonsUsed * fuelFactor / 1000;
            }
            
            const publicTransportEmissions = publicTransport * 12 * this.carbonFactors.transportation.bus / 1000;
            this.emissions.transport = transportEmissions + publicTransportEmissions;
            
            // Waste calculations
            const trashBags = this.getInputValue('trash-bags');
            const recyclingLevel = this.getSelectValue('recycling-level') || 0;
            const composting = this.getSelectValue('composting') || 0;
            
            const wasteEmissions = trashBags * 52 * this.carbonFactors.waste.landfill / 1000;
            const recyclingReduction = parseFloat(recyclingLevel) * 2 * this.carbonFactors.waste.recycling / 1000;
            const compostingReduction = parseFloat(composting) * 1 * this.carbonFactors.waste.compost / 1000;
            
            this.emissions.waste = wasteEmissions + recyclingReduction + compostingReduction;
            
            // Diet calculations
            const beefMeals = this.getInputValue('beef-meals');
            const poultryMeals = this.getInputValue('poultry-meals');
            const fishMeals = this.getInputValue('fish-meals');
            const dairyServings = this.getInputValue('dairy-servings');
            
            const beefEmissions = beefMeals * 52 * 0.25 * this.carbonFactors.diet.beef / 1000;
            const poultryEmissions = poultryMeals * 52 * 0.2 * this.carbonFactors.diet.chicken / 1000;
            const fishEmissions = fishMeals * 52 * 0.2 * this.carbonFactors.diet.fish / 1000;
            const dairyEmissions = dairyServings * 365 * 0.1 * this.carbonFactors.diet.dairy / 1000;
            
            this.emissions.diet = beefEmissions + poultryEmissions + fishEmissions + dairyEmissions;
            
            // Travel calculations
            const shortFlights = this.getInputValue('short-flights');
            const longFlights = this.getInputValue('long-flights');
            const internationalFlights = this.getInputValue('international-flights');
            
            const shortFlightEmissions = shortFlights * 500 * this.carbonFactors.flights.domestic_short;
            const longFlightEmissions = longFlights * 1500 * this.carbonFactors.flights.domestic_long;
            const internationalFlightEmissions = internationalFlights * 4000 * this.carbonFactors.flights.international;
            
            this.emissions.travel = (shortFlightEmissions + longFlightEmissions + internationalFlightEmissions) / 1000;

            this.updateCategoryResults();
            this.updateChart();
            
        } catch (error) {
            console.error('Calculation error:', error);
        }
    }

    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) || 0 : 0;
    }

    getSelectValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    updateCategoryResults() {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `${Math.max(0, value).toFixed(1)} tons CO₂/year`;
            }
        };

        updateElement('energy-emissions', this.emissions.energy);
        updateElement('transport-emissions', this.emissions.transport);
        updateElement('waste-emissions', this.emissions.waste);
        updateElement('diet-emissions', this.emissions.diet);
        updateElement('travel-emissions', this.emissions.travel);
    }

    updateFootprintDisplay() {
        const totalEmissions = Object.values(this.emissions).reduce((sum, emission) => sum + Math.max(0, emission), 0);
        
        // Update main display
        const footprintValue = document.querySelector('.footprint-value');
        const totalFootprint = document.getElementById('total-footprint');
        
        if (footprintValue) footprintValue.textContent = totalEmissions.toFixed(1);
        if (totalFootprint) totalFootprint.textContent = totalEmissions.toFixed(1);
        
        // Update status
        const status = document.getElementById('footprint-status');
        if (status) {
            if (totalEmissions === 0) {
                status.textContent = 'Calculate your impact to see results';
                status.className = 'total-status';
            } else if (totalEmissions <= this.globalAverages.target_2050) {
                status.textContent = '🌟 Excellent! Below 2050 target';
                status.className = 'total-status status--success';
            } else if (totalEmissions <= this.globalAverages.global_average) {
                status.textContent = '👍 Good! Below global average';
                status.className = 'total-status status--info';
            } else if (totalEmissions <= this.globalAverages.us_footprint) {
                status.textContent = '⚠️ Above global average';
                status.className = 'total-status status--warning';
            } else {
                status.textContent = '🔴 Well above US average';
                status.className = 'total-status status--error';
            }
        }
        
        // Update comparison bars
        const maxValue = Math.max(totalEmissions, this.globalAverages.us_footprint);
        if (maxValue > 0) {
            const userProgress = (totalEmissions / maxValue) * 100;
            const usProgress = (this.globalAverages.us_footprint / maxValue) * 100;
            const targetProgress = (this.globalAverages.target_2050 / maxValue) * 100;
            
            const progressBars = document.querySelectorAll('.progress-fill');
            if (progressBars.length >= 3) {
                progressBars[0].style.width = `${userProgress}%`;
                progressBars[1].style.width = `${usProgress}%`;
                progressBars[2].style.width = `${targetProgress}%`;
            }
        }
        
        // Update comparison values
        const comparisonValues = document.querySelectorAll('.comparison-value');
        if (comparisonValues.length > 0) {
            comparisonValues[0].textContent = totalEmissions.toFixed(1);
        }

        this.showRecommendations();
    }

    setupChart() {
        const ctx = document.getElementById('footprint-chart');
        if (!ctx) return;

        const isDark = this.currentTheme === 'dark';
        const textColor = isDark ? '#E8EAED' : '#202124';

        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = Object.values(this.emissions).map(val => Math.max(0, val));

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Home Energy', 'Transportation', 'Waste', 'Diet', 'Air Travel'],
                datasets: [{
                    data: chartData,
                    backgroundColor: [
                        '#1FB8CD',
                        '#FFC185', 
                        '#B4413C',
                        '#ECEBD5',
                        '#5D878F'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: {
                                family: 'Google Sans, Roboto, sans-serif',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#333' : '#fff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDark ? '#555' : '#ddd',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value.toFixed(1)} tons (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    updateChart() {
        if (this.chart) {
            const chartData = Object.values(this.emissions).map(val => Math.max(0, val));
            this.chart.data.datasets[0].data = chartData;
            this.chart.update('none');
        }
    }

    showRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;
        
        const totalEmissions = Object.values(this.emissions).reduce((sum, emission) => sum + Math.max(0, emission), 0);
        
        if (totalEmissions === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Complete the calculator to see personalized recommendations</p>';
            return;
        }

        const emissionEntries = Object.entries(this.emissions)
            .map(([key, value]) => [key, Math.max(0, value)])
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        let html = '';
        emissionEntries.forEach(([category, emission]) => {
            if (emission > 0) {
                const rec = this.recommendations.find(r => r.category === category);
                if (rec) {
                    html += `
                        <div class="recommendation-item">
                            <div class="recommendation-title">${rec.title}</div>
                            <div class="recommendation-impact">${rec.impact}</div>
                            <div class="recommendation-cost">${rec.cost}</div>
                        </div>
                    `;
                }
            }
        });

        if (html === '') {
            html = `
                <div class="recommendation-item">
                    <div class="recommendation-title">Use energy-efficient appliances</div>
                    <div class="recommendation-impact">Save 0.3-0.8 tons CO2/year</div>
                    <div class="recommendation-cost">ENERGY STAR certified products</div>
                </div>
                <div class="recommendation-item">
                    <div class="recommendation-title">Install a programmable thermostat</div>
                    <div class="recommendation-impact">Save 0.5-1.0 tons CO2/year</div>
                    <div class="recommendation-cost">$100-250 with installation</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    exportReport() {
        const totalEmissions = Object.values(this.emissions).reduce((sum, emission) => sum + Math.max(0, emission), 0);
        
        const report = `CARBON FOOTPRINT REPORT
Generated: ${new Date().toLocaleDateString()}

TOTAL FOOTPRINT: ${totalEmissions.toFixed(1)} tons CO₂/year

BREAKDOWN:
• Home Energy: ${Math.max(0, this.emissions.energy).toFixed(1)} tons CO₂/year
• Transportation: ${Math.max(0, this.emissions.transport).toFixed(1)} tons CO₂/year
• Waste: ${Math.max(0, this.emissions.waste).toFixed(1)} tons CO₂/year
• Diet: ${Math.max(0, this.emissions.diet).toFixed(1)} tons CO₂/year
• Air Travel: ${Math.max(0, this.emissions.travel).toFixed(1)} tons CO₂/year

COMPARISON:
• Your footprint: ${totalEmissions.toFixed(1)} tons
• US Average: ${this.globalAverages.us_footprint} tons
• Global Average: ${this.globalAverages.global_average} tons
• 2050 Target: ${this.globalAverages.target_2050} tons

Visit our calculator for personalized recommendations to reduce your impact!`;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'carbon-footprint-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('📊 Report exported successfully!', 'success');
    }

    resetCalculator() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            document.querySelectorAll('.form-control').forEach(input => {
                input.value = '';
            });

            Object.keys(this.emissions).forEach(key => {
                this.emissions[key] = 0;
            });

            this.updateCategoryResults();
            this.updateFootprintDisplay();
            this.updateChart();

            this.showToast('🔄 Calculator reset successfully!', 'info');
        }
    }

    showModal() {
        console.log('Showing modal');
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            console.log('Modal shown');
        } else {
            console.error('Modal not found');
        }
    }

    hideModal() {
        console.log('Hiding modal');
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--color-surface);
            color: var(--color-text);
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid var(--color-border);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the calculator
let calculator;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        calculator = new CarbonCalculator();
    });
} else {
    calculator = new CarbonCalculator();
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);