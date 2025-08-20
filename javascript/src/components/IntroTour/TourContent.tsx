import { t } from 'ttag'

export interface TourStepContent {
  heading: string
  text: string
  mobileText?: string
  mobileHeading?: string
  targetId: string
}

export interface TourStep extends TourStepContent {
  buttons: Array<{
    label: string
    action: () => void
    class?: string
  }>
}

export const introContent = {
  welcome: t`Welcome to the Seedlot Selection Tool`,
  description: t`This tool will guide you through the process of selecting appropriate seedlots for your planting sites or finding suitable planting sites for your seedlots based on climatic information.`,
  getStarted: t`The tour will show you the main features and help you get started. You can always access this tour again from the User Guides menu.`,
}

export const tourStepsContent: TourStepContent[] = [
  {
    heading: t`Step 1: Select Your Location`,
    text: t`Start by clicking on the map or entering coordinates to specify your seedlot or planting site location.`,
    mobileText: t`Tap on the map to select your location for seedlots or planting sites.`,
    targetId: 'location-top',
  },
  {
    heading: t`Step 2: Choose Time Period`,
    mobileHeading: t`Time Period`,
    text: t`Select the time period for climate data - current, historical, or future scenarios.`,
    targetId: 'time-period-top',
  },
  {
    heading: t`Step 3: Configure Settings`,
    text: t`Use these controls to configure your analysis parameters and run the tool.`,
    targetId: 'sidebar-btns',
  },
]
