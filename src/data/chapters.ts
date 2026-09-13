import type { Chapter } from './types';

export const chapters: Chapter[] = [
  {
    id: 'bendrosios',
    roman: 'I',
    title: 'Bendrosios nuostatos',
    summary: 'KET galiojimo sritis ir hierarchija teisės aktų atžvilgiu.',
    color: '#f5c518',
    rules: [
      {
        id: 'b1',
        number: '1',
        title: 'Kur galioja KET',
        text: 'Kelių eismo taisyklės nustato eismo keliais tvarką visoje Lietuvos Respublikos teritorijoje.',
        tip: 'KET taikomos visiems eismo dalyviams — vairuotojams, pėstiesiems, dviratininkams.',
      },
      {
        id: 'b2',
        number: '2',
        title: 'Teisės aktų hierarchija',
        text: 'Kiti saugaus eismo ar eismą reglamentuojantys įgyvendinamieji teisės aktai negali prieštarauti Taisyklėms.',
      },
    ],
  },
  {
    id: 'savokos',
    roman: 'II',
    title: 'Sąvokos',
    summary: 'Svarbiausi terminai, kuriuos reikia mokėti prieš egzaminą.',
    color: '#5ec8e8',
    rules: [
      {
        id: 's1',
        number: '3.2',
        title: 'Duoti kelią',
        text: 'Reikalavimas eismo dalyviui sustoti ar nepradėti važiuoti, nedaryti jokio manevro, kuris priverstų kitus eismo dalyvius keisti judėjimo kryptį arba greitį.',
        tip: '„Duoti kelią“ nereiškia, kad privalote sustoti — tik netrukdyti kitiems.',
      },
      {
        id: 's2',
        number: '3.10',
        title: 'Lenkimas',
        text: 'Vienos arba kelių važiuojančių transporto priemonių apvažiavimas įvažiuojant į priešpriešinio eismo juostą.',
        tip: 'Jei neįvažiuojate į priešpriešinę juostą — tai ne lenkimas, o apvažiavimas arba persirikiavimas.',
      },
      {
        id: 's3',
        number: '3.15',
        title: 'Persirikiavimas',
        text: 'Eismo juostos keitimas neįvažiuojant į priešpriešinio eismo juostą.',
      },
      {
        id: 's4',
        number: '3.6',
        title: 'Gyvenamoji zona',
        text: 'Teritorija ar kelias, kurių pradžia pažymėta ženklu „Gyvenamoji zona“, o pabaiga — „Gyvenamosios zonos pabaiga“.',
        tip: 'Gyvenamojoje zonoje greitis — iki 20 km/h; pėstieji turi pirmenybę.',
      },
      {
        id: 's5',
        number: '3.14',
        title: 'Pagrindinis kelias',
        text: 'Kelias, pažymėtas ženklais „Pagrindinis kelias“, „Automagistralė“ ir pan., arba kelias su kietąja danga birios dangos atžvilgiu. Reguliuojamose sankryžose pagrindinio kelio nėra.',
      },
      {
        id: 's6',
        number: '3.21',
        title: 'Dviračių gatvė',
        text: 'Kelias, kurio pradžia pažymėta ženklu „Dviračių gatvė“, o pabaiga — „Dviračių gatvės pabaiga“.',
      },
    ],
  },
  {
    id: 'dalyviai',
    roman: 'III',
    title: 'Eismo dalyvių pareigos',
    summary: 'Bendros taisyklės visiems eismo dalyviams, prioritetai ir avarinis koridorius.',
    color: '#7ecf8a',
    rules: [
      {
        id: 'd1',
        number: '8',
        title: 'Kas riboja eismą',
        text: 'Eismą riboja kelio ženklai, kintamos informacijos ženklai, ženklinimas, šviesoforai ir reguliuotojo signalai. Jei ženklas ir ženklinimas skiriasi — vadovaujamasi ženklu. Reguliuotojo nurodymai turi absoliučią pirmenybę.',
        tip: 'Prioritetų eilė: reguliuotojas → šviesoforas → ženklai → ženklinimas → KET.',
      },
      {
        id: 'd2',
        number: '12',
        title: 'Avarinis koridorius',
        text: 'Artėjant specialiosioms TP su mėlynais (ar mėlynais ir raudonais) švyturėliais ir garsiniu signalu, privaloma duoti kelią ir sudaryti avarinį koridorių: vienoje juostoje — trauktis dešinėn; keliose — kairieji traukiasi kairėn, kiti — dešinėn.',
      },
      {
        id: 'd3',
        number: '4–7',
        title: 'Pagrindinės pareigos',
        text: 'Eismo dalyviai privalo mokėti ir laikytis Taisyklių, elgtis pagarbiai ir atsargiai, paklusti teisėtiems pareigūnų reikalavimams.',
      },
    ],
  },
  {
    id: 'vairuotojai',
    roman: 'IV',
    title: 'Vairuotojų pareigos',
    summary: 'Kas gali vairuoti, dokumentai, telefonas, techninė būklė.',
    color: '#e88b5e',
    rules: [
      {
        id: 'v1',
        number: '14',
        title: 'Kam draudžiama vairuoti',
        text: 'Draudžiama vairuoti neturint teisės, neblaiviems, apsvaigusiems, be privalomo poilsio, taip pat sergant ar pavargus, jei kyla pavojus. Negalima duoti vairuoti tokiems asmenims.',
      },
      {
        id: 'v2',
        number: '19',
        title: 'Mobilusis telefonas',
        text: 'Vairuojant draudžiama naudotis mobiliuoju telefonu rankomis. Leidžiama laisvų rankų įranga, kai telefonas pritvirtintas laikiklyje, arba transporto priemonės įranga.',
        tip: 'Net stovint kamštyje (kai TP dalyvauja eisme) — telefonas rankose draudžiamas.',
      },
      {
        id: 'v3',
        number: '21',
        title: 'Ryškiaspalvė liemenė',
        text: 'Sustojus tamsiuoju metu neapšviestame kelyje (ne stovėjimo vietoje), išlipęs vairuotojas privalo vilkėti ryškiaspalvę liemenę su šviesą atspindinčiais elementais.',
      },
      {
        id: 'v4',
        number: '16',
        title: 'Techninė būklė',
        text: 'Draudžiama vairuoti techniškai netvarkingą TP. Prieš važiuojant reikia įsitikinti, kad yra pirmosios pagalbos, gaisrinės saugos ir avarinio sustojimo priemonės.',
      },
    ],
  },
  {
    id: 'pestieji',
    roman: 'V–VI',
    title: 'Pėstieji ir vairuotojai',
    summary: 'Pareigos pėstiesiems ir kaip vairuotojai privalo juos saugoti.',
    color: '#c49bff',
    rules: [
      {
        id: 'p1',
        number: '27–35',
        title: 'Vairuotojų pareigos pėstiesiems',
        text: 'Vairuotojas privalo duoti kelią pėstiesiems perėjose, būti ypač atsargus prie mokyklų, stotelių, kai matomi vaikai ar asmenys su negalia.',
      },
      {
        id: 'p2',
        number: '36–48',
        title: 'Pėsčiųjų pareigos',
        text: 'Pėstieji eina šaligatviu ar pėsčiųjų taku. Kur jų nėra — kelkraščiu priešpriešinio eismo kryptimi. Tamsiuoju metu neapšviestame kelyje privaloma turėti atšvaitą ar kitą matomumą didinančią priemonę.',
        tip: 'Eiti važiuojamąja dalimi galima tik kai nėra šaligatvio ir kelkraščio — kraštine juosta priešpriešinio eismo kryptimi.',
      },
    ],
  },
  {
    id: 'dviraciai',
    roman: 'VIII',
    title: 'Dviračių vairuotojai',
    summary: 'Kur važiuoti, šalmai, signalai ir draudimai dviratininkams.',
    color: '#4ecdc4',
    rules: [
      {
        id: 'dv1',
        number: '55–66',
        title: 'Dviračio vieta kelyje',
        text: 'Dviračiu važiuojama dviračių taku, juosta ar pėsčiųjų ir dviračių taku. Jų nesant — kelkraščiu, o jei ir jo nėra — viena eile važiuojamosios dalies kraštine dešine juosta.',
      },
      {
        id: 'dv2',
        number: '58',
        title: 'Šalmas ir šviesos',
        text: 'Jaunesniems nei 18 m. privalomas šalmas. Tamsiuoju metu ar blogai matant — privalomi priekiniai balti ir galiniai raudoni žibintai bei atšvaitai.',
      },
    ],
  },
  {
    id: 'mikromobilumas',
    roman: 'VIII¹',
    title: 'Elektrinis mikromobilumas',
    summary: 'Paspirtukai ir kitos elektrinės mikrojudumo priemonės — 2026-01-01 pakeitimai.',
    color: '#ff8fab',
    rules: [
      {
        id: 'm1',
        number: '66¹',
        title: 'Amžius ir vieta',
        text: 'Elektrine mikrojudumo priemone dviračių takais, juostomis, kelkraščiu, važiuojamąja dalimi ir gyvenamojoje zonoje leidžiama važiuoti ne jaunesniems kaip 16 metų. Nuo 14 metų — tik baigus SMSM kursą ir turint mokyklos pažymėjimą. Gyvenamojo namo kieme amžius neribojamas, bet jaunesnius kaip 10 metų privalo prižiūrėti suaugęs.',
      },
      {
        id: 'm2',
        number: '66²',
        title: 'Šalmas visiems (nuo 2026-01-01)',
        text: 'Visi elektrinių mikrojudumo priemonių vairuotojai važiuodami privalo būti užsidėję ir užsisegę dviratininko, riedlentininko ar motociklininko šalmą — be amžiaus ir važiavimo vietos išimčių. Jeigu priemonė nuomojama, šalmą privalo suteikti nuomotojas. Rekomenduojamos ir kūno apsaugos (alkūnės, keliai).',
        tip: 'Tai pagrindinis 2026-01-01 KET pakeitimas. Paprastam dviračiui šalmas vis dar privalomas tik iki 18 metų.',
      },
      {
        id: 'm3',
        number: '66³',
        title: 'Kur važiuoti',
        text: 'Važiuojama dviračių takais, pėsčiųjų ir dviračių takais arba dviračių juostomis, o kur jų nėra — tinkamu (asfalto/betono) kelkraščiu. Jų nesant arba kai jais važiuoti negalima — leidžiama šaligatviu arba viena eile važiuojamosios dalies kraštine dešine juosta, kuo arčiau dešiniojo krašto. Pro pėsčiąjį — pėstiesiems artimu greičiu, paliekant saugų tarpą.',
        tip: 'Šaligatvis — tik kai nėra dviračių infrastruktūros ir tinkamo kelkraščio, ne „visada“.',
      },
      {
        id: 'm4',
        number: '66⁹',
        title: 'Draudimai ir greitis',
        text: 'Draudžiama: vežti keleivius; kirsti važiuojamąją dalį pėsčiųjų perėjomis; važiuoti pėsčiųjų takais ir automagistralėmis / greitkeliais; važiuoti įsikibus į kitą TP. Didžiausias greitis — 20 km/h; pro pėsčiąjį pėsčiųjų ir dviračių take, kelkraščiu ar šaligatviu — 7 km/h.',
      },
    ],
  },
  {
    id: 'signalai',
    roman: 'X–XI',
    title: 'Signalai ir šviesos',
    summary: 'Šviesoforai, reguliuotojas, posūkio ir avariniai signalai.',
    color: '#ff6b6b',
    rules: [
      {
        id: 'sg1',
        number: '73–80',
        title: 'Šviesoforo signalai',
        text: 'Žalias — leidžiama; geltonas — stabdyti (išskyrus kai stabdymas pavojingas); raudonas — draudžiama. Raudonas su geltonu — ruoštis judėti. Žalia rodyklė papildomoje sekcijoje leidžia važiuoti nurodyta kryptimi, duodant kelią kitiems.',
      },
      {
        id: 'sg2',
        number: '81–93',
        title: 'Įspėjamieji signalai',
        text: 'Prieš manevrą posūkio signalas įjungiamas iš anksto. Avarinė šviesos signalizacija — sustojus dėl gedimo, eismo įvykio, vilkimo, staiga stabdant ir pan.',
      },
    ],
  },
  {
    id: 'greitis',
    roman: 'XV',
    title: 'Važiavimo greitis',
    summary: 'Leistini greičiai mieste, užmiestyje, automagistralėje.',
    color: '#f5c518',
    rules: [
      {
        id: 'g1',
        number: '127–135',
        title: 'Leistini greičiai',
        text: 'Gyvenvietėje — iki 50 km/h (jei nenustatyta kitaip). Gyvenamojoje zonoje — iki 20 km/h. Automagistralėje lengviesiems — iki 130 km/h (kai leidžia ženklai/sąlygos). Greitkelyje — iki 120 km/h. Pasirinktas greitis turi būti saugus pagal sąlygas.',
        tip: 'Greitis mažinamas esant blogam matomumui, slidžiai dangai, intensyviam eismui.',
      },
      {
        id: 'g2',
        number: '129',
        title: 'Saugus greitis',
        text: 'Vairuotojas privalo važiuoti greičiu, kuris leistų saugiai valdyti TP ir laiku sustoti pastebėjus kliūtį.',
      },
    ],
  },
  {
    id: 'sankryzos',
    roman: 'XVIII',
    title: 'Sankryžos',
    summary: 'Reguliuojamos ir nereguliuojamos sankryžos, „dešinės rankos“ taisyklė.',
    color: '#5ec8e8',
    rules: [
      {
        id: 'sk1',
        number: '154–167',
        title: 'Važiavimas per sankryžas',
        text: 'Reguliuojamoje sankryžoje vadovaujamasi šviesoforu ar reguliuotoju. Nereguliuojamoje lygiareikšmių kelių sankryžoje — duoti kelią iš dešinės atvažiuojančiam. Išvažiuojant iš šalutinio — duoti kelią važiuojantiems pagrindiniu.',
        tip: 'Sukant kairėn ar apsisukant — duoti kelią priešpriešiais tiesiai ar dešinėn važiuojantiems.',
      },
      {
        id: 'sk2',
        number: '160',
        title: 'Žiedinė sankryža',
        text: 'Įvažiuojant į žiedą, jei nėra kitų ženklų, duodamas kelias žiede jau važiuojantiems. Lietuvoje dažniausiai prie įvažiavimo būna „Duoti kelią“.',
      },
    ],
  },
  {
    id: 'lenkimas',
    roman: 'XVI',
    title: 'Lenkimas ir juostos',
    summary: 'Kada leidžiama lenkti, draudimai ir eismas juostose.',
    color: '#7ecf8a',
    rules: [
      {
        id: 'l1',
        number: '136–140',
        title: 'Lenkimo taisyklės',
        text: 'Lenkti leidžiama tik kai priešpriešinė juosta laisva ir manevras saugus. Draudžiama lenkti perėjose, geležinkelio pervažose, pavojinguose posūkiuose, kelio pabaigoje įkalnės, kai yra ištisinė linija.',
        tip: 'Lenkiamas vairuotojas negali didinti greičio ar kitaip trukdyti.',
      },
    ],
  },
  {
    id: 'sustojimas',
    roman: 'XVII',
    title: 'Sustojimas ir stovėjimas',
    summary: 'Kur galima stovėti, draudžiamos vietos, avarinis sustojimas.',
    color: '#e88b5e',
    rules: [
      {
        id: 'st1',
        number: '141–153',
        title: 'Sustojimo taisyklės',
        text: 'Sustoti ir stovėti leidžiama dešinėje kelio pusėje. Draudžiama: perėjose ir arčiau kaip 5 m prieš jas, sankryžose, tramvajaus bėgiuose, tiltuose, tuneliuose, ten kur užstotumėte ženklus ar trukdytumėte.',
      },
    ],
  },
  {
    id: 'pervazos',
    roman: 'XIX',
    title: 'Geležinkelio pervažos',
    summary: 'Sustojimas, užtvaras ir draudimai važiuoti per pervažą.',
    color: '#c9a227',
    rules: [
      {
        id: 'pv1',
        number: '168–170',
        title: 'Prieš pervažą',
        text: 'Prieš judėdamas per geležinkelio pervažą eismo dalyvis visais atvejais privalo įsitikinti, kad neartėja bėginė transporto priemonė. Kai važiuoti draudžiama — sustoti prieš „Stop“ liniją, ženklą „Stop“, šviesoforą ar užtvarą, o jei jų nėra — ne arčiau kaip 10 m nuo pirmojo bėgio.',
      },
      {
        id: 'pv2',
        number: '173',
        title: 'Draudimai pervažoje',
        text: 'Draudžiama įvažiuoti ar įeiti, kai užtvaras nuleistas arba pradeda leistis, savavališkai jį pakelti ar apvažiuoti; įvažiuoti, jei už pervažos yra kliūtis, kuri verstų sustoti ant bėgių; delsti ar stoviniuoti pervažoje.',
        tip: 'Net kai užtvaras kyla — palaukite, kol jis visiškai pakeltas ir signalai leidžia judėti.',
      },
    ],
  },
  {
    id: 'zenklai',
    roman: 'Priedai',
    title: 'Kelio ženklai',
    summary: 'Įspėjamieji, pirmumo, draudžiamieji, nukreipiamieji ir nurodomieji ženklai.',
    color: '#ff6b6b',
    rules: [
      {
        id: 'z1',
        number: '1 priedas',
        title: 'Ženklų grupės',
        text: 'Įspėjamieji (trikampis, raudonas kraštas), pirmumo (įvairių formų: rombas, apverstas trikampis, aštuonkampis), draudžiamieji (apskritimas, raudonas kraštas), nukreipiamieji (mėlynas apskritimas), nurodomieji (stačiakampis), paslaugų ir papildomos lentelės.',
        tip: 'Mokykite ženklus pagal oficialius KET 2026 numerius (101, 203, 301…).',
      },
    ],
  },
  {
    id: 'sauga',
    roman: 'XXVI',
    title: 'Saugos priemonės',
    summary: 'Diržai, vaikiškos kėdutės, šalmai motociklininkams.',
    color: '#c49bff',
    rules: [
      {
        id: 'sa1',
        number: '196–206',
        title: 'Saugos diržai',
        text: 'Vairuotojas ir keleiviai privalo būti prisisegę saugos diržais. Vaikai vežami jiems tinkamose saugos priemonėse pagal amžių, ūgį ir svorį.',
      },
    ],
  },
];

export function getChapter(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}
