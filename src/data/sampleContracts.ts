import type { FlaggedClause, CountryCode } from '../types/legal';

export interface SampleContractPreset {
  id: string;
  name: string;
  description: string;
  jurisdictionCode: CountryCode;
  riskCategory: 'High-Risk AI & Commercial' | 'Mixed Compliance' | 'Compliant Baseline' | 'Employment & IP';
  clauses: FlaggedClause[];
}

export const SAMPLE_CONTRACT_PRESETS: SampleContractPreset[] = [
  {
    id: 'high-risk-ai-contract',
    name: 'HIGH-RISK AI VENDOR & DATA AGREEMENT',
    description: 'Contains restrictive non-compete clauses, zero liability waivers, unconsented telemetry transfer, and missing human oversight overrides.',
    jurisdictionCode: 'IN',
    riskCategory: 'High-Risk AI & Commercial',
    clauses: [
      {
        id: 'nexus-101',
        section: 'Section 4.2 - Post-Employment Non-Compete & Restraint of Trade',
        primaryCategory: 'RESTRAINT_OF_TRADE',
        relatedCategories: ['CONTRACT_RISK'],
        clauseText: 'During the term of this Agreement and for a period of twenty-four (24) months following termination, Customer and its technical personnel shall not engage in, develop, or assist any third party in developing any competing commercial artificial intelligence software or automated legal auditing platform anywhere in the territory.',
        simplifiedText: 'You cannot work on or build any competing legal AI tools anywhere for 2 years after this agreement ends.',
        jargonTerms: [
          { term: 'Restraint of Trade', definition: 'A contractual term that restricts someone from working in their chosen business or profession.' },
          { term: 'Non-compete Covenant', definition: 'A promise not to work for or start a competing business for a set period.' }
        ],
        riskLevel: 'critical',
        riskScore: 95,
        ragRequirement: 'Post-employment non-compete covenants are strictly void under Section 27 of the Indian Contract Act 1872.',
        ragCitation: 'Indian Contract Act 1872 Section 27 & SC Landmark Percept D’Mark (2006)',
        aiVerdict: 'CRITICAL ILLEGALITY DETECTED: Under Indian Law, Section 27 invalidates all post-termination non-compete restraints. This clause is unenforceable and legally void.',
        aiConfidence: 0.98,
        benchmarkSource: 'NEXUS Benchmark: High-Risk AI Contract',
        suggestedRevision: 'Customer’s obligations shall be strictly limited to maintaining the confidentiality of Provider’s proprietary Trade Secrets and Intellectual Property during the active term, without imposing post-termination restraints on lawful professional activities.',
        revisionRationale: 'Replaces void non-compete restraint with standard enforceable IP confidentiality protection.',
        negotiationPaths: {
          aggressive: {
            text: 'Delete Section 4.2 in its entirety. Replace with an explicit statement affirming Customer’s freedom of business under Section 27 of the Indian Contract Act.',
            rationale: 'Void under Indian law; insisting on deletion protects against coercive litigation threats.',
            riskReduction: '100% Risk Elimination'
          },
          balanced: {
            text: 'Limit non-compete strictly during the active term of agreement only, deleting all post-termination 24-month covenants.',
            rationale: 'In-term restraints are legally enforceable; post-term restraints are void.',
            riskReduction: '85% Risk Reduction'
          },
          conservative: {
            text: 'Narrow geographical scope to specific Indian metropolitan cities and reduce post-term period to 3 months with garden leave compensation.',
            rationale: 'Reduces practical dispute risk, though remains vulnerable under Section 27.',
            riskReduction: '40% Risk Reduction'
          }
        },
        guardrail: {
          isAmbiguous: false,
          targetedAdvocateQuestions: [
            'How quickly can an Indian High Court grant an injunction against an employer enforcing a void Section 27 clause?',
            'Should we send a formal legal notice asserting voidness under Section 27 before signing?'
          ]
        },
        jurisdictionCode: 'IN',
        humanStatus: 'pending',
        isRemediated: false
      },
      {
        id: 'nexus-102',
        section: 'Section 8.4 - Complete Disclaimers & Unilateral Liability Cap',
        primaryCategory: 'CONTRACT_RISK',
        relatedCategories: ['CYBERSECURITY'],
        clauseText: 'Vendor provides the AI platform strictly "AS IS" and disclaims all express or implied warranties. In no event shall Vendor be liable for any indirect, consequential, or algorithmic failure damages, and Vendor’s total aggregate liability shall be capped at $100.00.',
        simplifiedText: 'The software company gives no guarantees. If the AI makes a major legal error or leaks data, the most they will ever pay you is $100.',
        jargonTerms: [
          { term: 'Consequential Damages', definition: 'Indirect financial losses resulting from a contract breach, such as lost business profits.' },
          { term: 'Aggregate Liability Cap', definition: 'The absolute maximum total monetary payout a party will owe regardless of the damage caused.' }
        ],
        riskLevel: 'critical',
        riskScore: 92,
        ragRequirement: 'Liability caps must maintain balanced risk allocation and cannot disclaim gross negligence or statutory data breaches.',
        ragCitation: 'Indian Contract Act 1872 Section 23 & UCTA 1977 s.2(1) Standard',
        aiVerdict: 'SEVERE RISK: Unilateral $100 liability cap shifts all operational risk to the customer while providing zero accountability for system defects or data leaks.',
        aiConfidence: 0.94,
        benchmarkSource: 'NEXUS Benchmark: High-Risk AI Contract',
        suggestedRevision: 'Vendor shall indemnify and hold Customer harmless against direct damages, security breaches, or regulatory fines caused by Vendor’s gross negligence, willful misconduct, or failure to comply with system specifications, up to an aggregate cap equal to twelve (12) months of fees paid.',
        revisionRationale: 'Establishes enterprise-standard mutual liability cap linked to contract value with carve-outs for gross negligence.',
        negotiationPaths: {
          aggressive: {
            text: 'Uncap liability for data breaches, IP infringement, and gross negligence, and increase general cap to 2x Total Contract Value (TCV).',
            rationale: 'Protects buyer against catastrophic vendor AI failures or data exposure.',
            riskReduction: '90% Risk Reduction'
          },
          balanced: {
            text: 'Set aggregate liability cap at 100% of TCV (12 months fees) with super-caps for confidentiality and privacy breaches.',
            rationale: 'Commercial standard for enterprise SaaS agreements.',
            riskReduction: '75% Risk Reduction'
          },
          conservative: {
            text: 'Cap liability at $50,000 or total fees paid in preceding 6 months.',
            rationale: 'Increases minimal $100 cap to a realistic recovery pool.',
            riskReduction: '45% Risk Reduction'
          }
        },
        guardrail: {
          isAmbiguous: true,
          ambiguityReason: 'Indian courts scrutinize complete liability disclaimers for unconscionability under Section 23 if there is unequal bargaining power.',
          targetedAdvocateQuestions: [
            'Can a $100 liability cap be invalidated under Indian Contract Act Section 23 as unconscionable in an enterprise software deal?',
            'What super-cap multiplier should be specified for DPDP Act data breach indemnities?'
          ]
        },
        jurisdictionCode: 'IN',
        humanStatus: 'pending',
        isRemediated: false
      },
      {
        id: 'nexus-103',
        section: 'Section 12.1 - Unconsented Data Telemetry & Model Retraining',
        primaryCategory: 'GDPR_PRIVACY',
        relatedCategories: ['DATA_TRANSFER', 'DATA_GOVERNANCE'],
        clauseText: 'Customer agrees that all uploaded legal documents, prompt text, and telemetry metadata may be retained indefinitely by Vendor and transmitted to third-party sub-processors anywhere globally for continuous AI model retraining without separate consent or notification.',
        simplifiedText: 'The vendor can keep your secret legal files forever and share them with outside overseas companies to train their AI without asking you.',
        jargonTerms: [
          { term: 'Telemetry Data', definition: 'Automated measurement and data collected from remote user interactions.' },
          { term: 'Sub-processor', definition: 'A third-party contractor hired by a main service provider to handle personal data.' }
        ],
        riskLevel: 'critical',
        riskScore: 96,
        ragRequirement: 'Personal data and confidential documents require explicit consent, data residency compliance, and executed Data Processing Addendums (DPAs).',
        ragCitation: 'DPDP Act 2023 Sec 6 & GDPR Article 44 Transfer Directives',
        aiVerdict: 'CRITICAL PRIVACY VIOLATION: Transmitting confidential documents to unlisted global sub-processors without explicit consent violates DPDP Act 2023 and GDPR Article 44.',
        aiConfidence: 0.97,
        benchmarkSource: 'NEXUS Benchmark: High-Risk AI Contract',
        suggestedRevision: 'Vendor agrees that Customer prompts and uploaded content shall remain strictly confidential, shall NOT be used for AI model retraining, and shall only be processed by authorized sub-processors under executed DPAs and Standard Contractual Clauses.',
        revisionRationale: 'Prohibits unauthorized AI model training on customer legal documents and mandates strict sub-processor DPA controls.',
        negotiationPaths: {
          aggressive: {
            text: 'Insert strict zero-retention policy: All customer data must be deleted immediately after processing response, with zero model training allowed.',
            rationale: 'Ensures absolute enterprise data privacy and prevents IP leakage into model weights.',
            riskReduction: '98% Risk Reduction'
          },
          balanced: {
            text: 'Allow telemetry logging solely for system error diagnostics (purged within 30 days), prohibiting model training and requiring 30-day prior notice for sub-processors.',
            rationale: 'Meets vendor operational needs while preserving privacy boundaries.',
            riskReduction: '80% Risk Reduction'
          },
          conservative: {
            text: 'Require customer data anonymization prior to any third-party export.',
            rationale: 'Reduces direct identity exposure.',
            riskReduction: '50% Risk Reduction'
          }
        },
        guardrail: {
          isAmbiguous: false,
          targetedAdvocateQuestions: [
            'Does transferring customer prompts overseas breach DPDP Act 2023 Data Fiduciary obligations?',
            'What specific DPA clauses must be annexed to guarantee zero-training compliance?'
          ]
        },
        jurisdictionCode: 'IN',
        humanStatus: 'pending',
        isRemediated: false
      },
      {
        id: 'nexus-104',
        section: 'Section 14.3 - Autonomous Decision Execution Without Human Oversight',
        primaryCategory: 'HUMAN_OVERSIGHT',
        relatedCategories: ['EU_AI_ACT', 'CONTRACT_RISK'],
        clauseText: 'The AI system operates with full execution autonomy. Automated system decisions, risk assessments, and contractual approvals shall be legally binding on Customer without requiring real-time human operator validation or manual override.',
        simplifiedText: 'The AI can make binding legal decisions for your business automatically, and you cannot stop or pause it in real time.',
        jargonTerms: [
          { term: 'Human-in-the-loop (HITL)', definition: 'A requirement that a human operator review and approve automated AI actions before final execution.' },
          { term: 'Autonomous System', definition: 'Software that performs actions and makes decisions independently without human intervention.' }
        ],
        riskLevel: 'high',
        riskScore: 88,
        ragRequirement: 'High-risk automated decision systems must provide real-time human oversight and manual override capabilities.',
        ragCitation: 'EU AI Act Article 14 & MAS AI Governance Framework',
        aiVerdict: 'HIGH COMPLIANCE GAP: Fully autonomous legally binding AI execution without human-in-the-loop validation creates severe operational risk and breaches EU AI Act Article 14 standards.',
        aiConfidence: 0.91,
        benchmarkSource: 'NEXUS Benchmark: High-Risk AI Contract',
        suggestedRevision: 'All outputs generated by the System shall serve as non-binding advisory recommendations. Final execution of any legal commitment shall require explicit approval by a qualified human operator.',
        revisionRationale: 'Reclassifies AI output from binding execution to advisory support, enforcing human oversight.',
        negotiationPaths: {
          aggressive: {
            text: 'Reclassify all AI platform outputs as informational only, disclaiming any automated binding legal authority.',
            rationale: 'Ensures human legal oversight over every contract decision.',
            riskReduction: '95% Risk Reduction'
          },
          balanced: {
            text: 'Incorporate mandatory Human-in-the-Loop (HITL) approval gate for decisions exceeding $10,000 threshold.',
            rationale: 'Balances automation speed with risk management.',
            riskReduction: '75% Risk Reduction'
          },
          conservative: {
            text: 'Add post-execution 48-hour human review and cancellation window.',
            rationale: 'Provides safety valve for automated errors.',
            riskReduction: '50% Risk Reduction'
          }
        },
        guardrail: {
          isAmbiguous: false,
          targetedAdvocateQuestions: [
            'Does making automated AI output binding violate local corporate governance mandates for board sign-off?',
            'What liabilities arise if an autonomous AI contract decision breaches statutory rules?'
          ]
        },
        jurisdictionCode: 'IN',
        humanStatus: 'pending',
        isRemediated: false
      }
    ]
  },
  {
    id: 'uk-commercial-contract',
    name: 'UK COMMERCIAL SAAS AGREEMENT',
    description: 'Governed by English Law, tested against UCTA 1977, UK GDPR, and English Common Law restraint of trade.',
    jurisdictionCode: 'UK',
    riskCategory: 'Mixed Compliance',
    clauses: [
      {
        id: 'nexus-201',
        section: 'Clause 9.1 - Liability Waiver & UCTA Compliance',
        primaryCategory: 'CONTRACT_RISK',
        relatedCategories: ['CYBERSECURITY'],
        clauseText: 'Neither party shall be liable for any negligence or loss of profit. Provider’s entire liability under English law shall be limited to £500, including for personal injury caused during on-site installation.',
        simplifiedText: 'Neither company is responsible for lost profits, and the supplier caps all liability at £500, even for physical injury caused by negligence.',
        jargonTerms: [
          { term: 'UCTA 1977', definition: 'The UK Unfair Contract Terms Act 1977 regulating clauses that limit legal liability.' }
        ],
        riskLevel: 'critical',
        riskScore: 92,
        ragRequirement: 'Under UCTA 1977 s.2(1), liability for death or personal injury resulting from negligence cannot be excluded or capped.',
        ragCitation: 'UK Unfair Contract Terms Act 1977 Section 2(1) & Schedule 2',
        aiVerdict: 'ILLEGAL UNDER UK LAW: UCTA Section 2(1) strictly prohibits capping liability for death or personal injury caused by negligence. This clause is void under English Law.',
        aiConfidence: 0.96,
        benchmarkSource: 'NEXUS Benchmark: UK Commercial Agreement',
        suggestedRevision: 'Nothing in this Agreement shall exclude or limit liability for: (a) death or personal injury caused by negligence (as defined under UCTA 1977 s.2(1)); (b) fraud or fraudulent misrepresentation; or (c) any liability which cannot be excluded under applicable English law.',
        revisionRationale: 'Incorporates mandatory UCTA 1977 statutory carve-outs for negligence causing injury/death and fraud.',
        negotiationPaths: {
          aggressive: {
            text: 'Insert standard UCTA carve-out clause and set general liability cap at 2x annual contract value.',
            rationale: 'Aligns clause with mandatory UK legislation.',
            riskReduction: '95% Risk Reduction'
          },
          balanced: {
            text: 'Add statutory UCTA carve-outs and cap liability at 100% of annual contract fees paid.',
            rationale: 'Standard UK commercial software term.',
            riskReduction: '80% Risk Reduction'
          },
          conservative: {
            text: 'Exclude death/injury from cap as required by law, keeping £500 cap for general breach.',
            rationale: 'Fixes illegal term while preserving low liability.',
            riskReduction: '60% Risk Reduction'
          }
        },
        guardrail: {
          isAmbiguous: false,
          targetedAdvocateQuestions: [
            'Will an English court strike down the entire liability clause if s.2(1) UCTA is violated, or sever the illegal sentence?',
            'What reasonableness arguments should be prepared under UCTA Schedule 2?'
          ]
        },
        jurisdictionCode: 'UK',
        humanStatus: 'pending',
        isRemediated: false
      }
    ]
  }
];
