const http = require('http');
const https = require('https');
const port = process.env.PORT || 3000;

const azureStorageUrl = 'https://storagejoeri.blob.core.windows.net/dgjoeri/waardes.csv';

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    https.get(azureStorageUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        let lines = data.trim().split(',');
        let values = lines.map((line) => {
          const [date, value] = line.split(':');
          return {
            date: date,
            value: value,
          };
        });

        // Function to send a portion of the values
        function sendValues(sliceCount) {
          const slicedValues = values.slice(0, sliceCount);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.write('<html><body>');

          res.write('<canvas id="myChart" width="400" height="200"></canvas>');

          res.write('<button id="loadMore">Load 25 More Records</button>');

          res.write('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
          res.write('<script>');
          res.write('var ctx = document.getElementById("myChart").getContext("2d");');
          res.write('var labels = ' + JSON.stringify(slicedValues.map((line) => line.date)) + ';');
          res.write('var data = ' + JSON.stringify(slicedValues.map((line) => line.value)) + ';');
          res.write('var myChart = new Chart(ctx, {');
          res.write('type: "line",');
          res.write('data: {');
          res.write('labels: labels,');
          res.write('datasets: [{');
          res.write('label: "Values",');
          res.write('data: data,');
          res.write('backgroundColor: "rgba(75, 192, 192, 0.2)",');
          res.write('borderColor: "rgba(75, 192, 192, 1)",');
          res.write('borderWidth: 1');
          res.write('}]');
          res.write('},');
          res.write('options: {');
          res.write('scales: {');
          res.write('y: {');
          res.write('beginAtZero: true');
          res.write('}');
          res.write('}');
          res.write('}');
          res.write('});');

          res.write('document.getElementById("loadMore").addEventListener("click", function() {');
          res.write('var moreData = ' + JSON.stringify(values.slice(sliceCount, sliceCount + 25).map((line) => line.value)) + ';');
          res.write('var moreLabels = ' + JSON.stringify(values.slice(sliceCount, sliceCount + 25).map((line) => line.date)) + ';');
          res.write('myChart.data.labels = myChart.data.labels.concat(moreLabels);');
          res.write('myChart.data.datasets[0].data = myChart.data.datasets[0].data.concat(moreData);');
          res.write('myChart.update();');
          res.write('});');

          res.write('</script>');

          res.write('</body></html>');
          res.end();
        }

        // Initially, display the first 25 records
        sendValues(25);
      });
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
