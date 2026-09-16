import type { CountryCode, ComplianceCategory } from '../types/legal';

export interface GroundingRule {
  category: ComplianceCategory;
  statuteName: string;
  section: string;
  verbatimSnippet: string;
  enforceabilityVerdict: string;
  riskWeight: number; // 0-100
  isAmbiguous: boolean;
  ambiguityReason?: string;
  targetedAdvocateQuestions: string[];
}

export const STATUTORY_GROUNDING_DATABASE: Record<CountryCode, GroundingRule[]> = {
  IN: [
    {
      category: 'RESTRAINT_OF_TRADE',
      statuteName: 'Indian Contract Act, 1872',
      section: 'Section 27',
      verbatimSnippet: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
      enforceabilityVerdict: 'Post-employment non-compete covenants are 100% void and unenforceable in India under Section 27, regardless of geographical scope or monetary compensation (Percept D’Mark v. Zaheer Khan, SC 2006).',
      riskWeight: 95,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does Section 27 render the non-compete clause entirely void, or can non-solicitation of clients be severed and saved?',
        'What interim relief strategies can be filed in Indian High Courts if the employer attempts to enforce a post-termination restriction?',
        'How does the Indian Stamp Act affect the admissibility of this agreement in local courts?'
      ]
    },
    {
      category: 'GDPR_PRIVACY',
      statuteName: 'Digital Personal Data Protection Act, 2023',
      section: 'Section 6(1) & Section 9',
      verbatimSnippet: 'Personal data of Data Principals may only be processed for a lawful purpose upon obtaining free, specific, informed, unconditional and unambiguous consent with a clear affirmative action.',
      enforceabilityVerdict: 'DPDP Act 2023 mandates explicit consent notices in English and all 22 8th Schedule Indian languages. Unilateral prompt telemetry processing without consent manager logging triggers penalties up to ₹250 Cr.',
      riskWeight: 90,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Has the Data Fiduciary registered a designated Data Protection Officer (DPO) under Section 10 of DPDP Act 2023?',
        'Does the consent notice meet the bilingual specification under the DPDP Rules 2024?'
      ]
    },
    {
      category: 'CYBERSECURITY',
      statuteName: 'Information Technology Act, 2000',
      section: 'Section 43A & CERT-In Directives 2022',
      verbatimSnippet: 'Body corporate failing to maintain reasonable security practices and procedures resulting in wrongful loss or gain shall be liable to pay damages by way of compensation.',
      enforceabilityVerdict: 'CERT-In cybersecurity directives mandate mandatory 6-hour security incident reporting for API vulnerabilities and data leaks.',
      riskWeight: 88,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Is the unvalidated API endpoint compliant with CERT-In mandatory log retention rules for 180 days?'
      ]
    },
    {
      category: 'CONTRACT_RISK',
      statuteName: 'Specific Relief Act, 1963',
      section: 'Section 14 & 41',
      verbatimSnippet: 'Injunction cannot be granted to prevent the breach of a contract the performance of which would not be specifically enforced.',
      enforceabilityVerdict: 'Unilateral liability waivers excluding all damages may be scrutinized for unconscionability under Section 23 of Indian Contract Act.',
      riskWeight: 75,
      isAmbiguous: true,
      ambiguityReason: 'Extent to which Indian courts will enforce complete limitation of liability for gross negligence in software contracts remains a matter of judicial discretion depending on public policy.',
      targetedAdvocateQuestions: [
        'Could the total waiver of liability be challenged under Section 23 of the Indian Contract Act as opposed to public policy?',
        'Should an explicit carve-out for gross negligence and data breach indemnification be demanded during pre-suit negotiations?'
      ]
    }
  ],
  UK: [
    {
      category: 'CONTRACT_RISK',
      statuteName: 'Unfair Contract Terms Act 1977 (UCTA)',
      section: 'Section 2(1) & Section 3',
      verbatimSnippet: 'A person cannot by reference to any contract term or to a notice given to persons generally exclude or restrict his liability for death or personal injury resulting from negligence.',
      enforceabilityVerdict: 'Under UCTA s.2(1), excluding liability for negligence causing death/injury is strictly VOID. Other exclusions must satisfy the UCTA Schedule 2 Reasonableness Test.',
      riskWeight: 92,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the blanket limitation of liability fail the UCTA 1977 reasonableness test considering the relative bargaining power of the parties?',
        'Has an express carve-out for UCTA s.2(1) liabilities been incorporated into the contract?'
      ]
    },
    {
      category: 'GDPR_PRIVACY',
      statuteName: 'UK GDPR & Data Protection Act 2018',
      section: 'Article 44 & 46',
      verbatimSnippet: 'Any transfer of personal data which are undergoing processing or are intended for processing after transfer to a third country or to an international organisation shall only take place if conditions in Chapter V are complied with.',
      enforceabilityVerdict: 'Exporting UK personal data to third countries requires UK Addendum to EU SCCs or UK International Data Transfer Agreement (IDTA).',
      riskWeight: 89,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Has a valid UK IDTA or UK Addendum to EU Standard Contractual Clauses been executed for off-shore data transfers?',
        'What high-risk Transfer Risk Assessment (TRA) documentation has been prepared?'
      ]
    },
    {
      category: 'RESTRAINT_OF_TRADE',
      statuteName: 'English Common Law Doctrine of Restraint of Trade',
      section: 'Restraint of Trade Rules',
      verbatimSnippet: 'All covenants in restraint of trade are prima facie void, unless they can be shown to be reasonable in the interests of both parties and the public.',
      enforceabilityVerdict: 'Non-competes are enforceable in the UK ONLY if narrowly tailored to protect a legitimate proprietary interest (e.g. trade secrets or customer connection) and restricted in geography and time (typically 6-12 months).',
      riskWeight: 82,
      isAmbiguous: true,
      ambiguityReason: 'UK government proposed 3-month statutory cap on non-compete clauses, but current judicial practice relies on blue-pencil doctrine and reasonableness tests.',
      targetedAdvocateQuestions: [
        'Can the blue-pencil doctrine be applied by English courts to sever excessive geographic restrictions?',
        'Is garden leave compensation provided during the non-compete restraint period?'
      ]
    }
  ],
  US: [
    {
      category: 'CONTRACT_RISK',
      statuteName: 'Uniform Commercial Code (UCC)',
      section: 'UCC § 2-302 & § 2-719',
      verbatimSnippet: 'If the court as a matter of law finds the contract or any clause of the contract to have been unconscionable at the time it was made the court may refuse to enforce the contract.',
      enforceabilityVerdict: 'Limitation of remedies is void if it fails of its essential purpose (UCC 2-719(2)). Total disclaimers of implied warranty of merchantability must be conspicuous (UCC 2-316).',
      riskWeight: 85,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the limitation of liability fail of its essential purpose under UCC § 2-719(2)?',
        'Is the warranty disclaimer formatted conspicuously in ALL CAPS or bold inline with UCC § 2-316 requirements?'
      ]
    },
    {
      category: 'RESTRAINT_OF_TRADE',
      statuteName: 'California Business & Professions Code / FTC Non-Compete Standard',
      section: 'Cal. B&P Code § 16600 & FTC Rule 16 C.F.R. Part 910',
      verbatimSnippet: 'Except as provided in this chapter, every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void.',
      enforceabilityVerdict: 'Under California B&P 16600 (amended SB 699/AB 1076), non-competes are strictly void and unlawful, triggering attorney fee penalties against employers seeking to enforce them regardless of out-of-state governing law.',
      riskWeight: 96,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'If the employee or vendor operates out of California, does Cal. B&P § 16600 invalidate the Delaware choice of law provision?',
        'What liability exists under Cal. Bus. & Prof. Code § 17200 for unfair business practices by inserting void covenants?'
      ]
    },
    {
      category: 'CYBERSECURITY',
      statuteName: 'Defend Trade Secrets Act (DTSA)',
      section: '18 U.S.C. § 1836',
      verbatimSnippet: 'An owner of a trade secret that is misappropriated may bring a civil action under this section if the trade secret is related to a product or service used in, or intended for use in, interstate or foreign commerce.',
      enforceabilityVerdict: 'Requires explicit whistleblower immunity notice under 18 U.S.C. § 1833(b) in any contract governing confidential information or trade secrets.',
      riskWeight: 78,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the NDA include the mandatory DTSA Whistleblower Immunity notice required to claim exemplary damages and attorney fees?'
      ]
    }
  ],
  DE: [
    {
      category: 'EU_AI_ACT',
      statuteName: 'EU Artificial Intelligence Act (Regulation EU 2024/1689)',
      section: 'Article 10, 14 & 15',
      verbatimSnippet: 'High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which the AI system is in use.',
      enforceabilityVerdict: 'Art 14 mandates real-time human intervention capability (stop button / override). Art 10 mandates dataset provenance logging. Violations carry fines up to €35M or 7% of global annual turnover.',
      riskWeight: 98,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the AI vendor agreement provide full technical documentation and EU declaration of conformity under Annex IV?',
        'Are human oversight protocols designed for real-time live execution rather than post-hoc batch audit?'
      ]
    },
    {
      category: 'CONTRACT_RISK',
      statuteName: 'German Civil Code (Bürgerliches Gesetzbuch - BGB)',
      section: 'BGB § 307 (AGB-Recht)',
      verbatimSnippet: 'Provisions in standard terms are ineffective if, contrary to the requirement of good faith, they unreasonably disadvantage the other party.',
      enforceabilityVerdict: 'BGB § 307 invalidates standard form contract terms (AGB) that limit liability for cardinal contractual duties (Kardinalpflichten) or gross negligence.',
      riskWeight: 90,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the limitation of liability clause impermissibly restrict liability for breach of cardinal contractual obligations under BGB § 307?'
      ]
    }
  ],
  UAE: [
    {
      category: 'GDPR_PRIVACY',
      statuteName: 'UAE Federal Decree-Law No. 45/2021 on Personal Data Protection',
      section: 'Article 22 & 23',
      verbatimSnippet: 'Personal data may not be transferred outside the State unless the receiving country provides an adequate level of protection for personal data.',
      enforceabilityVerdict: 'Cross-border data transfers outside UAE require UAE Data Office approval or approved contractual safeguards.',
      riskWeight: 88,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the cloud infrastructure host personal data in UAE-onshore servers or DIFC/ADGM compliant data centers?'
      ]
    }
  ],
  SG: [
    {
      category: 'GDPR_PRIVACY',
      statuteName: 'Singapore Personal Data Protection Act 2012 (PDPA)',
      section: 'Section 26 (Transfer Limitation Obligation)',
      verbatimSnippet: 'An organisation shall not transfer any personal data to a country or territory outside Singapore except in accordance with requirements prescribed under this Act.',
      enforceabilityVerdict: 'Transfers outside Singapore require ensuring receiver provides standard of protection comparable to PDPA.',
      riskWeight: 86,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Has the overseas recipient executed a Legally Binding Undertaking or standard contract complying with PDPA Regulations 2021?'
      ]
    }
  ],
  AU: [
    {
      category: 'CONTRACT_RISK',
      statuteName: 'Australian Consumer Law (ACL Schedule 2 to Competition and Consumer Act 2010)',
      section: 'Section 23 - Unfair Contract Terms',
      verbatimSnippet: 'A term of a small business contract is void if the term is unfair and the contract is a standard form contract.',
      enforceabilityVerdict: 'Since Nov 2023, penalties apply for proposing or relying on unfair contract terms under ACL (up to $50M or 3x value of benefit).',
      riskWeight: 94,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Does the unilateral indemnity clause expose the business to severe ACL unfair contract term penalties?'
      ]
    }
  ],
  CA: [
    {
      category: 'GDPR_PRIVACY',
      statuteName: 'Quebec Law 25 (An Act to modernize legislative provisions as regards the protection of personal information)',
      section: 'Section 17 & 103',
      verbatimSnippet: 'Before transferring personal information outside Quebec, an organization must conduct a Privacy Impact Assessment (PIA).',
      enforceabilityVerdict: 'Transferring Quebec resident data out of Quebec without a documented PIA triggers fines up to $25M or 2% of global turnover.',
      riskWeight: 92,
      isAmbiguous: false,
      targetedAdvocateQuestions: [
        'Has a Privacy Impact Assessment (PIA) been documented prior to exporting data outside Quebec?'
      ]
    }
  ]
};

export function getGroundingForCategory(country: CountryCode, category: ComplianceCategory): GroundingRule | null {
  const rules = STATUTORY_GROUNDING_DATABASE[country] || STATUTORY_GROUNDING_DATABASE.IN;
  return rules.find(r => r.category === category) || rules[0] || null;
}
