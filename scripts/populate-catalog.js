const CT = require('ctvault')
const fs = require('fs-extra')
const slugify = require('slugify')

let run = async () => {
    try {
        const ct = await CT.getClient('daves-test-project')
        const items = fs.readJSONSync('data/items.json')

        let products = await Promise.all(items.map(async item => {
            let slug = slugify(item.name).toLowerCase()
            let draft = {
                name: ct.functions.localize(item.name),
                slug: ct.functions.localize(slug),
                key: slug,
                productType: {
                    typeId: "product-type",
                    id: "0fd9b886-ad37-413e-918a-6cc3ee273ea2"
                },
                masterVariant: {
                    id: 1,
                    sku: slug,
                    prices: [
                        {
                            value: {
                                type: "centPrecision",
                                currencyCode: "USD",
                                centAmount: item.price,
                                fractionDigits: 2
                            }
                        }
                    ],
                    images: [item.image]
                },
                taxCategory: {
                    typeId: "tax-category",
                    id: "09359ff0-1f7b-401b-97dc-adef798e9ef0"
                }
            }

            try {                
                let product = await ct.products.get({ key: slug })

                if (!product) {
                    product = await ct.products.create(draft)
                }
                return product
            } catch (error) {
                console.error(`Error creating product [ ${item.name} ]: ${error.message}`)
            }
        }))

        await Promise.all(products.map(async product => {
            try {                
                await product.update([{
                    action: "publish",
                    scope: "All"
                }])
            } catch (error) {
                console.error(`Error publishing product [ ${product.name} ]: ${error.message}`)
            }
        }))

        // await ct.products.process(async prod => await prod.update([{
        //     action: "publish",
        //     scope: "all"
        // }]))
    } catch (error) {
        console.error(`Error: ${error}`)
    }
}

run()