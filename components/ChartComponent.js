// frontend/components/ChartComponent.js
import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Optional plugin for labels on each bar
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

import { Bar } from 'react-chartjs-2';

const ChartComponent = ({ data, options }) => {
  // Some interactive defaults
  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Project Timeline (days)'
      },
      tooltip: {
        callbacks: {
          // Example: show "Duration: X days" in the tooltip
          label: function(context) {
            return `Duration: ${context.parsed.y} days`;
          }
        }
      },
      datalabels: {
        // Show value labels on each bar
        anchor: 'end',
        align: 'top',
        formatter: (value) => `${value}d`,
        font: { weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Start Date'
        }
      }
    },
    // Example onClick to handle bar clicks
    onClick: (event, elements) => {
      if (!elements.length) return;
      const { datasetIndex, index } = elements[0];
      const barValue = data.datasets[datasetIndex].data[index];
      const barLabel = data.labels[index];
      alert(`Clicked bar!\nLabel: ${barLabel}\nValue: ${barValue} days`);
    }
  };

  // Merge any "options" prop with our defaults
  const mergedOptions = {
    ...defaultOptions,
    ...options
  };

  return <Bar data={data} options={mergedOptions} />;
};

export default ChartComponent;
