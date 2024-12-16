const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');

// Constants
const CACHE_DIR = path.join(__dirname, 'cache');
const CITIES_CACHE_DIR = path.join(CACHE_DIR, 'cities');

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

const serviceMap = new Map([
    // Sections
    ['s1', {name: "Фризьорски салони", type: "section", parentId: 1}],
    ['s4', {name: "Козметици", type: "section", parentId: 0}],
    ['s5', {name: "Масаж", type: "section", parentId: 5}],

    // Categories
    ['c13', {name: "Екстеншъни", type: "category", parentId: 68}],
    ['c15', {name: "Брада и бръснене", type: "category", parentId: 2}],
    ['c16', {name: "Кола маска жени", type: "category", parentId: 19}],
    ['c17', {name: "Кола маска мъже", type: "category", parentId: 21}],
    ['c18', {name: "Лазерна епилация", type: "category", parentId: 18}],
    ['c19', {name: "Фотоепилация", type: "category", parentId: 20}],
    ['c22', {name: "Ноктопластика", type: "category", parentId: 9}],
    ['c26', {name: "Тера��ии за лице", type: "category", parentId: 105}],
    ['c27', {name: "Професионален грим", type: "category", parentId: 4}],
    ['c29', {name: "Класически масаж", type: "category", parentId: 31}],
    ['c31', {name: "Антицелулитен масаж", type: "category", parentId: 29}],
    ['c32', {name: "Спортен масаж", type: "category", parentId: 30}],
    ['c34', {name: "Лечебен масаж", type: "category", parentId: 32}],
    ['c37', {name: "Терапии за тяло", type: "category", parentId: 107}],
    ['c42', {name: "Перманентен грим", type: "category", parentId: 14}],
    ['c43', {name: "Ароматерапия", type: "category", parentId: 182}],
    ['c54', {name: "Декорации на нокти", type: "category", parentId: 190}],
    ['c59', {name: "Микропигментация", type: "category", parentId: 171}],
    ['c60', {name: "Шугаринг", type: "category", parentId: 238}],
    ['c64', {name: "X Body (EMS)", type: "category", parentId: 0}],
    ['c65', {name: "Татуировки", type: "category", parentId: 0}],
    ['c68', {name: "Боуен терапия", type: "category", parentId: 0}],
    ['c69', {name: "Лазерна епилация бели косми", type: "category", parentId: 0}],

    // Service Types
    ['st2', {name: "Педикюр", type: "service_type", parentId: 10}],
    ['st10', {name: "Маникюр с гел лак", type: "service_type", parentId: 8}],
    ['st14', {name: "Медицински педикюр", type: "service_type", parentId: 11}],
    ['st15', {name: "Медицински маникюр", type: "service_type", parentId: 7}],
    ['st16', {name: "Почистване на лице", type: "service_type", parentId: 3}],
    ['st17', {name: "Микродермабразио", type: "service_type", parentId: 86}],
    ['st19', {name: "Оформяне на вежди", type: "service_type", parentId: 12}],
    ['st20', {name: "Микроблейдинг", type: "service_type", parentId: 13}],
    ['st22', {name: "Удължаване на мигли", type: "service_type", parentId: 15}],
    ['st23', {name: "Мигли руски обем", type: "service_type", parentId: 16}],
    ['st25', {name: "Пилинг на лице", type: "service_type", parentId: 220}],
    ['st26', {name: "Безиглена мезотерапия", type: "service_type", parentId: 184}],
    ['st39', {name: "Мъжко подстригване", type: "service_type", parentId: 22}],
    ['st40', {name: "Дамско подстригване", type: "service_type", parentId: 23}],
    ['st41', {name: "Детско подстригване", type: "service_type", parentId: 24}],
    ['st42', {name: "Прическа", type: "service_type", parentId: 57}],
    ['st43', {name: "Сешоар", type: "service_type", parentId: 99}],
    ['st44', {name: "Плитки", type: "service_type", parentId: 25}],
    ['st45', {name: "Боядисване на коса", type: "service_type", parentId: 62}],
    ['st46', {name: "Омбре", type: "service_type", parentId: 90}],
    ['st47', {name: "Балеаж", type: "service_type", parentId: 26}],
    ['st49', {name: "Кичури", type: "service_type", parentId: 72}],
    ['st50', {name: "Изправяне на коса", type: "service_type", parentId: 159}],
    ['st51', {name: "Ретропреса", type: "service_type", parentId: 229}],
    ['st52', {name: "Къдрене", type: "service_type", parentId: 77}],
    ['st54', {name: "Кератинова терапия", type: "service_type", parentId: 162}],
    ['st56', {name: "Оформяне на брада", type: "service_type", parentId: 27}],
    ['st59', {name: "Пилинг на тяло", type: "service_type", parentId: 92}],
    ['st61', {name: "Криолиполиза", type: "service_type", parentId: 75}],
    ['st63', {name: "Тайлдски масаж", type: "service_type", parentId: 28}],
    ['st66', {name: "Рейки", type: "service_type", parentId: 34}],
    ['st68', {name: "Лимфодренаж", type: "service_type", parentId: 33}],
    ['st74', {name: "Перманентен грим - контур устни", type: "service_type", parentId: 0}],
    ['st76', {name: "Боядисване на вежди", type: "service_type", parentId: 64}],
    ['st81', {name: "Йонофореза", type: "service_type", parentId: 202}],
    ['st82', {name: "Обезцветяване", type: "service_type", parentId: 88}],
    ['st83', {name: "Студено къдрене", type: "service_type", parentId: 0}],
    ['st84', {name: "Матиране", type: "service_type", parentId: 214}],
    ['st87', {name: "Сваляне на гел лак", type: "service_type", parentId: 0}],
    ['st88', {name: "Поддръжка на ноктопластика", type: "service_type", parentId: 0}],
    ['st90', {name: "Маникюр", type: "service_type", parentId: 6}],
    ['st92', {name: "Парафинова терапия", type: "service_type", parentId: 218}],
    ['st93', {name: "Педикюр с гел лак", type: "service_type", parentId: 0}],
    ['st94', {name: "Почистване на вежди", type: "service_type", parentId: 0}],
    ['st100', {name: "Перманентен грим - вежди", type: "service_type", parentId: 0}],
    ['st101', {name: "Перманентен грим - очна линия", type: "service_type", parentId: 0}],
    ['st103', {name: "Масаж на лице, шия и деколте", type: "service_type", parentId: 163}],
    ['st104', {name: "Кислородна терапия", type: "service_type", parentId: 203}],
    ['st105', {name: "Поддръжка на мигли", type: "service_type", parentId: 0}],
    ['st106', {name: "Сваляне на мигли", type: "service_type", parentId: 0}],
    ['st109', {name: "Интим - кола маска", type: "service_type", parentId: 196}],
    ['st111', {name: "Боядисване на мигли", type: "service_type", parentId: 186}],
    ['st144', {name: "Интим - лазерна епилация", type: "service_type", parentId: 199}],
    ['st177', {name: "Мезотерапия на тяло", type: "service_type", parentId: 84}],
    ['st178', {name: "LPG терапия", type: "service_type", parentId: 81}],
    ['st179', {name: "Ултразвукова терапия", type: "service_type", parentId: 0}],
    ['st180', {name: "Кавитация", type: "service_type", parentId: 70}],
    ['st181', {name: "Антицелулитна терапия", type: "service_type", parentId: 59}],
    ['st182', {name: "Дифузер", type: "service_type", parentId: 192}],
    ['st183', {name: "Радиочестотна терапия - тяло", type: "service_type", parentId: 96}],
    ['st184', {name: "Дарсонвал", type: "service_type", parentId: 188}],
    ['st188', {name: "Пиърсинг", type: "service_type", parentId: 178}],
    ['st189', {name: "Филъри", type: "service_type", parentId: 0}],
    ['st191', {name: "Мезоконци", type: "service_type", parentId: 0}],
    ['st192', {name: "Мезотерапия на лице", type: "service_type", parentId: 216}],
    ['st193', {name: "Скин бустери", type: "service_type", parentId: 0}],
    ['st194', {name: "Химичен пилинг", type: "service_type", parentId: 235}],
    ['st195', {name: "Заличаване на белези", type: "service_type", parentId: 194}],
    ['st196', {name: "Радиочестотен лифтинг - лице", type: "service_type", parentId: 227}],
    ['st197', {name: "Третиране на пигментации", type: "service_type", parentId: 233}],
    ['st198', {name: "Премахване на капиляри", type: "service_type", parentId: 225}],
    ['st200', {name: "Премахване на стрии", type: "service_type", parentId: 195}],
    ['st208', {name: "LED фототерапия", type: "service_type", parentId: 210}],
    ['st209', {name: "Солариум", type: "service_type", parentId: 231}],
    ['st210', {name: "Солна стая", type: "service_type", parentId: 0}],
    ['st214', {name: "Ламиниране на мигли", type: "service_type", parentId: 207}],
    ['st215', {name: "Микронидлинг", type: "service_type", parentId: 168}],
    ['st216', {name: "Трайно изправяне", type: "service_type", parentId: 0}],
    ['st222', {name: "Мануална терапия", type: "service_type", parentId: 213}],
    ['st223', {name: "Почистване на гръб", type: "service_type", parentId: 223}],
    ['st224', {name: "Третиране на гъбичен нокът", type: "service_type", parentId: 239}],
    ['st231', {name: "Ламиниране на вежди", type: "service_type", parentId: 206}],
    ['st236', {name: "Сауна", type: "service_type", parentId: 0}],
    ['st237', {name: "Парна баня", type: "service_type", parentId: 0}],
    ['st238', {name: "Инфрачевена сауна", type: "service_type", parentId: 201}],
    ['st245', {name: "BB Glow", type: "service_type", parentId: 174}],
    ['st250', {name: "Лазерно премахване на перманентен грим", type: "service_type", parentId: 205}],
    ['st254', {name: "HIFU (Хайфу) лифтинг - лице", type: "service_type", parentId: 237}],
    ['st255', {name: "Фотоподмладяване", type: "service_type", parentId: 234}],
    ['st278', {name: "Премахване на папиломи", type: "service_type", parentId: 226}],
    ['st279', {name: "Премахване на брадавици", type: "service_type", parentId: 224}],
    ['st280', {name: "Тониране", type: "service_type", parentId: 232}],
    ['st281', {name: "Air Touch", type: "service_type", parentId: 198}],
    ['st292', {name: "Лечение на кокоши трън", type: "service_type", parentId: 240}],
    ['st295', {name: "Лечение на мазоли", type: "service_type", parentId: 241}],
    ['st296', {name: "Поставяне на шина", type: "service_type", parentId: 242}],
    ['st297', {name: "Рефлексотерапия", type: "service_type", parentId: 243}],
    ['st298', {name: "Релаксиращ масаж", type: "service_type", parentId: 244}],
    ['st299', {name: "Дълбокотканен масаж", type: "service_type", parentId: 246}],
    ['st300', {name: "Масаж с вулканични камъни", type: "service_type", parentId: 248}],
    ['st315', {name: "Карбонов пилинг", type: "service_type", parentId: 0}],
    ['st317', {name: "Поправка / Лепене на счупен нокът", type: "service_type", parentId: 250}],
    ['st318', {name: "Изграждане на счупен нокът", type: "service_type", parentId: 251}],
    ['st323', {name: "Премахване на татуировка", type: "service_type", parentId: 0}],
    ['st328', {name: "Гел върху естествен нокът", type: "service_type", parentId: 252}]
]);



