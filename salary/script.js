document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');

    // Global variable to store stages for navigation
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

    // Earnings Inputs
    const basicPay = document.getElementById('basic-pay');

    // Ghost Mode Logic
    basicPay.dataset.lastValid = basicPay.value;

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

    basicPay.addEventListener('focus', activateGhostMode);
    basicPay.addEventListener('click', activateGhostMode);
    basicPay.addEventListener('blur', deactivateGhostMode);

    basicPay.addEventListener('keydown', function (e) {
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
    const daPerc = document.getElementById('da-perc');
    const daPendingPerc = document.getElementById('da-pending-perc');
    const hraPerc = document.getElementById('hra-perc');
    const otherEarnings = document.getElementById('other-earnings');

    // Earnings Calculated Displays
    const daVal = document.getElementById('da-val');
    const daPendingVal = document.getElementById('da-pending-val');
    const hraVal = document.getElementById('hra-val');

    // Deductions Inputs
    const gpfSub = document.getElementById('gpf-sub');
    const gis = document.getElementById('gis');
    const sli = document.getElementById('sli');
    const medisep = document.getElementById('medisep');
    const sliLoan = document.getElementById('sli-loan');
    const otherDeductions = document.getElementById('other-deductions');


    // Final Summary Displays
    const grossValDisplay = document.getElementById('gross-salary-val');
    const totalDeductDisplay = document.getElementById('total-deduction-val');
    const netValDisplay = document.getElementById('net-salary-val');

    const grossBottom = document.getElementById('gross-salary-bottom');
    const deductBottom = document.getElementById('total-deduction-bottom');
    const netBottom = document.getElementById('net-salary-bottom');

    function formatCurrency(num) {
        return Math.round(num).toLocaleString('en-IN');
    }

    function calculate() {
        const bp = parseFloat(basicPay.value) || 0;
        const daP = parseFloat(daPerc.value) || 0;
        const dapP = parseFloat(daPendingPerc.value) || 0;
        const hrP = parseFloat(hraPerc.value) || 0;
        const otherEarn = parseFloat(otherEarnings.value) || 0;

        // Calculate individual earnings
        const da = bp * (daP / 100);
        const dap = bp * (dapP / 100);
        const hra = bp * (hrP / 100);

        // Update earnings labels
        daVal.innerText = formatCurrency(da);
        daPendingVal.innerText = formatCurrency(dap);
        hraVal.innerText = formatCurrency(hra);

        // Gross Salary
        const gross = bp + da + dap + hra + otherEarn;
        grossValDisplay.innerText = formatCurrency(gross);

        // Deductions
        const d1 = parseFloat(gpfSub.value) || 0;
        const d2 = parseFloat(gis.value) || 0;
        const d3 = parseFloat(sli.value) || 0;
        const d4 = parseFloat(medisep.value) || 0;
        const d5 = parseFloat(sliLoan.value) || 0;
        const d6 = parseFloat(otherDeductions.value) || 0;


        const totalDeductions = d1 + d2 + d3 + d4 + d5 + d6;
        totalDeductDisplay.innerText = formatCurrency(totalDeductions);

        // Net Salary
        const net = gross - totalDeductions;
        netValDisplay.innerText = formatCurrency(net);

        // Update bottom summaries
        if (grossBottom) grossBottom.innerText = formatCurrency(gross);
        if (deductBottom) deductBottom.innerText = formatCurrency(totalDeductions);
        if (netBottom) netBottom.innerText = formatCurrency(net);
    }

    // Add listeners to all inputs
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();
});
