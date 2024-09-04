import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axiosInstance from '../utils/axiosInstance';

// Register all necessary components with Chart.js
Chart.register(...registerables);

const BarGraph = () => {
    const [chartData, setChartData] = useState(null);  // Initialize as null
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosInstance.get('/api/media-stats/')
            .then((response) => {
                const data = response.data;
                
                // Mapping of real department names to display names
                const departmentMapping = {
                    'Digital Bharat Nidhi': 'Digital Bharat Nidhi',
                    'BSNL': 'BSNL',
                    'NBM': 'NBM'
                };

                // Initialize arrays for chart data
                const weeklyImages = [];
                const weeklyApprovedImages = [];
                const weeklyVideos = [];
                const weeklyApprovedVideos = [];
                const displayLabels = [];

                // Fetch data by real department names and use mapped display names
                Object.keys(departmentMapping).forEach(realDeptName => {
                    const deptData = data[realDeptName]?.weekly_data || {
                        total_images: 0,
                        approved_images: 0,
                        total_videos: 0,
                        approved_videos: 0,
                    };

                    weeklyImages.push(deptData.total_images);
                    weeklyApprovedImages.push(deptData.approved_images);
                    weeklyVideos.push(deptData.total_videos);
                    weeklyApprovedVideos.push(deptData.approved_videos);

                    // Add the display name to the labels
                    displayLabels.push(departmentMapping[realDeptName]);
                });

                setChartData({
                    labels: displayLabels,
                    datasets: [
                        {
                            label: 'Weekly Images',
                            data: weeklyImages,
                            backgroundColor: 'rgba(75, 192, 227, 0.6)',
                        },
                        {
                            label: 'Weekly Approved Images',
                            data: weeklyApprovedImages,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        },
                        {
                            label: 'Weekly Videos',
                            data: weeklyVideos,
                            backgroundColor: 'rgba(213, 218, 254, 0.6)',
                        },
                        {
                            label: 'Weekly Approved Videos',
                            data: weeklyApprovedVideos,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }
                    ]
                });
            })
            .catch(error => {
                console.error('Error fetching the data:', error);
                setError('Error fetching the data');
            });
    }, []);

    return (
        <div>
            {error ? (
                <p>{error}</p>
            ) : (
                chartData && (
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                )
            )}
        </div>
    );
};

export default BarGraph;
