// const showDebugingInfo = false; // Setting this to true shows more debugging info.
// if (showDebugingInfo) {
//   api.setDebug(true);
// }

const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
require('dotenv').config();
let access_token = process.env.FB_API_KEY;
let ad_account_id = process.env.FB_ID;

const api = bizSdk.FacebookAdsApi.init(access_token);

const fields = [
    'spend',
];
async function getFbAdspend(fromDate, toDate) {
    fromDate = fromDate.toISOString().slice(0, 10);  // Convert to 'YYYY-MM-DD' format
    toDate = toDate.toISOString().slice(0, 10);  // Convert to 'YYYY-MM-DD' format
    
    try {
        const spend = await (new AdAccount(ad_account_id)).getInsights(fields, {
            'time_range': {'since': fromDate, 'until': toDate},
            'filtering': [],
            'level': 'campaign',
            'breakdowns': [],
        });
        return spend && spend[0] && spend[0]._data ? spend[0]._data.spend : 0;
    } catch (error) {
        console.error("Error fetching Facebook ad spend:", error);
        return 0;
    }
}

module.exports = { getFbAdspend }; 