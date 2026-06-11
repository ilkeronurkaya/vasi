
export interface Stats {
  total_users: number;
  active_users: number;
  paid_subs: number;
  total_delivered: number;
  total_failed: number;
  messages_today: number;
  delivery_rate_pct?: number;
}

export interface Plan {
  plan_type: string;
  user_count: number;
}
