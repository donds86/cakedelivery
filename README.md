# Cake Delivery

Sistema de encomendas com servidor Node.js 24, PostgreSQL, login e três perfis: administrador global, revenda e confeitaria. A loja pública usa um wizard de sete etapas e grava o pedido no banco antes de abrir a mensagem do WhatsApp.

## Desenvolvimento local

1. Instale Node.js 24 ou superior e execute `npm ci`.
2. Copie `.env.example` para `.env`. Defina `ADMIN_EMAIL` e uma `ADMIN_PASSWORD` exclusiva com no mínimo 12 caracteres.
3. Execute `npm start` e abra `http://localhost:4173/login` (ou o endereço definido em PUBLIC_URL).
4. Sem DATABASE_URL, o desenvolvimento utiliza SQLite persistente em `data/development.sqlite`. Nunca use esse modo para o deploy.

O primeiro administrador é criado no banco no primeiro início. Nas próximas inicializações, as variáveis não alteram sua senha. Use Minha senha no painel. Não há credenciais padrão nem contas demonstrativas criadas automaticamente em produção.

## Deploy no Railway

Conecte o repositório `donds86/cakedelivery`, branch `dev`, e adicione um serviço PostgreSQL. O projeto inclui `railway.json`, Dockerfile e comando `npm start`.

Variáveis do serviço da aplicação:

| Variável | Valor |
| --- | --- |
| NODE_ENV | production |
| DATABASE_URL | Referência à DATABASE_URL do serviço PostgreSQL, por exemplo `${{Postgres.DATABASE_URL}}` |
| PUBLIC_URL | URL HTTPS final da aplicação, sem caminho; exemplo `https://cake.up.railway.app` |
| ADMIN_EMAIL | Seu e-mail para o primeiro administrador |
| ADMIN_PASSWORD | Senha exclusiva de 12 a 128 caracteres para o primeiro administrador |

O Railway injeta PORT automaticamente. O servidor escuta em `0.0.0.0`. Se PUBLIC_URL não estiver definido, usa `https://RAILWAY_PUBLIC_DOMAIN` quando disponível. Produção recusa inicializar sem PostgreSQL ou sem URL HTTPS. Para o primeiro deploy, gere o domínio público nas configurações de rede antes de concluir o início do serviço. Configure backups do PostgreSQL no ambiente de hospedagem.

As migrações idempotentes são aplicadas na inicialização. O healthcheck `/health` verifica a conexão com o banco. Não há dados persistidos no disco da aplicação em produção: catálogo, fotos, pedidos, contas, sessões e auditoria ficam no PostgreSQL.

## Primeiro uso

- Entre em `/admin` com ADMIN_EMAIL e ADMIN_PASSWORD.
- Cadastre revendas com e-mail e senha de acesso. Somente o administrador global gerencia revendas.
- Cadastre uma empresa, responsável, e-mail, senha, link da loja, plano e validade. A revenda só cadastra e administra empresas vinculadas a ela.
- Abra o painel da empresa e configure catálogo, preços, adicionais e WhatsApp com país e DDD.
- Compartilhe `/loja/slug-da-empresa` com os clientes. O estabelecimento entra em `/` (ou `/login`), com a conta da própria empresa.
- O botão final registra a encomenda e abre o WhatsApp com a mensagem pronta. Se o navegador bloquear a janela, o comprovante mostra um link para abrir o WhatsApp. O envio da mensagem e a disponibilidade dependem da confirmação das pessoas.
- Licenças inativas, suspensas ou vencidas bloqueiam a API e a loja, mas a gestão continua acessível para regularização.
- A senha pode ser alterada pelo usuário; o gestor pode redefinir a senha ao editar uma empresa/revenda. Não há recuperação automática por e-mail nesta versão.

## Regras de preço

Preço do tamanho + diferença do preço base do produto em relação a R$ 65 + recheios extras + adicional fixo por andar + topo. O backend valida preços não negativos, recalcula em centavos e salva os valores no pedido. Até três andares e seis recheios. Planos Essencial e Profissional são classificações comerciais; cobrança e restrições por plano não estão implementadas.

