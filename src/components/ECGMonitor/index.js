import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { Loading } from '../Loading';

const ECGMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [ecgData, setEcgData] = useState({ labels: [], data: [] });
  const [displayData, setDisplayData] = useState({ labels: [], data: [] });
  const [startIndex, setStartIndex] = useState(0);
  const windowSize = 1000; 
  const updateInterval = 10; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const timestamps = [];
        const samples = [];

        json.data.forEach(entry => {
          const time = entry.ecg.Timestamp;
          entry.ecg.Samples.forEach((sample, index) => {
            timestamps.push(time + index * 1000 / 250); 
            samples.push(sample);
          });
        });

        setEcgData({ labels: timestamps, data: samples });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ECG data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStartIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % ecgData.labels.length;
        const endIndex = Math.min(newIndex + windowSize, ecgData.labels.length);
        setDisplayData({
          labels: ecgData.labels.slice(newIndex, endIndex),
          data: ecgData.data.slice(newIndex, endIndex),
        });
        return newIndex;
      });
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [ecgData, windowSize, updateInterval]);

  const chartData = {
    labels: displayData.labels,
    datasets: [
      {
        label: 'ECG Signal',
        data: displayData.data,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: true,
        pointRadius: 0, 
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude',
        },
      },
    },
    animation: {
      duration: 0, 
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.raw.toFixed(2); 
            return label;
          },
          title: function (context) {
            
            const time = Number(context[0].label);
            return 'Time: ' + (isNaN(time) ? context[0].label : time.toFixed(2)) + ' ms';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
  };

  return (
    <div>
      <h1>ECG Monitor</h1>
      {loading ? (
        <Loading />
      ) : (
        <div style={{ width: '800px', height: '400px' }} className="ecg">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ECGMonitor;
