import baseConfig from 'core/seedsource/config'

const config = {
    apiRoot: '/sst/',
    species: [
        {
            name: 'psme',
            label: 'Douglas-fir'
        },
        {
            name: 'pico',
            label: 'Lodgepole pine'
        },
        {
            name: 'piba',
            label: 'Jack pine'
        },
        {
            name: 'pipo',
            label: 'Ponderosa pine'
        },
        {
            name: 'pima',
            label: 'Black spruce'
        },
        {
            name: 'thpl',
            label: 'Western red cedar'
        },
        {
            name: 'pimo',
            label: 'Western white pine'
        }
    ]
}

export default Object.assign(baseConfig, config)
