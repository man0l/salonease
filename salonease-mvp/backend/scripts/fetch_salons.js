const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const CACHE_DIR = path.join(__dirname, 'cache');
const CITIES_CACHE_DIR = path.join(CACHE_DIR, 'cities');

// Ensure cache directories exist
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}
if (!fs.existsSync(CITIES_CACHE_DIR)) {
    fs.mkdirSync(CITIES_CACHE_DIR, { recursive: true });
}

const townMap = new Map([
    [1, {name: "София", slug: "sofiya"}],
    [2, {name: "Пловдив", slug: "plovdiv"}],
    [3, {name: "Варна", slug: "varna"}],
    [4, {name: "Бургас", slug: "burgas"}],
    [5, {name: "Русе", slug: "ruse"}],
    [6, {name: "Стара Загора", slug: "stara-zagora"}],
    [7, {name: "Плевен", slug: "pleven"}],
    [10, {name: "Асеновград", slug: "asenovgrad"}],
    [11, {name: "Габрово", slug: "gabrovo"}],
    [12, {name: "Добрич", slug: "dobrich"}],
    [16, {name: "Перник", slug: "pernik"}],
    [29, {name: "Пазарджик", slug: "pazardzhik"}],
    [32, {name: "Свети Влас", slug: "sveti-vlas"}],
    [33, {name: "Велико Търново", slug: "veliko-tarnovo"}],
    [37, {name: "Слънчев бряг", slug: "slanchev-bryag"}],
    [42, {name: "Сливен", slug: "sliven"}],
    [45, {name: "Елин Пелин", slug: "elin-pelin"}],
    [46, {name: "Благоевград", slug: "blagoevgrad"}],
    [51, {name: "Ямбол", slug: "yambol"}],
    [59, {name: "Хасково", slug: "haskovo"}]
]);

const axiosConfig = {
    headers: {
        'Origin': 'https://studio24.bg',
        'x-requested-with': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
};

async function fetchNeighborhoods(townId) {
    let results = [];
    try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('listing_type', 'neighbourhood');
        params.append('town', townId);
        params.append('language', 'bg');

        const response = await axios({
            ...axiosConfig,
            method: 'post',
            url: 'https://studio24.bg/studios/list',
            data: params
        });
        
        if (response.data && response.data.neighborhoods) {
            response.data.neighborhoods.forEach(async neighborhood => {
                const salons = await fetchSalons(neighborhood.id);                
                results = results.concat(salons);
            });
        }
       
        return results;
    } catch (error) {
        console.error(`Error fetching neighborhoods for town ${townId}:`, error.message);
        return [];
    }
}

async function fetchSalons(neighborhoodId) {
    try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('listing_type', 'neighbourhood');
        params.append('neighbourhood', neighborhoodId);
        params.append('language', 'bg');

        const response = await axios({
            ...axiosConfig,
            method: 'post',
            url: 'https://studio24.bg/studios/list',
            data: params
        });

        console.log(response.data.html);
        return response.data.html;
    } catch (error) {
        console.error(`Error fetching salons for neighborhood ${neighborhoodId}:`, error.message);
        return "";
    }
}

async function processSalon(html) {
    const $ = cheerio.load(html);
    const salons = [];

    $('article.list-item').each((_, element) => {
        const $article = $(element);
        
        const salon = {
            id: extractSalonId($article.find('.thumb a').attr('href')),
            name: $article.find('.title a').text().trim(),
            address: $article.find('address').text().trim(),
            rating: {
                score: parseFloat($article.find('.rating span').first().text()) || null,
                reviews: parseInt($article.find('.rating span').last().text()) || 0,
                percentage: parseFloat($article.find('.star-rating-top').attr('style')?.match(/width:\s*([\d.]+)%/)?.[1] || '0')
            },
            services: [],
            imageUrl: extractImageUrl($article.find('.thumb a').attr('style')),
            url: $article.find('.title a').attr('href')
        };

        // Parse services
        $article.find('.services li').each((_, serviceElement) => {
            const $service = $(serviceElement);
            const serviceText = $service.find('.name').text().trim();
            const priceText = $service.find('.price').text().trim();
            
            salon.services.push({
                name: serviceText,
                price: parsePrice(priceText),
                url: $service.find('a').attr('href')
            });
        });

        salons.push(salon);
    });

    return salons;
}

function extractSalonId(url) {
    const match = url?.match(/s(\d+)/);
    return match ? match[1] : null;
}

function extractImageUrl(style) {
    const match = style?.match(/url\('([^']+)'\)/);
    return match ? match[1] : null;
}

function parsePrice(priceText) {
    const price = {
        amount: null,
        isFrom: false
    };

    const match = priceText.match(/(от\s*)?(\d+)\s*лв\./);
    if (match) {
        price.isFrom = !!match[1];
        price.amount = parseInt(match[2]);
    }

    return price;
}

async function processCities() {
    for (const [townId, townInfo] of townMap) {
        console.log(`Processing ${townInfo.name} (ID: ${townId})...`);
        
        // Create cache file path
        const cacheFile = path.join(CITIES_CACHE_DIR, `${townInfo.slug}.json`);
        
        try {
            const neighborhoods = await fetchNeighborhoods(townId);
            console.log(neighborhoods);
            const cityData = {
                id: townId,
                name: townInfo.name,
                slug: townInfo.slug,
                neighborhoods: neighborhoods,
                fetchedAt: new Date().toISOString()
            };
            
            // Save to cache
            fs.writeFileSync(cacheFile, JSON.stringify(cityData, null, 2));
            console.log(`Saved ${neighborhoods.length} neighborhoods for ${townInfo.name}`);
            
            // Wait 1 second between requests to be nice to the server
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`Failed to process ${townInfo.name}:`, error.message);
        }
    }
}

// Run the script
processCities().then(() => {
    console.log('Finished processing all cities');
}).catch(error => {
    console.error('Script failed:', error);
});