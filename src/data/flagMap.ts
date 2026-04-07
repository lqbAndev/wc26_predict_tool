const buildAssetPath = (relativePath: string) => {
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase === './' ? './' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${base}${relativePath}`;
};

export const FLAG_FALLBACK_PATH = buildAssetPath('flags/placeholder.svg');

export const TEAM_FLAG_MAP: Record<string, string> = {
  Mexico: buildAssetPath('flags/mexico.svg'),
  'South Africa': buildAssetPath('flags/south-africa.svg'),
  'South Korea': buildAssetPath('flags/south-korea.svg'),
  'Czech Republic': buildAssetPath('flags/czech-republic.svg'),
  Canada: buildAssetPath('flags/canada.svg'),
  'Bosnia & Herzegovina': buildAssetPath('flags/bosnia-and-herzegovina.svg'),
  Qatar: buildAssetPath('flags/qatar.svg'),
  Switzerland: buildAssetPath('flags/switzerland.svg'),
  Brazil: buildAssetPath('flags/brazil.svg'),
  Morocco: buildAssetPath('flags/morocco.svg'),
  Haiti: buildAssetPath('flags/haiti.svg'),
  Scotland: buildAssetPath('flags/scotland.svg'),
  'United States': buildAssetPath('flags/united-states.svg'),
  Paraguay: buildAssetPath('flags/paraguay.svg'),
  Australia: buildAssetPath('flags/australia.svg'),
  Turkey: buildAssetPath('flags/turkey.svg'),
  Germany: buildAssetPath('flags/germany.svg'),
  Curacao: buildAssetPath('flags/curacao.svg'),
  'Ivory Coast': buildAssetPath('flags/ivory-coast.svg'),
  Ecuador: buildAssetPath('flags/ecuador.svg'),
  Netherlands: buildAssetPath('flags/netherlands.svg'),
  Japan: buildAssetPath('flags/japan.svg'),
  Sweden: buildAssetPath('flags/sweden.svg'),
  Tunisia: buildAssetPath('flags/tunisia.svg'),
  Belgium: buildAssetPath('flags/belgium.svg'),
  Egypt: buildAssetPath('flags/egypt.svg'),
  Iran: buildAssetPath('flags/iran.svg'),
  'New Zealand': buildAssetPath('flags/new-zealand.svg'),
  Spain: buildAssetPath('flags/spain.svg'),
  'Cape Verde': buildAssetPath('flags/cape-verde.svg'),
  'Saudi Arabia': buildAssetPath('flags/saudi-arabia.svg'),
  Uruguay: buildAssetPath('flags/uruguay.svg'),
  France: buildAssetPath('flags/france.svg'),
  Senegal: buildAssetPath('flags/senegal.svg'),
  Iraq: buildAssetPath('flags/iraq.svg'),
  Norway: buildAssetPath('flags/norway.svg'),
  Argentina: buildAssetPath('flags/argentina.svg'),
  Algeria: buildAssetPath('flags/algeria.svg'),
  Austria: buildAssetPath('flags/austria.svg'),
  Jordan: buildAssetPath('flags/jordan.svg'),
  Portugal: buildAssetPath('flags/portugal.svg'),
  'DR Congo': buildAssetPath('flags/dr-congo.svg'),
  Uzbekistan: buildAssetPath('flags/uzbekistan.svg'),
  Colombia: buildAssetPath('flags/colombia.svg'),
  England: buildAssetPath('flags/england.svg'),
  Croatia: buildAssetPath('flags/croatia.svg'),
  Ghana: buildAssetPath('flags/ghana.svg'),
  Panama: buildAssetPath('flags/panama.svg'),
};

export const getTeamFlagSrc = (teamName?: string | null) => {
  if (!teamName) {
    return FLAG_FALLBACK_PATH;
  }

  return TEAM_FLAG_MAP[teamName] ?? FLAG_FALLBACK_PATH;
};
