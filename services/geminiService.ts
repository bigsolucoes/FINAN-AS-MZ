
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Debtor, DebtorAgreement } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI Assistant will not work. Please set process.env.API_KEY.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const MODEL_NAME = 'gemini-2.5-flash';

interface AppContextData {
  debtors: Debtor[];
  debtorAgreements: DebtorAgreement[];
}

const formatDataForPrompt = (data: AppContextData): string => {
  let contextString = "Dados Atuais do Sistema:\n";
  contextString += "--- Devedores ---\n";
  if (data.debtors.length > 0) {
    data.debtors.forEach(debtor => {
      contextString += `ID: ${debtor.id}, Nome: ${debtor.name}, Email: ${debtor.email}\n`;
    });
  } else {
    contextString += "Nenhum devedor cadastrado.\n";
  }
  
  contextString += "\n--- Acordos Financeiros ---\n";
  if (data.debtorAgreements.length > 0) {
    data.debtorAgreements.forEach(agreement => {
      const debtorName = data.debtors.find(d => d.id === agreement.debtorId)?.name || 'Desconhecido';
      const totalPaid = agreement.installments.reduce((sum, inst) => sum + inst.paidAmount, 0);
      const remaining = agreement.agreementValue - totalPaid;
      
      contextString += `ID do Acordo: ${agreement.id}, Devedor: ${debtorName}, Valor Total: ${formatCurrency(agreement.agreementValue, false)}, Status: ${agreement.status}, Saldo Devedor: ${formatCurrency(remaining, false)}\n`;
      contextString += `   Parcelas: ${agreement.installments.length}x de ${formatCurrency(agreement.agreementValue / agreement.installments.length, false)}\n`;
    });
  } else {
    contextString += "Nenhum acordo cadastrado.\n";
  }
  contextString += "---\n";
  return contextString;
};

export const callGeminiApi = async (
  userQuery: string, 
  appContextData: AppContextData
): Promise<GenerateContentResponse> => {
  if (!ai) {
    return Promise.resolve({
        text: "Desculpe, o assistente de IA não está configurado corretamente (API Key ausente).",
        candidates: [],
        promptFeedback: undefined,
      } as unknown as GenerateContentResponse); 
  }

  const dataContext = formatDataForPrompt(appContextData);

  const systemInstruction = `Você é um assistente de IA especialista em análise financeira para escritórios de advocacia, operando dentro do sistema JurisFinance. Sua função é ajudar o usuário a entender os dados sobre devedores e acordos financeiros.
  - Use os dados fornecidos para responder. Não invente informações.
  - Seja conciso, direto e profissional.
  - Formate valores monetários em Reais (R$).
  - Responda em Português do Brasil.
  - Se a pergunta for sobre eventos atuais ou informações que não estão nos dados, você pode usar o Google Search. Se usar, cite as fontes.
  - Hoje é ${new Date().toLocaleDateString('pt-BR')}.`;

  const contents = `${dataContext}\nPergunta do Usuário: ${userQuery}`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}],
      }
    });
    
    return response;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    let errorMessage = "Ocorreu um erro ao contatar o assistente de IA.";
    if (error instanceof Error) {
        errorMessage += ` Detalhes: ${error.message}`;
    }
     return Promise.resolve({
        text: errorMessage,
        candidates: [],
        promptFeedback: undefined,
      } as unknown as GenerateContentResponse);
  }
};
