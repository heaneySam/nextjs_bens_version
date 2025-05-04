import React from 'react';
// Import the specific table component, adjusting the name
import CreditPoliticalRiskTable from './credit_political_risks_table'; 
import type { CreditRiskEntry } from './credit_political_risks_table';

// TODO: Import other components specific to Credit & Political Risk later
// import SummaryCards from './SummaryCards';
// import RiskCharts from './RiskCharts';

// Define the props this component receives
interface RiskDashboardContentProps {
  fetchedData: CreditRiskEntry[]; // Use the imported type
  riskClass: string; // Add riskClass prop here
}

// Accept fetchedData and riskClass in the function signature
export default function RiskDashboardContent({ fetchedData, riskClass }: RiskDashboardContentProps) {
  // This component arranges the specific UI parts for Credit & Political Risk
  return (
    <div className="space-y-6">
      {/* Render the specific data table */}
      {/* Pass the received fetchedData and riskClass props to the table */}
      <CreditPoliticalRiskTable fetchedData={fetchedData} riskClass={riskClass} />

      {/* TODO: Render other components like charts, summaries, etc. */}
      {/* <SummaryCards data={fetchedData?.summary} /> */}
      {/* <RiskCharts data={fetchedData?.chartData} /> */}

      {/* You can add more layout structure here as needed */}
    </div>
  );
}

RiskDashboardContent.displayName = "RiskDashboardContent";
