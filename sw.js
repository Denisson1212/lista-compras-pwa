const CACHE_NAME = 'lista-compras-cache-v1';
// Arquivos essenciais para o app funcionar offline
const urlsToCache = [
  '.', // Representa o diretório atual (pegará o index.html ou start_url)
  'styles.css', // **SE** você separar o CSS num arquivo, adicione aqui
  'app.js',   // **SE** você separar o JS num arquivo, adicione aqui
  'icon-192.png',
  'icon-512.png'
  // Adicione aqui outros arquivos JS ou CSS que você possa criar
];

// Evento de Instalação: Baixa e armazena os arquivos em cache
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto, adicionando arquivos essenciais.');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Arquivos essenciais cacheados com sucesso.');
        return self.skipWaiting(); // Ativa o SW imediatamente
      })
      .catch(error => {
          console.error('Service Worker: Falha ao cachear arquivos durante a instalação.', error);
      })
  );
});

// Evento de Ativação: Limpa caches antigos (se houver)
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
         console.log('Service Worker: Cache limpo, pronto para controlar a página.');
         return self.clients.claim(); // Controla clientes abertos imediatamente
     })
  );
});

// Evento Fetch: Intercepta requisições de rede
self.addEventListener('fetch', event => {
  // Responde prioritariamente com o cache, e busca na rede como fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('Service Worker: Servindo do cache:', event.request.url);
          return response; // Encontrou no cache, retorna
        }
        // console.log('Service Worker: Não encontrado no cache, buscando na rede:', event.request.url);
        return fetch(event.request); // Não achou no cache, busca na rede
      }
    ).catch(error => {
        console.error('Service Worker: Erro no fetch:', error);
        // Poderia retornar uma página offline padrão aqui, se tivesse uma
    })
  );
});