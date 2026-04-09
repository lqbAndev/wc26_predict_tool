import type { PlayerPosition, PlayerProfile } from '../types/tournament';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

const hashString = (value: string) =>
  Array.from(value).reduce((accumulator, character, index) => {
    return accumulator + character.charCodeAt(0) * (index + 7);
  }, 0);

type BasePlayer = { name: string; position: PlayerPosition };

const makeTeam = (gk: string[], df: string[], mf: string[], fw: string[]): BasePlayer[] => [
  ...gk.map((name) => ({ name, position: 'GK' as PlayerPosition })),
  ...df.map((name) => ({ name, position: 'DF' as PlayerPosition })),
  ...mf.map((name) => ({ name, position: 'MF' as PlayerPosition })),
  ...fw.map((name) => ({ name, position: 'FW' as PlayerPosition })),
];

const REAL_TEAM_ROSTERS: Record<string, BasePlayer[]> = {
  'Mexico': makeTeam(['Guillermo Ochoa'], ['Cesar Montes', 'Johan Vasquez', 'Jesus Gallardo', 'Jorge Sanchez', 'Kevin Alvarez'], ['Edson Alvarez', 'Luis Chavez', 'Orbelin Pineda', 'Denzell Garcia', 'Obed Vargas'], ['Hirving Lozano', 'Santi Gimenez', 'Henry Martin', 'Julian Quinones']),
  'South Africa': makeTeam(['Ronwen Williams'], ['Khuliso Mudau', 'Mothobi Mvala', 'Siyanda Xulu', 'Aubrey Modiba'], ['Teboho Mokoena', 'Sphephelo Sithole', 'Themba Zwane'], ['Percy Tau', 'Mihlali Mayambela', 'Evidence Makgopa']),
  'South Korea': makeTeam(['Jo Hyeon-woo'], ['Kim Min-jae', 'Jung Seung-hyun', 'Kim Young-gwon', 'Seol Young-woo'], ['Hwang In-beom', 'Lee Kang-in', 'Lee Jae-sung'], ['Son Heung-min', 'Hwang Hee-chan', 'Cho Gue-sung']),
  'Czech Republic': makeTeam(['Jindrich Stanek'], ['Tomas Holes', 'Robin Hranac', 'Ladislav Krejci', 'Vladimir Coufal'], ['Tomas Soucek', 'Lukas Provod', 'Antonin Barak'], ['Patrik Schick', 'Adam Hlozek', 'Vaclav Cerny']),
  'Canada': makeTeam(['Maxime Crepeau'], ['Alistair Johnston', 'Moise Bombito', 'Derek Cornelius', 'Alphonso Davies'], ['Stephen Eustaquio', 'Ismael Kone', 'Jonathan Osorio'], ['Tajon Buchanan', 'Cyle Larin', 'Jonathan David']),
  'Bosnia & Herzegovina': makeTeam(['Ibrahim Sehic'], ['Amar Dedic', 'Anel Ahmedhodzic', 'Dennis Hadzikadunic', 'Sead Kolasinac'], ['Miralem Pjanic', 'Rade Krunic', 'Gojko Cimirot'], ['Miroslav Stevanovic', 'Edin Dzeko', 'Ermedin Demirovic']),
  'Qatar': makeTeam(['Meshaal Barsham'], ['Ro-Ro', 'Tarek Salman', 'Lucas Mendes', 'Mohammed Waad'], ['Ahmed Fatehi', 'Abdulaziz Hatem', 'Hassan Al-Haydos'], ['Akram Afif', 'Almoez Ali', 'Yusuf Abdurisag']),
  'Switzerland': makeTeam(['Yann Sommer'], ['Manuel Akanji', 'Nico Elvedi', 'Ricardo Rodriguez', 'Silvan Widmer'], ['Granit Xhaka', 'Remo Freuler', 'Xherdan Shaqiri'], ['Dan Ndoye', 'Breel Embolo', 'Ruben Vargas']),
  'Brazil': makeTeam(['Alisson Becker'], ['Danilo', 'Marquinhos', 'Gabriel Magalhaes', 'Guilherme Arana'], ['Casemiro', 'Bruno Guimaraes', 'Lucas Paqueta'], ['Vinicius Junior', 'Rodrygo', 'Richarlison']),
  'Morocco': makeTeam(['Yassine Bounou'], ['Achraf Hakimi', 'Nayef Aguerd', 'Romain Saiss', 'Noussair Mazraoui'], ['Sofyan Amrabat', 'Azzedine Ounahi', 'Selim Amallah'], ['Hakim Ziyech', 'Youssef En-Nesyri', 'Sofiane Boufal']),
  'Haiti': makeTeam(['Johny Placide'], ['Carlens Arcus', 'Ricardo Ade', 'Alex Christian', 'Martin Experience'], ['Bryan Alceus', 'Leverton Pierre', 'Steeven Saba'], ['Duckens Nazon', 'Frantzdy Pierrot', 'Derrick Etienne']),
  'Scotland': makeTeam(['Angus Gunn'], ['Jack Hendry', 'Grant Hanley', 'Kieran Tierney', 'Anthony Ralston'], ['Billy Gilmour', 'Callum McGregor', 'John McGinn', 'Scott McTominay'], ['Che Adams', 'Lyndon Dykes']),
  'United States': makeTeam(['Matt Turner'], ['Sergino Dest', 'Chris Richards', 'Tim Ream', 'Antonee Robinson'], ['Tyler Adams', 'Weston McKennie', 'Yunus Musah'], ['Tim Weah', 'Folarin Balogun', 'Christian Pulisic']),
  'Paraguay': makeTeam(['Carlos Coronel'], ['Robert Rojas', 'Fabián Balbuena', 'Omar Alderete', 'Mathias Espinoza'], ['Mathias Villasanti', 'Andres Cubas', 'Diego Gomez'], ['Miguel Almiron', 'Antonio Sanabria', 'Julio Enciso']),
  'Australia': makeTeam(['Mathew Ryan'], ['Nathaniel Atkinson', 'Harry Souttar', 'Kye Rowles', 'Aziz Behich'], ['Keanu Baccus', 'Jackson Irvine', 'Connor Metcalfe'], ['Martin Boyle', 'Mitchell Duke', 'Craig Goodwin']),
  'Turkey': makeTeam(['Mert Gunok'], ['Zeki Celik', 'Merih Demiral', 'Abdulkerim Bardakci', 'Ferdi Kadioglu'], ['Salih Ozcan', 'Hakan Calhanoglu', 'Arda Guler'], ['Orkun Kokcu', 'Kenan Yildiz', 'Baris Alper Yilmaz']),
  'Germany': makeTeam(['Manuel Neuer'], ['Joshua Kimmich', 'Jonathan Tah', 'Antonio Rudiger', 'Maximilian Mittelstadt'], ['Robert Andrich', 'Toni Kroos', 'Ilkay Gundogan'], ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz']),
  'Curacao': makeTeam(['Eloy Room'], ['Juriën Gaari', 'Cuco Martina', 'Sherel Floranus', 'Nathangelo Markelo'], ['Vurnon Anita', 'Leandro Bacuna', 'Kevin Felida'], ['Brandley Kuwas', 'Rangelo Janga', 'Kenji Gorré']),
  'Ivory Coast': makeTeam(['Yahia Fofana'], ['Serge Aurier', 'Odilon Kossounou', 'Evan Ndicka', 'Ghislain Konan'], ['Franck Kessie', 'Jean Michael Seri', 'Seko Fofana'], ['Nicolas Pepe', 'Sebastien Haller', 'Simon Adingra']),
  'Ecuador': makeTeam(['Alexander Dominguez'], ['Angelo Preciado', 'Felix Torres', 'Willian Pacho', 'Piero Hincapie'], ['Carlos Gruezo', 'Moises Caicedo', 'Alan Franco'], ['Kendry Paez', 'Enner Valencia', 'Kevin Rodriguez']),
  'Netherlands': makeTeam(['Bart Verbruggen'], ['Denzel Dumfries', 'Stefan de Vrij', 'Virgil van Dijk', 'Nathan Ake'], ['Jerdy Schouten', 'Tijjani Reijnders', 'Xavi Simons'], ['Jeremie Frimpong', 'Memphis Depay', 'Cody Gakpo']),
  'Japan': makeTeam(['Zion Suzuki'], ['Yukinari Sugawara', 'Ko Itakura', 'Takehiro Tomiyasu', 'Hiroki Ito'], ['Wataru Endo', 'Hidemasa Morita', 'Takefusa Kubo'], ['Takumi Minamino', 'Kaoru Mitoma', 'Ayase Ueda']),
  'Sweden': makeTeam(['Robin Olsen'], ['Emil Krafth', 'Victor Lindelof', 'Isak Hien', 'Ludwig Augustinsson'], ['Mattias Svanberg', 'Jens Cajuste', 'Dejan Kulusevski'], ['Emil Forsberg', 'Alexander Isak', 'Viktor Gyokeres']),
  'Tunisia': makeTeam(['Aymen Dahmen'], ['Wajdi Kechrida', 'Yassine Meriah', 'Montassar Talbi', 'Ali Abdi'], ['Ellyes Skhiri', 'Aissa Laidouni', 'Mohamed Ali Ben Romdhane'], ['Hannibal Mejbri', 'Youssef Msakni', 'Elias Achouri']),
  'Belgium': makeTeam(['Koen Casteels'], ['Timothy Castagne', 'Wout Faes', 'Jan Vertonghen', 'Arthur Theate'], ['Amadou Onana', 'Youri Tielemans', 'Kevin De Bruyne'], ['Jeremy Doku', 'Leandro Trossard', 'Romelu Lukaku']),
  'Egypt': makeTeam(['Mohamed El Shenawy'], ['Mohamed Hany', 'Ahmed Hegazy', 'Mohamed Abdelmonem', 'Ahmed Fotouh'], ['Hamdi Fathi', 'Mohamed Elneny', 'Emam Ashour'], ['Mohamed Salah', 'Mostafa Mohamed', 'Trezeguet']),
  'Iran': makeTeam(['Alireza Beiranvand'], ['Ramin Rezaeian', 'Hossein Kanaani', 'Shojae Khalilzadeh', 'Ehsan Hajsafi'], ['Saeid Ezatolahi', 'Saman Ghoddos', 'Alireza Jahanbakhsh'], ['Mehdi Taremi', 'Mohammad Mohebi', 'Sardar Azmoun']),
  'New Zealand': makeTeam(['Max Crocombe'], ['Tim Payne', 'Tyler Bindon', 'Nando Pijnaker', 'Liberato Cacace'], ['Joe Bell', 'Marko Stamenic', 'Matthew Garbett'], ['Marco Rojas', 'Chris Wood', 'Elijah Just']),
  'Spain': makeTeam(['Unai Simon'], ['Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte', 'Marc Cucurella'], ['Rodri', 'Fabian Ruiz', 'Pedri'], ['Lamine Yamal', 'Alvaro Morata', 'Nico Williams']),
  'Cape Verde': makeTeam(['Vozinha'], ['Roberto Lopes', 'Logan Costa', 'Steven Moreira', 'João Paulo'], ['Kevin Pina', 'Jamiro Monteiro', 'Deroy Duarte'], ['Ryan Mendes', 'Bebe', 'Garry Rodrigues']),
  'Saudi Arabia': makeTeam(['Mohammed Al-Owais'], ['Saud Abdulhamid', 'Hassan Tambakti', 'Ali Al-Bulaihi', 'Yasser Al-Shahrani'], ['Mohamed Kanno', 'Abdulellah Al-Malki', 'Salem Al-Dawsari'], ['Sami Al-Najei', 'Firas Al-Buraikan', 'Saleh Al-Shehri']),
  'Uruguay': makeTeam(['Sergio Rochet'], ['Nahitan Nandez', 'Ronald Araujo', 'Jose Gimenez', 'Mathias Olivera'], ['Manuel Ugarte', 'Federico Valverde', 'Nicolas De La Cruz'], ['Facundo Pellistri', 'Darwin Nunez', 'Maximiliano Araujo']),
  'France': makeTeam(['Mike Maignan'], ['Jules Kounde', 'Dayot Upamecano', 'William Saliba', 'Theo Hernandez'], ['N\'Golo Kante', 'Aurelien Tchouameni', 'Adrien Rabiot'], ['Ousmane Dembele', 'Kylian Mbappe', 'Marcus Thuram']),
  'Senegal': makeTeam(['Edouard Mendy'], ['Kalidou Koulibaly', 'Abdou Diallo', 'Moussa Niakhate', 'Ismail Jakobs'], ['Idrissa Gueye', 'Pape Matar Sarr', 'Lamine Camara'], ['Ismaila Sarr', 'Nicolas Jackson', 'Sadio Mane']),
  'Iraq': makeTeam(['Jalal Hassan'], ['Hussein Ali', 'Saad Natiq', 'Rebin Sulaka', 'Merchas Doski'], ['Osama Rashid', 'Amir Al-Ammari', 'Ibrahim Bayesh'], ['Bashar Resan', 'Ali Jasim', 'Aymen Hussein']),
  'Norway': makeTeam(['Orjan Nyland'], ['Julian Ryerson', 'Leo Ostigard', 'Kristoffer Ajer', 'Birger Meling'], ['Sander Berge', 'Martin Odegaard', 'Fredrik Aursnes'], ['Oscar Bobb', 'Erling Haaland', 'Alexander Sorloth']),
  'Argentina': makeTeam(['Emiliano Martinez'], ['Nahuel Molina', 'Cristian Romero', 'Lisandro Martinez', 'Nicolas Tagliafico'], ['Rodrigo De Paul', 'Enzo Fernandez', 'Alexis Mac Allister'], ['Angel Di Maria', 'Lionel Messi', 'Julian Alvarez']),
  'Algeria': makeTeam(['Anthony Mandrea'], ['Youcef Atal', 'Aissa Mandi', 'Ramy Bensebaini', 'Rayan Ait-Nouri'], ['Nabil Bentaleb', 'Ismael Bennacer', 'Houssem Aouar'], ['Riyad Mahrez', 'Baghdad Bounedjah', 'Yousef Belaili']),
  'Austria': makeTeam(['Patrick Pentz'], ['Stefan Posch', 'Kevin Danso', 'Philipp Lienhart', 'Phillipp Mwene'], ['Nicolas Seiwald', 'Marcel Sabitzer', 'Konrad Laimer'], ['Christoph Baumgartner', 'Michael Gregoritsch', 'Marko Arnautovic']),
  'Jordan': makeTeam(['Yazeed Abu Laila'], ['Abdallah Nasib', 'Yazan Al-Arab', 'Salem Al-Ajalin', 'Ihsan Haddad'], ['Nizar Al-Rashdan', 'Noor Al-Rawabdeh', 'Mahmoud Al-Mardi'], ['Musa Al-Taamari', 'Ali Olwan', 'Yazan Al-Naimat']),
  'Portugal': makeTeam(['Diogo Costa'], ['Joao Cancelo', 'Ruben Dias', 'Pepe', 'Nuno Mendes'], ['Joao Palhinha', 'Vitinha', 'Bruno Fernandes'], ['Bernardo Silva', 'Rafael Leao', 'Cristiano Ronaldo']),
  'DR Congo': makeTeam(['Lionel Mpasi'], ['Gedeon Kalulu', 'Chancel Mbemba', 'Henoc Inonga', 'Arthur Masuaku'], ['Samuel Moutoussamy', 'Charles Pickel', 'Gael Kakuta'], ['Meschak Elia', 'Cedric Bakambu', 'Yoane Wissa']),
  'Uzbekistan': makeTeam(['Utkir Yusupov'], ['Husniddin Aliqulov', 'Abdukodir Khusanov', 'Rustam Ashurmatov', 'Farrukh Sayfiev'], ['Otabek Shukurov', 'Odiljon Hamrobekov', 'Jaloliddin Masharipov'], ['Abbosbek Fayzullaev', 'Oston Urunov', 'Eldor Shomurodov']),
  'Colombia': makeTeam(['Camilo Vargas'], ['Daniel Munoz', 'Davinson Sanchez', 'Carlos Cuesta', 'Johan Mojica'], ['Jefferson Lerma', 'Richard Rios', 'Jhon Arias'], ['James Rodriguez', 'Luis Diaz', 'Miguel Borja']),
  'England': makeTeam(['Jordan Pickford'], ['Kyle Walker', 'John Stones', 'Marc Guehi', 'Kieran Trippier'], ['Declan Rice', 'Kobbie Mainoo', 'Jude Bellingham'], ['Phil Foden', 'Bukayo Saka', 'Harry Kane']),
  'Croatia': makeTeam(['Dominik Livakovic'], ['Josip Stanisic', 'Josip Sutalo', 'Josko Gvardiol', 'Borna Sosa'], ['Luka Modric', 'Marcelo Brozovic', 'Mateo Kovacic'], ['Lovro Majer', 'Andrej Kramaric', 'Mario Pasalic']),
  'Ghana': makeTeam(['Richard Ofori'], ['Alidu Seidu', 'Alexander Djiku', 'Mohammed Salisu', 'Gideon Mensah'], ['Salis Abdul Samed', 'Thomas Partey', 'Mohammed Kudus'], ['Jordan Ayew', 'Antoine Semenyo', 'Inaki Williams']),
  'Panama': makeTeam(['Orlando Mosquera'], ['Fidel Escobar', 'Jose Cordoba', 'Andres Andrade', 'Michael Murillo'], ['Adalberto Carrasquilla', 'Anibal Godoy', 'Eric Davis'], ['Edgar Barcenas', 'Jose Fajardo', 'Ismael Diaz']),
};

const FIRST_NAMES = [
  'Ari', 'Bruno', 'Caio', 'Dario', 'Elian', 'Felix', 'Gio', 'Hugo', 'Ilias', 'Jovan',
  'Kai', 'Luca', 'Mika', 'Niko', 'Omar', 'Pablo', 'Rayan', 'Sami', 'Thiago', 'Yuri',
  'Zaid', 'Mateo', 'Noah', 'Leo', 'Kenji', 'Tariq', 'Amir', 'Milan', 'Rafa', 'Teo',
];

const LAST_NAMES = [
  'Silva', 'Costa', 'Kim', 'Haddad', 'Muller', 'Lopez', 'Moreno', 'Santos', 'Ibrahim',
  'Romero', 'Petrov', 'Aziz', 'Nakamura', 'Diallo', 'Suarez', 'Ferreira', 'Mensah',
  'Ionescu', 'Benali', 'Pereira', 'Sato', 'Kone', 'Vega', 'Novak', 'Arias', 'Khalil',
  'Popov', 'Yilmaz', 'Campos', 'Duarte', 'Salem', 'Toure', 'Park', 'Sissoko', 'Ortega',
  'Crespo', 'Amadou', 'Zapata', 'Makengo', 'Osorio',
];

const ROSTER_SHAPE: PlayerPosition[] = [
  'GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW',
];

export const buildTeamRoster = (teamName: string): PlayerProfile[] => {
  const realPlayers = REAL_TEAM_ROSTERS[teamName];
  if (realPlayers) {
    return realPlayers.map((player, index) => ({
      id: slugify(`${teamName}-${index + 1}-${player.name}`),
      name: player.name,
      position: player.position,
    }));
  }

  // Backup fake generator just in case a team is missing
  const seed = hashString(teamName);
  const usedNames = new Set<string>();

  return ROSTER_SHAPE.map((position, index) => {
    let attempt = 0;
    let fullName = '';

    while (!fullName || usedNames.has(fullName)) {
      const firstNameIndex = (seed + index * 7 + attempt * 11) % FIRST_NAMES.length;
      const lastNameIndex = (seed * 3 + index * 13 + attempt * 17) % LAST_NAMES.length;
      fullName = `${FIRST_NAMES[firstNameIndex]} ${LAST_NAMES[lastNameIndex]}`;
      attempt += 1;
    }

    usedNames.add(fullName);

    return {
      id: slugify(`${teamName}-${index + 1}-${fullName}`),
      name: fullName,
      position,
    };
  });
};
