'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Plan } from '@/types'
import { planLabel } from '@/lib/plans'

const COLORS = ['var(--copper)', 'var(--mist)']

export default function PlanDistributionChart({ plans }: { plans: Plan[] }) {
  const data = plans.map(p => ({
    name: planLabel[p.plan_type] || p.plan_type,
    value: p.user_count,
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: 'var(--midnight)', border: '1px solid var(--horizon)' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
