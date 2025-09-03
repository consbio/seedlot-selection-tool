import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { t } from 'ttag'
import Modal from '../../seedsource-ui/components/Modal'
import { selectTab } from '../../seedsource-ui/actions/tabs'
import { tourStepsContent, introContent, TourStep } from './TourContent'
import './IntroTour.scss'

function IntroHeader() {
  return <h4 className="title is-4">{introContent.welcome}</h4>
}

function IntroText() {
  return (
    <div>
      <p className="content">{introContent.description}</p>
      <p className="content">{introContent.getStarted}</p>
    </div>
  )
}

interface IntroTourState {
  mounted: boolean
  showIntro: boolean
  showPopup: boolean
  currentStepNumber: number
  popupWidth: number
  isMobile: boolean
}

const initialPopupTop = 122
let popupTop = initialPopupTop

const connector = connect(null, (dispatch: (action: any) => any) => {
  return {
    onSelectTab: (tab: string) => {
      dispatch(selectTab(tab))
    },
  }
})

type IntroTourProps = ConnectedProps<typeof connector>

class IntroTour extends Component<IntroTourProps, IntroTourState> {
  private updatePositionTimeout?: number

  constructor(props: IntroTourProps) {
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
    window.addEventListener('announcement-dismissed', this.handleAnnouncementDismissed)

    // Check localStorage for tour preference
    if (typeof Storage !== 'undefined' && localStorage.getItem('show-intro-tour') === 'false') {
      this.setState({ showIntro: false })
    } else {
      this.checkIfAnnouncementWillShow()
    }
  }

  componentDidUpdate(prevProps: IntroTourProps, prevState: IntroTourState) {
    const { currentStepNumber, showPopup } = this.state
    if ((prevState.currentStepNumber !== currentStepNumber || prevState.showPopup !== showPopup) && showPopup) {
      this.updateTourPosition()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkMobile)
    window.removeEventListener('restart-intro-tour', this.restartTour)
    window.removeEventListener('announcement-dismissed', this.handleAnnouncementDismissed)
    if (this.updatePositionTimeout) {
      clearTimeout(this.updatePositionTimeout)
    }
  }

  get tourSteps(): TourStep[] {
    return tourStepsContent.map((stepContent, index) => {
      const isLastStep = index === tourStepsContent.length - 1

      const buttons = isLastStep
        ? [{ label: t`Complete Tour`, action: this.endTour, class: 'featured' }]
        : [
            { label: t`Leave Tour`, action: this.endTour, class: 'basic' },
            { label: t`Next`, action: this.goNext, class: 'featured' },
          ]

      return {
        ...stepContent,
        buttons,
      }
    })
  }

