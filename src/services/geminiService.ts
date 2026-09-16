import { GoogleGenAI } from '@google/genai';
import type { FlaggedClause, CountryCode } from '../types/legal';
import { SUPPORTED_COUNTRIES } from '../data/jurisdictions';

function getGeminiClient(userApiKey?: string): GoogleGenAI | null {
  const apiKey = userApiKey || (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY : '');
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * Call Gemini 1.5 / 2.5 API or Fallback for Legal Clause Analysis
 */
export async function analyzeClauseWithGemini(
  clauseText: string,
  countryCode: CountryCode,
  apiKey?: string
): Promise<Partial<FlaggedClause>> {
  const aiClient = getGeminiClient(apiKey);
  const countryConfig = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.IN;

  if (aiClient) {
    try {
      const prompt = `You are NEXUS AI, a Senior Legal Architect specializing in ${countryConfig.name} law (${countryConfig.legalSystem}).
Analyze the following contractual clause under ${countryConfig.primaryStatutes.join(', ')}.

CLAUSE TEXT:
"${clauseText}"

Respond strictly in valid JSON format matching this structure:
{
  "section": "Clause Title/Section",
  "primaryCategory": "RESTRAINT_OF_TRADE | GDPR_PRIVACY | DATA_GOVERNANCE | HUMAN_OVERSIGHT | CYBERSECURITY | CONTRACT_RISK",
  "simplifiedText": "Plain 8th-grade language explanation of what this means in simple terms",
  "riskLevel": "critical | high | medium | low",
  "riskScore": 85,
  "ragRequirement": "Specific statutory requirement under ${countryConfig.name} law",
  "ragCitation": "Exact statutory section or case law citation",
  "aiVerdict": "Detailed legal verdict explaining potential non-compliance gaps",
  "aiConfidence": 0.95,
  "suggestedRevision": "Redrafted clause resolving compliance gaps under ${countryConfig.name} law",
  "revisionRationale": "Why this revision protects the client under ${countryConfig.name} law",
  "negotiationPaths": {
    "aggressive": { "text": "...", "rationale": "...", "riskReduction": "..." },
    "balanced": { "text": "...", "rationale": "...", "riskReduction": "..." },
    "conservative": { "text": "...", "rationale": "...", "riskReduction": "..." }
  },
  "guardrail": {
    "isAmbiguous": false,
    "ambiguityReason": "...",
    "targetedAdvocateQuestions": ["Question 1", "Question 2"]
  }
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          ...parsed,
          jurisdictionCode: countryCode
        };
      }
    } catch (err) {
      console.warn('Gemini API call error, falling back to local grounding engine:', err);
    }
  }

  return generateLocalGroundingAnalysis(clauseText, countryCode);
}

/**
 * Ask NEXUS Contextual Chat Assistant grounded on contract and country statutes
 */
export async function askNexusAssistant(
  userQuery: string,
  contractContext: string,
  countryCode: CountryCode,
  activeClause?: FlaggedClause,
  apiKey?: string
): Promise<{ text: string; citation?: string }> {
  const aiClient = getGeminiClient(apiKey);
  const countryConfig = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.IN;

  if (aiClient) {
    try {
      const prompt = `You are Ask NEXUS, a grounded AI legal assistant for ${countryConfig.name} law.
Contract Context: "${contractContext.slice(0, 1500)}"
Active Clause: "${activeClause?.clauseText || 'None'}"
Active Jurisdiction: ${countryConfig.name} (${countryConfig.primaryStatutes.join('; ')})

User Question: "${userQuery}"

Provide a direct, authoritative legal answer grounded on the contract text and ${countryConfig.name} law. Include statutory citations where applicable.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        }
      });

      if (response.text) {
        return {
          text: response.text,
          citation: `${countryConfig.primaryStatutes[0]} (${countryConfig.name})`
        };
      }
    } catch (err) {
      console.warn('Gemini Chat error fallback:', err);
    }
  }

  const qLower = userQuery.toLowerCase();
  const clause = activeClause;

  if (qLower.includes('why') && qLower.includes('flagged')) {
    return {
      text: clause ? `This clause was flagged under ${countryConfig.name} law because: ${clause.aiVerdict}` : `Analysis under ${countryConfig.name} law flags potential risks regarding non-competes, liability waivers, or privacy disclosures.`,
      citation: clause?.ragCitation || countryConfig.primaryStatutes[0]
    };
  } else if (qLower.includes('safer') || qLower.includes('revision') || qLower.includes('alternative')) {
    return {
      text: clause ? `Recommended Revision under ${countryConfig.name} law:\n"${clause.suggestedRevision}"\n\nRationale: ${clause.revisionRationale}` : `Consider limiting non-competes to in-term only, inserting UCTA/UCC carve-outs, and establishing a 100% TCV liability cap.`,
      citation: clause?.ragCitation
    };
  } else if (qLower.includes('non-compete') || qLower.includes('section 27')) {
    if (countryCode === 'IN') {
      return {
        text: `Under Indian Law (Section 27 of the Indian Contract Act 1872), post-employment non-compete clauses are 100% VOID. Employers cannot enforce restraints of trade after employment terminates.`,
        citation: 'Indian Contract Act 1872 Section 27'
      };
    } else if (countryCode === 'UK') {
      return {
        text: `Under UK English Common Law, non-compete clauses are prima facie void unless reasonably necessary to protect a legitimate proprietary interest and limited in time/geography.`,
        citation: 'English Common Law Restraint of Trade Rules'
      };
    } else if (countryCode === 'US') {
      return {
        text: `Under US law, non-competes vary by state: in California (Cal. B&P 16600) they are strictly void; in Delaware/NY they require reasonable temporal and geographic limits.`,
        citation: 'Cal. B&P § 16600 & FTC Rule 16 C.F.R. Part 910'
      };
    }
  }

  return {
    text: `Regarding your query about ${countryConfig.name} law (${countryConfig.primaryStatutes[0]}): The analyzed agreement has been evaluated against statutory frameworks. Key priority is resolving ${clause ? clause.riskLevel.toUpperCase() + ' risk in ' + clause.section : 'flagged risk items'}.`,
    citation: countryConfig.primaryStatutes[0]
  };
}

