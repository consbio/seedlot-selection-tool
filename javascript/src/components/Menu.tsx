import React from 'react'
import { t, c, jt } from 'ttag'
import ModalCard from '../seedsource-ui/components/ModalCard'
import NavItemDropdown from '../seedsource-ui/components/NavItemDropdown'
import { getCookies } from '../seedsource-ui/utils'
import Background1 from '../../images/background1.jpg'
import Background2 from '../../images/background2.jpg'
import FSLogo from '../../images/fs_logo.png'
import OSULogo from '../../images/osu_logo.png'
import CBILogo from '../../images/cbi_logo.png'
import ClimateHubLogo from '../../images/nw_climate_hub_logo.png'
import SSTInstructions from '../../documents/SST User Guide.pdf'
import SSTInstructionsESMX from '../../documents/translations/es_MX/SST User Guide.pdf'
import SSTSilviculturistsGuide from '../../documents/SST R6 Silviculturists Guide.pdf'

class Menu extends React.Component {
  backgroundModal?: ModalCard

  climatenaModal?: ModalCard

  peopleModal?: ModalCard

  newsModal?: ModalCard

  issueModal?: ModalCard

  render() {
    const cookies = getCookies()
    const manual = cookies.django_language === 'es-mx' ? SSTInstructionsESMX : SSTInstructions

    const tl = (
      <span className="pre" key="tl">
        TL
      </span>
    )
    const formula = (
      <span className="pre" key="formula">
        y = |x – xmid|/TL
      </span>
    )
    const xmid = (
      <span className="pre" key="xmid">
        xmid
      </span>
    )
    const d = (
      <span className="pre" key="d">
        d
      </span>
    )
    const n = (
      <span className="pre" key="n">
        n
      </span>
    )
    const distanceFormula = (
      <span className="pre" key="dn">
        dn = (y12 + y22 + ∙∙∙+ yn2)0.5
      </span>
    )
    const m = (
      <span className="pre" key="m">
        m
      </span>
    )
    const matchFormula = (
      <span className="pre" key="matchFormula">
        m = ‒(d-1)*100
      </span>
    )
    const mLessThan0 = (
      <span className="pre" key="mLessThan">
        m &lt; 0
      </span>
    )

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
              {t`Populations of forest trees and other native plants are genetically different from one another and are
              locally adapted owing to natural selection to different climatic pressures across the landscape (Leimu and
              Fischer 2008, Alberto et al. 2013, Baughman et al. 2019). As a result, local seed sources are usually
              recommended for reforestation and restoration. Typically, this has been accomplished using geographically
              defined zones or seed transfer rules that limit the geographic or climatic distance that populations may
              be moved. As climates change, however, the assumption of “local is best” and the use of local seed zones
              and guidelines may no longer apply. Because populations are genetically adapted to their local climates,
              the health and productivity of native or newly established ecosystems using local seed sources will likely
              decline. We are already seeing increased mortality across many forest tree species in North America likely
              attributed to changes in climate (van Mantgem et al. 2009, Sáenz-Romero et al. 2020). And the problem will
              only get worse – the amount of climate change to date is small compared to what is projected by the mid-
              to late-21st century.`}
            </p>
            <p>
              {t`Natural resource managers may respond to concerns of maladaptation and declines in ecosystem 
              productivity by matching the climatic adaptability of their plant material to the climatic conditions of 
              their reforestation or restoration sites. Software applications are now available that can be used to
              characterize the local climates of seed sources and planting sites, including past climates and future
              climates given different climate change models. For the Seedlot Selection Tool (SST), we use ClimateNA
              v5.30 and a USGS DEM data a resolution of 15-arc seconds (~450 m) to determine the climate for each grid
              point on a map (Wang et al. 2016 – more information may be found by clicking on the ClimateNA tab).
              ClimateNA is a user-friendly application that locally downscales historical and future climate from
              various baseline gridded climate data into scale-free point estimates of climate values for the entire
              continent of North America. It also calculates a large number of biologically relevant climate variables.
              The SST uses sixteen temperature- and precipitation-related variables as determined for two 30-year
              normals for past climates (1961 – 1990 and 1981-2010) and three 30-year normals for future climates (2011
              – 2040, 2041 – 2070, and 2071 – 2100). For the three future climates, the SST allows the user to make
              assumptions about future emission scenarios (relative concentration pathways) of RCP 4.5 or RCP 8.5. The
              climate projections are based on an ensemble of the average projections from fifteen climate models from
              the Coupled Model Intercomparison Project phase 5 (CMIP5) database of the 5th IPCC Assessment Report.`}
            </p>
            <p>
              {jt`Using the climate estimates for each grid point on a map, the SST determines the climatic distances
              between a focal point location and each grid point on a map. The area mapped is limited to the maximum
              climatic distance a user is willing to move as indicated by the transfer limit (${tl}). The gridded data 
              for each climate variable is rescaled as: ${formula}, where ${xmid} is the midpoint value, or climatic 
              center, of the focal point. Then, the multivariate climatic distance (${d}) from the focal point to each 
              grid point is calculated as the Euclidean distance for ${n} climate variables: ${distanceFormula}. 
              Finally, the climate match (${m}) is calculated as ${matchFormula}. Values of ${mLessThan0} are not 
              mapped, whereas values between 0 and 100 are mapped using the color scale ranging from light to dark 
              orange.`}
            </p>
            <p>
              {t`To match seedlots and planting sites, it is necessary to choose appropriate climate variables that reflect
              the adaptive capacity of seedlots. Evidence for adaptation comes from two types of genetic studies: (1)
              genecology studies and (2) reciprocal transplant studies (or provenance studies that approximate
              reciprocal transplants). Both types of studies use a common-garden approach which minimizes environmental
              variation such that genetic differences are more easily observed. Genecology studies relate differences
              among seedlings from different populations to the environment of the seed sources. Consistent correlations
              between traits and source climates are indicative of adaptation as a result of natural selection of the
              parents in those source climates. Reciprocal transplant studies test adaptation directly by relating
              survival and growth of different populations from different source climates to the climates in which they
              are growing. Populations that survive and grow best in test climates that are similar to their source
              climates are considered to be locally adapted. In both types of studies, those climate variables showing
              the strongest relationships to population differences may be considered most important for adaptation. In
              general, genetic studies indicate that temperate trees are most strongly related to climate variables that
              reflect adaptation to cold temperatures in the winter and aridity during the growing season (Aitken and
              Bemmels 2015). Aridity is driven by both moisture availability and evapotranspiration, and is, thus, best
              reflected by climate variables that reflect both, such as climate moisture deficit and heat:moisture
              index, as well as related variables such as annual precipitation and summer temperatures.`}
            </p>
            <img
              src={Background2}
              className="is-pulled-right margin-left-5 "
              alt={t`A clear-cut hillside in the foreground, a wooded hillside in the background`}
            />
            <p>
              {t`Once important climate variables are selected, it is necessary to decide on transfer limits – that is, how
              far can one move a population climatically before performance becomes unacceptable. This information is
              best obtained by measuring growth and survival in reciprocal transplant studies or provenance tests that
              move populations across large climatic gradients. As populations are moved greater climatic distances
              between seed sources and planting sites, we can expect that growth and survival will decrease,
              particularly for growing environments showing strong local adaptation, as is frequently the case. Because
              the decrease in growth and survival is a gradient, deciding on a transfer limit that is acceptable depends
              on the risk tolerance of the manager.`}
            </p>
            <p>
              {t`Because long-term, well-designed studies are rare for many plant species, we must often rely on
              generalizations from other species as well as practical experience for determining climate variables and
              transfer limits. For example, climatic variation in seed zones and breeding zones can be used to set
              transfer limits. Many of these zones have been used for decades—solving earlier problems with
              maladaptation resulting from excessive seed transfer. No matter what method is used, transfer limits
              should be adjusted to reflect the management practices and risk tolerance of the user. Agencies or
              organizations that are able to adjust management practices quickly (e.g., because of short rotations), or
              are more willing to accept risk, may choose a wider transfer limit than those that are risk-averse.`}
            </p>
            <p>
              {t`Once climate variables important for adaptation are determined and climatic transfer limits have been
              defined, natural resource managers can use the SST to explore options for responding to climate change
              through assisted migration. The output from the SST indicates the suitability of each point on the map to
              the focal point of interest. The difficulty arises, however, in that climate is a moving target – what is
              suitable in the near-term may not be suitable by mid- to late-century. For long-lived species such as
              forest trees, the best a natural resource manager can do is to aim as far into the future as possible to
              find the best match – that is, a climatic transfer distance of zero – while still remaining with their
              specified transfer limit in the near-term. For the Pacific Northwest, for example, that generally implies
              looking for the best match for mid-century while still being within the transfer limits for the next few
              decades. This is indicated on the mapped output by dark orange for the time period 2041-2070 (or a
              similarity index near 100 if you have mapped locations for comparison to the focal point) while still
              being within the light orange area by 2011-2040 (or a similarity index above zero). The goal is to
              minimize the climatic transfer distance for the future, but still remain within a transfer limit beyond
              which declines in health and productivity may be deemed unacceptable in the near-term. What is clear,
              however, is that the difference between the climatic adaptation of local populations and future climates
              will likely be well beyond acceptable transfer limits by mid- to late-century for much of North America,
              leading to declines in forest health and productivity – unless forest managers work to match suitable seed
              sources to projected future climates.`}
            </p>
            <h4 className="title is-4">{t`Literature Cited`}</h4>
            <p>
              Aitken, S.N. and J.B. Bemmels. 2015. Time to get moving: assisted gene flow of forest trees. Evolutionary
              Applications 9(1): 271-290.
            </p>
            <p>
              Alberto, F., S.N. Aitken, R. Alia, SC. Gonzalez-Martinez, H. Hanninen, A. Kremer, F. Lefevre et al. 2013.
              Potential for evolutionary responses to climate change – evidence from tree populations. Global Change
              Biology 18: 1645-1661.
            </p>
            <p>
              Baughman, O.W., A.C. Agneray, M.L. Forister, F.F. Kilkenny, E.K. Espeland, R. Fiegener, M.E. Horning, R.C.
              Johnson, T.N. Kaye, J. Ott, J.B. St.Clair, E.A. Leger. 2019. Strong patterns of intraspecific variation
              and local adaptation in Great Basin plants revealed through a review of 75 years of experiments. Ecology
              and Evolution 2019-9: 6259-6275.
            </p>
            <p>Leimu,R. and M. Fischer. 2008. A meta-analysis of local adaptation in plants. PLoS ONE 3(12): e4010.</p>
            <p>
              Sáenz-Romero, E. Mendoza-Mata, E. Gómez-Pineda, A. Blanco-Garcia, et al. 2020. Recent evidence of Mexican
              temperate forest decline and the need for ex situ conservation, assisted migration, and translocation of
              species ensembles as adaptive management to face projected climatic change impacts in a megadiverse
              country. Can. J. For Res. 50: 843-854.
            </p>
            <p>
              Van Mantgem, N.l. Stephenson, J.C. Byrne, L.D. Daniels, J.F. Franklin, P.Z. Fulé, M.E. Harmon, A.J.
              Larson, J.M. Smith, A.H. Taylor, T.T. Veblen. 2009. Widespread increase of tree mortality rates in the
              Western United States. Science 323: 521-524.
            </p>
            <p>
              Wang, T., A. Hamann, D.L. Spittlehouse, and C. Carroll. 2016. Locally downscaled and spatially
              conceptualized climate data for historical and future periods for North America. PLoS ONE 11(6): e0156720.
            </p>
          </ModalCard>
          <ModalCard
            ref={(input: ModalCard) => {
              this.climatenaModal = input
            }}
            title="ClimateNA"
          >
            <p>
              {(() => {
                const name = (
                  <a
                    key="dr-tongli"
                    href="http://cfcg.forestry.ubc.ca/people/tongli-wang/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Dr Tongli Wang
                  </a>
                )

                return jt`ClimateNA is a software program written by ${name} and others that extracts and downscales 
                  monthly climate data layers for the normal period of 1961-1990 from moderate spatial resolution 
                  (4 x 4 km) to scale-free point estimates for the entire continent of North America (Wang et al. 
                  2016). The downscaling is achieved through a combination of bilinear interpolation and dynamic 
                  local elevational adjustment. ClimateNA uses the derived data as a baseline to determine downscaled 
                  historical and future climate variables for individual years and periods between 1901 and 2100. 
                  ClimateNA also calculates a number of biologically relevant climate variables from the temperature 
                  and precipitation data.`
              })()}
            </p>

            <h4 className="title is-4">{t`Data sources`}</h4>
            <p>
              <em>{t`Baseline data`} </em>
            </p>
            <p>
              {t`The monthly baseline data for 1961-1990 normals were compiled from the following sources and unified 
                at 4 x 4 km spatial resolution`}
              :
            </p>
            <ol>
              <li>{t`British Columbia: PRISM at 800 x 800 m from Pacific Climate Impact Consortium`};</li>
              <li>
                {(() => {
                  const prismLink = (
                    <a key="prism" href="http://www.prism.oregonstate.edu/" target="_blank" rel="noreferrer">
                      {c("This is the value of 'prismLink'").t`PRISM Climate Group`}
                    </a>
                  )
                  return jt`Prairie provinces: PRISM at 4 x 4 km from the ${prismLink}`
                })()}
                ;
              </li>
              <li>{t`United States: PRISM at 800 x 800 m from the PRISM Climate Group (Daly et al. 2008)`};</li>
              <li>{t`The rest: ANUSPLIN at 4 x 4 km`}</li>
              <li>{t`The rest of North America: ANUSPLIN at 4 x 4 km`}</li>
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
              {(() => {
                const name = (
                  <a
                    key="knutti"
                    href="http://onlinelibrary.wiley.com/doi/10.1002/grl.50256/abstract"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Knutti et al (2013)
                  </a>
                )
                return jt`The climate data for future periods, including 2020s (2010-2039), 2050s (2040-69) and 2080s 
                (2070-2100), were from General Circulation Models (GCMs) of the Coupled Model Intercomparison Project 
                (CMIP5) included in the IPCC Fifth Assessment Report (IPCC 2014). Fifteen GCMs were selected for two 
                greenhouse gas emission scenarios (RCP 4.5 and RCP 8.5). When multiple ensembles are available for each 
                GCM, an average was taken over the available (up to five) ensembles. Ensembles among the 15 GCMs are 
                also available. The 15 AOGCMs are CanESM2, ACCESS1.0, IPSL-CM5A-MR, MIROC5, MPI-ESM-LR, CCSM4, 
                HadGEM2-ES, CNRM-CM5, CSIRO Mk 3.6, GFDL-CM3, INM-CM4, MRI-CGCM3, MIROC-ESM, CESM1-CAM5, GISS-E2R and 
                were chosen to represent all major clusters of similar AOGCMs by ${name}.`
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
            <p />
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
              Wang, T., A. Hamann, D.L. Spittlehouse, and C. Carroll. 2016. Locally downscaled and spatially
              conceptualized climate data for historical and future periods for North America. PLoS ONE 11(6): e0156720.
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
              Harris, I., P.D. Jones, T.J. Osborn, and D.H. Lister. 2014. Updated high-resolution grids of monthly
              climatic observations - the CRU TS3.10 Dataset. International Journal of Climatology 34: 623-642.
            </p>
            <p>
              Knutti, R., D. Masson, and A. Gettelman. 2013. Climate model genealogy: Generation CMIP5 and how we got
              there. Geophys. Res. Lett. 40: 1194–1199.
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
                Conservation Biology Institute, the USDA Northwest Climate Hub, Natural Resources Canada, 
                USFS International Programs, and USFS State & Private`}
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
              Nikolas Stevenson-Molnar – {c('i.e., Lead Software Developer').t`Lead Developer`}
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
              <a href="https://github.com/consbio/seedlot-selection-tool/issues" target="_blank" rel="noreferrer">
                {t`Report an Issue`}
              </a>
            </p>
          </ModalCard>
        </div>
        <NavItemDropdown title={t`User Guides`}>
          <a className="navbar-item" href={manual} target="_blank" rel="noreferrer">
            {t`Basic Guide`}
          </a>
          <a className="navbar-item" href={SSTSilviculturistsGuide} target="_blank" rel="noreferrer">
            {t`Silviculturists Guide`}
          </a>
        </NavItemDropdown>
        <NavItemDropdown title={t`About`}>
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
        </NavItemDropdown>
        <a className="navbar-item" key="issues" onClick={() => this.issueModal!.show()}>
          {t`Report an Issue`}
        </a>
      </>
    )
  }
}

export default Menu
