import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import CustomTooltip from './CustomTooltip';
import CustomLegend from './CustomLegend';

const CustomPieChart = ({
    data = [],
    label,
    totalAmount,
    colors = [],
    showTextAnchor,
}) => {
    const hasPositiveData =
        Array.isArray(data) &&
        data.some((item) => Number(item?.amount || 0) > 0);

    if (!hasPositiveData) {
        return (
            <div className="h-[340px] flex flex-col items-center justify-center text-center px-4">
                {showTextAnchor && (
                    <div className="mb-2">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-xl font-semibold text-gray-800 mt-0.5">{totalAmount}</p>
                    </div>
                )}
                <p className="text-sm text-gray-400">Add transactions to visualize this breakdown.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={380}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={100}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${entry.name || index}`}
                            fill={colors[index % colors.length]}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />

                {showTextAnchor && (
                    <>
                        <text
                            x="50%"
                            y="50%"
                            dy={-25}
                            textAnchor="middle"
                            fill="#666"
                            fontSize="14px"
                        >
                            {label}
                        </text>

                        <text
                            x="50%"
                            y="50%"
                            dy={8}
                            textAnchor="middle"
                            fill="#333"
                            fontSize="22px"
                            fontWeight="600"
                        >
                            {totalAmount}
                        </text>
                    </>
                )}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomPieChart;
