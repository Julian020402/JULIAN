
export enum EventType {
  VIEW = 'view',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  SIGNUP = 'signup'
}

export interface RawEvent {
  user_id?: string;
  event_type?: string;
  revenue?: string | number;
  country?: string;
  currency?: string;
  device?: string;
  timestamp?: string;
}

export interface CleanedEvent {
  user_id: string;
  event_type: EventType;
  revenue: number;
  country: string;
  currency: string;
  device: string;
  timestamp: Date;
}

export interface CleaningLog {
  duplicatesRemoved: number;
  nullsHandled: number;
  casingFixed: number;
  invalidDropped: number;
}

export interface AggregationResults {
  revenueByCountry: { country: string; totalRevenue: number }[];
  arpu: number;
}
