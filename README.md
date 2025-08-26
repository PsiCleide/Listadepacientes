# PWA Controle de Pacientes

Um Progressive Web App (PWA) completo para controle de pacientes de psicólogos, desenvolvido com HTML, CSS e JavaScript vanilla.

## 🚀 Características

- **PWA Completo**: Instalável em dispositivos móveis e desktop
- **Offline First**: Funciona sem conexão com internet
- **Responsivo**: Adaptado para todos os tamanhos de tela
- **Dashboard**: Estatísticas em tempo real dos pacientes
- **CRUD Completo**: Criar, ler, atualizar e deletar pacientes
- **Filtros**: Busca por nome, CPF ou email e filtro por status
- **Exportação**: Exportar lista de pacientes para Excel (CSV)
- **Validação**: Máscaras para CPF e telefone
- **Notificações**: Toast notifications para feedback do usuário

## 📋 Campos do Paciente

1. **Nome Completo** (obrigatório)
2. **CPF** (obrigatório, com máscara)
3. **Email**
4. **Celular (WhatsApp)** (com máscara)
5. **Data da Primeira Consulta**
6. **Data da Próxima Consulta**
7. **Status** (Ativo/Inativo)
8. **Observações**

## 🛠️ Instalação e Uso

### Opção 1: Servidor Local
```bash
# Clone ou baixe os arquivos
cd pwa-controle-pacientes

# Inicie um servidor HTTP simples
python3 -m http.server 8000
# ou
npx serve .
# ou
php -S localhost:8000

# Acesse http://localhost:8000
```

### Opção 2: GitHub Pages
1. Faça upload dos arquivos para um repositório GitHub
2. Ative o GitHub Pages nas configurações
3. Acesse a URL fornecida

### Opção 3: Netlify/Vercel
1. Faça upload da pasta para Netlify ou Vercel
2. O deploy será automático

## 📱 Instalação como App

1. Abra o PWA no navegador
2. Clique no botão "Instalar App" (aparece automaticamente)
3. Ou use o menu do navegador: "Instalar aplicativo"
4. O app será instalado como um aplicativo nativo

## 🎯 Funcionalidades

### Dashboard
- Total de pacientes cadastrados
- Número de pacientes ativos
- Número de pacientes inativos
- Botão para exportar dados

### Gerenciamento de Pacientes
- **Adicionar**: Formulário completo com validação
- **Listar**: Visualização em cards responsivos
- **Buscar**: Por nome, CPF ou email
- **Filtrar**: Por status (Todos/Ativos/Inativos)
- **Editar**: Clique no paciente e depois em "Editar"
- **Excluir**: Clique no paciente e depois em "Excluir"

### Exportação
- Exporta todos os pacientes para arquivo CSV
- Compatível com Excel e Google Sheets
- Nome do arquivo inclui a data atual

## 💾 Armazenamento

Os dados são armazenados localmente no navegador usando `localStorage`. Isso significa que:
- Os dados persistem entre sessões
- Funcionam offline
- São específicos do navegador/dispositivo
- Para backup, use a função de exportação

## 🎨 Design

- **Cores**: Paleta moderna com azul índigo (#4f46e5) como cor primária
- **Tipografia**: Inter font para melhor legibilidade
- **Ícones**: Font Awesome para consistência visual
- **Layout**: Grid responsivo com breakpoints para mobile

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet e mobile
- **PWA**: Suporte completo para instalação e uso offline

## 🔧 Estrutura de Arquivos

```
pwa-controle-pacientes/
├── index.html          # Página principal
├── manifest.json       # Configuração do PWA
├── sw.js              # Service Worker
├── css/
│   └── style.css      # Estilos principais
├── js/
│   └── app.js         # Lógica da aplicação
├── icons/             # Ícones do PWA (vários tamanhos)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── ...
│   └── icon-512x512.png
└── README.md          # Esta documentação
```

## 🚀 Próximos Passos

Para expandir o aplicativo, considere:

1. **Backend**: Integrar com API para sincronização na nuvem
2. **Autenticação**: Sistema de login para múltiplos psicólogos
3. **Relatórios**: Gráficos e relatórios mais avançados
4. **Notificações**: Lembretes de consultas
5. **Backup**: Sincronização automática com Google Drive/Dropbox

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais e comerciais.

## 🤝 Suporte

Para dúvidas ou sugestões, entre em contato ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para profissionais da psicologia**

