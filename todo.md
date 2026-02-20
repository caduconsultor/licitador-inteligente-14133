# Licitador Inteligente 14.133 - TODO

## Fase 1: Análise e Planejamento
- [x] Pesquisa sobre Lei 14.133/2021 e requisitos de licitações públicas
- [x] Definição da arquitetura de banco de dados
- [x] Planejamento da estrutura de pastas e componentes

## Fase 2: Banco de Dados e Schema
- [x] Criar tabelas: companies, tenders, products, suppliers, documents, proposals, declarations
- [x] Configurar relacionamentos e índices
- [x] Implementar migrations com Drizzle

## Fase 3: Autenticação e Dashboard
- [ ] Integrar OAuth Manus
- [ ] Criar layout principal com sidebar (DashboardLayout)
- [ ] Implementar dashboard com widgets de prazos, propostas e alertas
- [ ] Criar página de onboarding para novo usuário

## Fase 4: Cadastro da Empresa
- [ ] Formulário de cadastro de CNPJ com busca automática de dados
- [ ] Campos de regime tributário, percentual de impostos, dados bancários
- [ ] Upload de logomarca e representante legal
- [ ] Página de edição de dados da empresa

## Fase 5: Gestão de Documentos
- [ ] Sistema de upload de documentos em nuvem (S3)
- [ ] Cadastro de data de validade
- [ ] Alertas de vencimento por e-mail
- [ ] Download múltiplo em PDF único
- [ ] Checklist dinâmico de documentos exigidos

## Fase 6: Upload e Análise de Editais
- [ ] Interface de upload de PDF/Word
- [ ] Integração com IA para extração de informações
- [ ] Extração de: objeto, prazos, requisitos, critérios, itens/lotes
- [ ] Armazenamento de editais analisados
- [ ] Visualização de análise de risco e prazos

## Fase 7: Calculadora de Precificação (Produtos)
- [ ] Formulário de entrada de produtos
- [ ] Cálculo automático de custos, impostos, margem
- [ ] Distribuição de frete por peso/valor
- [ ] Resumo financeiro

## Fase 8: Calculadora de Serviços/Obras (BDI)
- [ ] Formulário específico para serviços
- [ ] Cálculo de BDI (Benefícios e Despesas Indiretas)
- [ ] Geração de planilha de custos detalhada
- [ ] Relatório BDI exportável

## Fase 9: Gerador de Propostas e Declarações
- [ ] Gerador de propostas em PDF timbrado (normas ABNT)
- [ ] Gerador de declarações padrão Lei 14.133/2021
- [ ] Criação de declarações manuais
- [ ] Preenchimento automático de dados da empresa

## Fase 10: Gerenciador de Produtos e Fornecedores
- [ ] Cadastro manual de produtos
- [ ] Importação de produtos via planilha
- [ ] Cadastro de fornecedores
- [ ] Busca e autocomplete de produtos

## Fase 11: Testes e Refinamentos
- [ ] Testes unitários com Vitest
- [ ] Testes de integração
- [ ] Otimizações de performance
- [ ] Validação de conformidade com Lei 14.133/2021

## Fase 12: Entrega Final
- [ ] Documentação do sistema
- [ ] Checkpoint final
- [ ] Apresentação ao usuário

## Fase 5: Cadastro da Empresa e Gestao de Documentos
- [x] Criar procedimento tRPC para busca de CNPJ via API ReceitaWS
- [x] Validar e formatar CNPJ no frontend
- [x] Desenvolver componente de formulario de cadastro da empresa
- [ ] Implementar upload de logomarca com S3
- [x] Criar pagina de configuracao da empresa
- [ ] Implementar gestao de documentos com controle de validade
- [ ] Adicionar alertas de vencimento de documentos
- [x] Criar testes unitarios para procedimentos de empresa


## Fase 6: Upload e Analise de Editais com IA
- [x] Criar procedimento tRPC para upload de arquivo (PDF/Word)
- [x] Implementar extração de texto de PDFs
- [x] Criar procedimento tRPC para análise com IA (LLM)
- [x] Extrair: objeto, prazos, requisitos, itens/lotes, critérios
- [x] Salvar análise no banco de dados
- [x] Criar componente de upload com drag-and-drop
- [x] Desenvolver página de visualização de editais analisados
- [ ] Criar testes para procedimentos de análise


## Fase 6.1: Pagina de Detalhes do Edital
- [x] Criar componente de visualizacao de requisitos estruturados
- [x] Implementar checklist dinamico de documentos necessarios
- [x] Criar pagina TenderDetail.tsx com rota parametrizada
- [x] Adicionar comparacao entre documentos exigidos e cadastrados
- [x] Implementar alertas de documentos vencidos ou faltantes
- [ ] Criar testes para componentes de detalhes


## Fase 7: Gestao de Documentos da Empresa
- [x] Criar procedimentos tRPC para upload, listagem e deleção de documentos
- [x] Implementar upload de arquivos com S3
- [x] Criar componente de upload de documentos
- [x] Implementar cálculo automático de validade (180 dias)
- [x] Criar página de gestão de documentos
- [x] Adicionar alertas de vencimento (30, 60, 90 dias)
- [ ] Criar testes para procedimentos de documentos


## Fase 8: Calculadora de Precificacao para Produtos
- [x] Criar procedimentos tRPC para calculo de precificacao
- [x] Implementar logica de calculo de impostos baseado em regime tributario
- [x] Criar componente de formulario de entrada de produtos
- [x] Implementar calculo de margem de lucro
- [x] Adicionar distribuicao de frete por peso/valor
- [x] Criar resumo financeiro com breakdown de custos
- [ ] Implementar persistencia de calculos
- [ ] Criar testes para procedimentos de precificacao


## Fase 9: Gerador de Propostas em PDF
- [x] Criar procedimentos tRPC para geracao de propostas
- [x] Implementar template de proposta com normas ABNT
- [x] Adicionar dados da empresa (logomarca, endereco, contato)
- [x] Criar formulario de entrada de itens da proposta
- [x] Implementar calculo automatico de totais
- [x] Gerar PDF com ReportLab/WeasyPrint
- [x] Adicionar assinatura digital ou espaco para assinatura
- [ ] Criar testes para procedimentos de propostas


## Fase 10: Gerador de Declaracoes Lei 14.133/2021
- [x] Criar procedimentos tRPC para geracao de declaracoes
- [x] Implementar templates de declaracoes padrao (juridica, tecnica, fiscal, economica)
- [x] Adicionar campos dinamicos de preenchimento
- [x] Implementar geracao de PDF com assinatura
- [x] Criar interface de seleção de tipo de declaracao
- [x] Adicionar validacao de dados obrigatorios
- [ ] Implementar persistencia de declaracoes geradas
- [ ] Criar testes para procedimentos de declaracoes
