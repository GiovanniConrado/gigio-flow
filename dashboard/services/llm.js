/**
 * services/llm.js
 * Funções de integração com LLMs (Gemini e OpenAI) e helpers de contexto.
 */

import https from 'https';
import path from 'path';
import { readFile } from './files.js';

/**
 * Helper para fazer requisições HTTPS POST.
 * @param {string} url
 * @param {Object} headers
 * @param {Object} body
 * @returns {Promise<{statusCode: number, body: string}>}
 */
export function makeHttpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Lê os arquivos de contexto do workspace e os concatena em uma string formatada.
 * Arquivos lidos: VISAO.md, ARQUITETURA.md, ESTADO_ATUAL.md, DESIGN_SYSTEM.md, safety-locks.md
 * @param {string} workspaceDir - Diretório raiz do workspace ativo
 * @returns {string} Contexto concatenado com headers separando cada arquivo
 */
export function buildSystemContext(workspaceDir) {
  const files = [
    { dir: 'knowledge', name: 'VISAO.md',        label: '📋 VISÃO DO PRODUTO (knowledge/VISAO.md)' },
    { dir: 'knowledge', name: 'ARQUITETURA.md',  label: '🏗️ ARQUITETURA TÉCNICA (knowledge/ARQUITETURA.md)' },
    { dir: 'knowledge', name: 'ESTADO_ATUAL.md', label: '📊 ESTADO ATUAL DO PROJETO (knowledge/ESTADO_ATUAL.md)' },
    { dir: 'knowledge', name: 'DESIGN_SYSTEM.md',label: '🎨 DESIGN SYSTEM (knowledge/DESIGN_SYSTEM.md)' },
    { dir: '.ai/rules', name: 'safety-locks.md', label: '🔒 SAFETY LOCKS E REGRAS (.ai/rules/safety-locks.md)' },
  ];

  const sections = files.map(f => {
    const content = readFile(workspaceDir, f.dir, f.name);
    if (!content) return `### ${f.label}\n\n*(Arquivo não encontrado ou vazio)*\n`;
    return `### ${f.label}\n\n${content}\n`;
  });

  return `## 🌐 CONTEXTO COMPLETO DO SISTEMA\n\n${sections.join('\n---\n\n')}`;
}

/**
 * Chama a LLM configurada (Gemini, OpenAI ou DeepSeek) e retorna a resposta como string.
 * @param {Object} params
 * @param {'gemini'|'openai'|'deepseek'} params.provider
 * @param {string} params.apiKey
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {string} [params.model] - Model override (defaults per provider)
 * @returns {Promise<string>}
 */
export async function callLLM({ provider, apiKey, systemPrompt, userPrompt, model }) {
  if (!apiKey) throw new Error('API Key é obrigatória para chamar a LLM.');

  if (provider === 'openai') {
    console.log('[LLM Engine] Enviando requisição para OpenAI API...');
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    const body = {
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    };

    const result = await makeHttpsPost(url, headers, body);
    if (result.statusCode !== 200) {
      throw new Error(`OpenAI API erro status ${result.statusCode}: ${result.body}`);
    }
    const data = JSON.parse(result.body);
    return data.choices[0].message.content;

  } else if (provider === 'deepseek') {
    console.log('[LLM Engine] Enviando requisição para DeepSeek API...');
    const url = 'https://api.deepseek.com/v1/chat/completions';
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    const body = {
      model: model || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    };

    const result = await makeHttpsPost(url, headers, body);
    if (result.statusCode !== 200) {
      throw new Error(`DeepSeek API erro status ${result.statusCode}: ${result.body}`);
    }
    const data = JSON.parse(result.body);
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`Resposta inesperada da DeepSeek API: ${JSON.stringify(data).substring(0, 200)}`);
    }
    return data.choices[0].message.content;

  } else {
    // Default: Gemini
    console.log('[LLM Engine] Enviando requisição para Gemini API...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n========================\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: { temperature: 0.7 }
    };

    const result = await makeHttpsPost(url, {}, body);
    if (result.statusCode !== 200) {
      throw new Error(`Gemini API erro status ${result.statusCode}: ${result.body}`);
    }
    const data = JSON.parse(result.body);

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('Formato de resposta inesperado do Gemini API');
  }
}
