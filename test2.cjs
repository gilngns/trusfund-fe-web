const https = require('https');

https.get('https://nextrust.my.id/api-docs/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/url:\s*[\"'](.*?)[\"']/);
    if (match) {
      const swaggerUrl = match[1];
      console.log('Found URL:', swaggerUrl);
      
      const fullUrl = swaggerUrl.startsWith('http') ? swaggerUrl : `https://nextrust.my.id${swaggerUrl}`;
      
      https.get(fullUrl, (res2) => {
        let jsonStr = '';
        res2.on('data', chunk => jsonStr += chunk);
        res2.on('end', () => {
          try {
            const swagger = JSON.parse(jsonStr);
            console.log(Object.keys(swagger.paths));
          } catch(e) { console.error('Error parsing JSON'); }
        });
      });
    } else {
      console.log('No URL found in swagger init');
    }
  });
});
