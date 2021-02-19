const _ = require('lodash')
const axios = require('axios')

let fetchContent = async (path) => (await axios.get(`https://multihub-thom.cdn.content.amplience.net/content/key/${path}?depth=all&format=inlined`)).data

module.exports = {
    microservices: [{
        key: 'get-env-configuration',
        path: '/api/products',
        handle: async ({ ct }) => await ct.products.all()
    },{
        key: 'get-home-page',
        path: '/api/homepage',
        handle: async ({ ct }) => {
            let slot = await fetchContent('dave-page-slot')

            // handle the product carousel
            let carouselComponent = _.first(_.filter(slot.content.components, comp => comp.component === 'ProductCarousel'))
            carouselComponent.products = await Promise.all(carouselComponent.carousel.map(async item => await ct.products.get({ id: item })))
            return slot.content
        }
    }]
}