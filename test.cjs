const https = require('https');

https.get('https://nextrust.my.id/api-docs/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/url: [\"'](.*?)[\"']/);
    console.log(match ? match[1] : 'No URL found');
  });
});