/**
 * Local Grounding Analysis Engine
 */
function generateLocalGroundingAnalysis(
  clauseText: string,
  countryCode: CountryCode
): Partial<FlaggedClause> {
  const lower = clauseText.toLowerCase();
  const country = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.IN;

  let primaryCategory: any = 'CONTRACT_RISK';
  let riskLevel: any = 'medium';
  let riskScore = 60;
  let ragRequirement = `Adhere to commercial standards under ${country.primaryStatutes[0]}`;
  let ragCitation = country.primaryStatutes[0];
  let aiVerdict = `Clause flagged for standard contractual review under ${country.name} law.`;
  let simplifiedText = `This clause sets out rights and responsibilities between the parties under ${country.name} law.`;
  let suggestedRevision = clauseText;
  let revisionRationale = `Ensures terms align with standard ${country.name} commercial contracts.`;

  if (lower.includes('non-compete') || lower.includes('restraint') || lower.includes('compete') || lower.includes('competing') || lower.includes('territory')) {
    primaryCategory = 'RESTRAINT_OF_TRADE';
    if (countryCode === 'IN') {
      riskLevel = 'critical';
      riskScore = 95;
      ragRequirement = 'Post-employment non-compete covenants are 100% void under Section 27 of the Indian Contract Act 1872.';
      ragCitation = 'Indian Contract Act 1872 Section 27';
      aiVerdict = 'VOID UNDER INDIAN LAW: Post-employment non-competes are legally unenforceable in India under Section 27.';
      simplifiedText = 'You are forbidden from working for a competitor after leaving, but Indian law says this restriction is illegal and void.';
      suggestedRevision = 'Customer’s obligations shall be strictly limited to protecting proprietary trade secrets and confidential information, without post-termination restraint of trade.';
      revisionRationale = 'Replaces illegal Section 27 non-compete with enforceable confidentiality protections.';
    } else {
      riskLevel = 'high';
      riskScore = 80;
      ragRequirement = `Non-competes must be reasonable in time, scope, and geography under ${country.name} law.`;
      ragCitation = `${country.primaryStatutes[0]} Restraint of Trade Rules`;
      aiVerdict = `RESTRICTIVE COVENANT FLAGGED: Review required to verify reasonableness of duration under ${country.name} law.`;
      simplifiedText = 'You cannot work for competitors for a period after leaving.';
      suggestedRevision = clauseText.replace('twenty-four (24)', 'six (6)');
      revisionRationale = 'Reduces temporal scope to commercially reasonable 6 months.';
    }
  } else if (lower.includes('liability') || lower.includes('as is') || lower.includes('damages') || lower.includes('indemn')) {
    primaryCategory = 'CONTRACT_RISK';
    riskLevel = lower.includes('$100') || lower.includes('zero') || lower.includes('no event') ? 'critical' : 'high';
    riskScore = 90;
    ragRequirement = `Liability waivers must not disclaim gross negligence or statutory duties under ${country.name} law.`;
    ragCitation = countryCode === 'UK' ? 'UCTA 1977 s.2(1)' : countryCode === 'US' ? 'UCC § 2-719' : 'Indian Contract Act Sec 23';
    aiVerdict = `UNBALANCED RISK ALLOCATION: Liability cap disclaims essential vendor operational accountability.`;
    simplifiedText = 'The vendor disclaims responsibility for errors and caps what they owe you at a nominal amount.';
    suggestedRevision = `${clauseText.trim()}, provided that Vendor’s aggregate liability shall be capped at total fees paid in 12 months, with no cap for gross negligence or data breach.`;
    revisionRationale = 'Restores standard commercial accountability and caps liability at contract value.';
  } else if (lower.includes('telemetry') || lower.includes('sub-processor') || lower.includes('retraining') || lower.includes('gdpr') || lower.includes('dpdp')) {
    primaryCategory = 'GDPR_PRIVACY';
    riskLevel = 'critical';
    riskScore = 94;
    ragRequirement = `Data transfers and model retraining require explicit consent and DPA safeguards under ${country.name} law.`;
    ragCitation = countryCode === 'IN' ? 'DPDP Act 2023 Sec 6' : countryCode === 'DE' ? 'EU GDPR Article 44' : 'UK GDPR & DPA 2018';
    aiVerdict = `PRIVACY GAP: Transferring user prompts for model training without consent breaches privacy statutes.`;
    simplifiedText = 'The software vendor can keep your data and share it globally to train AI without asking.';
    suggestedRevision = 'Vendor shall process Customer data strictly for providing services under the Agreement and shall NOT use Customer data for AI model retraining without prior explicit written consent.';
    revisionRationale = 'Enforces data privacy boundaries and prohibits unconsented model retraining.';
  }

  return {
    section: `Parsed Clause - ${primaryCategory}`,
    primaryCategory,
    relatedCategories: ['CONTRACT_RISK'],
    clauseText,
    simplifiedText,
    jargonTerms: [
      { term: 'Indemnification', definition: 'An obligation to compensate another party for losses or damages incurred.' }
    ],
    riskLevel,
    riskScore,
    ragRequirement,
    ragCitation,
    aiVerdict,
    aiConfidence: 0.92,
    benchmarkSource: 'NEXUS Legal Grounding Engine',
    suggestedRevision,
    revisionRationale,
    negotiationPaths: {
      aggressive: {
        text: `Delete clause or insert strict protective terms favoring Customer under ${country.name} law.`,
        rationale: 'Maximum legal protection for buyer.',
        riskReduction: '95% Risk Reduction'
      },
      balanced: {
        text: `Modify term to align with standard enterprise market practice under ${country.name} law.`,
        rationale: 'Balanced commercial risk sharing.',
        riskReduction: '80% Risk Reduction'
      },
      conservative: {
        text: `Accept core vendor framework but cap exposure pool.`,
        rationale: 'Minimal negotiation friction.',
        riskReduction: '40% Risk Reduction'
      }
    },
    guardrail: {
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        `Does this clause meet enforceability precedents in ${country.name} local courts?`,
        `What specific statutory carve-outs should be inserted for local advocate approval?`
      ]
    },
    jurisdictionCode: countryCode,
    humanStatus: 'pending',
    isRemediated: false
  };
}
