"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VitalsTrends } from "@/lib/validations/patient";

interface VitalsTrendsChartProps {
  trends: VitalsTrends;
  timeFilter: 24 | 48 | 72 | null;
}

export function VitalsTrendsChart({
  trends,
  timeFilter,
}: VitalsTrendsChartProps) {
  // Helper to format chart data
  const formatChartData = (
    data: Array<{ timestamp: string; value: number }>,
  ) => {
    return data.map((point) => ({
      time: format(new Date(point.timestamp), "MM/dd HH:mm"),
      value: point.value,
      fullTime: new Date(point.timestamp).toLocaleString(),
    }));
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullTime}</p>
          <p className="text-sm text-primary">
            Value:{" "}
            <span className="font-bold">{payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const chartHeight = 300;
  const timeRangeText = timeFilter ? `Last ${timeFilter} Hours` : "All Time";

  return (
    <div className="grid gap-6">
      {/* PaO2 Chart */}
      {trends.pao2.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              PaO2 - Arterial Oxygen Partial Pressure ({timeRangeText})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={formatChartData(trends.pao2)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="PaO2 (mmHg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* PaCO2 Chart */}
      {trends.paco2.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              PaCO2 - Arterial CO2 Partial Pressure ({timeRangeText})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={formatChartData(trends.paco2)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="PaCO2 (mmHg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* pH Chart */}
      {trends.ph.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>pH - Blood pH Level ({timeRangeText})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={formatChartData(trends.ph)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  domain={[6.8, 7.8]}
                  label={{ value: "pH", angle: -90, position: "insideLeft" }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="pH"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lactate Chart */}
      {trends.lactate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Lactate - Blood Lactate Level ({timeRangeText})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={formatChartData(trends.lactate)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "mmol/L",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Lactate (mmol/L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* HCO3 Chart */}
      {trends.hco3.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>HCO3 - Bicarbonate Level ({timeRangeText})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={formatChartData(trends.hco3)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "mmol/L",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="HCO3 (mmol/L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {trends.pao2.length === 0 &&
        trends.paco2.length === 0 &&
        trends.ph.length === 0 &&
        trends.lactate.length === 0 &&
        trends.hco3.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                No vitals data available for the selected time range
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
