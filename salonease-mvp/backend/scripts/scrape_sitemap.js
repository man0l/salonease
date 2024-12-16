const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const cheerio = require('cheerio');
const path = require('path');

// Rate limiting settings
const CONCURRENT_REQUESTS = 3;
const REQUEST_DELAY = 1000;

// File paths
const CACHE_DIR = path.join(__dirname, 'cache');
const URLS_CACHE_PATH = path.join(CACHE_DIR, 'urls.json');
const PROGRESS_CACHE_PATH = path.join(CACHE_DIR, 'progress.json');
const FINAL_OUTPUT_PATH = path.join(__dirname, 'salon_data.json');

const CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Стара Загора', 'Русе', 'Ямбол',
  'Перник', 'Пазарджик', 'Габрово', 'Благоевград', 'Плевен'
];

const cyrillicToLatin = {
  'София': 'sofiya',
  'Пловдив': 'plovdiv', 
  'Варна': 'varna',
  'Бургас': 'burgas',
  'Стара Загора': 'stara-zagora',
  'Русе': 'ruse',
  'Ямбол': 'yambol',
  'Перник': 'pernik',
  'Пазарджик': 'pazardzhik',
  'Габрово': 'gabrovo',
  'Благоевград': 'blagoevgrad',
  'Плевен': 'pleven'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getCitySlug = (city) => cyrillicToLatin[city];

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

async function loadCache(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

async function saveCache(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function fetchSitemapUrls() {
  // Try to load cached URLs first
  const cachedUrls = await loadCache(URLS_CACHE_PATH);
  if (cachedUrls.length > 0) {
    console.log(`Loaded ${cachedUrls.length} URLs from cache`);
    return cachedUrls;
  }

  console.log('Fetching sitemap from studio24.bg...');
  const response = await axios.get('https://studio24.bg/sitemap.xml', {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);
  
  if (!result.urlset?.url) {
    throw new Error('Invalid sitemap structure');
  }

  const urls = result.urlset.url.map(url => url.loc[0]);
  console.log(`Found ${urls.length} URLs in sitemap`);
  
  // Cache the URLs
  await saveCache(URLS_CACHE_PATH, urls);
  
  return urls;
}

async function processBatch(urls, batchSize) {
  // Load progress from cache
  const processedResults = await loadCache(PROGRESS_CACHE_PATH, { results: [], lastProcessedIndex: 0 });
  const { results = [], lastProcessedIndex = 0 } = processedResults;
  
  console.log(`Resuming from index ${lastProcessedIndex} with ${results.length} previously processed results`);

  const remainingUrls = urls.slice(lastProcessedIndex);
  console.log(`${remainingUrls.length} URLs remaining to process`);

  for (let i = 0; i < remainingUrls.length; i += batchSize) {
    const currentIndex = lastProcessedIndex + i;
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(remainingUrls.length/batchSize)}`);
    
    const batch = remainingUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => processUrl(url));
    const batchResults = await Promise.all(batchPromises);
    
    // Add successful results to the collection
    const validResults = batchResults.filter(Boolean);
    results.push(...validResults);
    
    // Update progress cache after each batch with the current index
    await saveCache(PROGRESS_CACHE_PATH, {
      results,
      lastProcessedIndex: currentIndex + batch.length
    });
    
    console.log(`Completed batch. Total processed URLs: ${currentIndex + batch.length}`);
    console.log(`Valid results in this batch: ${validResults.length}`);
    console.log(`Total valid results: ${results.length}`);
    
    await delay(REQUEST_DELAY);
  }

  return results;
}

async function processUrl(url) {
  console.log(`Processing URL: ${url}`);
  const salonPattern = /salon-za-krasota-(.+)-(.+)-k(\d+)/;
  const match = url.match(salonPattern);
  
  if (!match) {
    console.log(`URL ${url} doesn't match salon pattern`);
    return null;
  }

  const [, neighbourhood, citySlug, salonId] = match;
  const city = Object.entries(cyrillicToLatin).find(([_, slug]) => slug === citySlug)?.[0];
  
  if (!city) {
    console.log(`City not found for slug: ${citySlug}`);
    return null;
  }

  try {
    console.log(`Fetching data for salon ${salonId} in ${city}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    const salonName = $('h1').first().text().trim();
    const address = $('address').first().text().trim();
    const rating = $('.rating').first().text().trim();
    const reviewCount = $('.reviews-count').first().text().trim();
    const servicesUrl = $('.services-list a').last().attr('href') || url;

    console.log(`Successfully extracted data for salon: ${salonName}`);

    return {
      salonId,
      name: salonName,
      city,
      neighbourhood: neighbourhood.replace(/-/g, ' '),
      address,
      rating: rating ? parseFloat(rating) : null,
      reviewCount: reviewCount ? parseInt(reviewCount, 10) : null,
      url,
      servicesUrl,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error processing ${url}: ${error.message}`);
    return null;
  }
}

function extractServices($) {
  const services = [];
  
  $('li').each((_, element) => {
    const serviceText = $(element).text().trim();
    const priceMatch = serviceText.match(/(.*?)\s+(\d+)\s*лв\./);
    
    if (priceMatch) {
      services.push({
        name: priceMatch[1].trim(),
        price: parseInt(priceMatch[2], 10),
        currency: 'BGN'
      });
    }
  });

  return services;
}

async function scrapeSitemap() {
  console.log('Starting sitemap scraping...');
  
  try {
    await ensureCacheDir();
    
    // Step 1: Fetch and cache URLs
    const urls = await fetchSitemapUrls();
    
    // Step 2: Process URLs in batches with caching
    const salonData = await processBatch(urls, CONCURRENT_REQUESTS);
    
    // Step 3: Save final results
    await saveCache(FINAL_OUTPUT_PATH, salonData);
    
    console.log(`Successfully scraped ${salonData.length} salons`);
    console.log(`Final data saved to ${FINAL_OUTPUT_PATH}`);
    
  } catch (error) {
    console.error('Scraping failed:', error.message);
    process.exit(1);
  }
}

(async () => {
  console.log('Script started');
  try {
    await scrapeSitemap();
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
