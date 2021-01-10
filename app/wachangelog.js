const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const NodeCache = require('node-cache');
const ResponseCache = new NodeCache();

const cache = true,
  cacheKey = 'WA_CL_CACHE',
  cacheTTL = 604800000; // 1 Week Assuming that we can have the updated response from WA before months

const waChangeLogResponseTemplate = {
  meta: {
    scraper_version: '1.0.0',
    scraper_status: 'stable',
  },
  scraper_data: {
    type: 'WhatsappChangeLog',
    link: 'https://developers.facebook.com/docs/whatsapp/changelog/',
    whatapp: {
      currentVersion: '',
      currentVersionStart: '',
      currentVersionEnd: '',
      otherVersions: [],
    },
  },
};

const ElementMap = {
  // Current Version
  current_version: 'tbody#u_0_2 tr.row_0 > td:nth-child(1) > p > a',
  current_version_start: 'tbody#u_0_2 tr.row_0 > td:nth-child(2) > p',
  current_version_end: 'tbody#u_0_2 tr.row_0 > td:nth-child(3) > p',
  // Recent Old Versions
  // recent - 0
  // old - 4
  old_version_0: 'tbody#u_0_2 tr.row_1._5m29 > td:nth-child(1) > p > a',
  old_version_0_start: 'tbody#u_0_2 tr.row_1._5m29 > td:nth-child(2) > p',
  old_version_0_end: 'tbody#u_0_2 tr.row_1._5m29 > td:nth-child(3) > p',
  old_version_1: 'tbody#u_0_2 tr.row_2 > td:nth-child(1) > p > a',
  old_version_1_start: 'tbody#u_0_2 tr.row_2 > td:nth-child(2) > p',
  old_version_1_end: 'tbody#u_0_2 tr.row_2 > td:nth-child(3) > p',
  old_version_2: 'tbody#u_0_2 tr.row_3._5m29 > td:nth-child(1) > p > a',
  old_version_2_start: 'tbody#u_0_2 tr.row_3._5m29 > td:nth-child(2) > p',
  old_version_2_end: 'tbody#u_0_2 tr.row_3._5m29 > td:nth-child(3) > p',
  old_version_3: 'tbody#u_0_2 tr.row_4 > td:nth-child(1) > p > a',
  old_version_3_start: 'tbody#u_0_2 tr.row_4 > td:nth-child(2) > p',
  old_version_3_end: 'tbody#u_0_2 tr.row_4 > td:nth-child(3) > p',
  old_version_4: 'tbody#u_0_2 tr.row_5._5m29 > td:nth-child(1) > p > a',
  old_version_4_start: 'tbody#u_0_2 tr.row_5._5m29 > td:nth-child(2) > p',
  old_version_4_end: 'tbody#u_0_2 tr.row_5._5m29 > td:nth-child(3) > p',
};

const getVersion = async (nocache = false) => {
  // Check of Cache
  const cacheData = ResponseCache.get(cacheKey);
  if (cacheData !== undefined && !nocache) {
    console.log("[INFO] Using Cache")
    return cacheData;
  }

  console.log("[INFO] Cache not found")
  let waChangeLogResponse = waChangeLogResponseTemplate;
  try {
    const { data } = await axios.get('https://developers.facebook.com/docs/whatsapp/changelog/');
    const $ = cheerio.load(data);

    waChangeLogResponse.scraper_data.whatapp.currentVersion = $(ElementMap.current_version).text();
    waChangeLogResponse.scraper_data.whatapp.currentVersionStart = moment(
      $(ElementMap.current_version_start).text(),
      'MMMM DD, YYYY',
    );
    waChangeLogResponse.scraper_data.whatapp.currentVersionEnd = moment(
      $(ElementMap.current_version_end).text(),
      'MMMM DD, YYYY',
    );

    for (i = 0; i <= 4; i++) {
      waChangeLogResponse.scraper_data.whatapp.otherVersions.push({
        version: $(ElementMap[`old_version_${i}`]).text(),
        start: moment($(ElementMap[`old_version_${i}_start`]).text(), 'MMMM DD, YYYY'),
        end: moment($(ElementMap[`old_version_${i}_end`]).text(), 'MMMM DD, YYYY'),
      });
    }

    ResponseCache.set(cacheKey, waChangeLogResponse, cacheTTL);
    console.log("[INFO] Saving to Cache")
  } catch (e) {
    console.log(e);
  }

  return waChangeLogResponse;
};

module.exports = {
  getVersion,
};
