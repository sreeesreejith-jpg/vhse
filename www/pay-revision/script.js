document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        'basic-pay-in',
        'da-pend-perc',
        'hra-old-perc',
        'fitment-perc',
        'bal-da-perc',
        'hra-perc'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', calculate);
        // Auto-select text on click/focus to easily see datalist
        el.addEventListener('click', function () {
            this.select();
        });
    });

    // Global variable to store stages for navigation
    let payStagesList = [];

    // Fetch and populate Pay Stages
    fetch('../data/pay_stages.json')
        .then(response => response.json())
        .then(data => {
            const dataList = document.getElementById('pay-stages');
            if (dataList && data.payStages) {
                payStagesList = data.payStages; // Store for smart navigation
                data.payStages.forEach(stage => {
                    const option = document.createElement('option');
                    option.value = stage;
                    dataList.appendChild(option);
                });
            }
        })
        .catch(err => console.error('Error loading pay stages:', err));

    // Handle Up/Down Arrow Navigation & Clear-on-Focus (Ghost Value Pattern)
    const basicPayInput = document.getElementById('basic-pay-in');

    // Store current value to dataset for reference
    basicPayInput.dataset.lastValid = basicPayInput.value;

    function activateGhostMode() {
        if (this.value.trim() !== "") {
            this.dataset.lastValid = this.value;
            this.placeholder = this.value; // Show value as placeholder
            this.value = ''; // Clear actual value to show full datalist
        }
    }

    function deactivateGhostMode() {
        if (this.value.trim() === "") {
            this.value = this.dataset.lastValid; // Restore if nothing selected
        } else {
            this.dataset.lastValid = this.value; // Update if new value selected
        }
        // Calculate immediately to ensure UI is in sync
        calculate();
    }

    basicPayInput.addEventListener('focus', activateGhostMode);
    basicPayInput.addEventListener('click', activateGhostMode);
    basicPayInput.addEventListener('blur', deactivateGhostMode);

    basicPayInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (payStagesList.length === 0) return;

            e.preventDefault();

            // Use current value or ghost value (stored in dataset)
            let currentValStr = this.value;
            if (currentValStr === '') {
                currentValStr = this.dataset.lastValid || "0";
            }

            const currentVal = parseInt(currentValStr) || 0;

            let currentIndex = payStagesList.indexOf(currentVal);

            // If not found (custom value), find closest
            if (currentIndex === -1) {
                currentIndex = payStagesList.findIndex(val => val >= currentVal);
                if (currentIndex === -1) currentIndex = payStagesList.length - 1;
            }

            let nextIndex = currentIndex;
            if (e.key === 'ArrowUp') {
                nextIndex = currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1;
            }

            // Boundary checks
            if (nextIndex >= 0 && nextIndex < payStagesList.length) {
                this.value = payStagesList[nextIndex];
                this.dataset.lastValid = this.value; // Update ghost ref
                calculate(); // Trigger calculation
            }
        }
    });

    function calculate() {
        const bp = parseFloat(document.getElementById('basic-pay-in').value) || 0;

        // Before Revision Percentages
        const daOldPerc = 22; // Fixed
        const daPendPerc = parseFloat(document.getElementById('da-pend-perc').value) || 0;
        const hraOldPerc = parseFloat(document.getElementById('hra-old-perc').value) || 0;

        // After Revision Percentages
        const daMergedPerc = 31; // Fixed
        const fitmentPerc = parseFloat(document.getElementById('fitment-perc').value) || 0;
        const balDaPerc = parseFloat(document.getElementById('bal-da-perc').value) || 0;
        const hraNewPerc = parseFloat(document.getElementById('hra-perc').value) || 0;

        // Before Revision Calculations
        const daOldVal = Math.round(bp * (daOldPerc / 100));
        const daPendVal = Math.round(bp * (daPendPerc / 100));
        const hraOldVal = Math.round(bp * (hraOldPerc / 100));
        const grossOld = bp + daOldVal + daPendVal + hraOldVal;

        // Update Before UI
        document.getElementById('res-bp-old').textContent = bp.toLocaleString();
        document.getElementById('res-da-old').textContent = daOldVal.toLocaleString();
        document.getElementById('res-da-pend').textContent = daPendVal.toLocaleString();
        document.getElementById('res-hra-old').textContent = hraOldVal.toLocaleString();
        document.getElementById('res-gross-old').textContent = grossOld.toLocaleString();
        document.getElementById('gross-old-val').textContent = grossOld.toLocaleString();

        // After Revision Calculations
        const daMergedVal = Math.round(bp * (daMergedPerc / 100));
        const fitmentVal = Math.round(bp * (fitmentPerc / 100));
        const actualTotal = bp + daMergedVal + fitmentVal;

        // BP Fixed At: Rounded to next multiple of 100
        const bpFixed = Math.ceil(actualTotal / 100) * 100;

        // Updated: Bal DA and HRA are calculated on BP Fixed At
        const balDaVal = Math.round(bpFixed * (balDaPerc / 100));
        const hraNewVal = Math.round(bpFixed * (hraNewPerc / 100));
        const grossNew = bpFixed + balDaVal + hraNewVal;

        const growth = grossNew - grossOld;
        const growthPerc = grossOld > 0 ? ((growth / grossOld) * 100).toFixed(1) : 0;

        // Update After UI
        document.getElementById('res-bp-new').textContent = bp.toLocaleString();
        document.getElementById('res-da-merged').textContent = daMergedVal.toLocaleString();
        document.getElementById('res-fitment').textContent = fitmentVal.toLocaleString();
        document.getElementById('res-actual-total').textContent = actualTotal.toLocaleString();
        document.getElementById('res-bp-fixed').textContent = bpFixed.toLocaleString();
        document.getElementById('res-bal-da').textContent = balDaVal.toLocaleString();
        document.getElementById('res-hra-new').textContent = hraNewVal.toLocaleString();
        document.getElementById('res-gross-new').textContent = grossNew.toLocaleString();

        // Summary Cards
        document.getElementById('gross-new-val').textContent = grossNew.toLocaleString();
        document.getElementById('gross-old-val').textContent = grossOld.toLocaleString();
        document.getElementById('growth-val').textContent = `${growth.toLocaleString()} (${growthPerc}%)`;
    }

    // Initial calculation
    calculate();
});