// Request configuration
const axiosConfig = {
    headers: {
        'Origin': 'https://studio24.bg',
        'x-requested-with': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
};

// Pipeline Stages
class Stage {
    async process(data) {
        throw new Error('Process method must be implemented');
    }
}

class CacheDirectoryStage extends Stage {
    async process() {
        const dirs = [CACHE_DIR, CITIES_CACHE_DIR];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
        return { cities: Array.from(townMap.entries()) };
    }
}

class CityProcessingStage extends Stage {
    async process() {
        const processedCities = [];
        
        for (const [townId, townInfo] of townMap) {
            console.log(`Processing ${townInfo.name} (ID: ${townId})...`);
            
            let page = 1;
            let hasMore = true;
            const neighborhoods = [];

            while (hasMore) {
                try {
                    const params = new URLSearchParams();
                    params.append('page', page.toString());
                    params.append('listing_type', 'neighbourhood');
                    params.append('town', townId);

                    console.log(`Making request for page ${page} with params:`, {
                        method: 'post',
                        url: 'https://studio24.bg/studios/list',
                        data: params,
                        headers: axiosConfig.headers
                    });

                    const response = await axios({
                        ...axiosConfig,
                        method: 'post',
                        url: 'https://studio24.bg/studios/list',
                        data: params
                    });

                    console.log(`Response status for page ${page}:`, response.status);
                    console.log('Response data preview:', JSON.stringify(response.data));

                    if (response.data && response.data.html && response.data.html.trim()) {
                        neighborhoods.push(...this.parseNeighborhoods(response.data.html));
                        page++;
                    } else {
                        hasMore = false;
                        console.log(`No more results for ${townInfo.name} after page ${page-1}`);
                    }
                } catch (error) {
                    console.error('Request error details:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        responseData: error.response?.data,
                        requestConfig: error.config
                    });
                    hasMore = false;
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
            }

            processedCities.push({
                townId,
                townInfo,
                neighborhoods
            });
        }
        
        return { processedCities };
    }

    parseNeighborhoods(html) {
        const $ = cheerio.load(html);
        const neighborhoods = [];
        
        $('.neighborhood-item').each((_, element) => {
            const $item = $(element);
            neighborhoods.push({
                id: $item.data('id'),
                name: $item.text().trim(),
                anchor: $item.find('a').text().trim()
            });
        });
        
        return neighborhoods;
    }
}

class NeighborhoodServiceStage extends Stage {
    async process(data) {
        const { processedCities } = data;
        const results = [];
        
        for (const cityData of processedCities) {
            const cityResults = await this.processNeighborhoods(cityData);
            results.push(...cityResults);
        }
        
        return { results };
    }

    async processNeighborhoods(cityData) {
        const { townId, townInfo, neighborhoods } = cityData;
        const results = [];
        
        for (const neighborhood of neighborhoods) {
            const neighborhoodResults = await this.processServices(townId, townInfo, neighborhood);
            results.push(...neighborhoodResults);
        }
        
        return results;
    }

    async processServices(townId, townInfo, neighborhood) {
        const results = [];
        
        for (const [serviceId, serviceInfo] of serviceMap) {
            if (serviceInfo.type === 'service_type') {
                const serviceResults = await this.processServicePages(
                    townId, 
                    townInfo, 
                    neighborhood, 
                    serviceId, 
                    serviceInfo
                );
                results.push(...serviceResults);
            }
        }
        
        return results;
    }

    async processServicePages(townId, townInfo, neighborhood, serviceId, serviceInfo) {
        const results = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const cachePath = path.join(
                CACHE_DIR,
                `${townInfo.slug}_${neighborhood.id}_${serviceId}_${page}.json`
            );

            let salonData;
            if (this.isCacheValid(cachePath)) {
                salonData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            } else {
                salonData = await this.fetchSalonData(
                    townId,
                    neighborhood.id,
                    serviceId.replace('st', ''),
                    page
                );

                if (salonData) {
                    fs.writeFileSync(cachePath, JSON.stringify(salonData, null, 2));
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (salonData) {
                results.push({
                    town: townInfo.name,
                    neighborhood: neighborhood.anchor,
                    service: serviceInfo.name,
                    page,
                    data: salonData
                });
            }

            hasMore = salonData?.studios && salonData.studios.length > 0;
            page++;
        }

        return results;
    }

    isCacheValid(cachePath) {
        if (!fs.existsSync(cachePath)) return false;
        const stats = fs.statSync(cachePath);
        const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        return ageInHours < 24;
    }

    async fetchSalonData(townId, neighborhoodId, serviceTypeId, page) {
        try {
            const response = await axios({
                ...axiosConfig,
                method: 'post',
                url: 'https://studio24.bg/studios/list',
                data: `page=${page}&listing_type=service_type&town=${townId}&neighborhood=${neighborhoodId}&service_type=${serviceTypeId}`
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching salon data:`, error.message);
            return null;
        }
    }
}

class SalonParsingStage extends Stage {
    async process({ results }) {
        const parsedResults = [];
        
        for (const result of results) {
            if (result.data && result.data.html) {
                const salons = this.parseSalonListings(result.data.html);
                parsedResults.push({
                    town: result.town,
                    neighborhood: result.neighborhood,
                    service: result.service,
                    page: result.page,
                    salons
                });
            }
        }
        
        return { parsedResults };
    }

    parseSalonListings(html) {
        const $ = cheerio.load(html);
        const salons = [];

        $('article.list-item').each((i, element) => {
            const $article = $(element);
            
            const salon = {
                id: this.extractSalonId($article.find('.thumb a').attr('href')),
                name: $article.find('.title a').text().trim(),
                address: $article.find('address').text().trim(),
                rating: {
                    score: parseFloat($article.find('.rating span').first().text()),
                    reviews: parseInt($article.find('.rating span').last().text()),
                    percentage: parseFloat($article.find('.star-rating-top').attr('style').match(/width:\s*([\d.]+)%/)[1])
                },
                services: [],
                imageUrl: this.extractImageUrl($article.find('.thumb a').attr('style')),
                url: $article.find('.title a').attr('href')
            };

            $article.find('.services li').each((j, serviceElement) => {
                const $service = $(serviceElement);
                const serviceText = $service.find('.name').text().trim();
                const priceText = $service.find('.price').text().trim();
                
                salon.services.push({
                    name: serviceText,
                    price: this.parsePrice(priceText),
                    url: $service.find('a').attr('href')
                });
            });

            salons.push(salon);
        });

        return salons;
    }

    extractSalonId(url) {
        const match = url.match(/s(\d+)/);
        return match ? match[1] : null;
    }

    extractImageUrl(style) {
        const match = style.match(/url\('([^']+)'\)/);
        return match ? match[1] : null;
    }

    parsePrice(priceText) {
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
}

class ResultProcessingStage extends Stage {
    async process({ results }) {
        const summary = {
            totalCities: new Set(results.map(r => r.town)).size,
            totalNeighborhoods: new Set(results.map(r => `${r.town}-${r.neighborhood}`)).size,
            totalServices: new Set(results.map(r => r.service)).size,
            totalPages: results.length
        };

        console.log('Scraping Summary:', summary);
        return { summary, results };
    }
}

// Pipeline Runner
async function runPipeline() {
    const stages = [
        new CacheDirectoryStage(),
        new CityProcessingStage(),
        new NeighborhoodServiceStage(),
        new SalonParsingStage(),
        new ResultProcessingStage()
    ];

    let data = {};
    try {
        for (const stage of stages) {
            data = await stage.process(data);
        }
        console.log('Pipeline completed successfully');
        return data;
    } catch (error) {
        console.error('Pipeline error:', error);
        throw error;
    }
}

// Execute
runPipeline().catch(console.error);