## Verificação

`npm test` executa testes de integração HTTP com banco real SQLite em arquivo temporário. `TEST_DATABASE_URL` executa a mesma suíte com PostgreSQL. O GitHub Actions configura PostgreSQL 17 e testa os dois modos. Testes cobrem autenticação, isolamento entre empresas/revendas, licenças, preços adulterados, concorrência de catálogo, duplicação de pedido, persistência, auditoria e logout.

Veja `ARCHITECTURE.md` para o modelo de dados e limites operacionais. Os dados do antigo mockup no navegador não são importados automaticamente para o servidor.

## Empresa demonstrativa local

Para criar Doce Ateliê com quatro pedidos fictícios no banco local, defina DEMO_PASSWORD (mínimo 12 caracteres) e execute `npm run seed:demo`. O acesso será `demo@cakedelivery.local`, com a senha que você definiu. O script é bloqueado em produção e quando DATABASE_URL está configurada; não sobrescreve uma empresa já existente. A loja fica em `/loja/doce-atelie`; configure o WhatsApp antes de enviar encomendas.

## Acessos separados e demonstração para leads

- `/`: acesso exclusivo do estabelecimento. `/login` permanece como endereço alternativo.
- `/admin`: administrador da plataforma e revendas. Sessão e cookie separados; uma sessão administrativa não abre a gestão na raiz.
- `/loja/slug`: montagem pública do pedido.

Em `/admin`, clique em **Criar demonstração** para provisionar uma empresa separada **Maysa Lima · Demonstração**, com licença permanente, credenciais geradas, quatro pedidos fictícios e o cardápio da imagem de 2026. Login, senha (exibida uma vez) e link da loja aparecem na confirmação. Cada criação gera uma instância independente, sem alterar clientes existentes.

Cardápio demonstrativo: 10 cm/4 fatias/R$ 80; 12 cm/6/R$ 100; 15 cm/12/R$ 140; 20 cm/22/R$ 190; 25 cm/35/R$ 260; 30 cm/52/R$ 360; 35 cm/76/R$ 490. Tradicionais: Brigadeiro, Ninho e Coco. Especiais: Nutella, Morango, Maracujá, Abacaxi, Nozes, Ameixa, Pêssego e Doce de leite, com mínimos de R$ 15 por opção para a apresentação. Andar adicional: R$ 20. Topo não incluso e sem valor informado, portanto não oferecido com preço automático. Sem acréscimo por quantidade nesta configuração, pois a imagem não define uma regra. Limite técnico de seleção: seis recheios.

Pedidos com recheios especiais mostram total estimado e mensagem de confirmação do valor final, porque o cardápio diz “a partir de”. Todos esses adicionais e comportamentos são editáveis em Preços. O número 99873-6335 é apresentado como contato; o WhatsApp permanece sem configuração até informar país e DDD. Nenhum DDD foi inferido. A imagem original não integra a publicação no GitHub; somente os dados de cardápio foram cadastrados.


Demonstrações criadas por `demo.created` são convertidas para licença permanente pela migração única `permanent-demo-v1`. São preservados dados, login, senha, slug e status. A validade interna `9999-12-31` representa licença sem vencimento e aparece como Permanente no painel; ainda é possível suspender ou desativar a licença. A opção é editável no cadastro da empresa.

## E-mail compartilhado entre empresa e revenda
O mesmo e-mail pode ser cadastrado no estabelecimento (`/`) e em uma revenda (`/admin`). São contas independentes; cada uma tem sua própria senha, sessão e permissões. O e-mail continua único dentro de cada portal: não pode identificar duas empresas distintas na raiz nem duas contas de gestão em `/admin`. A migração `scoped-email-v1` remove a restrição global antiga e preserva usuários, hashes, vínculos e sessões existentes. O login consulta apenas as contas do portal acessado.

A montagem inclui Tema logo após Recheios, com opções prontas, sem tema ou personalizado. O tema é salvo no pedido e enviado no WhatsApp; não altera automaticamente o preço. A navegação Voltar/Continuar e a finalização ficam após o resumo, no computador e no celular.

