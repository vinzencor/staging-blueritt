/**
 * Comprehensive Keyword Filtering System
 * Blocks inappropriate content based on various safety categories
 */

// Child Sexual Abuse / Exploitation (CSAM)
const CSAM_KEYWORDS = [
  'child porn', 'cp', 'pedo', 'pedophile', 'underage sex', 'lolita', 'teen sex', 
  'preteen', 'child abuse', 'minor sex', 'kiddie', 'jailbait', 'barely legal',
  'schoolgirl', 'young girl', 'little girl', 'baby sex', 'toddler', 'infant'
];

// Sexually Explicit / Pornographic
const SEXUAL_KEYWORDS = [
  'porn', 'pornography', 'xxx', 'sex', 'nude', 'naked', 'blowjob', 'blow job',
  'anal', 'gangbang', 'hardcore', 'nude pics', 'pussy', 'dick', 'cock', 
  'penis', 'vagina', 'masturbate', 'orgasm', 'cumshot', 'facial', 'threesome',
  'orgy', 'dildo', 'vibrator', 'sex toy', 'erotic', 'adult content'
];

// Violence & Gore
const VIOLENCE_KEYWORDS = [
  'kill', 'murder', 'shoot', 'stab', 'decapitate', 'bomb tutorial', 'torture',
  'gore', 'blood', 'death', 'suicide bomb', 'assassination', 'massacre',
  'genocide', 'execution', 'beheading', 'dismember', 'mutilate', 'slaughter'
];

// Self-harm / Suicide
const SELF_HARM_KEYWORDS = [
  'kill myself', 'suicide', 'cutting', 'self harm', 'suicide method', 
  'pro-ana', 'pro-suicide', 'anorexia', 'bulimia', 'self injury', 'razor',
  'overdose', 'hanging', 'jump off', 'end my life', 'want to die'
];

// Terrorism & Extremism
const TERRORISM_KEYWORDS = [
  'isis', 'al-qaeda', 'al qaeda', 'jihad', 'bomb', 'martyrdom', 'terrorist',
  'extremist', 'radical islam', 'holy war', 'infidel', 'caliphate',
  'suicide bomber', 'ied', 'explosive', 'attack plan', 'target list'
];

// Hate Speech / Slurs
const HATE_SPEECH_KEYWORDS = [
  // Racial slurs (partially censored for safety)
  'n*gger', 'n*gga', 'ch*nk', 'sp*c', 'w*tback', 'sand n*gger', 'towelhead',
  'k*ke', 'h*be', 'g*ok', 'sl*nt', 'cr*cker', 'honky', 'w*p', 'guinea',
  // Homophobic slurs
  'f*ggot', 'f*g', 'qu*er', 'd*ke', 'tr*nny', 'sh*male',
  // Religious hate
  'j*w', 'muslim terrorist', 'christian freak', 'hindu cow', 'sikh terrorist',
  // General hate terms
  'white supremacy', 'nazi', 'hitler', 'holocaust denial', 'ethnic cleansing'
];

// Illegal Drugs / Crime
const DRUGS_CRIME_KEYWORDS = [
  'cocaine', 'heroin', 'meth', 'methamphetamine', 'crack cocaine', 'lsd',
  'ecstasy', 'mdma', 'buy weed', 'buy drugs', 'drug dealer', 'drug deal',
  'gun for sale', 'illegal weapons', 'fake passport', 'stolen goods',
  'money laundering', 'human trafficking', 'organ trafficking', 'hitman',
  'assassin for hire', 'contract killer', 'black market', 'dark web'
];

// Non-consensual sexual acts
const NON_CONSENSUAL_KEYWORDS = [
  'rape', 'rape porn', 'forced sex', 'molest', 'drugged sex', 'date rape',
  'sexual assault', 'non consensual', 'against will', 'roofie', 'rohypnol',
  'unconscious sex', 'sleeping sex', 'drunk sex', 'coerced sex'
];

// Fraud / Scams
const FRAUD_KEYWORDS = [
  'free credit card', 'cvv dump', 'credit card hack', 'bank hack', 
  'hacking service', 'crack software', 'pirated software', 'stolen account',
  'phishing', 'identity theft', 'social security hack', 'tax fraud',
  'insurance fraud', 'ponzi scheme', 'pyramid scheme', 'fake id'
];

