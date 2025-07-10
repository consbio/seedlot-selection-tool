import React from 'react'
import { jt, t } from 'ttag'
import SSTCollage from '../../images/sst-collage.png'
import SSTInstructions from '../../documents/SST User Guide.pdf'
import SSTInstructionsESMX from '../../documents/translations/es_MX/SST User Guide.pdf'
import SSTSilviculturistsGuide from '../../documents/SST R6 Silviculturists Guide.pdf'
import { getCookies } from '../seedsource-ui/utils'
import FSLogo from '../../images/usfs_logo.png'
import OSULogo from '../../images/osu_logo.png'
import CBILogo from '../../images/cbi_logo.png'
import ClimateHubLogo from '../../images/nw_climate_hub_logo.png'
import BLMLogo from '../../images/blm_logo.png'
import GBNPPLogo from '../../images/gbnpp_logo.png'

const About = () => {
  const cookies = getCookies()
  const manual = cookies.django_language === 'es-mx' ? SSTInstructionsESMX : SSTInstructions

  return (
    <>
      <div>
        <h4 className="title is-4">{t`Planting for the future`}</h4>
        <img
          src={SSTCollage}
          alt={t`Four images arranged in a square. Clockwise from top-left: a hand holding a bunch of small seeds; a 
      clear-cut hillside; several flowering sagebrush; conifer trees in a mist.`}
        />
        <p className="about-text">
          {t`Over a century of genetic research has shown that environment, in particularly climate, strongly affects plant 
      genetic adaptation and the geography distance seed can be moved from its source location. The Seedlot Selection 
      Tool (SST) is a GIS mapping program designed to provide information on seed collection and transfer of native 
      plants and help forest managers match seedlots with planting sites based on climatic information.`}
        </p>
        <p className="about-text">
          {t`The climates of the planting sites and seedlots can be chosen to represent current climates, or future 
      climates based on selected climate change scenarios.`}
        </p>
        <p>&nbsp;</p>
        <h5 className="title is-5">{t`Getting Started`}</h5>
        <p className="about-text content">
          {(() => {
            const tool = <strong>{t`Tool`}</strong>
            return jt`Click the ${tool} tab to get started. To learn more about how to use this 
              tool, refer to one of the available guides:`
          })()}
          <ul>
            <li>
              {(() => {
                const basicGuide = (
                  <a href={manual} target="_blank" rel="noopener noreferrer">
                    {t`Basic Guide`}
                  </a>
                )
                return jt`The ${basicGuide} provides information about the features, functionality, and internal 
                  calculations of the tool.`
              })()}
            </li>
            <li>
              {(() => {
                const silviculturistsGuide = (
                  <a href={SSTSilviculturistsGuide} target="_blank" rel="noopener noreferrer">
                    {t`Silviculturists Guide`}
                  </a>
                )
                return jt`The ${silviculturistsGuide} demonstrates how to use the tool for silviculturists working in 
                  the Pacific Northwest`
              })()}
            </li>
          </ul>
        </p>
      </div>
      <hr />
      <div className="columns logos">
        <div className="column">
          <a href="http://www.fs.fed.us/" target="_blank" rel="noreferrer">
            <img src={FSLogo} alt={t`United States Forest Service`} />
          </a>
        </div>
        <div className="column">
          <a href="https://www.blm.gov/" target="_blank" rel="noreferrer">
            <img src={BLMLogo} alt={t`Bureau of Land Management`} style={{ maxHeight: '50px' }} />
          </a>
        </div>
        <div className="column">
          <a href="http://oregonstate.edu/" target="_blank" rel="noreferrer">
            <img src={OSULogo} alt={t`Oregon State University`} />
          </a>
        </div>
        <div className="column">
          <a href="http://www.greatbasinnpp.org/" target="_blank" rel="noreferrer">
            <img src={GBNPPLogo} alt={t`Great Basin Native Plant Project`} style={{ maxHeight: '50px' }} />
          </a>
        </div>
        <div className="column">
          <a href="http://consbio.org" target="_blank" rel="noreferrer">
            <img src={CBILogo} alt={t`Conservation Biology Institute`} />
          </a>
        </div>
      </div>
      <div className="columns">
        <div className="column is-half">
          <a href="https://www.climatehubs.oce.usda.gov/hubs/northwest" target="_blank" rel="noreferrer">
            <img src={ClimateHubLogo} alt={t`NW Climate Hub`} />
          </a>
        </div>
      </div>
    </>
  )
}

export default About
