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
  'Mexico': makeTeam(
    ['Guillermo Ochoa'],
    ['Cesar Montes', 'Johan Vasquez', 'Jesus Gallardo', 'Jorge Sanchez', 'Kevin Alvarez'],
    ['Edson Alvarez', 'Luis Chavez', 'Orbelin Pineda', 'Denzell Garcia', 'Obed Vargas', 'Carlos Rodriguez', 'Roberto Alvarado', 'Luis Romo'],
    ['Hirving Lozano', 'Santi Gimenez', 'Henry Martin', 'Julian Quinones', 'Uriel Antuna'],
  ),
  'South Africa': makeTeam(
    ['Ronwen Williams'],
    ['Khuliso Mudau', 'Mothobi Mvala', 'Siyanda Xulu', 'Aubrey Modiba'],
    ['Teboho Mokoena', 'Sphephelo Sithole', 'Themba Zwane', 'Ethan Brooks', 'Monnapule Saleng'],
    ['Percy Tau', 'Mihlali Mayambela', 'Evidence Makgopa', 'Lyle Foster', 'Iqraam Rayners'],
  ),
  'South Korea': makeTeam(
    ['Jo Hyeon-woo'],
    ['Kim Min-jae', 'Jung Seung-hyun', 'Kim Young-gwon', 'Seol Young-woo'],
    ['Hwang In-beom', 'Lee Kang-in', 'Lee Jae-sung', 'Jeong Woo-yeong', 'Park Yong-woo', 'Kwon Chang-hoon'],
    ['Son Heung-min', 'Hwang Hee-chan', 'Cho Gue-sung', 'Oh Hyeon-gyu'],
  ),
  'Czech Republic': makeTeam(
    ['Jindrich Stanek'],
    ['Tomas Holes', 'Robin Hranac', 'Ladislav Krejci', 'Vladimir Coufal'],
    ['Tomas Soucek', 'Lukas Provod', 'Antonin Barak', 'David Jurasek', 'Alex Kral', 'Michal Sadilek'],
    ['Patrik Schick', 'Adam Hlozek', 'Vaclav Cerny', 'Mojmir Chytil'],
  ),
  'Canada': makeTeam(
    ['Maxime Crepeau'],
    ['Alistair Johnston', 'Moise Bombito', 'Derek Cornelius', 'Alphonso Davies'],
    ['Stephen Eustaquio', 'Ismael Kone', 'Jonathan Osorio', 'Mark-Anthony Kaye', 'Samuel Piette', 'Liam Millar'],
    ['Tajon Buchanan', 'Cyle Larin', 'Jonathan David', 'Junior Hoilett'],
  ),
  'Bosnia & Herzegovina': makeTeam(
    ['Ibrahim Sehic'],
    ['Amar Dedic', 'Anel Ahmedhodzic', 'Dennis Hadzikadunic', 'Sead Kolasinac'],
    ['Miralem Pjanic', 'Rade Krunic', 'Gojko Cimirot', 'Amar Begic', 'Amer Gojak', 'Smail Prevljak'],
    ['Miroslav Stevanovic', 'Edin Dzeko', 'Ermedin Demirovic', 'Benjamin Tahirovic'],
  ),
  'Qatar': makeTeam(
    ['Meshaal Barsham'],
    ['Ro-Ro', 'Tarek Salman', 'Lucas Mendes', 'Mohammed Waad'],
    ['Ahmed Fatehi', 'Abdulaziz Hatem', 'Hassan Al-Haydos', 'Assim Madibo', 'Karim Boudiaf'],
    ['Akram Afif', 'Almoez Ali', 'Yusuf Abdurisag', 'Mohammed Muntari', 'Ahmed Alaaeldin'],
  ),
  'Switzerland': makeTeam(
    ['Yann Sommer'],
    ['Manuel Akanji', 'Nico Elvedi', 'Ricardo Rodriguez', 'Silvan Widmer'],
    ['Granit Xhaka', 'Remo Freuler', 'Xherdan Shaqiri', 'Denis Zakaria', 'Fabian Rieder', 'Vincent Sierro'],
    ['Dan Ndoye', 'Breel Embolo', 'Ruben Vargas', 'Zeki Amdouni'],
  ),
  'Brazil': makeTeam(
    ['Alisson Becker'],
    ['Danilo', 'Marquinhos', 'Gabriel Magalhaes', 'Guilherme Arana'],
    ['Casemiro', 'Bruno Guimaraes', 'Lucas Paqueta', 'Joao Gomes', 'Andre', 'Raphinha'],
    ['Vinicius Junior', 'Rodrygo', 'Richarlison', 'Endrick', 'Savinho'],
  ),
  'Morocco': makeTeam(
    ['Yassine Bounou'],
    ['Achraf Hakimi', 'Nayef Aguerd', 'Romain Saiss', 'Noussair Mazraoui'],
    ['Sofyan Amrabat', 'Azzedine Ounahi', 'Selim Amallah', 'Bilal El Khannouss', 'Amine Adli'],
    ['Hakim Ziyech', 'Youssef En-Nesyri', 'Sofiane Boufal', 'Ibrahim Diaz', 'Abde Ezzalzouli'],
  ),
  'Haiti': makeTeam(
    ['Johny Placide'],
    ['Carlens Arcus', 'Ricardo Ade', 'Alex Christian', 'Martin Experience'],
    ['Bryan Alceus', 'Leverton Pierre', 'Steeven Saba', 'Melchie Dumornay'],
    ['Duckens Nazon', 'Frantzdy Pierrot', 'Derrick Etienne', 'Ricardo Ade Jr'],
  ),
  'Scotland': makeTeam(
    ['Angus Gunn'],
    ['Jack Hendry', 'Grant Hanley', 'Kieran Tierney', 'Anthony Ralston'],
    ['Billy Gilmour', 'Callum McGregor', 'John McGinn', 'Scott McTominay', 'Ryan Christie', 'Kenny McLean'],
    ['Che Adams', 'Lyndon Dykes', 'Lawrence Shankland', 'Ben Doak'],
  ),
  'United States': makeTeam(
    ['Matt Turner'],
    ['Sergino Dest', 'Chris Richards', 'Tim Ream', 'Antonee Robinson'],
    ['Tyler Adams', 'Weston McKennie', 'Yunus Musah', 'Brenden Aaronson', 'Giovanni Reyna', 'Luca de la Torre'],
    ['Tim Weah', 'Folarin Balogun', 'Christian Pulisic', 'Josh Sargent', 'Ricardo Pepi'],
  ),
  'Paraguay': makeTeam(
    ['Carlos Coronel'],
    ['Robert Rojas', 'Fabián Balbuena', 'Omar Alderete', 'Mathias Espinoza'],
    ['Mathias Villasanti', 'Andres Cubas', 'Diego Gomez', 'Oscar Romero', 'Hernan Perez'],
    ['Miguel Almiron', 'Antonio Sanabria', 'Julio Enciso', 'Adam Bareiro', 'Isidro Pitta'],
  ),
  'Australia': makeTeam(
    ['Mathew Ryan'],
    ['Nathaniel Atkinson', 'Harry Souttar', 'Kye Rowles', 'Aziz Behich'],
    ['Keanu Baccus', 'Jackson Irvine', 'Connor Metcalfe', 'Aiden O\'Neill', 'Riley McGree'],
    ['Martin Boyle', 'Mitchell Duke', 'Craig Goodwin', 'Jamie Maclaren', 'Garang Kuol'],
  ),
  'Turkey': makeTeam(
    ['Mert Gunok'],
    ['Zeki Celik', 'Merih Demiral', 'Abdulkerim Bardakci', 'Ferdi Kadioglu'],
    ['Salih Ozcan', 'Hakan Calhanoglu', 'Arda Guler', 'Orkun Kokcu', 'Ismail Yueksek'],
    ['Kenan Yildiz', 'Baris Alper Yilmaz', 'Yunus Akgun', 'Enes Unal', 'Cenk Tosun'],
  ),
  'Germany': makeTeam(
    ['Manuel Neuer'],
    ['Joshua Kimmich', 'Jonathan Tah', 'Antonio Rudiger', 'Maximilian Mittelstadt'],
    ['Robert Andrich', 'Toni Kroos', 'Ilkay Gundogan', 'Leon Goretzka', 'Chris Fuehrich', 'Leroy Sane'],
    ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz', 'Niclas Fuellkrug', 'Serge Gnabry'],
  ),
  'Curacao': makeTeam(
    ['Eloy Room'],
    ['Juriën Gaari', 'Cuco Martina', 'Sherel Floranus', 'Nathangelo Markelo'],
    ['Vurnon Anita', 'Leandro Bacuna', 'Kevin Felida', 'Juninho Bacuna'],
    ['Brandley Kuwas', 'Rangelo Janga', 'Kenji Gorré', 'Jarchinio Antonia'],
  ),
  'Ivory Coast': makeTeam(
    ['Yahia Fofana'],
    ['Serge Aurier', 'Odilon Kossounou', 'Evan Ndicka', 'Ghislain Konan'],
    ['Franck Kessie', 'Jean Michael Seri', 'Seko Fofana', 'Ibrahim Sangare', 'Jeremie Boga'],
    ['Nicolas Pepe', 'Sebastien Haller', 'Simon Adingra', 'Oumar Diakite', 'Christian Kouame'],
  ),
  'Ecuador': makeTeam(
    ['Alexander Dominguez'],
    ['Angelo Preciado', 'Felix Torres', 'Willian Pacho', 'Piero Hincapie'],
    ['Carlos Gruezo', 'Moises Caicedo', 'Alan Franco', 'Jhegson Mendez', 'Jeremy Sarmiento'],
    ['Kendry Paez', 'Enner Valencia', 'Kevin Rodriguez', 'Gonzalo Plata', 'Michael Estrada'],
  ),
  'Netherlands': makeTeam(
    ['Bart Verbruggen'],
    ['Denzel Dumfries', 'Stefan de Vrij', 'Virgil van Dijk', 'Nathan Ake'],
    ['Jerdy Schouten', 'Tijjani Reijnders', 'Xavi Simons', 'Frenkie de Jong', 'Teun Koopmeiners', 'Ryan Gravenberch'],
    ['Jeremie Frimpong', 'Memphis Depay', 'Cody Gakpo', 'Donyell Malen', 'Wout Weghorst'],
  ),
  'Japan': makeTeam(
    ['Zion Suzuki'],
    ['Yukinari Sugawara', 'Ko Itakura', 'Takehiro Tomiyasu', 'Hiroki Ito'],
    ['Wataru Endo', 'Hidemasa Morita', 'Takefusa Kubo', 'Daichi Kamada', 'Ritsu Doan'],
    ['Takumi Minamino', 'Kaoru Mitoma', 'Ayase Ueda', 'Kyogo Furuhashi', 'Daizen Maeda'],
  ),
  'Sweden': makeTeam(
    ['Robin Olsen'],
    ['Emil Krafth', 'Victor Lindelof', 'Isak Hien', 'Ludwig Augustinsson'],
    ['Mattias Svanberg', 'Jens Cajuste', 'Dejan Kulusevski', 'Hugo Larsson', 'Yasin Ayari'],
    ['Emil Forsberg', 'Alexander Isak', 'Viktor Gyokeres', 'Anthony Elanga', 'Joel Asoro'],
  ),
  'Tunisia': makeTeam(
    ['Aymen Dahmen'],
    ['Wajdi Kechrida', 'Yassine Meriah', 'Montassar Talbi', 'Ali Abdi'],
    ['Ellyes Skhiri', 'Aissa Laidouni', 'Mohamed Ali Ben Romdhane', 'Hannibal Mejbri', 'Ferjani Sassi'],
    ['Youssef Msakni', 'Elias Achouri', 'Seifeddine Jaziri', 'Naim Sliti'],
  ),
  'Belgium': makeTeam(
    ['Koen Casteels'],
    ['Timothy Castagne', 'Wout Faes', 'Jan Vertonghen', 'Arthur Theate'],
    ['Amadou Onana', 'Youri Tielemans', 'Kevin De Bruyne', 'Charles De Ketelaere', 'Orel Mangala', 'Aster Vranckx'],
    ['Jeremy Doku', 'Leandro Trossard', 'Romelu Lukaku', 'Lois Openda', 'Johan Bakayoko'],
  ),
  'Egypt': makeTeam(
    ['Mohamed El Shenawy'],
    ['Mohamed Hany', 'Ahmed Hegazy', 'Mohamed Abdelmonem', 'Ahmed Fotouh'],
    ['Hamdi Fathi', 'Mohamed Elneny', 'Emam Ashour', 'Ibrahim Adel', 'Nabil Dunga'],
    ['Mohamed Salah', 'Mostafa Mohamed', 'Trezeguet', 'Marwan Hamdi', 'Omar Marmoush'],
  ),
  'Iran': makeTeam(
    ['Alireza Beiranvand'],
    ['Ramin Rezaeian', 'Hossein Kanaani', 'Shojae Khalilzadeh', 'Ehsan Hajsafi'],
    ['Saeid Ezatolahi', 'Saman Ghoddos', 'Alireza Jahanbakhsh', 'Ahmad Nourollahi', 'Milad Sarlak'],
    ['Mehdi Taremi', 'Mohammad Mohebi', 'Sardar Azmoun', 'Kaveh Rezaei', 'Allahyar Sayyadmanesh'],
  ),
  'New Zealand': makeTeam(
    ['Max Crocombe'],
    ['Tim Payne', 'Tyler Bindon', 'Nando Pijnaker', 'Liberato Cacace'],
    ['Joe Bell', 'Marko Stamenic', 'Matthew Garbett', 'Alex Greive'],
    ['Marco Rojas', 'Chris Wood', 'Elijah Just', 'Ben Waine', 'Kosta Barbarouses'],
  ),
  'Spain': makeTeam(
    ['Unai Simon'],
    ['Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte', 'Marc Cucurella'],
    ['Rodri', 'Fabian Ruiz', 'Pedri', 'Dani Olmo', 'Gavi', 'Fermin Lopez'],
    ['Lamine Yamal', 'Alvaro Morata', 'Nico Williams', 'Mikel Oyarzabal', 'Joselu'],
  ),
  'Cape Verde': makeTeam(
    ['Vozinha'],
    ['Roberto Lopes', 'Logan Costa', 'Steven Moreira', 'João Paulo'],
    ['Kevin Pina', 'Jamiro Monteiro', 'Deroy Duarte', 'Nene'],
    ['Ryan Mendes', 'Bebe', 'Garry Rodrigues', 'Julio Tavares'],
  ),
  'Saudi Arabia': makeTeam(
    ['Mohammed Al-Owais'],
    ['Saud Abdulhamid', 'Hassan Tambakti', 'Ali Al-Bulaihi', 'Yasser Al-Shahrani'],
    ['Mohamed Kanno', 'Abdulellah Al-Malki', 'Salem Al-Dawsari', 'Nasser Al-Dawsari', 'Ali Al-Hassan'],
    ['Sami Al-Najei', 'Firas Al-Buraikan', 'Saleh Al-Shehri', 'Abdullah Al-Hamdan', 'Fahad Al-Muwallad'],
  ),
  'Uruguay': makeTeam(
    ['Sergio Rochet'],
    ['Nahitan Nandez', 'Ronald Araujo', 'Jose Gimenez', 'Mathias Olivera'],
    ['Manuel Ugarte', 'Federico Valverde', 'Nicolas De La Cruz', 'Rodrigo Bentancur', 'Giorgian De Arrascaeta'],
    ['Facundo Pellistri', 'Darwin Nunez', 'Maximiliano Araujo', 'Luis Suarez', 'Agustin Canobbio'],
  ),
  'France': makeTeam(
    ['Mike Maignan'],
    ['Jules Kounde', 'Dayot Upamecano', 'William Saliba', 'Theo Hernandez'],
    ['N\'Golo Kante', 'Aurelien Tchouameni', 'Adrien Rabiot', 'Eduardo Camavinga', 'Antoine Griezmann', 'Youssouf Fofana'],
    ['Ousmane Dembele', 'Kylian Mbappe', 'Marcus Thuram', 'Randal Kolo Muani', 'Olivier Giroud'],
  ),
  'Senegal': makeTeam(
    ['Edouard Mendy'],
    ['Kalidou Koulibaly', 'Abdou Diallo', 'Moussa Niakhate', 'Ismail Jakobs'],
    ['Idrissa Gueye', 'Pape Matar Sarr', 'Lamine Camara', 'Cheikhou Kouyate', 'Nampalys Mendy'],
    ['Ismaila Sarr', 'Nicolas Jackson', 'Sadio Mane', 'Boulaye Dia', 'Iliman Ndiaye'],
  ),
  'Iraq': makeTeam(
    ['Jalal Hassan'],
    ['Hussein Ali', 'Saad Natiq', 'Rebin Sulaka', 'Merchas Doski'],
    ['Osama Rashid', 'Amir Al-Ammari', 'Ibrahim Bayesh', 'Ali Faez', 'Amjad Attwan'],
    ['Bashar Resan', 'Ali Jasim', 'Aymen Hussein', 'Mohanad Ali'],
  ),
  'Norway': makeTeam(
    ['Orjan Nyland'],
    ['Julian Ryerson', 'Leo Ostigard', 'Kristoffer Ajer', 'Birger Meling'],
    ['Sander Berge', 'Martin Odegaard', 'Fredrik Aursnes', 'Morten Thorsby', 'Jens Petter Hauge'],
    ['Oscar Bobb', 'Erling Haaland', 'Alexander Sorloth', 'Antonio Nusa', 'Joshua King'],
  ),
  'Argentina': makeTeam(
    ['Emiliano Martinez'],
    ['Nahuel Molina', 'Cristian Romero', 'Lisandro Martinez', 'Nicolas Tagliafico'],
    ['Rodrigo De Paul', 'Enzo Fernandez', 'Alexis Mac Allister', 'Exequiel Palacios', 'Leandro Paredes', 'Giovani Lo Celso'],
    ['Angel Di Maria', 'Lionel Messi', 'Julian Alvarez', 'Lautaro Martinez', 'Nicolas Gonzalez'],
  ),
  'Algeria': makeTeam(
    ['Anthony Mandrea'],
    ['Youcef Atal', 'Aissa Mandi', 'Ramy Bensebaini', 'Rayan Ait-Nouri'],
    ['Nabil Bentaleb', 'Ismael Bennacer', 'Houssem Aouar', 'Said Benrahma', 'Hichem Boudaoui'],
    ['Riyad Mahrez', 'Baghdad Bounedjah', 'Yousef Belaili', 'Islam Slimani', 'Mohamed Amoura'],
  ),
  'Austria': makeTeam(
    ['Patrick Pentz'],
    ['Stefan Posch', 'Kevin Danso', 'Philipp Lienhart', 'Phillipp Mwene'],
    ['Nicolas Seiwald', 'Marcel Sabitzer', 'Konrad Laimer', 'Florian Grillitsch', 'Romano Schmid'],
    ['Christoph Baumgartner', 'Michael Gregoritsch', 'Marko Arnautovic', 'Patrick Wimmer', 'Andreas Weimann'],
  ),
  'Jordan': makeTeam(
    ['Yazeed Abu Laila'],
    ['Abdallah Nasib', 'Yazan Al-Arab', 'Salem Al-Ajalin', 'Ihsan Haddad'],
    ['Nizar Al-Rashdan', 'Noor Al-Rawabdeh', 'Mahmoud Al-Mardi', 'Yazan Al-Naimat'],
    ['Musa Al-Taamari', 'Ali Olwan', 'Oday Dabbagh', 'Hamza Al-Dardour'],
  ),
  'Portugal': makeTeam(
    ['Diogo Costa'],
    ['Joao Cancelo', 'Ruben Dias', 'Pepe', 'Nuno Mendes'],
    ['Joao Palhinha', 'Vitinha', 'Bruno Fernandes', 'Bernardo Silva', 'Joao Neves', 'Otavio'],
    ['Rafael Leao', 'Cristiano Ronaldo', 'Goncalo Ramos', 'Diogo Jota', 'Pedro Neto'],
  ),
  'DR Congo': makeTeam(
    ['Lionel Mpasi'],
    ['Gedeon Kalulu', 'Chancel Mbemba', 'Henoc Inonga', 'Arthur Masuaku'],
    ['Samuel Moutoussamy', 'Charles Pickel', 'Gael Kakuta', 'Theo Bongonda', 'Merveille Bokadi'],
    ['Meschak Elia', 'Cedric Bakambu', 'Yoane Wissa', 'Fiston Mayele', 'Silas Katompa'],
  ),
  'Uzbekistan': makeTeam(
    ['Utkir Yusupov'],
    ['Husniddin Aliqulov', 'Abdukodir Khusanov', 'Rustam Ashurmatov', 'Farrukh Sayfiev'],
    ['Otabek Shukurov', 'Odiljon Hamrobekov', 'Jaloliddin Masharipov', 'Oston Urunov', 'Jamshid Iskanderov'],
    ['Abbosbek Fayzullaev', 'Eldor Shomurodov', 'Igor Sergeev', 'Azizbek Turgunboev'],
  ),
  'Colombia': makeTeam(
    ['Camilo Vargas'],
    ['Daniel Munoz', 'Davinson Sanchez', 'Carlos Cuesta', 'Johan Mojica'],
    ['Jefferson Lerma', 'Richard Rios', 'Jhon Arias', 'James Rodriguez', 'Juan Fernando Quintero', 'Kevin Castaño'],
    ['Luis Diaz', 'Miguel Borja', 'Rafael Santos Borre', 'Jhon Cordoba', 'Luis Sinisterra'],
  ),
  'England': makeTeam(
    ['Jordan Pickford'],
    ['Kyle Walker', 'John Stones', 'Marc Guehi', 'Kieran Trippier'],
    ['Declan Rice', 'Kobbie Mainoo', 'Jude Bellingham', 'Phil Foden', 'Cole Palmer', 'Conor Gallagher'],
    ['Bukayo Saka', 'Harry Kane', 'Anthony Gordon', 'Ollie Watkins', 'Ivan Toney'],
  ),
  'Croatia': makeTeam(
    ['Dominik Livakovic'],
    ['Josip Stanisic', 'Josip Sutalo', 'Josko Gvardiol', 'Borna Sosa'],
    ['Luka Modric', 'Marcelo Brozovic', 'Mateo Kovacic', 'Lovro Majer', 'Luka Sucic'],
    ['Andrej Kramaric', 'Mario Pasalic', 'Bruno Petkovic', 'Ivan Perisic', 'Ante Budimir'],
  ),
  'Ghana': makeTeam(
    ['Richard Ofori'],
    ['Alidu Seidu', 'Alexander Djiku', 'Mohammed Salisu', 'Gideon Mensah'],
    ['Salis Abdul Samed', 'Thomas Partey', 'Mohammed Kudus', 'Elisha Owusu', 'Daniel Kofi Kyereh'],
    ['Jordan Ayew', 'Antoine Semenyo', 'Inaki Williams', 'Osman Bukari', 'Abdul Fatawu Issahaku'],
  ),
  'Panama': makeTeam(
    ['Orlando Mosquera'],
    ['Fidel Escobar', 'Jose Cordoba', 'Andres Andrade', 'Michael Murillo'],
    ['Adalberto Carrasquilla', 'Anibal Godoy', 'Eric Davis', 'Cesar Yanis', 'Jose Luis Rodriguez'],
    ['Edgar Barcenas', 'Jose Fajardo', 'Ismael Diaz', 'Rolando Blackburn', 'Gabriel Torres'],
  ),
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
