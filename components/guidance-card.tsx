'use client'

import { Card } from '@/components/ui/card'

interface GuidanceCardProps {
  title: string
  content: string
  icon?: React.ReactNode
}

export function GuidanceCard({ title, content, icon }: GuidanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700/50 p-6">
      <div className="flex gap-4">
        {icon && <div className="text-3xl flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">{title}</h3>
          <p className="text-purple-100 leading-relaxed">{content}</p>
        </div>
      </div>
    </Card>
  )
}
