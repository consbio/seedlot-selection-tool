import React from 'react'
import { t, c, jt } from 'ttag'
import ModalCard from 'seedsource-ui/lib/components/ModalCard'
import Background1 from '../../images/background1.jpg'
import Background2 from '../../images/background2.jpg'
import FSLogo from '../../images/fs_logo.png'
import OSULogo from '../../images/osu_logo.png'
import CBILogo from '../../images/cbi_logo.png'
import ClimateHubLogo from '../../images/nw_climate_hub_logo.png'
import ClimateWNA from '../../documents/ClimateWNA.pdf'
import SSTInstructions from '../../documents/SST Instructions.pdf'

class Menu extends React.Component {
  backgroundModal?: ModalCard

  climatenaModal?: ModalCard

  peopleModal?: ModalCard

  newsModal?: ModalCard

  issueModal?: ModalCard

  render() {
    return (
      <>
        <div className="has-text-dark is-size-6" key="modals">
          <ModalCard
            ref={(input: ModalCard) => {
              this.backgroundModal = input
            }}
            title={t`Background`}
          >
            <img
              src={Background1}
              className="is-pulled-left margin-right-5"
              alt={t`Trees on a hillside enveloped in fog`}
            />
            <p>
              {t`Populations of forest trees and other native plants are genetically different from each other, and 
                adapted to different climatic conditions. Therefore, natural resource managers must match the climatic
                adaptability of their plant materials to the climatic conditions of their planting sites. Generally, 
                local populations are optimally adapted to their local climates, or nearly so. Thus, local seed sources 
                are usually recommended for reforestation and restoration. Typically, this has been accomplished using
                geographically defined zones (e.g., seed zones or breeding zones) or seed transfer rules that specify a
                geographic or climatic distance beyond which populations should not be moved. However, these
                recommendations assume that climates are stable over the long-term—an assumption that is unlikely given
                projected climate change. Because populations are genetically adapted to their local climates, the 
                health and productivity of native or newly established ecosystems will likely decline as climates 
                change. Climate models are now available that can be used to define zones based on climate rather than 
                geography, or calculate climatically based seed transfer limits. Once climatic transfer limits have 
                been defined, natural resource managers can explore options for responding to climate change through 
                assisted migration.`}
            </p>
            <p>
              {t`To match seedlots and planting sites, it is first necessary to choose appropriate climate variables. 
                This information can come from genecology studies, which are used to understand how seed source climates
                influences adaptive trait variation among populations via natural selection. In general, genetic studies
                indicate that temperate plants are adapted to temperature—especially cold temperatures during the 
                winter, warm temperatures during the summer, and moisture related variables such as precipitation and
                heat:moisture index.`}
            </p>
            <img
              src={Background2}
              className="is-pulled-right margin-left-5 "
              alt={t`A clear-cut hillside in the foreground, a wooded hillside in the background`}
            />
            <p>
              {t`Once important climate variables are selected, it is necessary to decide on transfer limits—that is, 
                how far can we move a population climatically before performance becomes unacceptable. This information 
                can be obtained by measuring growth and survival in long-term field tests (e.g., provenance and
                reciprocal-transplant studies) that move populations across large climatic gradients. However, because
                well-designed studies are rare for many plant species, we often must rely on generalizations from other
                species and practical experience. For example, climatic variation in seed zones and breeding zones can 
                be used to set transfer limits. Many of these zones have been used for decades—solving earlier problems 
                with maladaptation resulting from excessive seed transfer. No matter what method is used, transfer 
                limits should adjusted to reflect the management practices and risk tolerance of the user. Agencies or
                organizations that are able to adjust management practices quickly (e.g., because of short rotations), 
                or are more willing to accept risk, may choose a wider transfer limit than those that are risk-averse.`}
            </p>
          </ModalCard>
          <ModalCard
            ref={(input: ModalCard) => {
              this.climatenaModal = input
            }}
            title="ClimateNA"
          >
            <p>
              <a href={ClimateWNA} target="_blank" rel="noreferrer">
                {t`Download PDF`}
              </a>
            </p>
            <p>
              {(() => {
                const climateNA = (
                  <a
                    href="http://cfcg.forestry.ubc.ca/projects/climate-data/climatebcwna/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ClimateWNA
                  </a>
                )
                return jt`${climateNA}: generating high-resolution climate data for climate change studies and 
                  applications in Western North America`
              })()}
            </p>
            <p>
              {(() => {
                const name = (
                  <a href="http://cfcg.forestry.ubc.ca/people/tongli-wang/" target="_blank" rel="noreferrer">
                    Dr Tongli Wang
                  </a>
                )

                return jt`ClimateWNA is an application written by ${name} that extracts and downscales 1961-1990 
                  monthly climate normal data from a moderate spatial resolution (4 x 4 km) to scale-free point 
                  locations, and calculates monthly, seasonal and annual climate variables for specific locations based 
                  on latitude, longitude and elevation. The downscaling is achieved through a combination of bilinear 
                  interpolation and dynamic local elevational adjustment. ClimateWNA uses the scale-free data as 
                  baseline to downscale historical and future climate variables for individual years and periods 
                  between 1901 and 2100.`
              })()}
            </p>

            <h4 className="title is-4">{t`Data sources`}</h4>
            <p>
              <em>{t`Baseline data`} </em>
            </p>
            <p>
              {t`The monthly baseline data for 1961-1990 normals were compiled from the following sources and unified at 4
                x 4 km spatial resolution`}
              :
            </p>
            <ol>
              <li>{t`British Columbia: PRISM at 800 x 800 m from Pacific Climate Impact Consortium`};</li>
              <li>
                {(() => {
                  const prismLink = (
                    <a href="http://www.prism.oregonstate.edu/" target="_blank" rel="noreferrer">
                      {c('prismLink').t`PRISM Climate Group`}
                    </a>
                  )
                  return jt`Prairie provinces: PRISM at 4 x 4 km from the ${prismLink}`
                })()}
                ;
              </li>
              <li>{t`United States: PRISM at 800 x 800 m from the PRISM Climate Group (Daly et al. 2008)`};</li>
              <li>{t`The rest: ANUSPLIN at 4 x 4 km`}</li>
              <li>
                {t`Monthly solar radiation data were provided by Dr. Robbie Hember at University of British Columbia.`}
              </li>
            </ol>
            <p>
              <em>{t`Historical data`}</em>
            </p>
            <p>
              {t`Historical monthly data were obtained from Climate Research Unit (CRU) (Harris et al 2014). The data
                version is CRU TS 3.23. The spatial resolution is 0.5 x 0.5° and covers the period of 1901-2014. 
                Anomalies were calculated for each year and period relative to the 1961-1990 normals.`}
            </p>
            <em>{t`Future climate data`}</em>

            <p>
              {t`The climate data for future periods, including 2020s (2010-2039), 2050s (2040-69) and 2080s 
                (2070-2100), were from General Circulation Models (GCMs) of the Coupled Model Intercomparison Project 
                (CMIP5) included in the IPCC Fifth Assessment Report (IPCC 2014). Fifteen GCMs were selected for two 
                greenhouse gas emission scenarios (RCP 4.5 and RCP 8.5). When multiple ensembles are available for each 
                GCM, an average was taken over the available (up to five) ensembles. Ensembles among the 15 GCMs are 
                also available.`}
            </p>

            <p>
              {(() => {
                const name = (
                  <a
                    href="http://onlinelibrary.wiley.com/doi/10.1002/grl.50256/abstract"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Knutti et al (2013)
                  </a>
                )
                return jt`The 15 AOGCMs are CanESM2, ACCESS1.0, IPSL-CM5A-MR, MIROC5, MPI-ESM-LR, CCSM4, HadGEM2-ES, 
                  CNRM-CM5, CSIRO Mk 3.6, GFDL-CM3, INM-CM4, MRI-CGCM3, MIROC-ESM, CESM1-CAM5, GISS-E2R and were chosen 
                  to represent all major clusters of similar AOGCMs by ${name}.`
              })()}
            </p>

            <h4 className="title is-4">{t`Climate variables used in Seedlot Select Tool`}</h4>
            <p>
              <em>1) {t`Annual variables`}:</em>
            </p>
            <p>
              <em>{t`Directly calculated annual variables`}:</em>
            </p>
            <div>
              <ul>
                <li>MAT {t`mean annual temperature (°C)`}</li>
                <li>MWMT {t`mean warmest month temperature (°C)`}</li>
                <li>MCMT {t`mean coldest month temperature (°C)`}</li>
                <li>TD {t`temperature difference between MWMT and MCMT, or continentality (°C)`}</li>
                <li>MAP {c('mm = millimeters').t`mean annual precipitation (mm)`}</li>
                <li>MSP {c('mm = millimeters').t`mean annual summer (May to Sept.) precipitation (mm)`}</li>
                <li>AHM {t`annual heat-moisture index`} (MAT+10)/(MAP/1000))</li>
                <li>SHM {t`summer heat-moisture index`} ((MWMT)/(MSP/1000))</li>
              </ul>
            </div>
            <p>
              <em>{t`Derived annual variables`}:</em>
            </p>
            <div>
              <ul>
                <li>DD&lt;0 {t`degree-days below 0°C, chilling degree-days`}</li>
                <li>DD&gt;5 {t`degree-days above 5°C, growing degree-days`}</li>
                <li>FFP {t`frost-free period`}</li>
                <li>
                  PAS{' '}
                  {c('mm = millimeters')
                    .t`precipitation as snow (mm) between August in previous year and July in current year`}
                </li>
                <li>EMT {t`extreme minimum temperature over 30 years`}</li>
                <li>EXT {t`extreme maximum temperature over 30 years`}</li>
                <li>Eref {c('mm = millimeters').t`Hargreaves reference evaporation (mm)`}</li>
                <li>CMD {c('mm = millimeters').t`Hargreaves climatic moisture deficit (mm)`}</li>
              </ul>
            </div>
            <div>&nbsp;</div>
            <h4 className="title is-4">{t`References`}</h4>
            <p>
              Wang, T., Hamann, A. Spittlehouse, D.L. and Murdock, T.Q. 2012. ClimateWNA – High-resolution spatial
              climate data for western North America. Journal of Applied Meteorology and Climatology 51:16-29.
            </p>
            <p>
              Wang, T., Hamann, A., Spittlehouse, D., and Aitken, S. N. 2006. Development of scale-free climate data for
              western Canada for use in resource management. International Journal of Climatology, 26(3):383-397.
            </p>
            <p>
              Daly. C., M. Halbleib, J. I. Smith, W. P. Gibson, M. K. Doggett, G. H. Taylor, and J. Curtis, 2008.
              Physiographically sensitive mapping of temperature and precipitation across the conterminous United
              States. Int. J. Climatol., 28, 2031–2064.
            </p>
            <p>
              Harris, I., Jones, P.D., Osborn, T.J. and Lister, D.H. (2014), Updated high-resolution grids of monthly
              climatic observations - the CRU TS3.10 Dataset. International Journal of Climatology, 34. pp. 623-642.
            </p>
            <p>
              Knutti, R., D. Masson, and A. Gettelman (2013), Climate model genealogy: Generation CMIP5 and how we got
              there, Geophys. Res. Lett., 40, 1194–1199, doi:
              <a href="http://dx.doi.org/10.1002/grl.50256" target="_blank" rel="noreferrer">
                10.1002/grl.50256
              </a>
              .
            </p>
          </ModalCard>
          <ModalCard
            ref={(input: ModalCard) => {
              this.peopleModal = input
            }}
            title={t`People`}
          >
            <p>
              {t`The Seedlot Selection Tool is a collaboration between the US Forest Service, Oregon State University, 
              and the Conservation Biology Institute. Initial conceptualization and development was done by Glenn Howe 
              at Oregon State University College of Forestry and Brad St.Clair at the US Forest Service Pacific 
              Northwest Research Station, with considerable input from Ron Beloin while he was working at Oregon State 
              University. The Conservation Biology Institute was brought onboard to bring the project to fruition 
              through their expertise in web site design and programming for spatial applications. Personnel at the 
              Conservation Biology Institute included Nikolas Stevenson-Molnar (tool developer), Brendan Ward (project 
              manager), and Dominique Bachelet (project co-PI).`}
            </p>
            <p>
              {t`Initial funding for the Seedlot Selection Tool came from the US Forest Service Washington Office.
                Subsequent funding came from the USFS Pacific Northwest Research Station, Oregon State University,
                Conservation Biology Institute, the USDA Northwest Climate Hub, and Natural Resources Canada.`}
            </p>
            <p>&nbsp;</p>
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
            <p>&nbsp;</p>
            <h4 className="title is-4">{t`Contact Information`}</h4>
            <p>
              Dr. Brad St.Clair – {t`Co - Principal Investigator`}
              <br />
              {t`Research Geneticist, Pacific Northwest Research Station`}
              <br />
              {t`USDA Forest Service, Corvallis, Oregon, USA`}
              <br />
              <a href="mailto:bstclair@fs.fed.us">bstclair@fs.fed.us</a>
            </p>
            <p>
              Nikolas Stevenson-Molnar – {c('i.e., Software Developer').t`Lead Developer`}
              <br />
              {t`Software Engineer`}
              <br />
              {t`Conservation Biology Institute, Corvallis, Oregon, USA`}
              <br />
              <a href="mailto:nik.molnar@consbio.org">nik.molnar@consbio.org</a>
            </p>
          </ModalCard>
          <ModalCard
            ref={(input: ModalCard) => {
              this.newsModal = input
            }}
            title={t`News & Updates`}
          >
            <p>
              {t`Sign up for the SST newsletter. We will send you emails to inform you of major updates. We will not
                share your email address with anyone else.`}
            </p>
            <p>
              <a href="http://eepurl.com/gUCYYz" target="_blank" rel="noreferrer">
                {t`Sign up for our newsletter`}
              </a>
            </p>
          </ModalCard>
          <ModalCard
            ref={(input: ModalCard) => {
              this.issueModal = input
            }}
            title={t`Report an Issue`}
          >
            <p>
              {t`Issues are used to track to-dos, bugs, feature requests, and more. As issues are created, they'll
                appear here in a searchable and filterable list. To get started, you should create an issue (you will 
                need to sign up for a GitHub account).`}
            </p>
            <p>
              <a href="https://github.com/consbio/seedsource/issues" target="_blank" rel="noreferrer">
                {t`Report an Issue`}
              </a>
            </p>
          </ModalCard>
        </div>
        <a className="navbar-item" href={SSTInstructions} target="_blank" rel="noreferrer" key="instructions">
          {t`Instructions`}
        </a>
        <a className="navbar-item" onClick={() => this.backgroundModal!.show()}>
          {t`Background`}
        </a>
        <a className="navbar-item" onClick={() => this.climatenaModal!.show()}>
          {t`ClimateNA`}
        </a>
        <a className="navbar-item" key="people" onClick={() => this.peopleModal!.show()}>
          {t`People`}
        </a>
        <a className="navbar-item" key="news" onClick={() => this.newsModal!.show()}>
          {t`News & Updates`}
        </a>
        <a className="navbar-item" key="issues" onClick={() => this.issueModal!.show()}>
          {t`Report an Issue`}
        </a>
      </>
    )
  }
}

export default Menu
