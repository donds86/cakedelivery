# Cake Delivery — arquitetura proposta para implementação

## Escopo desta entrega
Mockup navegável, sem backend. O painel Gestão SaaS demonstra administração da plataforma, revendas, empresas e licenças. Cada empresa carrega um conjunto independente de dados do localStorage. Os perfis são selecionáveis para revisão do produto, sem autenticação. Isso não é isolamento de segurança.

## Papéis e regras propostas
- Administrador da plataforma: cadastra revendas, empresas e licenças; pode vincular empresas a uma revenda.
- Revenda: cadastra clientes e administra somente suas empresas e licenças. A permissão para ativar/desativar foi adotada para a demonstração e pode ser ajustada no produto.
- Administrador da confeitaria: gerencia seus produtos, tamanhos, preços, clientes e pedidos.
- Cliente final: acessa a loja pública da empresa, monta o bolo e solicita a encomenda.
- Uma empresa representa um tenant. Uma revenda pode possuir várias empresas vinculadas. Clientes diretos são administrados pela plataforma.
- Licença ativa e dentro da validade permite operação; licença inativa, suspensa ou vencida bloqueia novas encomendas. A administração global permanece acessível. Planos são rótulos nesta fase, sem cobrança ou limites implementados.

## Estrutura de dados sugerida
| Entidade | Escopo e vínculo |
| --- | --- |
| users | Identidade autenticada |
| resellers | Revenda |
| reseller_memberships | Usuário + revenda + papel |
| tenants | Empresa + reseller_id opcional + slug público único |
| tenant_memberships | Usuário + tenant_id + papel |
| licenses | tenant_id + plano + status + validade |
| products / sizes / price_rules | tenant_id obrigatório |
| customers / orders / order_items | tenant_id obrigatório |
| audit_events | Ator, escopo, ação, valores anteriores e novos |

## Requisitos de segurança para o backend
Resolver a empresa pelo slug público ou contexto autenticado; validar a associação no servidor. Nunca confiar em tenant_id, perfil ou preço enviado pelo navegador. Aplicar filtros por tenant_id em todas as operações e políticas de isolamento no banco. Relacionamentos entre pedidos, produtos e clientes devem garantir o mesmo tenant. Arquivos devem possuir prefixo por tenant e autorização de acesso. Revendas só podem atuar nas empresas sob seu vínculo. Administradores globais exigem autorização explícita e auditoria, especialmente ao acessar uma empresa.

Verificar status e validade da licença no servidor em cada operação protegida, incluindo API pública de encomendas. Definir fuso da validade e regra de expiração. Calcular o valor final no servidor a partir da tabela vigente e salvar um snapshot dos valores no pedido. Registrar o pedido no banco antes de abrir o WhatsApp. Não tratar a abertura do WhatsApp como confirmação do envio ou aceite da encomenda.

Implementar testes de acesso cruzado entre tenants e revendas, tentativas de alterar contexto, licenças expiradas e manipulação de preço. O servidor estático atual é apenas de desenvolvimento local; não deve ser usado como backend de produção.

## Repositório
Repositório informado: https://github.com/donds86/cakedelivery
Branch inicial solicitada: dev. A branch main não é criada nesta entrega.
