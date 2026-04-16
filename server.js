const express = require('express');
const path = require('path');
const fs = require('fs');

// Load .env manually (no dotenv dependency needed)
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    }
  });
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// POST /api/diagnose — receives quiz data, calls Claude, returns result
app.post('/api/diagnose', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('COLOQUE')) {
    return res.status(500).json({ error: 'API key do Claude não configurada no servidor. Edite o arquivo .env' });
  }

  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt não enviado.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Erro na API Anthropic' });
    }

    const data = await response.json();
    res.json({ text: data.content[0].text });

  } catch (err) {
    console.error('Erro ao chamar Claude:', err);
    res.status(500).json({ error: 'Erro interno ao gerar diagnóstico: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Sovereign Consultant rodando em http://localhost:${PORT}\n`);
});
