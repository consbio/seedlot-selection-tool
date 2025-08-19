import React, { Component } from 'react'
import { t } from 'ttag'
import Modal from '../../seedsource-ui/components/Modal'
import StyledButton from './StyledButton'
import './IntroTour.scss'

function IntroHeader() {
  return <h4 className="title is-4">{t`Welcome to the Seedlot Selection Tool`}</h4>
}

function IntroText() {
  return (
    <div>
      <p className="content">
        {t`This tool will guide you through the process of selecting appropriate seedlots for your planting sites or finding suitable planting sites for your seedlots based on climatic information.`}
      </p>
      <p className="content">
        {t`The tour will show you the main features and help you get started. You can always access this tour again from the User Guides menu.`}
      </p>
    </div>
  )
}

interface TourStep {
  heading: string
  text: string
  mobileText?: string
  mobileHeading?: string
  targetId: string
  buttons: Array<{
    label: string
    action: () => void
    class?: string
  }>
}

interface IntroTourState {
  mounted: boolean
  showIntro: boolean
  showPopup: boolean
  currentStepNumber: number
  popupWidth: number
  isMobile: boolean
}

class IntroTour extends Component<{}, IntroTourState> {
  private updatePositionTimeout?: number

  constructor(props: {}) {
    super(props)
    this.state = {
      mounted: false,
      showIntro: true,
      showPopup: false,
      currentStepNumber: 0,
      popupWidth: 0,
      isMobile: false,
    }
  }

  componentDidMount() {
    this.setState({ mounted: true })
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    window.addEventListener('restart-intro-tour', this.restartTour)

    // Check localStorage for tour preference
    if (typeof Storage !== 'undefined' && localStorage.getItem('show-intro-tour') === 'false') {
      this.setState({ showIntro: false })
    }
  }

  componentDidUpdate(prevState: IntroTourState) {
    const { currentStepNumber, showPopup } = this.state
    if ((prevState.currentStepNumber !== currentStepNumber || prevState.showPopup !== showPopup) && showPopup) {
      this.updateTourPosition()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkMobile)
    window.removeEventListener('restart-intro-tour', this.restartTour)
    if (this.updatePositionTimeout) {
      clearTimeout(this.updatePositionTimeout)
    }
  }

  get tourSteps(): TourStep[] {
    // TODO: REPLACE WITH ACTUAL TEXT FOR SST
    return [
      {
        heading: t`Step 1: Select Your Location`,
        text: t`Start by clicking on the map or entering coordinates to specify your seedlot or planting site location.`,
        mobileText: t`Tap on the map to select your location for seedlots or planting sites.`,
        targetId: 'location-top',
        buttons: [
          { label: t`Skip Tour`, action: this.endTour },
          { label: t`Next`, action: this.goNext, class: 'featured' },
        ],
      },
      {
        heading: t`Step 2: Choose Time Period`,
        mobileHeading: t`Time Period`,
        text: t`Select the time period for climate data - current, historical, or future scenarios.`,
        targetId: 'time-period-top',
        buttons: [
          { label: t`Skip Tour`, action: this.endTour },
          { label: t`Next`, action: this.goNext, class: 'featured' },
        ],
      },
      {
        heading: t`Step 3: Configure Settings`,
        text: t`Use these controls to configure your analysis parameters and run the tool.`,
        targetId: 'sidebar-btns',
        buttons: [{ label: t`Complete Tour`, action: this.endTour, class: 'featured' }],
      },
    ]
  }

