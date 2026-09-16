import type { CountryCode, CountryConfig } from '../types/legal';

export const SUPPORTED_COUNTRIES: Record<CountryCode, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR (₹)',
    legalSystem: 'Indian Federal & Statutory Common Law',
    primaryStatutes: [
      'Indian Contract Act, 1872 (Sec 27 Non-competes)',
      'Digital Personal Data Protection (DPDP) Act, 2023',
      'Information Technology Act, 2000 & 2011 Rules',
      'Specific Relief Act, 1963',
      'Indian Stamp Act, 1899'
    ],
    governingLawKeywords: [
      'india', 'indian contract act', 'dpdp', 'new delhi', 'mumbai', 'bengaluru', 'karnataka',
      'laws of india', 'courts at mumbai', 'courts of new delhi', 'it act 2000'
    ],
    description: 'Enforces strict voidness of post-employment non-competes under Section 27, mandatory consent managers under DPDP Act 2023, and IT Act cybersecurity requirements.'
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP (£)',
    legalSystem: 'English Common Law & UK Statutory Directives',
    primaryStatutes: [
      'Unfair Contract Terms Act 1977 (UCTA s.2(1))',
      'UK GDPR & Data Protection Act 2018',
      'Consumer Rights Act 2015',
      'English Common Law Restraint of Trade Rules',
      'Commercial Agents Regulations 1993'
    ],
    governingLawKeywords: [
      'united kingdom', 'uk', 'england', 'wales', 'english law', 'london', 'ucta',
      'uk gdpr', 'data protection act 2018', 'high court of london', 'english courts'
    ],
    description: 'Requires UCTA reasonableness testing for liability exclusions, strict s.2(1) prohibition of negligence death/injury waivers, and UK GDPR international transfer mechanisms.'
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD ($)',
    legalSystem: 'US State Common Law & Uniform Commercial Code',
    primaryStatutes: [
      'Uniform Commercial Code (UCC Article 2)',
      'Defend Trade Secrets Act (DTSA)',
      'California Consumer Privacy Act (CCPA/CPRA)',
      'Delaware General Corporation Law (DGCL)',
      'FTC Act Section 5 & Non-Compete Standards'
    ],
    governingLawKeywords: [
      'united states', 'usa', 'delaware', 'california', 'new york', 'ucc', 'dtsa',
      'governed by the laws of delaware', 'state of new york', 'california courts', 'ccpa'
    ],
    description: 'Enforces UCC commercial warranties, Delaware corporate precedents, CCPA consumer opt-out mandates, and California B&P 16600 void non-compete rules.'
  },
  DE: {
    code: 'DE',
    name: 'Germany / European Union',
    flag: '🇩🇪',
    currency: 'EUR (€)',
    legalSystem: 'German Civil Code (BGB) & EU Regulatory Framework',
    primaryStatutes: [
      'EU Artificial Intelligence Act 2024 (Art 10, 14, 15, 50)',
      'EU General Data Protection Regulation (GDPR)',
      'German Civil Code BGB § 307 (AGB-Recht Unreasonableness Test)',
      'Bundesdatenschutzgesetz (BDSG)',
      'EU NIS2 Security Directive'
    ],
    governingLawKeywords: [
      'germany', 'german law', 'bgb', 'eu ai act', 'gdpr', 'berlin', 'frankfurt',
      'european union', 'federal republic of germany', 'court of frankfurt', 'bdsg'
    ],
    description: 'Strict adherence to EU AI Act high-risk classification, real-time human oversight mandates, GDPR Article 44 cross-border restrictions, and BGB standard contract term checks.'
  },
  UAE: {
    code: 'UAE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED (د.إ)',
    legalSystem: 'UAE Civil Code & DIFC/ADGM Financial Free Zone Laws',
    primaryStatutes: [
      'UAE Federal Decree-Law No. 31/2021 (Crimes & Penalties)',
      'UAE Federal Decree-Law No. 45/2021 (Personal Data Protection)',
      'DIFC Contract Law No. 6/2004',
      'ADGM Companies Regulations',
      'UAE Commercial Transactions Law'
    ],
    governingLawKeywords: [
      'uae', 'united arab emirates', 'dubai', 'difc', 'adgm', 'abu dhabi',
      'difc courts', 'adgm courts', 'uae data protection law'
    ],
    description: 'Differentiates onshore UAE Civil Law from DIFC/ADGM Common Law courts, enforcing strict local data localization and penal law confidentiality provisions.'
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD (S$)',
    legalSystem: 'Singapore Common Law & Statutory Acts',
    primaryStatutes: [
      'Personal Data Protection Act 2012 (PDPA)',
      'Singapore Application of English Law Act (Cap. 7A)',
      'Unfair Contract Terms Act (Cap. 396)',
      'Monetary Authority of Singapore (MAS) AI Guidelines',
      'Computer Misuse Act'
    ],
    governingLawKeywords: [
      'singapore', 'singapore law', 'pdpa', 'singapore international arbitration centre',
      'siac', 'high court of singapore', 'mas guidelines'
    ],
    description: 'Enforces PDPA 2012 data protection mandates, SIAC arbitration clauses, and MAS FEAT principles for financial AI deployment.'
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD (A$)',
    legalSystem: 'Australian Federal & State Common Law',
    primaryStatutes: [
      'Privacy Act 1988 & Australian Privacy Principles (APPs)',
      'Australian Consumer Law (ACL Schedule 2 Unfair Terms)',
      'Fair Work Act 2009',
      'Corporations Act 2001',
      'Security of Critical Infrastructure Act (SOCI)'
    ],
    governingLawKeywords: [
      'australia', 'australian law', 'sydney', 'melbourne', 'new south wales', 'nsw',
      'privacy act 1988', 'acl', 'australian consumer law', 'federal court of australia'
    ],
    description: 'Enforces ACL prohibitions on unconscionable conduct and unfair standard form contract terms, along with strict APPs cross-border disclosure obligations.'
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD (C$)',
    legalSystem: 'Canadian Common Law & Quebec Civil Code',
    primaryStatutes: [
      'Personal Information Protection and Electronic Documents Act (PIPEDA)',
      'Quebec Law 25 (Data Privacy Modernization)',
      'Artificial Intelligence and Data Act (AIDA / Bill C-27)',
      'Competition Act (Non-compete provisions)',
      'Canada Business Corporations Act (CBCA)'
    ],
    governingLawKeywords: [
      'canada', 'canadian law', 'ontario', 'quebec', 'toronto', 'montreal', 'pipeda',
      'law 25', 'bill c-27', 'aida', 'superior court of ontario'
    ],
    description: 'Combines federal PIPEDA and strict Quebec Law 25 data privacy consent standards with AIDA provisions for high-impact AI systems.'
  }
};

export const DEFAULT_JURISDICTION: CountryCode = 'IN';

export function detectJurisdictionFromText(text: string): CountryCode | null {
  const lower = text.toLowerCase();
  
  for (const [code, config] of Object.entries(SUPPORTED_COUNTRIES)) {
    for (const keyword of config.governingLawKeywords) {
      if (lower.includes(keyword)) {
        return code as CountryCode;
      }
    }
  }
  
  return null;
}