  restartTour = () => {
    this.setState({
      showIntro: true,
      showPopup: false,
      currentStepNumber: 0,
    })
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('show-intro-tour')
    }
  }

  checkMobile = () => {
    const isMobile = window.innerWidth <= 768 // Approximate mobile breakpoint
    this.setState({ isMobile })
  }

  checkIfAnnouncementWillShow = () => {
    const announcementID = 'new-future-data'
    const announcementWillShow = !localStorage.getItem(announcementID)

    if (announcementWillShow) {
      this.setState({ showIntro: false })
    }
  }

  handleAnnouncementDismissed = () => {
    if (typeof Storage !== 'undefined' && localStorage.getItem('show-intro-tour') !== 'false') {
      this.setState({ showIntro: true })
    }
  }

  notNow = () => {
    popupTop = initialPopupTop

    this.setState({
      showIntro: false,
      showPopup: false,
    })
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('show-intro-tour', 'false')
    }
  }

  startTour = () => {
    this.setState({
      showIntro: false,
      showPopup: true,
    })
    this.props.onSelectTab('tool')
  }

  endTour = () => {
    popupTop = initialPopupTop

    this.setState({
      showIntro: false,
      showPopup: false,
    })
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

    this.updatePositionTimeout = window.setTimeout(() => {
      const tourPopup = document.getElementById('tour-popup')
      const configurationSteps = document.getElementsByClassName('configuration-step')

      if (!tourPopup) {
        return
      }

      if (configurationSteps.length === 0) {
        return
      }

      const stepIndex = currentStepNumber
      if (stepIndex >= 0 && stepIndex < configurationSteps.length) {
        const targetStep = configurationSteps[stepIndex] as HTMLElement

        // Check if scrolling is needed before deciding on timing
        const stepRect = targetStep.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const scrollPadding = 50
        const stepTop = stepRect.top
        const stepBottom = stepRect.bottom
        const isStepVisible = stepTop >= scrollPadding && stepBottom <= viewportHeight - scrollPadding

        if (isStepVisible) {
          // Step is already visible - position modal immediately for quick response
          const tourPopupRect = tourPopup.getBoundingClientRect()
          const targetStepTop = stepRect.top + window.scrollY
          const popupHeight = tourPopupRect.height
          const viewportPadding = 10
          const maxPopupTop = viewportHeight + window.scrollY - popupHeight - viewportPadding

          const desiredPopupTop = targetStepTop - 20
          const newPopupTop = Math.min(desiredPopupTop, maxPopupTop)
          const modalShift = desiredPopupTop - newPopupTop
          const arrowOffset = 20 + modalShift
          const finalArrowOffset = Math.max(10, Math.min(arrowOffset, popupHeight - 40))

          // Apply positioning immediately
          tourPopup.style.top = `${newPopupTop}px`
          popupTop = newPopupTop

          const arrow = document.querySelector('.pointer-triangle') as HTMLElement
          if (arrow) {
            arrow.style.top = `${finalArrowOffset}px`
          }
        } else {
          // Step needs scrolling - use scroll-first approach with delay
          targetStep.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })

          // Wait for scroll to complete, then calculate and apply positioning
          setTimeout(() => {
            const updatedStepRect = targetStep.getBoundingClientRect()
            const updatedTourPopupRect = tourPopup.getBoundingClientRect()

            const updatedTargetStepTop = updatedStepRect.top + window.scrollY
            const updatedPopupHeight = updatedTourPopupRect.height
            const updatedViewportHeight = window.innerHeight
            const updatedViewportPadding = 10
            const updatedMaxPopupTop =
              updatedViewportHeight + window.scrollY - updatedPopupHeight - updatedViewportPadding

            const updatedDesiredPopupTop = updatedTargetStepTop - 20
            const updatedNewPopupTop = Math.min(updatedDesiredPopupTop, updatedMaxPopupTop)
            const updatedModalShift = updatedDesiredPopupTop - updatedNewPopupTop
            const updatedArrowOffset = 20 + updatedModalShift
            const updatedMaxArrowOffset = updatedPopupHeight - 40
            const updatedFinalArrowOffset = Math.max(10, Math.min(updatedArrowOffset, updatedMaxArrowOffset))

            // Apply final positioning after scroll
            tourPopup.style.top = `${updatedNewPopupTop}px`
            popupTop = updatedNewPopupTop

            const arrow = document.querySelector('.pointer-triangle') as HTMLElement
            if (arrow) {
              arrow.style.top = `${updatedFinalArrowOffset}px`
            }
          }, 300) // Wait for scroll animation to complete
        }
      } else {
        // Fallback - use first or last step
        const fallbackIndex = stepIndex < 0 ? 0 : configurationSteps.length - 1
        const fallbackStep = configurationSteps[fallbackIndex] as HTMLElement

        // Check if fallback step needs scrolling
        const fallbackRect = fallbackStep.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const scrollPadding = 50
        const fallbackTop = fallbackRect.top
        const fallbackBottom = fallbackRect.bottom
        const isFallbackVisible = fallbackTop >= scrollPadding && fallbackBottom <= viewportHeight - scrollPadding

        if (isFallbackVisible) {
          // Fallback step is visible - position immediately
          const tourPopupRect = tourPopup.getBoundingClientRect()
          const targetStepTop = fallbackRect.top + window.scrollY
          const popupHeight = tourPopupRect.height
          const viewportPadding = 10
          const maxPopupTop = viewportHeight + window.scrollY - popupHeight - viewportPadding

          const desiredPopupTop = targetStepTop - 20
          const newFallbackTop = Math.min(desiredPopupTop, maxPopupTop)
          const modalShift = desiredPopupTop - newFallbackTop
          const arrowOffset = 20 + modalShift
          const finalArrowOffset = Math.max(10, Math.min(arrowOffset, popupHeight - 40))

          // Apply positioning immediately
          tourPopup.style.top = `${newFallbackTop}px`
          popupTop = newFallbackTop

          const arrow = document.querySelector('.pointer-triangle') as HTMLElement
          if (arrow) {
            arrow.style.top = `${finalArrowOffset}px`
          }
        } else {
          // Fallback step needs scrolling - use scroll-first approach
          fallbackStep.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })

          // Wait for scroll to complete, then calculate and apply positioning
          setTimeout(() => {
            const updatedFallbackRect = fallbackStep.getBoundingClientRect()
            const updatedTourPopupRect = tourPopup.getBoundingClientRect()

            const updatedTargetStepTop = updatedFallbackRect.top + window.scrollY
            const updatedPopupHeight = updatedTourPopupRect.height
            const updatedViewportHeight = window.innerHeight
            const updatedViewportPadding = 10
            const updatedMaxPopupTop =
              updatedViewportHeight + window.scrollY - updatedPopupHeight - updatedViewportPadding

            const updatedDesiredPopupTop = updatedTargetStepTop - 20
            const updatedFallbackTop = Math.min(updatedDesiredPopupTop, updatedMaxPopupTop)
            const updatedModalShift = updatedDesiredPopupTop - updatedFallbackTop
            const updatedArrowOffset = 20 + updatedModalShift
            const updatedFinalArrowOffset = Math.max(10, Math.min(updatedArrowOffset, updatedPopupHeight - 40))

            // Apply final positioning after scroll
            tourPopup.style.top = `${updatedFallbackTop}px`
            popupTop = updatedFallbackTop

            const arrow = document.querySelector('.pointer-triangle') as HTMLElement
            if (arrow) {
              arrow.style.top = `${updatedFinalArrowOffset}px`
            }
          }, 300) // Wait for scroll animation to complete
        }
      }
    }, 10)
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
              <button type="button" className="button is-primary intro-button" onClick={this.startTour}>
                {t`Start Tour`}
              </button>
              <button type="button" className="button intro-button" onClick={this.notNow}>
                {t`Not Now`}
              </button>
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
                  <button type="button" className="button intro-button" onClick={this.notNow}>
                    {t`Not Now`}
                  </button>
                  <button type="button" className="button is-primary intro-button" onClick={this.startTour}>
                    {t`Start Tour`}
                  </button>
                </div>
              </footer>
            </div>
          </Modal>
        )}

        <div
          id="tour-popup"
          className={`tour-popup ${!showPopup ? 'hide' : ''} ${isMobile ? 'mobile' : ''}`}
          style={{ '--popupWidth': `${popupWidth}px`, 'top': `${popupTop}px` } as React.CSSProperties}
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

export default connector(IntroTour)