  // Public method to restart the tour from external components
  restartTour = () => {
    this.setState({
      showIntro: true,
      showPopup: false,
      currentStepNumber: 0,
    })
    // Clear the localStorage flag so the tour shows again
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('show-intro-tour')
    }
  }

  checkMobile = () => {
    const isMobile = window.innerWidth <= 768 // Approximate mobile breakpoint
    this.setState({ isMobile })
  }

  notNow = () => {
    this.setState({
      showIntro: false,
      showPopup: false,
    })
    // Save preference to localStorage immediately
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('show-intro-tour', 'false')
    }
  }

  startTour = () => {
    this.setState({
      showIntro: false,
      showPopup: true,
    })
  }

  endTour = () => {
    this.setState({
      showIntro: false,
      showPopup: false,
    })
    // Save preference to localStorage immediately when tour is completed/skipped
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('show-intro-tour', 'false')
    }
  }

  goNext = () => {
    this.setState(prevState => ({
      currentStepNumber: prevState.currentStepNumber + 1,
    }))
  }

  goBack = () => {
    this.setState(prevState => ({
      currentStepNumber: prevState.currentStepNumber - 1,
    }))
  }

  updateTourPosition = async () => {
    const { mounted, isMobile, currentStepNumber } = this.state
    if (!mounted || isMobile) return

    // Use timeout to ensure DOM has updated
    this.updatePositionTimeout = window.setTimeout(() => {
      const tourPopup = document.getElementById('tour-popup')
      const tourPopupRect = tourPopup?.getBoundingClientRect()
      const pointer = document.getElementById('popup-pointer')
      const sidebar = document.getElementById('sidebar-elem')
      const sidebarRect = sidebar?.getBoundingClientRect()
      const target = document.getElementById(this.tourSteps[currentStepNumber].targetId)
      const topPadding = 20
      const bottomPadding = 40

      let exceedsHeight = false
      let pointerTop = 20

      if (target && tourPopupRect && sidebarRect) {
        if (target.offsetTop + tourPopupRect.height - topPadding > sidebarRect.height) {
          exceedsHeight = true
          pointerTop = target.offsetTop - (sidebarRect.height - tourPopupRect.height - bottomPadding)
        }
      }

      // Make sure pointer stays within popup area
      if (pointerTop < 10) {
        pointerTop = 10
      }
      if (tourPopupRect && pointerTop > tourPopupRect.height - bottomPadding) {
        pointerTop = tourPopupRect.height - bottomPadding
      }

      if (exceedsHeight) {
        // Position up from the bottom
        if (tourPopup && sidebar && sidebarRect && tourPopupRect) {
          const topPosition = sidebarRect.height - tourPopupRect.height - bottomPadding
          tourPopup.style.top = `${topPosition}px`
        }
        if (pointer) {
          pointer.style.top = `${pointerTop}px`
        }
      } else if (target) {
        if (tourPopup) {
          const topPosition = target.offsetTop - topPadding
          tourPopup.style.top = `${topPosition}px`
        }
        if (pointer) {
          pointer.style.top = `${pointerTop}px`
        }
      }
    }, 0)
  }

  handlePopupWidthChange = (element: HTMLDivElement | null) => {
    if (element) {
      this.setState({ popupWidth: element.clientWidth })
    }
  }

  render() {
    const { showIntro, showPopup, currentStepNumber, popupWidth, isMobile } = this.state

    const currentStep = this.tourSteps[currentStepNumber]
    const stepButtons = isMobile ? [...currentStep.buttons].reverse() : currentStep.buttons
    const currentStepNum = currentStepNumber + 1
    const totalSteps = this.tourSteps.length

    return (
      <>
        {isMobile && showIntro ? (
          <div className="pre-tour mobile">
            <IntroHeader />
            <IntroText />
            <footer role="group">
              <StyledButton color="primary" label={t`Start Tour`} onClick={this.startTour} classes="intro-button" />
              <StyledButton color="neutral" label={t`Not Now`} onClick={this.notNow} classes="intro-button" />
            </footer>
          </div>
        ) : (
          <Modal active={showIntro} onHide={this.notNow}>
            <div className="modal-card intro-modal">
              <header className="modal-card-head">
                <p className="modal-card-title">
                  <IntroHeader />
                </p>
                <button type="button" className="delete" aria-label={t`close`} onClick={this.notNow} />
              </header>
              <section className="modal-card-body">
                <div className="content">
                  <IntroText />
                </div>
              </section>
              <footer className="modal-card-foot footer">
                <div className="btn-container">
                  <StyledButton color="neutral" label={t`Not Now`} onClick={this.notNow} classes="intro-button" />
                  <StyledButton color="primary" label={t`Start Tour`} onClick={this.startTour} classes="intro-button" />
                </div>
              </footer>
            </div>
          </Modal>
        )}

        <div
          id="tour-popup"
          className={`tour-popup ${!showPopup ? 'hide' : ''} ${isMobile ? 'mobile' : ''}`}
          style={{ '--popupWidth': `${popupWidth}px` } as React.CSSProperties}
        >
          <span className="pointer-triangle" />
          <div className="popup-inner" role="presentation" ref={this.handlePopupWidthChange}>
            <section
              role="dialog"
              aria-modal="true"
              aria-live="polite"
              aria-label={t`Tour step ${currentStepNum} of ${totalSteps}`}
              tabIndex={-1}
              className="container max-width-md"
            >
              <span className="top-section">
                <header>
                  <span className="back-arrow">
                    {currentStepNumber >= 1 && (
                      <button type="button" className="button back-btn" onClick={this.goBack} aria-label={t`Go back`}>
                        ←
                      </button>
                    )}
                  </span>
                  <span>
                    {currentStepNum}/{totalSteps}
                  </span>
                </header>
                <div className="content" role="document">
                  <div className="heading">
                    {isMobile && currentStep.mobileHeading ? currentStep.mobileHeading : currentStep.heading}
                  </div>
                  <div className="text">
                    {isMobile && currentStep.mobileText ? currentStep.mobileText : currentStep.text}
                  </div>
                </div>
              </span>
              <footer role="group">
                {stepButtons.map(button => (
                  <button
                    key={`tour-button-${button.label}`}
                    type="button"
                    className={`button ${button.class || ''}`}
                    onClick={button.action}
                  >
                    {button.label}
                  </button>
                ))}
              </footer>
            </section>
          </div>
        </div>
      </>
    )
  }
}

export default IntroTour
