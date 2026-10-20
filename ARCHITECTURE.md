# Arquitetura implementada

## Runtime e persistência
Servidor Node.js 24, sem framework HTTP. PostgreSQL via driver pg em produção; SQLite nativo apenas para desenvolvimento e testes. Toda consulta parametrizada. Migrações transacionais na inicialização. O frontend usa API same-origin, sem persistência de dados ou sessão em localStorage.

## Identidade e autorização
- users: e-mail único, hash de senha scrypt com salt aleatório e papel admin, reseller ou tenant.
- O administrador global gerencia todas as revendas e empresas. A revenda só gerencia suas empresas. A conta de confeitaria só opera o próprio tenant.
- Vínculos e perfil são recuperados do banco em cada requisição, sem confiar em perfil, tenant_id ou reseller_id fornecidos pelo navegador.
- sessions: apenas SHA-256 do token aleatório de 256 bits é armazenado no banco. Cookie HttpOnly, SameSite=Lax, Secure em produção, validade de 8 horas.
- Operações de escrita exigem Origin igual à URL configurada. Endpoints JSON rejeitam formulários cross-origin. Sem CORS permissivo.
- Limites de tentativas e pedidos compartilhados no banco; cabeçalhos de segurança e lista explícita de arquivos públicos. Requisições limitadas a 8 MB.

## Multi tenancy
Todas as operações de catálogo e pedidos são autorizadas no servidor e vinculadas ao tenant. Não há acesso a pedidos por ID sem incluir e autorizar o tenant. A loja pública resolve o tenant pelo slug único e entrega apenas dados públicos do catálogo, sem lista de pedidos ou contatos administrativos. O banco usa chaves estrangeiras para vínculos. O isolamento é aplicado na camada de serviço; não depende de um seletor na interface e não usa RLS nesta versão.

Tabelas: resellers, tenants, users, sessions, tenant_data, orders, audit_events, rate_limits.
Catálogos são documentos JSON versionados por empresa dentro de tenant_data. Fotos raster são validadas e armazenadas no catálogo no banco (até 2 MB cada, sujeito ao limite total de 8 MB por atualização). Pedidos e status têm registros próprios; salvar o catálogo nunca sobrescreve pedidos.

## Licenças e pedidos
Status ativo e validade igual ou superior ao dia atual em America/Sao_Paulo são obrigatórios para acessar catálogo privado ou criar encomendas. Gerenciamento de licenças continua disponível ao administrador e revenda. No PostgreSQL, alterações de catálogo/licença e criação de pedido bloqueiam a linha do tenant dentro de transação para coordenar a validação e gravação.

Valores finais são calculados no servidor em centavos. Cada pedido guarda snapshot de produto, tamanho, recheios, adicionais, data e valor. Versionamento otimista bloqueia a sobrescrita de catálogo alterado por outro usuário. A loja exige a versão atual antes de aceitar um novo pedido. Chave idempotente impede duplicação durante tentativas repetidas de envio. Pedido é registrado como Novo; abertura do WhatsApp não representa envio, pagamento ou aceite.

## Operação e limites
Dashboard calcula indicadores e gráfico com pedidos do banco; total vendido representa encomendas criadas, sem controle financeiro de recebimentos. Atualizar no painel recarrega os pedidos; atualização em tempo real por push não está implementada. Plano é uma classificação, sem gateway de cobrança. Recuperação de senha é administrativa e não por e-mail. Uma conta de acesso por confeitaria e uma por revenda na interface atual. Página de auditoria lista as últimas 100 ações do servidor para administrador global.

Servidor está preparado para proxy HTTPS Railway, com PostgreSQL compartilhado entre instâncias. Certificados do banco usam o comportamento padrão do driver/connection string, sem desativação global de validação TLS. Domínio público deve corresponder a PUBLIC_URL. Configure política de backups e monitore tamanho dos catálogos. O modo SQLite não é permitido em produção. As credenciais e o deploy do Railway são gerenciados no ambiente de hospedagem, não no Git.

## Separação de portais
A gestão global e as revendas autenticam em `/admin` e `/api/admin/login`, com cookie `cake_admin_session`. O estabelecimento usa `/` e `/api/login`, com cookie `cake_session`. O backend valida os papéis também ao recuperar as sessões. Contas de estabelecimento não autenticam no portal administrativo, e contas de gestão não autenticam na raiz. O gestor pode abrir o painel de uma empresa autorizada dentro do contexto `/admin`, usando `/api/admin/tenants/:id`, sem criar sessão de estabelecimento.

O endpoint administrativo POST `/api/platform/demo` cria uma empresa demonstrativa Maysa Lima separada, sem sobrescrever empresas existentes. Somente administrador global. Credencial é aleatória e retornada uma única vez; banco armazena apenas hash. Dados demonstrativos são pedidos sintéticos com o catálogo do material fornecido pelo usuário, não registros reais do negócio.
