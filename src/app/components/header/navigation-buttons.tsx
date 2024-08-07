import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/ui/button'
import useNavigationHistory from '@/app/hooks/use-navigation-history'

export function NavigationButtons() {
  const navigate = useNavigate()
  const { canGoBack, canGoForward } = useNavigationHistory()

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-md"
        disabled={!canGoBack}
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 rounded-md"
        disabled={!canGoForward}
        onClick={() => navigate(1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
