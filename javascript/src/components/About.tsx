import React from 'react'
import HandsImage from '../../images/hands.jpg'
import ObjectiveImage from '../../images/about_objective.gif'
import LocationImage from '../../images/about_location.gif'
import RegionImage from '../../images/about_region.gif'
import ClimateImage from '../../images/about_climate.gif'
import MethodImage from '../../images/about_method.gif'
import VariablesImage from '../../images/about_variables.gif'
import MapImage from '../../images/about_map.gif'

const About = () => (
  <div>
    <h4 className="title is-4">Planting Healthy Forests</h4>
    <img src={HandsImage} className="about-hands" alt="Hands holding a small tree seedling." />
    <p className="about-text">
      The Seedlot Selection Tool (SST) is a GIS mapping program designed to help forest managers match seedlots with
      planting sites based on climatic information. The climates of the planting sites can be chosen to represent
      current climates, or future climates based on selected climate change scenarios.
    </p>
    <div>&nbsp;</div>
    <div>
      <div className="about-step">
        <img src={ObjectiveImage} alt="A bullseye." />
        <h4 className="title is-4">1. Select Objective</h4>
        <p>You can find seedlots for your planting site or planting sites for your seedlot</p>
      </div>
      <div className="about-step">
        <img src={LocationImage} alt="A pushpin." />
        <h4 className="title is-4">2. Select Location</h4>
        <p>You can click on the map or enter coordinates to locate your seedlot or planting site</p>
      </div>
      <div className="about-step">
        <img src={RegionImage} alt="A map of North America with the western United States highlighted in red." />
        <h4 className="title is-4">3. Select Region</h4>
        <p>You can select the geographic region closest to your site or choose from a list of available regions</p>
      </div>
      <div className="about-step">
        <img src={ClimateImage} alt="A calendar icon showing the year 2050" />
        <h4 className="title is-4">4. Select Climate Scenarios</h4>
        <p>You can select historical, current, or future climates for your seedlots of planting sites</p>
      </div>
      <div className="about-step">
        <img src={MethodImage} alt="A curved, blue arrow." />
        <h4 className="title is-4">5. Select Transfer Limit Method</h4>
        <p>You can enter your own custom limit or use an existing zone to calculate a transfer limit</p>
      </div>
      <div className="about-step">
        <img src={VariablesImage} alt="A cloud with raindrops falling from the bottom, in front of the sun." />
        <h4 className="title is-4">6. Select Climate Variables</h4>
        <p>You can use a variety of climate variables to match your seedlot and planting site</p>
      </div>
      <div className="about-step">
        <img src={MapImage} alt="An icon of the globe." />
        <h4 className="title is-4">7. Map your Results</h4>
        <p>The map shows where to find appropriate seedlots or planting sites</p>
      </div>
    </div>
  </div>
)

export default About
