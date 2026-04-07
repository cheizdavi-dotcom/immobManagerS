# ImmobManager - CRM Imobiliário

## Contexto do Projeto

CRM completo para gestão de imobiliária desenvolvido com Next.js 16, Prisma (PostgreSQL/Neon), NextAuth e Tailwind CSS.

---

## O que foi implementado

### Features do CRM (prontas)
- **Dashboard** - Gráficos de VGV, comissões pendentes, eficiência, corretores ativos
- **Clientes (Kanban)** - Pipeline com drag-and-drop: Novo → Contato → Agendado → Negociação → Contrato → Fechado
- **Vendas** - Tabela com filtros, modal de criação/edição, status do funil, **gerador de PDF**
- **Agenda de Visitas** - Calendário mensal visual + lista do dia + **envio de lembretes WhatsApp**
- **Corretores** - Cadastro com integração de usuário no auth
- **Empreendimentos** - Cadastro de obras/construtoras
- **Imóveis** - Catálogo de propriedades com detalhes
- **Finanças** - Controle de comissões a pagar
- **Configurações** - Dados da empresa, comissões (house/broker), APIs (WhatsApp, Meta, RD Station)

### Funcionalidades implementadas nessa sessão

1. **WhatsApp** (`src/app/actions.ts`)
   - Função `sendWhatsAppMessage(phone, message)` que usa o token das configurações
   - Botão nos cards de clientes na aba Kanban
   - Envia mensagem automática ao clicar

2. **Agenda de Visitas** (`src/app/dashboard/visitas/`)
   - Página `page.tsx` com busca de dados do Prisma
   - `VisitasClient.tsx` com calendário mensal interativo
   - Modal para criar/editar visitas
   - Status: Agendada, Confirmada, Realizada, Cancelada, Remarcada

---

## Estrutura do projeto

```
immobmanager/
├── prisma/schema.prisma     # Modelos do banco
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── clientes/         # Kanban de clientes
│   │   │   ├── vendas/           # Vendas
│   │   │   ├── visitas/          # NOVO: Calendário
│   │   │   ├── corretores/
│   │   │   ├── empregos/
│   │   │   ├── financeiro/
│   │   │   └── configuracoes/
│   │   ├── actions.ts             # Server actions (inclui WhatsApp)
│   │   └── api/auth/             # NextAuth
│   ├── components/
│   │   └── Sidebar.tsx           # Menu lateral
│   └── lib/
│       └── prisma.ts             # Conexão DB
└── .env                         # Variáveis de ambiente
```

---

## Como rodar

```bash
cd immobmanager
npm install
npm run dev
# Acesse http://localhost:3000
```

---

## Próximos passos sugeridos

1. ~~Faturas/Propostas PDF~~ ✅ **FEITO** - Gerador de PDF funcionando
2. **Follow-up pro corretor** ✅ **FEITO (MANUAL)** - Dias sem contato no card + botão WhatsApp atualiza data
3. **Follow-up automático** - Implementado em actions.ts (sendFollowUpReminders), precisa de cron job
4. **Relatórios** - Conversion rate por corretor
5. **Deploy** - Só quando tudo funcionando 100%

---

## Histórico de Sessão

### Sessão atual (31/03/2026)
- Adicionado botão de WhatsApp nos cards de clientes (Kanban)
- Criada função `sendWhatsAppMessage` em `actions.ts`
- Criada página "Agenda de Visitas" com calendário mensal
- Adicionado item "Agenda de Visitas" na Sidebar
- Criado arquivo CONTEXT.md para persistência de contexto

### Sessão atual (31/03/2026) - Continuação
- Implementado **Lembrete de Visitas Automático**:
  - Nova função `sendVisitReminders()` em `actions.ts`
  - Botão "Enviar Lembretes" na página de Visitas
  - Envia WhatsApp automático para clientes com visita agendada/confirmada para hoje
  - Template: "Olá {nome}! Lembrete: Sua visita está agendada para hoje às {hora} no imóvel {titulo} ({endereço})"

- Corrigido **bug do toggle WhatsApp** nas Configurações (não salvava ao desconectar)

- Implementado **Gerador de PDF para Vendas**:
  - Nova lib `jspdf` instalada
  - Arquivo `src/lib/generatePDF.ts` com função `generateSalePDF()`
  - Botão verde "Gerar PDF" na tabela de Vendas
  - PDF contém: empresa (se configurado), cliente, imóvel, venda, corretor, observações
  - Visual clean/profissional com cores do tema

### Sessão atual (02/04/2026)
- Implementado **Follow-up Manual**:
  - Adicionado campo `ultimoContato` no modelo Client (schema.prisma)
  - Adicionada relação `userId` no Client (cada cliente pertence a um corretor)
  - Atualizado `saveClient()` em actions.ts para definir `ultimoContato` ao criar/editar
  - Atualizado `updateClientPhase()` para atualizar `ultimoContato` ao mover de fase
  - Atualizado `sendWhatsAppMessage()` para atualizar `ultimoContato` após envio
  - Exibido "dias sem contato" no card do cliente (ClientesClient.tsx)
  - Botão de WhatsApp no card agora atualiza data de contato

- Implementado **Follow-up Automático**:
  - Nova função `sendFollowUpReminders(daysThreshold)` em actions.ts
  - Envia WhatsApp para clientes sem contato há mais de X dias (padrão: 5)
  - Clientes em fase FECHADO/CONTRATO são excluídos