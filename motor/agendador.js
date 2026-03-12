const config = require('./config');
const { executar } = require('./buscar-ofertas');

async function rodar() {
  console.log('[%s] Executando busca...', new Date().toISOString());
  try {
    await executar();
    console.log('[%s] Concluído.\n', new Date().toISOString());
  } catch (err) {
    console.error('[%s] Erro:', new Date().toISOString(), err?.message || err);
  }
}

rodar();
console.log('Robô ligado. Próximas buscas a cada %d min.\n', config.INTERVALO_ROBO_MS / 60000);
setInterval(rodar, config.INTERVALO_ROBO_MS);

