document.addEventListener('DOMContentLoaded', function() {
    // ----------------------- Earning statistics Start ------------------
    const ctx = document.getElementById('vendorearningChart').getContext('2d');

    const earningData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: [1.5, 2.0, 1.8, 3.0, 2.5, 4.0, 3.8, 4.2, 3.5, 4.5, 4.0, 5.0], 
                borderColor: '#27ae60', 
                borderWidth: 2,
                pointBackgroundColor: '#27ae60',
                pointBorderColor: '#27ae60',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4
            },
            // --- new datasate for commision given
            {
                label: 'Commission given',
                data: [0.5, 0.8, 0.6, 1.2, 1.0, 1.5, 1.4, 1.6, 1.3, 1.8, 1.5, 2.0], 
                borderColor: '#0de81c3b',
                borderWidth: 2,
                pointBackgroundColor: '#0de81c3b',
                pointBorderColor: '#0de81c3b',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4
            }
        ]
    };

    const config = {
        type: 'line',
        data: earningData,
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0, max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: value => '$' + value,
                        color: '#6c757d', font: { family: "'Poppins', sans-serif" }
                    },
                    grid: { color: '#dee2e6', borderDash: [5, 5] }
                },
                x: {
                    ticks: { color: '#6c757d', font: { family: "'Poppins', sans-serif" } },
                    grid: { display: false, drawBorder: false }
                }
            }
        }
    };

    // chart put on instant variable
    const vendorearningChart = new Chart(ctx, config);

    // legend button clickable
    const legendItems = [
        document.getElementById('legend-income'),
        document.getElementById('legend-commission')
    ];

    legendItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // dataset visibility toggle
            const isVisible = vendorearningChart.isDatasetVisible(index);
            if (isVisible) {
                vendorearningChart.hide(index);
            } else {
                vendorearningChart.show(index);
            }
            
            // style add for legend item
            item.classList.toggle('hidden');
        });
    });
    // ----------------------- Earning statistics End ------------------
});