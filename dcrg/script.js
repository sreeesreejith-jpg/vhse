/**
 * Kerala Pension & DCRG Calculator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const basicPayInput = document.getElementById('basicPay');
    const daPercentageInput = document.getElementById('daPercentage');
    const serviceYearsInput = document.getElementById('serviceYears');
    const avgEmolumentsInput = document.getElementById('avgEmoluments');

    // Display elements
    const pensionAmountDisplay = document.getElementById('pensionAmount');
    const drAmountDisplay = document.getElementById('drAmount');

    // Global variable to store stages
    let payStagesList = [
        23000, 23700, 24400, 25100, 25800, 26500, 27200, 27900, 28700, 29500,
        30300, 31100, 32000, 32900, 33800, 34700, 35600, 36500, 37400, 38300,
        39300, 40300, 41300, 42300, 43400, 44500, 45600, 46700, 47800, 49000,
        50200, 51400, 52600, 53900, 55200, 56500, 57900, 59300, 60700, 62200,
        63700, 65200, 66800, 68400, 70000, 71800, 73600, 75400, 77200, 79000,
        81000, 83000, 85000, 87000, 89000, 91200, 93400, 95600, 97800, 100300,
        102800, 105300, 107800, 110300, 112800, 115300, 118100, 120900, 123700,
        126500, 129300, 132100, 134900, 137700, 140500, 143600, 146700, 149800,
        153200, 156600, 160000, 163400, 166800
    ];

    function populatePayStages(stages) {
        const dataList = document.getElementById('pay-stages');
        if (dataList && stages) {
            dataList.innerHTML = '';
            stages.forEach(stage => {
                const option = document.createElement('option');
                option.value = stage;
                dataList.appendChild(option);
            });
        }
    }

    // Initial population
    populatePayStages(payStagesList);

    fetch('../data/pay_stages.json')
        .then(response => response.json())
        .then(data => {
            if (data.payStages) {
                payStagesList = data.payStages;
                populatePayStages(payStagesList);
            }
        })
        .catch(err => console.log('Using embedded pay stages'));

    // Smart Navigation & Auto-List Logic for DCRG Basic Pay
    basicPayInput.dataset.lastValid = basicPayInput.value || "60700";

    function activateGhostMode() {
        if (this.value.trim() !== "") {
            this.dataset.lastValid = this.value;
            this.placeholder = this.value;
            this.value = '';
        }
    }

    function deactivateGhostMode() {
        if (this.value.trim() === "") {
            this.value = this.dataset.lastValid;
        } else {
            this.dataset.lastValid = this.value;
        }
        this.dispatchEvent(new Event('input'));
    }

    basicPayInput.addEventListener('focus', activateGhostMode);
    basicPayInput.addEventListener('click', activateGhostMode);
    basicPayInput.addEventListener('blur', deactivateGhostMode);

    basicPayInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (payStagesList.length === 0) return;

            e.preventDefault();

            let currentValStr = this.value;
            if (currentValStr === '') {
                currentValStr = this.dataset.lastValid || "0";
            }

            const currentVal = parseInt(currentValStr) || 0;

            let currentIndex = payStagesList.indexOf(currentVal);

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

            if (nextIndex >= 0 && nextIndex < payStagesList.length) {
                this.value = payStagesList[nextIndex];
                this.dataset.lastValid = this.value;
                this.dispatchEvent(new Event('input'));
            }
        }
    });
    const totalMonthlyPensionDisplay = document.getElementById('totalMonthlyPension');
    const commutationAmountDisplay = document.getElementById('commutationAmount');
    const balancePensionDisplay = document.getElementById('balancePension');
    const dcrgAmountDisplay = document.getElementById('dcrgAmount');
    const totalBenefitsDisplay = document.getElementById('totalBenefits');
    const netMonthlyPensionDisplay = document.getElementById('netMonthlyPension');
    const pensionFactorVal = document.getElementById('pensionFactorVal');
    const dcrgFactorVal = document.getElementById('dcrgFactorVal');

    // Dashboard elements
    const totalBenefitsHeader = document.getElementById('totalBenefitsHeader');
    const commuteHeader = document.getElementById('commuteHeader');
    const dcrgHeader = document.getElementById('dcrgHeader');
    const balanceHeader = document.getElementById('balanceHeader');

    const inputs = [basicPayInput, daPercentageInput, serviceYearsInput];

    /**
     * Format number as Indian Currency (₹)
     */
    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(num);
    };

    /**
     * Main calculation function
     */
    const calculateAll = () => {
        const bp = parseFloat(basicPayInput.value) || 0;
        const da = parseFloat(daPercentageInput.value) || 0;
        let years = parseFloat(serviceYearsInput.value) || 0;

        // Validation & Constraints
        if (years > 35) years = 35;
        // Note: Rules say min 10, but we process whatever is there for instant feedback

        // 1. Average Emoluments
        const avgEmoluments = bp + (bp * da / 100);
        avgEmolumentsInput.value = Math.round(avgEmoluments).toLocaleString('en-IN');

        // 2. Pension Calculation
        // Formula: (Average Emoluments / 2) * (Completed Service / 30)
        let pensionFactor = years / 30;
        if (pensionFactor > 1.0) pensionFactor = 1.0;

        const pension = (avgEmoluments / 2) * pensionFactor;

        // 3. Pension Commutation
        // Formula: 40% of Pension * 11.42 * 12
        const commutationAmount = pension * 0.40 * 11.42 * 12;
        const balancePension = pension * 0.60;
        const netTotalPension = balancePension;

        // 4. DCRG Calculation
        // Formula: (Average Emoluments) * (Completed Service / 2)
        // Rule: Factor (Years / 2) must not exceed 16.5
        let dcrgFactor = years / 2;
        if (dcrgFactor > 16.5) dcrgFactor = 16.5;

        let dcrg = avgEmoluments * dcrgFactor;
        // Limit DCRG to 16 Lakhs
        if (dcrg > 1600000) dcrg = 1600000;

        // 5. Total Benefits
        const totalLumpSum = commutationAmount + dcrg;

        // Update Dashboard
        const displayValue = (val) => (val > 0) ? formatCurrency(val) : "";

        if (totalBenefitsHeader) totalBenefitsHeader.textContent = displayValue(totalLumpSum);
        if (commuteHeader) commuteHeader.textContent = displayValue(commutationAmount);
        if (dcrgHeader) dcrgHeader.textContent = displayValue(dcrg);
        if (balanceHeader) balanceHeader.textContent = displayValue(balancePension);
    };

    // Attach listeners
    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // Initial calculation
    calculateAll();
});
