import React from 'react'
import ModalCard from 'seedsource/components/ModalCard'
import NavItemDropdown from 'seedsource/components/NavItemDropdown'
import { staticResource } from 'utils'

class Menu extends React.Component {
    render() {
        return [
            <div className="has-text-dark is-size-6" key="modals">
                <ModalCard ref={input => { this.purposeModal = input }} title="Purpose">
                    <img src={staticResource('images/purpose.jpg')} className="is-pulled-left margin-right-5" />
                    <p>
                        The Seedlot Selection Tool (SST) is a web-based mapping application designed to help natural
                        resource managers match seedlots with planting sites based on climatic information. The SST
                        can be used to map current climates or future climates based on selected climate change
                        scenarios. It is tailored for matching seedlots and planting sites, but can be used by
                        anyone interested in mapping climates defined by temperature and water availability. The
                        SST is most valuable as a planning and educational tool because of the uncertainty
                        associated with climate interpolation models and climate change projections. The SST
                        allows the user to control many input parameters, and can be customized for the management
                        practices, climate change assumptions, and risk tolerance of the user.
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.backgroundModal = input }} title="Background">
                    <img src={staticResource('images/background1.jpg')} className="is-pulled-left margin-right-5" />
                    <p>
                        Populations of forest trees and other native plants are genetically different from each other,
                        and adapted to different climatic conditions. Therefore, natural resource managers must match
                        the climatic adaptability of their plant materials to the climatic conditions of their planting
                        sites. Generally, local populations are optimally adapted to their local climates, or nearly
                        so. Thus, local seed sources are usually recommended for reforestation and restoration.
                        Typically, this has been accomplished using geographically defined zones (e.g., seed zones or
                        breeding zones) or seed transfer rules that specify a geographic or climatic distance beyond
                        which populations should not be moved. However, these recommendations assume that climates are
                        stable over the long-term—an assumption that is unlikely given projected climate change.
                        Because populations are genetically adapted to their local climates, the health and
                        productivity of native or newly established ecosystems will likely decline as climates change.
                        Climate models are now available that can be used to define zones based on climate rather than
                        geography, or calculate climatically based seed transfer limits. Once climatic transfer limits
                        have been defined, natural resource managers can explore options for responding to climate
                        change through assisted migration.
                    </p>
                    <p>
                        To match seedlots and planting sites, it is first necessary to choose appropriate climate
                        variables. This information can come from genecology studies, which are used to understand how
                        seed source climates influences adaptive trait variation among populations via natural
                        selection. In general, genetic studies indicate that temperate plants are adapted to
                        temperature—especially cold temperatures during the winter, warm temperatures during the
                        summer, and moisture related variables such as precipitation and heat:moisture index.
                    </p>
                    <img src={staticResource('images/background2.jpg')} className="is-pulled-right margin-left-5 "/>
                    <p>
                        Once important climate variables are selected, it is necessary to decide on transfer
                        limits—that is, how far can we move a population climatically before performance becomes
                        unacceptable.  This information can be obtained by measuring growth and survival in long-term
                        field tests (e.g., provenance and reciprocal-transplant studies) that move populations across
                        large climatic gradients.  However, because well-designed studies are rare for many plant
                        species, we often must rely on generalizations from other species and practical experience.
                        For example, climatic variation in seed zones and breeding zones can be used to set transfer
                        limits.  Many of these zones have been used for decades—solving earlier problems with
                        maladaptation resulting from excessive seed transfer.  No matter what method is used, transfer
                        limits should adjusted to reflect the management practices and risk tolerance of the user.
                        Agencies or organizations that are able to adjust management practices quickly (e.g., because
                        of short rotations), or are more willing to accept risk, may choose a wider transfer limit than
                        those that are risk-averse.
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.methodsModal = input }} title="Approach & Methods">
                    <h4 className="title is-4">Approach</h4>
                    <p>
                        The Seedlot Selection Tool (SST) is a web-based mapping application designed to help natural
                        resource managers match seedlots with planting sites based on climatic information.  For
                        example, given a planting site, the SST identifies geographic areas that have similar climates.
                        Thus, the resulting mapped areas show where one could collect well-adapted native seed for
                        planting.  Alternatively, when these areas coincide with breeding zones, the mapped areas show
                        where to obtain well-adapted materials from breeding programs.  Given a seedlot location, the
                        SST can be used to identify geographic areas with similar climates—that is, candidate planting
                        areas where the seedlot is expected to grow well.  In each case, the SST defines the center of
                        the climatic space to be mapped, and then maps all areas that fall within a specified climatic
                        distance (climatic transfer limit) based on climate variables selected by the user.  Within the
                        mapped area, the degree of climatic similarity is shown using different colors.  Areas that
                        fall outside of the transfer limit are not mapped.  To run the SST, the user must specific two
                        climatic regimes—the climate to which the seedlots are optimally adapted, and the climate of
                        the planting site.  Typically, the user would choose one of the historical climates as the
                        seedlot climate, and a current or future projected climate as the planting site climate.  By
                        choosing a future climate, the SST can be used to examine how assisted migration might be used
                        to respond to climate change.
                    </p>
                    <h4 className="title is-4">Methods</h4>
                    <p>
                        The Seedlot Selection Tool involves the following steps: (1) select objective, (2) select
                        location, (3) select climate scenarios, (4) select transfer limit method, (5) select climate
                        variables, and (6) map your results.  By allowing the user to select the climate change
                        scenarios, transfer limits, and climate variables, the results can be adjusted to reflect the
                        management practices, available knowledge of adaptation, and risk tolerance of the user.
                    </p>
                    <p>
                        <strong>Step 1 – Select objective.</strong> The SST was designed to help natural resource
                        managers (1) find seedlots for specific planting sites or (2) find planting sites for specific
                        seedlots.  Because these two objectives must be approached differently, the first step is to
                        select one of these two objectives.
                    </p>
                    <p>
                        <strong>Step 2 – Select location.</strong> The location of interest can be selected using
                        coordinates or by clicking on the map.  However, the location has two different meanings,
                        depending on whether you are searching for seedlots or planting sites. The location of a
                        planting site is straightforward—it is the geographic location of the site you intend to plant.
                        The location of a seedlot may refer to two different things.  If seed are collected form a
                        specific stand, then the user can specify the exact location of the seedlot using coordinates
                        or by clicking on the map.  In other cases, the seedlot may represent seed collected from a
                        larger zone.  In this case, the user can enter the location of the zone's climatic center, and
                        then use either the Custom or Zone transfer limit method in Step 4.  If the zone's climatic
                        center is unknown, the user can use the Zone transfer limit method to get its location.  In
                        this case, the user would enter any location within the desired zone in Step 2, and then choose
                        the 'climatic center' option in Step 4.
                    </p>
                    <p>
                        <strong>Step 3 – Select climate scenarios.</strong> The first step is to identify which climate
                        the seedlots are adapted to, which is typically assumed to be the climate having the greatest
                        influence on the seedlot's parents. Two 30-year normals are available: 1961-1990 and 1981-2010.
                        The 1981-2010 normals represent the 'current' climate.  For the SST, we obtained climate data
                        using ClimateNA v5.30 and a USGS DEM data at a resolution of 15-arc-seconds (∼450 m).  More
                        information on ClimateNA can be found by clicking on the 'ClimateNA' tab under the 'More
                        Information drop-down menu.
                    </p>
                    <p>
                        The next step is to choose when you want the planted trees to be optimally adapted to their
                        planting site. Typical choices are the current climate (e.g., 1981-2010), or if you want to
                        account for climate change, some future time period.  The future time periods available are:
                        2011-2040, 2041-2070, and 2071-2100.
                    </p>
                    <p>
                        If a future time period is used, the final step is to select a representative concentration
                        pathway (RCP), which is associated with different levels of atmospheric greenhouse gases and
                        climate change.  The two options are RCP4.5 and RCP8.5.  According to IPCC AR5, the RCP4.5
                        “stabilization” scenario has a projected increase in mean annual temperature of 1.8°C by 2100
                        (range = 1.1-2.6°C), whereas the RCP8.5 “business as usual” scenario has a projected increase
                        of 3.7°C by 2100 (range = 2.6-4.8°C).  The projected climates used by the SST are ClimateNA
                        ensemble projections (averages) across 15 CMIP5 models.
                    </p>
                    <p>
                        <strong>Step 4 – Select transfer limit method.</strong> Transfer limits can be set by the user
                        using the Custom method or the Zone method.  The Custom method might be preferred when there is
                        good existing information on the effects of seed transfer.  As described in the Background, this
                        might come from nursery or field-based genetic tests, or from the operational experience gained
                        from long-term planting programs.  If appropriate climatic transfer limits are not known a
                        priori, the user can use the Zone approach, which estimates transfer limits from existing seed
                        zones, breeding zones, or other zones that geographically define acceptable transfer distances.
                        Because managers have been using some zones for decades to guide seed transfer, the climatic
                        transfer distances associated with the zones have been empirically tested.9
                    </p>
                    <p>
                        <strong><em>Select your climatic center (Zone method).</em></strong> If you have chosen to find planting
                        sites for a seedlot, the first step in the Zone method is to specify the climatic center of
                        your mapped output. If you have a seedlot from a specific known location, you would typically
                        use that location as the center of your mapped output.  If you have a seedlot that represents
                        an entire seed zone, you will probably want to use the climatic center of that zone.
                    </p>
                    <p>
                        <strong><em>Select your species of interest (Zone method).</em></strong> The second step in the Zone
                        method is to select your species of interest, which will determine which zones to display as
                        available options.  The generic option returns seed zones that are not species specific. Once
                        selected, only seed zones that are either generic or specific for the selected species will
                        show up in the drop-down menu.
                    </p>
                    <p>
                        <strong><em>Select your zone of interest (Zone method).</em></strong> The third step in the Zone method
                        is to select one of the available zones. Only seed zones that correspond to your selected
                        species and location (Step 2) will be shown. If no zones are available (e.g., the location is
                        outside the region or species range), then the SST will indicate that there are no zones at
                        this location.
                    </p>
                    <p>
                        <strong><em>Transfer limits.</em></strong> If you use the Custom method, you will be asked to
                        enter transfer limits for each climate variable in Step 5.  If you use the Zone method, the SST
                        obtains the transfer limit (TL) for each climate variable using the selected zone: TL =
                        (x<sub>max</sub>-x<sub>min</sub>)/2, where x<sub>max</sub> and x<sub>min</sub> are the maximum
                        and minimum climate values for the zone.  Because some unusual zones return outlier TLs, we
                        also provide the average TL for all zones in the selected zone set (e.g., species/author
                        combination).  This and other information will show up in a pop-up window if you hover over the
                        climate variable in the climate variable table.
                    </p>
                    <p>
                        <strong>Step 5 – Select climate variables.</strong> The user can choose among 16 temperature
                        and precipitation related variables available from ClimateNA.  As described in the Background,
                        these variables were chosen based on a wide variety of plant genecological studies.  For a
                        location to be mapped (i.e., have a climatic match > 0), it must fall within the TL for each
                        selected climate variable (see Step 6).  Thus, the more climate variables that are used, the
                        smaller the mapped areas will be.  Although, the points that are excluded are those that have
                        extreme values for multiple climate variables, the use of many climate variables will probably
                        result in overly conservative climate matches.  Thus, we caution users from selecting too many
                        climate variables, particularly variables that are unrelated to adaptation.  It is also best to
                        avoid selecting variables that are very highly correlated with one another.
                    </p>
                    <p>
                        <strong>Step 6 – Map results.</strong> The SST uses the Custom or Zone-based transfer limit
                        (TL) for calculating the climatic match.  First, the gridded data for each climate variable are
                        re-scaled: y = |x – x<sub>mid</sub>|/TL, where x<sub>mid</sub> is the midpoint value, or
                        climatic center.  Then, the multivariate climatic distance (d) from the climatic center to each
                        grid point is calculated as the Euclidean distance for n climate variables: dn = 
                        (y<sub>1</sub><sup>2</sup> + y<sub>2</sub><sup>2</sup> + ∙∙∙+
                        y<sub>n</sub><sup>2</sup>)<sup>0.5</sup>.  Finally, the climate match (m) is calculated as m =
                        ‒(d-1)*100.  Values of m &lt; 0 are not mapped, whereas values between 0 and 100 are mapped
                        using a color scale ranging from light to dark orange.
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.climatenaModal = input }} title="ClimateNA">
                    <p>
                        <a href={staticResource('documents/ClimateWNA.pdf')} target="_blank">Download PDF</a>
                    </p>
                    <p>
                        <a href="https://www.climatehubs.oce.usda.gov/hubs/northwest" target="_blank">
                            ClimateWNA:
                        </a>
                        generating high-resolution climate data for climate change studies and applications in Western
                        North America
                    </p>
                    <p>
                        ClimateWNA is an application written by
                        <a href="http://cfcg.forestry.ubc.ca/people/tongli-wang/" target="_blank">Dr Tongli Wang</a>
                        that extracts and downscales 1961-1990 monthly climate normal data from a moderate spatial
                        resolution (4 x 4 km) to scale-free point locations, and calculates monthly, seasonal and
                        annual climate variables for specific locations based on latitude, longitude and elevation.
                        The downscaling is achieved through a combination of bilinear interpolation and dynamic local
                        elevational adjustment. ClimateWNA uses the scale-free data as baseline to downscale historical
                        and future climate variables for individual years and periods between 1901 and 2100.
                    </p>

                    <h4 className="title is-4">Data sources</h4>
                    <p>
                        <em>Baseline data </em>
                    </p>
                    <p>
                        The monthly baseline data for 1961-1990 normals were compiled from the following sources and
                        unified at 4 x 4 km spatial resolution:
                    </p>
                    <ol>
                        <li>British Columbia: PRISM at 800 x 800 m from Pacific Climate Impact Consortium;</li>
                        <li>
                            Prairie provinces: PRISM at 4 x 4 km from the
                            <a href="http://www.prism.oregonstate.edu/" target="_blank">PRISM Climate Group</a>;
                        </li>
                        <li>United States: PRISM at 800 x 800 m from the PRISM Climate Group (Daly et al. 2008);</li>
                        <li>The rest: ANUSPLIN at 4 x 4 km</li>
                        <li>
                            Monthly solar radiation data were provided by Dr. Robbie Hember at University of British
                            Columbia.
                        </li>
                    </ol>
                    <p><em>Historical data</em></p>
                    <p>
                        Historical monthly data were obtained from Climate Research Unit (CRU) (Harris et al 2014).
                        The data version is CRU TS 3.23. The spatial resolution is 0.5 x 0.5° and covers the period of
                        1901-2014. Anomalies were calculated for each year and period relative to the 1961-1990 normals.
                    </p>
                    <p><em>Future climate data</em></p>
                    <p>
                        The climate data for future periods, including 2020s (2010-2039), 2050s (2040-69) and 2080s
                        (2070-2100), were from General Circulation Models (GCMs) of the Coupled Model Intercomparison
                        Project (CMIP5) included in the IPCC Fifth Assessment Report (IPCC 2014). Fifteen GCMs were
                        selected for two greenhouse gas emission scenarios (RCP 4.5 and RCP 8.5). When multiple
                        ensembles are available for each GCM, an average was taken over the available (up to five)
                        ensembles. Ensembles among the 15 GCMs are also available.
                    </p>

                    <p>
                        The 15 AOGCMs are CanESM2, ACCESS1.0, IPSL-CM5A-MR, MIROC5, MPI-ESM-LR, CCSM4, HadGEM2-ES,
                        CNRM-CM5, CSIRO Mk 3.6, GFDL-CM3, INM-CM4, MRI-CGCM3, MIROC-ESM, CESM1-CAM5, GISS-E2R and were
                        chosen to represent all major clusters of similar AOGCMs by
                        <a href="http://onlinelibrary.wiley.com/doi/10.1002/grl.50256/abstract" target="_blank">
                            Knutti et al (2013)
                        </a>.
                    </p>

                    <h4 className="title is-4">Climate variables used in Seedlot Select Tool</h4>
                    <p><em>1) Annual variables:</em></p>
                    <p><em>Directly calculated annual variables:</em></p>
                    <div>
                        <ul>
                            <li>MAT mean annual temperature (°C)</li>
                            <li>MWMT mean warmest month temperature (°C)</li>
                            <li>MCMT mean coldest month temperature (°C)</li>
                            <li>TD temperature difference between MWMT and MCMT, or continentality (°C)</li>
                            <li>MAP mean annual precipitation (mm)</li>
                            <li>MSP mean annual summer (May to Sept.) precipitation (mm)</li>
                            <li>AHM annual heat-moisture index (MAT+10)/(MAP/1000))</li>
                            <li>SHM summer heat-moisture index ((MWMT)/(MSP/1000))</li>
                        </ul>
                    </div>
                    <p><em>Derived annual variables:</em></p>
                    <div>
                        <ul>
                            <li>DD&lt;0 degree-days below 0°C, chilling degree-days</li>
                            <li>DD&gt;5 degree-days above 5°C, growing degree-days</li>
                            <li>FFP frost-free period</li>
                            <li>
                                PAS precipitation as snow (mm) between August in previous year and July in current year
                            </li>
                            <li>EMT extreme minimum temperature over 30 years</li>
                            <li>EXT extreme maximum temperature over 30 years</li>
                            <li>Eref Hargreaves reference evaporation (mm)</li>
                            <li>CMD Hargreaves climatic moisture deficit (mm)</li>
                        </ul>
                    </div>
                    <div>&nbsp;</div>
                    <h4 className="title is-4">References</h4>
                    <p>
                        Wang, T., Hamann, A. Spittlehouse, D.L. and Murdock, T.Q. 2012. ClimateWNA – High-resolution
                        spatial climate data for western North America. Journal of Applied Meteorology and Climatology
                        51:16-29.
                    </p>
                    <p>
                        Wang, T., Hamann, A., Spittlehouse, D., and Aitken, S. N. 2006. Development of scale-free
                        climate data for western Canada for use in resource management. International Journal of
                        Climatology, 26(3):383-397.
                    </p>
                    <p>
                        Daly. C., M. Halbleib, J. I. Smith, W. P. Gibson, M. K. Doggett, G. H. Taylor, and J. Curtis,
                        2008. Physiographically sensitive mapping of temperature and precipitation across the
                        conterminous United States. Int. J. Climatol., 28, 2031–2064.
                    </p>
                    <p>
                        Harris, I., Jones, P.D., Osborn, T.J. and Lister, D.H. (2014), Updated high-resolution grids
                        of monthly climatic observations - the CRU TS3.10 Dataset. International Journal of
                        Climatology, 34. pp. 623-642.
                    </p>
                    <p>
                        Knutti, R., D. Masson, and A. Gettelman (2013), Climate model genealogy: Generation CMIP5 and
                        how we got there, Geophys. Res. Lett., 40, 1194–1199,
                        doi:<a href="http://dx.doi.org/10.1002/grl.50256" target="_blank">10.1002/grl.50256</a>.
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.peopleModal = input }} title="People">
                    <p>
                        The Seedlot Selection Tool is a collaboration between the US Forest Service, Oregon State
                        University, and the Conservation Biology Institute.  Initial conceptualization and development
                        was done by Glenn Howe at Oregon State University College of Forestry and Brad St.Clair at the
                        USFS Pacific Northwest Research Station, with considerable input from Ron Beloin while he was
                        working at Oregon State University. The Conservation Biology Institute was brought onboard to
                        bring the project to fruition through their expertise in web site design and programming for
                        spatial applications.  Personnel at the Conservation Biology Institute include Dominique
                        Bachelet (project co-PI), Nikolas Stevenson-Molnar (tool developer), and Brendan Ward
                        (project manager).
                    </p>
                    <p>
                        Initial funding for the Seedlot Selection Tool came from the US Forest Service Washington
                        Office.  Subsequent funding came from the USFS Pacific Northwest Research Station, Oregon State
                        University, Conservation Biology Institute, the USDA Northwest Climate Hub, and Natural
                        Resources Canada.
                    </p>
                    <p>&nbsp;</p>
                    <div className="columns">
                        <div className="column">
                            <a href="http://www.fs.fed.us/" target="_blank">
                                <img src={staticResource('images/fs_logo.png')} alt="Forest Service" />
                            </a>
                        </div>
                        <div className="column">
                            <a href="http://oregonstate.edu/" target="_blank">
                                <img src={staticResource('images/osu_logo.png')} alt="Oregon State University" />
                            </a>
                        </div>
                        <div className="column">
                            <a href="http://consbio.org" target="_blank">
                                <img src={staticResource('images/cbi_logo.png')} alt="Conservation Biology Institute" />
                            </a>
                        </div>
                        <div className="column is-half">
                            <a href="https://www.climatehubs.oce.usda.gov/northwest" target="_blank">
                                <img src={staticResource('images/nw_climate_hub_logo.png')} alt="NW Climate Hub" />
                            </a>
                        </div>
                    </div>
                    <p>&nbsp;</p>
                    <h4 className="title is-4">Contact Information</h4>
                    <p>
                        Dr. Glenn Howe – Co-Principal Investigator<br />
                        Associate Professor, Department of Forest Ecosystems and Society<br />
                        Oregon State University, Corvallis, Oregon, USA<br />
                        <a href="mailto:glenn.howe@oregonstate.edu">glenn.howe@oregonstate.edu</a>
                    </p>
                    <p>
                        Dr. Brad St.Clair – Co-Principal Investigator<br />
                        Research Geneticist, Pacific Northwest Research Station<br />
                        USDA Forest Service, Corvallis, Oregon, USA<br />
                        <a href="mailto:bstclair@fs.fed.us">bstclair@fs.fed.us</a>
                    </p>
                    <p>
                        Dr. Dominique Bachelet – Co-Principal Investigator<br />
                        Senior Climate Change Scientist<br />
                        Conservation Biology Institute, Corvallis, Oregon, USA<br />
                        <a href="mailto:dominique@consbio.org">dominique@consbio.org</a>
                    </p>
                    <p>
                        Nikolas Stevenson-Molnar – Lead Developer<br />
                        Software Engineer<br />
                        Conservation Biology Institute, Corvallis, Oregon, USA<br />
                        <a href="mailto:nik.molnar@consbio.org">nik.molnar@consbio.org</a>
                    </p>
                    <p>
                        Brendan Ward – Project Manager<br />
                        Conservation Biologist/GIS Analyst/Software Engineer<br />
                        Conservation Biology Institute, Corvallis, Oregon, USA<br />
                        <a href="mailto:bcward@consbio.org">bcward@consbio.org</a>
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.newsModal = input }} title="News & Updates">
                    <p>
                        Sign up for the SST newsletter. We will send you emails to inform you of major updates. We will
                        not share your email address with anyone else.
                    </p>
                    <p>
                        <a href="http://eepurl.com/cc1p1z" target="_blank">Sign up for our newsletter</a>
                    </p>
                </ModalCard>
                <ModalCard ref={input => { this.issueModal = input }} title="Report an Issue">
                    <p>
                        Issues are used to track to-dos, bugs, feature requests, and more. As issues are created,
                        they'll appear here in a searchable and filterable list.  To get started, you should create an
                        issue (you will need to sign up for a GitHub account).
                    </p>
                    <p>
                        <a href="https://github.com/consbio/seedsource/issues" target="_blank">Report an Issue</a>
                    </p>
                </ModalCard>
            </div>,

            <a className='navbar-item' onClick={() => this.purposeModal.show()} key="purpose">Purpose</a>,
            <a className='navbar-item' href={staticResource('documents/SST Instructions.pdf')} target="_blank" key="instructions">
                Instructions
            </a>,
            <NavItemDropdown title="More Information" key="information">
                <a className="navbar-item" onClick={() => this.backgroundModal.show()}>Background</a>
                    <a className="navbar-item" onClick={() => this.methodsModal.show()}>Approach & Methods</a>
                    <a className="navbar-item" onClick={() => this.climatenaModal.show()}>ClimateNA</a>
                    <a className="navbar-item" href="https://github.com/consbio/seedlot-selection-tool" target="_blank">
                        Source Code
                    </a>
            </NavItemDropdown>,
            <a className='navbar-item' key="people" onClick={() => this.peopleModal.show()}>People</a>,
            <a className='navbar-item' key="news" onClick={() => this.newsModal.show()}>News & Updates</a>,
            <a className='navbar-item' key="issues" onClick={() => this.issueModal.show()}>Report an Issue</a>
        ]
    }
}

export default Menu
