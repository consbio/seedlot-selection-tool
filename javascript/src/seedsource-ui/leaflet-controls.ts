import L from 'leaflet'

export const LegendControl = L.Control.extend({
  options: {
    position: 'bottomright',
    legends: [],
  },

  onAdd(this: any) {
    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-legend')

    L.DomEvent.on(this._container, 'click', e => {
      e.stopPropagation()
    })

    this._rebuildLegends()

    return this._container
  },

  _rebuildLegends(this: any) {
    L.DomUtil.empty(this._container)

    this.options.legends.forEach((legend: any) => {
      let className = 'legend-item'

      if (legend.className) {
        className += ` ${legend.className}`
      }

      const container = L.DomUtil.create('div', className, this._container)
      const label = L.DomUtil.create('h4', 'title is-5', container)
      label.innerHTML = legend.label

      const table = L.DomUtil.create('table', undefined, container)
      const tbody = L.DomUtil.create('tbody', undefined, table)

      legend.elements.forEach((item: any) => {
        const tr = L.DomUtil.create('tr', undefined, tbody)
        const imageCell = L.DomUtil.create('td', undefined, tr)

        const image = L.DomUtil.create('img', undefined, imageCell) as HTMLImageElement
        image.src = `data:image/png;base64,${item.imageData}`

        const labelCell = L.DomUtil.create('td', undefined, tr)
        labelCell.innerHTML = item.label
      })
    })
  },

  setLegends(legends: any) {
    this.options.legends = legends

    this._rebuildLegends()
  },
})

export const ButtonControl = L.Control.extend({
  options: {
    position: 'topright',
    icon: '',
  },

  onAdd(this: any): HTMLElement {
    const container = L.DomUtil.create('div', 'leaflet-button leaflet-bar')
    const button = L.DomUtil.create('span', `icon-${this.options.icon}-16`, container)

    L.DomEvent.on(button, 'click', () => {
      this.fire('click', { target: this })
    }).on(button, 'mousedown mouseup click', L.DomEvent.stopPropagation)

    this._button = button
    this._container = container
    return this._container
  },

  setIcon(this: any, icon: string) {
    this.options.icon = icon
    this._button.setAttribute('class', `icon-${icon}-16`)
  },

  includes: L.Evented.prototype,
})
