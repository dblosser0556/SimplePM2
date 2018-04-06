export interface SeriesData {
    name: string;
    value: number;
}

export interface ChartData {
    name: string;
    series: SeriesData[];
}

