// Data structure types based on the bot's file formats

export interface Position {
  symbol: string;
  open_quantity: string; // Bot uses 'open_quantity', not 'open_qty'
  total_cost: string;
  avg_cost?: string; // May not be present in positions_current.json
  price?: string;
  market_value?: string;
  unrealized_pl?: string;
}

export interface PositionsCurrent {
  updated_at: string;
  base_currency: string;
  total_quote_invested: string;
  positions: Position[];
}

export interface SnapshotPosition {
  symbol: string;
  open_qty: string; // Snapshots use 'open_qty'
  total_cost: string;
  avg_cost: string;
  price: string;
  market_value: string;
  unrealized_pl: string;
}

export interface Snapshot {
  ts: string;
  base_currency: string;
  total_quote_invested: string;
  total_market_value: string;
  total_unrealized_pl: string;
  positions: SnapshotPosition[];
}

export interface PriceLine {
  ts: string;
  symbol: string;
  price: string;
  source: string;
  iteration_id: string;
}

export interface TransactionLine {
  ts: string;
  exchange: string;
  symbol: string;
  side: string;
  price: string;
  qty: string;
  quote_spent: string;
  order_type: string;
  iteration_id: string;
  filters_validated: boolean;
  notes: string;
}

export interface IterationLine {
  iteration_id: string;
  started_at: string;
  ended_at: string;
  assets_total: number;
  buys_executed: number;
  status: string;
  notes: string;
}

// UI state types
export interface TimeRange {
  label: string;
  value: string;
  hours?: number;
}

export interface ChartDataPoint {
  ts: string;
  timestamp: number;
  totalInvested: number;
  totalMarketValue: number;
  totalUnrealizedPl: number;
}

export interface SymbolChartData {
  symbol: string;
  data: ChartDataPoint[];
}

// Configuration types
export interface AppConfig {
  dataBasePath: string;
}

// Error types are now implemented as classes in fileReaders.ts