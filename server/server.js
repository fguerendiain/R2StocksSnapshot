import express from 'express';
import { renderWidget } from './renderWidget.js';

const app = express();
const PORT = 3000;

app.get('/widget', async (req, res) => {
    const symbol = req.query.symbol || 'MSFT';
    const fontFamily = req.query.font || 'Inter, system-ui, sans-serif';
    const html = await renderWidget({ symbol, fontFamily });
    const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
    const apiKey = 'V43D5Q7XYZT9B094'

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Stocks Widget SSR</title>
        <link
            rel="stylesheet"
            href="${fontUrl}"
        />        
      </head>
      <body>
        <div id="stocks-widget">
          ${html}
        </div>

        <script src="/stocks.bundle.js"></script>
        <script>
            StocksSnapshot.init({
                containerId: 'stocks-widget',
                symbol: '${symbol}',
                apiKey: '${apiKey}',
                fontUrl: '${fontUrl}',
                theme:{
                    'font-family': 'Inter, sans-serif'    
                },
                sparkline: 'week'
            });
        </script>
      </body>
    </html>        
    `);
})
app.use(express.static('dist'));
app.listen(PORT, () => {
    console.log('SSR server running on http://localhost:' + PORT);
});
