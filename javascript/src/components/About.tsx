import React from 'react'
import { t } from 'ttag'
import HandsImage from '../../images/hands.jpg'
import ObjectiveImage from '../../images/about_objective.gif'
import LocationImage from '../../images/about_location.gif'
import RegionImage from '../../images/about_region.gif'
import ClimateImage from '../../images/about_climate.gif'
import MethodImage from '../../images/about_method.gif'
import VariablesImage from '../../images/about_variables.gif'
import MapImage from '../../images/about_map.gif'
import FSLogo from '../../images/fs_logo.png'
import OSULogo from '../../images/osu_logo.png'
import CBILogo from '../../images/cbi_logo.png'
import ClimateHubLogo from '../../images/nw_climate_hub_logo.png'

const About = () => (
  <div>
    <h4 className="title is-4">{t`Planting Healthy Forests`}</h4>
    <img src={HandsImage} className="about-hands" alt={t`Hands holding a small tree seedling`} />
    <p className="about-text">
      {t`The Seedlot Selection Tool (SST) is a GIS mapping program designed to help forest managers match seedlots with
        planting sites based on climatic information. The climates of the planting sites can be chosen to represent
        current climates, or future climates based on selected climate change scenarios.`}
    </p>
    <div>&nbsp;</div>
    <div>
      <div className="about-step">
        <img src={ObjectiveImage} alt={t`A bullseye`} />
        <h4 className="title is-4">1. {t`Select Objective`}</h4>
        <p>{t`You can find seedlots for your planting site or planting sites for your seedlot`}</p>
      </div>
      <div className="about-step">
        <img src={LocationImage} alt="A pushpin." />
        <h4 className="title is-4">2. {t`Select Location`}</h4>
        <p>{t`You can click on the map or enter coordinates to locate your seedlot or planting site`}</p>
      </div>
      <div className="about-step">
        <img src={RegionImage} alt={t`A map of North America with the western United States highlighted in red`} />
        <h4 className="title is-4">3. {t`Select Region`}</h4>
        <p>{t`You can select the geographic region closest to your site or choose from a list of available regions`}</p>
      </div>
      <div className="about-step">
        <img src={ClimateImage} alt={t`A calendar icon showing the year 2050`} />
        <h4 className="title is-4">4. {t`Select Climate Scenarios`}</h4>
        <p>{t`You can select historical, current, or future climates for your seedlots of planting sites`}</p>
      </div>
      <div className="about-step">
        <img src={MethodImage} alt={t`A curved, blue arrow`} />
        <h4 className="title is-4">5. {t`Select Transfer Limit Method`}</h4>
        <p>
          {t`You can enter your own custom limit, use an existing zone to calculate a transfer limit, or use a function 
          relating genetic variation to climate to calculate a transfer limit`}
        </p>
      </div>
      <div className="about-step">
        <img src={VariablesImage} alt={t`A cloud with raindrops falling from the bottom, in front of the sun`} />
        <h4 className="title is-4">6. {t`Select Climate Variables`}</h4>
        <p>{t`You can use a variety of climate variables to match your seedlot and planting site`}</p>
      </div>
      <div className="about-step">
        <img src={MapImage} alt={t`An icon of the globe`} />
        <h4 className="title is-4">7. {t`Map your Results`}</h4>
        <p>{t`The map shows where to find appropriate seedlots or planting sites`}</p>
      </div>
    </div>
    <hr />
    <div className="columns">
      <div className="column">
        <a href="http://www.fs.fed.us/" target="_blank" rel="noreferrer">
          <img src={FSLogo} alt={t`United States Forest Service`} />
        </a>
      </div>
      <div className="column">
        <a href="http://oregonstate.edu/" target="_blank" rel="noreferrer">
          <img src={OSULogo} alt={t`Oregon State University`} />
        </a>
      </div>
      <div className="column">
        <a href="http://consbio.org" target="_blank" rel="noreferrer">
          <img src={CBILogo} alt={t`Conservation Biology Institute`} />
        </a>
      </div>
      <div className="column is-half">
        <a href="https://www.climatehubs.oce.usda.gov/hubs/northwest" target="_blank" rel="noreferrer">
          <img src={ClimateHubLogo} alt={t`NW Climate Hub`} />
        </a>
      </div>
    </div>
  </div>
)

export default About
