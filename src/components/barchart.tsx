import { useEffect } from 'react';
import Chart from 'chart.js/auto';

export const BarChartComponent = ({ data }) => {
    useEffect(() => {
        const canvas = document.getElementById('myChart') as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const labels = data.map(item => item.initials);
        const bkdValues = data.map(item => item.bkd);

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'BKD',
                    data: bkdValues,
                    backgroundColor: bkdValues.map(value => value < 4 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)'),  // Red if less than 4, otherwise blue
                    borderColor: bkdValues.map(value => value < 4 ? 'rgba(255, 99, 132, 1)' : 'rgba(53, 162, 235, 1)'),  // Match border color
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            myChart.destroy();
        };
    }, [data]);

    
    return <div className='max-h-72'><canvas id="myChart" width="400" height="400"></canvas></div>
};

export default BarChartComponent;
