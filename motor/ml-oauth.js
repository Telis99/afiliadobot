const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '..', 'dados', 'ml-token.json');
const TOKEN_ENDPOINT = 'https://api.mercadolibre.com/oauth/token';
const AUTH_ENDPOINT = 'https://auth.mercadolibre.com.ar/authorization';

function loadToken() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  } catch {
    return { access_token: null, refresh_token: null, expires_at: 0 };
  }
}

function saveToken(token) {
  const pasta = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), 'utf8');
}

function getEnvOrThrow(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta configurar ${name} no ambiente.`);
  return v;
}

function getAuthUrl() {
  const clientId = getEnvOrThrow('ML_CLIENT_ID');
  const redirectUri = getEnvOrThrow('ML_REDIRECT_URI');

  const u = new URL(AUTH_ENDPOINT);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  return u.toString();
}

async function exchangeCodeForToken(code) {
  const clientId = getEnvOrThrow('ML_CLIENT_ID');
  const clientSecret = getEnvOrThrow('ML_CLIENT_SECRET');
  const redirectUri = getEnvOrThrow('ML_REDIRECT_URI');

  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('code', code);
  body.set('redirect_uri', redirectUri);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`OAuth token falhou (${res.status}): ${json.message || 'erro'}`);

  const expiresAt = Date.now() + (json.expires_in ? json.expires_in * 1000 : 0) - 60_000;
  const token = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: expiresAt
  };
  saveToken(token);
  return token;
}

async function refreshAccessToken(refreshToken) {
  const clientId = getEnvOrThrow('ML_CLIENT_ID');
  const clientSecret = getEnvOrThrow('ML_CLIENT_SECRET');

  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('refresh_token', refreshToken);

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`OAuth refresh falhou (${res.status}): ${json.message || 'erro'}`);

  const expiresAt = Date.now() + (json.expires_in ? json.expires_in * 1000 : 0) - 60_000;
  const token = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || refreshToken,
    expires_at: expiresAt
  };
  saveToken(token);
  return token;
}

async function getValidAccessToken({ allowRefresh = true } = {}) {
  const token = loadToken();
  if (token.access_token && token.expires_at && Date.now() < token.expires_at) return token.access_token;

  if (allowRefresh && token.refresh_token) {
    const refreshed = await refreshAccessToken(token.refresh_token);
    return refreshed.access_token;
  }

  return null;
}

async function cli() {
  const cmd = process.argv[2];

  if (cmd === 'url') {
    console.log(getAuthUrl());
    return;
  }

  if (cmd === 'code') {
    const code = process.env.ML_CODE || process.argv[3];
    if (!code) throw new Error('Passe o code: defina ML_CODE ou use: node motor/ml-oauth.js code <code>');
    await exchangeCodeForToken(code);
    console.log('Token salvo em dados/ml-token.json');
    return;
  }

  if (cmd === 'refresh') {
    const token = loadToken();
    if (!token.refresh_token) throw new Error('Sem refresh_token salvo ainda. Rode o fluxo de code primeiro.');
    await refreshAccessToken(token.refresh_token);
    console.log('Token renovado e salvo.');
    return;
  }

  console.log('Uso:');
  console.log('  node motor/ml-oauth.js url');
  console.log('  node motor/ml-oauth.js code <code>   (ou defina ML_CODE)');
  console.log('  node motor/ml-oauth.js refresh');
}

if (require.main === module) {
  cli().catch(err => {
    console.error(err.message || err);
    process.exit(1);
  });
}

module.exports = { getAuthUrl, exchangeCodeForToken, refreshAccessToken, getValidAccessToken, loadToken, saveToken };