// Profanity (common swear words)
const PROFANITY_KEYWORDS = [
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'damn', 'hell',
  'cunt', 'whore', 'slut', 'bastard', 'piss', 'crap', 'motherfucker'
];

// Combine all keyword lists
const ALL_BLOCKED_KEYWORDS = [
  ...CSAM_KEYWORDS,
  ...SEXUAL_KEYWORDS,
  ...VIOLENCE_KEYWORDS,
  ...SELF_HARM_KEYWORDS,
  ...TERRORISM_KEYWORDS,
  ...HATE_SPEECH_KEYWORDS,
  ...DRUGS_CRIME_KEYWORDS,
  ...NON_CONSENSUAL_KEYWORDS,
  ...FRAUD_KEYWORDS,
  ...PROFANITY_KEYWORDS
];

/**
 * Check if a text contains any blocked keywords
 * @param text - The text to check
 * @returns Object with isBlocked boolean and matched keywords
 */
export const checkForBlockedKeywords = (text: string): {
  isBlocked: boolean;
  matchedKeywords: string[];
  category: string;
} => {
  if (!text || typeof text !== 'string') {
    return { isBlocked: false, matchedKeywords: [], category: '' };
  }

  const normalizedText = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let category = '';

  // Check each category separately to identify the type of violation
  const categories = [
    { name: 'Child Sexual Abuse/Exploitation', keywords: CSAM_KEYWORDS },
    { name: 'Sexual Content', keywords: SEXUAL_KEYWORDS },
    { name: 'Violence/Gore', keywords: VIOLENCE_KEYWORDS },
    { name: 'Self-harm/Suicide', keywords: SELF_HARM_KEYWORDS },
    { name: 'Terrorism/Extremism', keywords: TERRORISM_KEYWORDS },
    { name: 'Hate Speech', keywords: HATE_SPEECH_KEYWORDS },
    { name: 'Illegal Drugs/Crime', keywords: DRUGS_CRIME_KEYWORDS },
    { name: 'Non-consensual Content', keywords: NON_CONSENSUAL_KEYWORDS },
    { name: 'Fraud/Scams', keywords: FRAUD_KEYWORDS },
    { name: 'Profanity', keywords: PROFANITY_KEYWORDS }
  ];

  for (const cat of categories) {
    for (const keyword of cat.keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      
      // Check for exact word matches (not just substring)
      const wordBoundaryRegex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (wordBoundaryRegex.test(normalizedText) || normalizedText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
        if (!category) {
          category = cat.name;
        }
      }
    }
  }

  return {
    isBlocked: matchedKeywords.length > 0,
    matchedKeywords,
    category
  };
};

/**
 * Sanitize text by removing blocked keywords
 * @param text - The text to sanitize
 * @returns Sanitized text with blocked keywords replaced with [BLOCKED]
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let sanitizedText = text;
  
  for (const keyword of ALL_BLOCKED_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    sanitizedText = sanitizedText.replace(regex, '[BLOCKED]');
  }

  return sanitizedText;
};

/**
 * Get a user-friendly error message for blocked content
 * @param category - The category of blocked content
 * @returns User-friendly error message
 */
export const getBlockedContentMessage = (category: string): string => {
  const messages: Record<string, string> = {
    'Child Sexual Abuse/Exploitation': 'Content related to child exploitation is strictly prohibited.',
    'Sexual Content': 'Sexually explicit content is not allowed.',
    'Violence/Gore': 'Violent or graphic content is not permitted.',
    'Self-harm/Suicide': 'Content promoting self-harm or suicide is blocked for safety.',
    'Terrorism/Extremism': 'Terrorist or extremist content is prohibited.',
    'Hate Speech': 'Hate speech and discriminatory language is not allowed.',
    'Illegal Drugs/Crime': 'Content related to illegal drugs or criminal activities is blocked.',
    'Non-consensual Content': 'Non-consensual sexual content is strictly prohibited.',
    'Fraud/Scams': 'Content related to fraud or scams is not allowed.',
    'Profanity': 'Profanity and offensive language is not permitted.'
  };

  return messages[category] || 'This content contains blocked keywords and cannot be processed.';
};

export default {
  checkForBlockedKeywords,
  sanitizeText,
  getBlockedContentMessage
};
