import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/jira', async (req, res) => {
  try {
    const { email, apiToken, domain, endpoint } = req.body;

    if (!email || !apiToken || !domain || !endpoint) {
      return res.status(400).json({ error: 'Missing required credentials or endpoint' });
    }

    // Ensure domain has proper format
    const formattedDomain = domain.includes('://') ? domain : `https://${domain}`;
    const url = `${formattedDomain}${endpoint}`;

    // Create Basic Auth header
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Jira API request failed: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Jira proxy server running on http://localhost:${PORT}`);
});