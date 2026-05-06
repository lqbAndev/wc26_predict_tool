/**
 * Logo Map — maps team names to logo image paths in /public/logo_country/
 *
 * Logo filenames follow the pattern: `{slug}-national-team.football-logos.cc.png`
 * with some exceptions (e.g. Netherlands → "dutch", Portugal → "portuguese-football-federation").
 */

const buildAssetPath = (relativePath: string) => {
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase === './' ? './' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${base}${relativePath}`;
};

export const TEAM_LOGO_MAP: Record<string, string> = {
  Mexico: buildAssetPath('logo_country/mexico-national-team.football-logos.cc.png'),
  'South Africa': buildAssetPath('logo_country/south-africa-national-team.football-logos.cc.png'),
  'South Korea': buildAssetPath('logo_country/south-korea-national-team.football-logos.cc.png'),
  'Czech Republic': buildAssetPath('logo_country/czech-republic-national-team.football-logos.cc.png'),
  Canada: buildAssetPath('logo_country/canada-national-team.football-logos.cc.png'),
  'Bosnia & Herzegovina': buildAssetPath('logo_country/bosnia-and-herzegovina-national-team.football-logos.cc.png'),
  Qatar: buildAssetPath('logo_country/qatar-national-team.football-logos.cc.png'),
  Switzerland: buildAssetPath('logo_country/switzerland-national-team.football-logos.cc.png'),
  Brazil: buildAssetPath('logo_country/brazil-national-team.football-logos.cc.png'),
  Morocco: buildAssetPath('logo_country/morocco-national-team.football-logos.cc.png'),
  Haiti: buildAssetPath('logo_country/haiti-national-team.football-logos.cc.png'),
  Scotland: buildAssetPath('logo_country/scotland-national-team.football-logos.cc.png'),
  'United States': buildAssetPath('logo_country/usa-national-team.football-logos.cc.png'),
  Paraguay: buildAssetPath('logo_country/paraguay-national-team.football-logos.cc.png'),
  Australia: buildAssetPath('logo_country/australia-national-team.football-logos.cc.png'),
  Turkey: buildAssetPath('logo_country/turkey-national-team.football-logos.cc.png'),
  Germany: buildAssetPath('logo_country/germany-national-team.football-logos.cc.png'),
  Curacao: buildAssetPath('logo_country/curacao-national-team.football-logos.cc.png'),
  'Ivory Coast': buildAssetPath('logo_country/cote-d-ivoire-national-team.football-logos.cc.png'),
  Ecuador: buildAssetPath('logo_country/ecuador-national-team.football-logos.cc.png'),
  Netherlands: buildAssetPath('logo_country/dutch-national-team.football-logos.cc.png'),
  Japan: buildAssetPath('logo_country/japan-national-team.football-logos.cc.png'),
  Sweden: buildAssetPath('logo_country/sweden-national-team.football-logos.cc.png'),
  Tunisia: buildAssetPath('logo_country/tunisia-national-team.football-logos.cc.png'),
  Belgium: buildAssetPath('logo_country/belgium-national-team.football-logos.cc.png'),
  Egypt: buildAssetPath('logo_country/egypt-national-team.football-logos.cc.png'),
  Iran: buildAssetPath('logo_country/iran-national-team.football-logos.cc.png'),
  'New Zealand': buildAssetPath('logo_country/new-zealand-national-team.football-logos.cc.png'),
  Spain: buildAssetPath('logo_country/spain-national-team.football-logos.cc.png'),
  'Cape Verde': buildAssetPath('logo_country/cabo-verde-national-team.football-logos.cc.png'),
  'Saudi Arabia': buildAssetPath('logo_country/saudi-arabia-national-team.football-logos.cc.png'),
  Uruguay: buildAssetPath('logo_country/uruguay-national-team.football-logos.cc.png'),
  France: buildAssetPath('logo_country/france-national-team.football-logos.cc.png'),
  Senegal: buildAssetPath('logo_country/senegal-national-team.football-logos.cc.png'),
  Iraq: buildAssetPath('logo_country/iraq-national-team.football-logos.cc.png'),
  Norway: buildAssetPath('logo_country/norway-national-team.football-logos.cc.png'),
  Argentina: buildAssetPath('logo_country/argentina-national-team.football-logos.cc.png'),
  Algeria: buildAssetPath('logo_country/algeria-national-team.football-logos.cc.png'),
  Austria: buildAssetPath('logo_country/austria-national-team.football-logos.cc.png'),
  Jordan: buildAssetPath('logo_country/jordan-national-team.football-logos.cc.png'),
  Portugal: buildAssetPath('logo_country/portuguese-football-federation.football-logos.cc.png'),
  'DR Congo': buildAssetPath('logo_country/congo-dr-national-team.football-logos.cc.png'),
  Uzbekistan: buildAssetPath('logo_country/uzbekistan-national-team.football-logos.cc.png'),
  Colombia: buildAssetPath('logo_country/colombia-national-team.football-logos.cc.png'),
  England: buildAssetPath('logo_country/england-national-team.football-logos.cc.png'),
  Croatia: buildAssetPath('logo_country/croatia-national-team.football-logos.cc.png'),
  Ghana: buildAssetPath('logo_country/ghana-national-team.football-logos.cc.png'),
  Panama: buildAssetPath('logo_country/panama-national-team.football-logos.cc.png'),
};

export const getTeamLogoSrc = (teamName?: string | null): string | null => {
  if (!teamName) return null;
  return TEAM_LOGO_MAP[teamName] ?? null;
};
