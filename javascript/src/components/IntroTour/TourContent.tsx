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
    heading: t`Step 1: Select Objective`,
    mobileHeading: t`Objective`,
    text: t`Choose whether you want to find seedlots for your planting site or find planting sites for your seedlot.`,
    mobileText: t`Select your objective: find seedlots or find planting sites.`,
    targetId: 'objective-step',
  },
  {
    heading: t`Step 2: Select Location`,
    mobileHeading: t`Location`,
    text: t`Click on the map or enter coordinates to specify your seedlot or planting site location.`,
    mobileText: t`Tap on the map to select your location for seedlots or planting sites.`,
    targetId: 'location-step',
  },
  {
    heading: t`Step 3: Select Region`,
    mobileHeading: t`Region`,
    text: t`Choose the geographic region that contains your area of interest for the analysis.`,
    mobileText: t`Select the region for your analysis.`,
    targetId: 'region-step',
  },
  {
    heading: t`Step 4: Select Climate Scenarios`,
    mobileHeading: t`Climate Scenarios`,
    text: t`Choose the time period for climate data - current, historical, or future climate scenarios.`,
    mobileText: t`Select time period for climate data.`,
    targetId: 'climate-step',
  },
  {
    heading: t`Step 5: Select Transfer Limit Method`,
    mobileHeading: t`Transfer Limits`,
    text: t`Choose how to determine transfer limits: Custom (user-defined) or Zone (based on existing zones).`,
    mobileText: t`Select transfer limit method.`,
    targetId: 'transfer-step',
  },
  {
    heading: t`Step 6: Select Climate Variables`,
    mobileHeading: t`Climate Variables`,
    text: t`Choose which climate variables to include in your analysis and set their transfer limits.`,
    mobileText: t`Select climate variables for analysis.`,
    targetId: 'variable-step',
  },
  {
    heading: t`Step 7: Apply Constraints`,
    mobileHeading: t`Constraints`,
    text: t`Optionally apply geographic or elevation constraints to refine your results.`,
    mobileText: t`Apply optional constraints to results.`,
    targetId: 'constraint-step',
  },
  {
    heading: t`Step 8: Map Your Results`,
    mobileHeading: t`Results`,
    text: t`Click "Run Tool" to generate a map showing suitable seedlots or planting sites based on your configuration.`,
    mobileText: t`Run the tool to generate your results map.`,
    targetId: 'run-step',
  },
]
