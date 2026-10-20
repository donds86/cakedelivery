# Doce Ateliê — mockup navegável

Abra http://127.0.0.1:4173 com o servidor iniciado por `node server.cjs` nesta pasta.

Protótipo em português com painel (Dashboard, Pedidos, Produtos, Preços, Clientes) e loja de montagem de bolos. Layout responsivo, ilustrações vetoriais próprias e marca demonstrativa inspirada na paleta das referências.

## Testar
- Em Preços, ajuste tamanhos e adicionais e salve. Cadastre o WhatsApp com país e DDD, só números.
- Em Produtos, cadastre ou edite bolos e adicione fotos de até 2 MB.
- Abra Ver loja do cliente e personalize o bolo. O total muda imediatamente.
- Preencha nome e data. O botão registra a encomenda local e abre o WhatsApp com a mensagem pronta; o cliente precisa confirmar o envio.
- Volte ao painel para ver a encomenda e mudar o status.

Os dados ficam apenas no localStorage deste navegador. Não há backend, autenticação, sincronização entre dispositivos, pagamento ou confirmação real de entrega da mensagem. O gráfico semanal é ilustrativo; os indicadores são calculados com os pedidos locais. Total vendido hoje representa encomendas criadas hoje, sem controle de pagamento. Cada andar adicional tem preço fixo na proposta. O preço base do produto usa o tamanho inicial de referência de R$ 65; a diferença é aplicada aos demais tamanhos.

Para produção: definir regras de andares e rendimentos, implementar banco de dados, autenticação administrativa, upload de fotos, registro compartilhado e fluxo de confirmação de encomendas. Publicar a loja e proteger o painel.

Verificação: `node verify.cjs` confere cálculos, atualização dos preços, renderização das telas e mudança de status. `node --check app.js` verifica sintaxe. HTTP local verificado com resposta 200. Layout não foi inspecionado visualmente em navegador automatizado nesta entrega.

## Gestão SaaS e revendas
Clique em Gestão SaaS no painel da confeitaria. A administração possui Visão geral, Empresas, Licenças e Revendas. Use Simular visão para revisar a área de uma revenda. Cadastre clientes, associe revendas, altere planos, validade e status das licenças. Abrir painel troca a empresa ativa e carrega seus dados locais. Empresas novas iniciam sem pedidos; licenças inativas ou vencidas bloqueiam a loja na demonstração.

A separação local de dados serve para revisar o comportamento multiempresa. Não é uma implementação segura de multi tenancy. Veja ARCHITECTURE.md para papéis, modelo de dados e requisitos de isolamento no backend. A loja continua usando o wizard de seis etapas.
