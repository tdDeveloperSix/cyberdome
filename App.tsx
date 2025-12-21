import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Eye,
  Lock,
  Activity,
  Terminal,
  MapPin,
  Users,
  Zap,
  Play,
  Box,
  Scan,
  Maximize2,
  TrendingUp,
  Briefcase,
  Target,
  Quote,
  Clock,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TiltCard } from './components/TiltCard';
import { VirtualTour } from './components/VirtualTour';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

// --- Types ---
type Section = 'home' | 'executive' | 'forge' | 'nexus' | 'facility' | 'simulation' | 'contact';

type PanicTone = 'info' | 'alert' | 'panic';

interface PanicMessage {
  sender: string;
  channel: string;
  text: string;
  tone: PanicTone;
}

interface Choice {
  id: string;
  label: string;
  nextNodeId: string;
  variant?: 'default' | 'danger' | 'success';
}

interface ScenarioNode {
  id: string;
  title: string;
  gamemasterText: string;
  incomingMessages: PanicMessage[];
  choices: Choice[];
}

const NAV_ITEMS: { label: string; section: Section }[] = [
  { label: 'Forside', section: 'home' },
  { label: 'Tre zoner', section: 'facility' },
  { label: 'Command Center', section: 'executive' },
  { label: 'The Forge', section: 'forge' },
  { label: 'The Nexus', section: 'nexus' },
  { label: 'Scenario Engine', section: 'simulation' },
  { label: 'Kontakt', section: 'contact' },
];

const HAVN_SCENARIO: Record<string, ScenarioNode> = {
  start: {
    id: 'start',
    title: 'TRUSSEL DETEKTERET',
    gamemasterText: 'Kritisk alarm i Security Operations Center (SOC). En ukendt ransomware-variant spreder sig aggressivt i det administrative netværk. Der er risiko for "lateral movement" mod det operative lag (OT), som styrer kraner og sluser.',
    incomingMessages: [
      { sender: 'CISO', channel: 'Signal', text: 'Vi ser kryptering på 40% af serverne. Det går stærkt.', tone: 'alert' },
      { sender: 'COO', channel: 'Radio', text: 'Driften kører stadig, men vi er blinde. Skal vi fortsætte?', tone: 'info' },
    ],
    choices: [
      { id: 'c1', label: 'Iværksæt total nedlukning (Blackout)', nextNodeId: 'shutdown', variant: 'danger' },
      { id: 'c2', label: 'Isoler systemer og fortsæt drift', nextNodeId: 'isolate', variant: 'default' },
    ],
  },
  shutdown: {
    id: 'shutdown',
    title: 'TOTAL NEDLUKNING',
    gamemasterText: 'Du har beordret øjeblikkeligt stop. Havnen er stille. Lastbiler hober sig op ved gaten, og Mærsk ringer direkte til bestyrelsesformanden. Tabet er 2 mio. kr. i timen.',
    incomingMessages: [
      { sender: 'Mærsk', channel: 'Telefon', text: 'Vi har tre skibe der skal losses. Hvad er tidshorisonten?', tone: 'panic' },
      { sender: 'Presse', channel: 'Mail', text: 'Rygtet siger I er hacket. Bekræfter I nedbruddet?', tone: 'alert' },
    ],
    choices: [
      { id: 'c3', label: 'Gå til pressen (Fuld åbenhed)', nextNodeId: 'transparency', variant: 'default' },
      { id: 'c4', label: 'Ingen kommentarer (Køb tid)', nextNodeId: 'silence', variant: 'default' },
    ],
  },
  isolate: {
    id: 'isolate',
    title: 'RISIKABEL DRIFT',
    gamemasterText: 'I forsøger at holde driften kørende mens IT kæmper. Det var en fælde. Hackerne brugte støjen til at snige sig ind i kranstyringen (OT). En container er netop tabt fra 10 meters højde.',
    incomingMessages: [
      { sender: 'Kranfører', channel: 'Radio', text: 'Kran 4 lystrer ikke! Den slap godset af sig selv!', tone: 'panic' },
      { sender: 'Sikkerhedschef', channel: 'Alarm', text: 'Ingen personskade, men vi har mistet kontrollen over maskinerne.', tone: 'panic' },
    ],
    choices: [
      { id: 'c5', label: 'NØDSTOP ALT NU', nextNodeId: 'emergency', variant: 'danger' },
      { id: 'c6', label: 'Forhandl med hackerne', nextNodeId: 'negotiate', variant: 'default' },
    ],
  },
  transparency: {
    id: 'transparency',
    title: 'OFFENSIV KOMMUNIKATION',
    gamemasterText: 'I melder klart ud. Aktiekursen dykker kortvarigt, men kunderne roser jeres ansvarlighed. IT får ro til at rense systemerne uden pres for "hurtige løsninger".',
    incomingMessages: [
      { sender: 'Bestyrelse', channel: 'SMS', text: 'Modigt valg. Vi bakker op. Få det løst rigtigt.', tone: 'info' },
      { sender: 'CISO', channel: 'Teams', text: 'Vi har fundet "Patient Zero". Gendannelse påbegyndt.', tone: 'info' },
    ],
    choices: [
      { id: 'reset', label: 'Genstart simulation', nextNodeId: 'start', variant: 'success' },
    ],
  },
  silence: {
    id: 'silence',
    title: 'MEDIESTORM',
    gamemasterText: 'Tavsheden skaber panik. En lækket intern mail når Ekstra Bladet. "Aalborg Havn skjuler hackerangreb". Tilliden lider et alvorligt knæk.',
    incomingMessages: [
      { sender: 'Journalist', channel: 'Twitter', text: '#Breaking: Aalborg Havn nede. Ledelsen tavs. Er data lækket?', tone: 'panic' },
      { sender: 'Kunde', channel: 'Mail', text: 'Vi trækker vores ordrer indtil vi får en forklaring.', tone: 'alert' },
    ],
    choices: [
      { id: 'reset', label: 'Prøv igen', nextNodeId: 'start', variant: 'default' },
    ],
  },
  emergency: {
    id: 'emergency',
    title: 'FYSISK SIKKERHED',
    gamemasterText: 'Strømmen kappes manuelt. Skaden er begrænset til materiel. Det bliver dyrt, men ingen kom til skade. I har lært lektien: OT og IT skal adskilles.',
    incomingMessages: [
      { sender: 'COO', channel: 'Møde', text: 'Det var tæt på. God beslutning at trække stikket.', tone: 'info' },
    ],
    choices: [
      { id: 'reset', label: 'Genstart simulation', nextNodeId: 'start', variant: 'success' },
    ],
  },
  negotiate: {
    id: 'negotiate',
    title: 'AFPRESNING',
    gamemasterText: 'I betaler. Hackerne giver nøglen, men planter en bagdør. Tre måneder senere sker det igen. Denne gang er prisen tredoblet.',
    incomingMessages: [
      { sender: 'Hacker', channel: 'Darkweb', text: 'Payment received. Pleasure doing business.', tone: 'info' },
      { sender: 'CFO', channel: 'Mail', text: 'Revisionen spørger til den udbetaling...', tone: 'alert' },
    ],
    choices: [
      { id: 'reset', label: 'Prøv igen', nextNodeId: 'start', variant: 'danger' },
    ],
  },
};

const PANIC_TONE_STYLES: Record<PanicTone, { badge: string; bubble: string }> = {
  info: {
    badge: 'text-slate-300 border-slate-600',
    bubble: 'border-slate-700 bg-slate-900/60',
  },
  alert: {
    badge: 'text-amber-300 border-amber-400/60',
    bubble: 'border-amber-500/30 bg-amber-900/10',
  },
  panic: {
    badge: 'text-red-300 border-red-500/70',
    bubble: 'border-red-500/40 bg-red-900/10',
  },
};

// --- Mock Data for Charts ---
const MOCK_THREAT_DATA = [
  { time: '09:00', level: 20 },
  { time: '10:00', level: 35 },
  { time: '11:00', level: 25 },
  { time: '12:00', level: 60 },
  { time: '13:00', level: 85 },
  { time: '14:00', level: 95 },
  { time: '15:00', level: 90 },
];

const EXEC_METRICS = [
  {
    label: 'War Room',
    value: '360°',
    detail: 'Interaktive skærmvægge til wargaming i realtid',
    icon: Activity,
  },
  {
    label: 'Deep-fake simulator',
    value: 'LIVE',
    detail: 'Træn kritisk sans når lyd og video manipuleres',
    icon: Cpu,
  },
  {
    label: 'Observer Gallery',
    value: '1-VEJ',
    detail: 'Feedback på dynamik, kommunikation og stress under pres',
    icon: Eye,
  },
  {
    label: 'Krisestab',
    value: 'HØJINTENS',
    detail: 'Fra ransomware-nedbrud til statsstøttet spionage',
    icon: Shield,
  },
];

const EXEC_FLOW = [
  {
    phase: '01',
    title: 'Krisestab: Ramme og mandat',
    subtitle: '15 min briefing',
    narrative: 'Vi sætter scenen og fastlægger beslutningsrum, roller og mandat. Fokus er menneskelig forståelse af digitale trusler—uden at drukne i detaljer.',
    signal: 'Fokus: mandat og risikobillede',
    icon: Target,
    quote: '"Vi ved præcist, hvad vi beslutter os ud fra—og hvorfor."',
  },
  {
    phase: '02',
    title: 'The War Room: Wargaming',
    subtitle: '60 min beslutningspres',
    narrative: 'Et cirkulært lokale med 360° skærmvægge. I træner realtidsscenarier fra ransomware til spionage—med medier, interessenter og konsekvenser, der mærkes i rummet.',
    signal: 'Fokus: tempo og ansvar',
    icon: Activity,
    quote: '"Vi tester presset af—uden at sætte virksomheden på spil."',
  },
  {
    phase: '03',
    title: 'Deep-fake & debrief',
    subtitle: '30 min feedback-loop',
    narrative: 'I oplever manipulation i realtid via lyd og video, og vi debriefer med fokus på kommunikation, kropssprog og stresshåndtering. Slutresultatet er en kort handlingsplan med ejerskab og næste skridt.',
    signal: 'Fokus: mennesket i systemet',
    icon: Briefcase,
    quote: '"Jeg kan forklare planen for bestyrelsen på fem minutter—og stå på mål for den."',
  },
];

const FORGE_METRICS = [
  {
    label: 'Modular Cyber Range',
    value: 'P&P',
    detail: 'Plug-and-play stationer til isolerede netværk',
    icon: Cpu,
  },
  {
    label: 'Red / Blue Teaming',
    value: 'LIVE',
    detail: 'Angreb vs. forsvar i kontrollerede miljøer',
    icon: Shield,
  },
  {
    label: 'OT/IoT Lab',
    value: 'HW',
    detail: 'PLC, vindmøller, vand og robotarme (fysiske konsekvenser)',
    icon: Lock,
  },
  {
    label: 'CTF Arena',
    value: 'GAME',
    detail: 'Gamificeret dyst i sårbarheder og forsvar',
    icon: Zap,
  },
];

const FORGE_FLOW = [
  {
    phase: '01',
    title: 'Onboarding til miljøet',
    subtitle: '15 min setup',
    narrative: 'Holdet kobles på isolerede netværk. Vi gennemgår mål, regler og sikkerhedsrammer, så træningen er realistisk—men kontrolleret.',
    signal: 'Fokus: sikker ramme',
    icon: Target,
    quote: '"Vi kan øve os hårdt uden at risikere produktionen."',
  },
  {
    phase: '02',
    title: 'Cyber Range: Red vs. Blue',
    subtitle: '60–90 min hands-on',
    narrative: 'Red Team angriber, Blue Team forsvarer. Vi skifter perspektiv undervejs og måler, hvad der virker: detektion, respons, kommunikation og genopretning.',
    signal: 'Fokus: teknik og tempo',
    icon: Activity,
    quote: '"Nu ved vi præcis hvor vi mister tid—og hvorfor."',
  },
  {
    phase: '03',
    title: 'OT/IoT: den fysiske konsekvens',
    subtitle: '30–45 min lab',
    narrative: 'Træning på fysisk hardware: PLC-styringer, sensorer og industri-setup. Formålet er at forstå, hvordan digitale hændelser kan blive til fysiske hændelser.',
    signal: 'Fokus: OT-sikkerhed',
    icon: Lock,
    quote: '"Det her gør truslen konkret for alle i rummet."',
  },
];

const NEXUS_METRICS = [
  {
    label: 'Physicality of Code',
    value: 'ARTEFAKTER',
    detail: 'Kabler, kryptering og “smeltede” server-racks',
    icon: Terminal,
  },
  {
    label: 'VR: Journey through the Wire',
    value: 'IMMERSIVE',
    detail: 'Firewalls, datapakker og DDoS som fysisk storm',
    icon: Eye,
  },
  {
    label: 'Social Engineering Maze',
    value: 'LABYRINT',
    detail: 'Hologrammer tester valg, adfærd og sikkerhedsvaner',
    icon: Users,
  },
  {
    label: 'Data-visualisering',
    value: 'REALTIME',
    detail: 'Kunstinstallation der lyser baseret på aktuelle trusler',
    icon: TrendingUp,
  },
];

const NEXUS_FLOW = [
  {
    phase: '01',
    title: 'Gør det usynlige synligt',
    subtitle: '20 min udstilling',
    narrative: 'Vi starter i “Physicality of Code”. Fysiske artefakter gør netværk og kryptografi forståeligt—og skaber sprog på tværs af roller.',
    signal: 'Fokus: forståelse',
    icon: Target,
    quote: '"Nu kan jeg forklare det for mit team—uden slides."',
  },
  {
    phase: '02',
    title: 'VR: inde i netværket',
    subtitle: '15–25 min oplevelse',
    narrative: 'Du bliver “skrumpet” og sendt gennem et netværk. Du navigerer firewalls, ser datapakker og oplever et DDoS som en fysisk storm omkring dig.',
    signal: 'Fokus: intuition',
    icon: Eye,
    quote: '"Jeg forstår pludselig hvad et angreb “gør”."',
  },
  {
    phase: '03',
    title: 'Social Engineering Maze',
    subtitle: '15–25 min adfærd',
    narrative: 'En fysisk labyrint med “personer” (hologrammer), der forsøger at lokke adgangskort og passwords. Kun de rigtige sikkerhedsvalg får dig igennem.',
    signal: 'Fokus: mennesket',
    icon: Users,
    quote: '"Det er ikke kun IT—det er os alle sammen."',
  },
];

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 20); // Speed of typing

    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse text-cyan-500">_</span>
    </span>
  );
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [scrolled, setScrolled] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [initialTourIndex, setInitialTourIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [zonesIntroExpanded, setZonesIntroExpanded] = useState(false);
  const [activeFacilityVideo, setActiveFacilityVideo] = useState<'command' | 'forge' | 'nexus' | null>(null);

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<ScenarioNode | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<PanicMessage[]>([]);

  // Scroll handler for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsTourActive(false);
  }, []);

  // Initialize scenario
  useEffect(() => {
    // Start with no scenario active
  }, []);

  const startScenario = () => {
    handleNodeChange('start');
  };

  const handleNodeChange = (nodeId: string) => {
    const node = HAVN_SCENARIO[nodeId];
    if (!node) return;

    setCurrentNodeId(nodeId);
    setCurrentNode(node);

    // Reset messages for the new node
    setVisibleMessages([]);

    // Stagger messages
    node.incomingMessages.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
      }, 1000 + (index * 1500)); // First msg after 1s, next after 1.5s
    });
  };
  const openTour = (index: number = 0) => {
    setInitialTourIndex(index);
    setIsTourActive(true);
  };

  const scrollTo = (id: Section) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-white">

      {isTourActive && <VirtualTour onClose={() => setIsTourActive(false)} initialSceneIndex={initialTourIndex} />}

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 cyber-grid z-0 pointer-events-none opacity-40"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 z-0 pointer-events-none"></div>

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-900/90 backdrop-blur-md border-cyan-900/50 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-2xl font-bold tracking-widest uppercase glow-text">Cyberdome</span>
          </div>
          <div className="hidden md:flex space-x-8 font-mono text-sm tracking-wider">
            {NAV_ITEMS.map(({ label, section }) => (
              <button
                key={section}
                onClick={() => scrollTo(section)}
                className={`hover:text-cyan-400 transition-colors uppercase ${activeSection === section ? 'text-cyan-400 border-b border-cyan-400' : 'text-slate-400'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-label={isMobileMenuOpen ? 'Luk menu' : 'Åbn menu'}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="p-3 rounded-full border border-slate-700 bg-slate-950/60 text-slate-200 hover:border-cyan-500 hover:text-cyan-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile navigation sheet */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobilmenu"
        >
          <button
            aria-label="Luk menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute top-16 left-0 right-0 mx-4 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur p-4 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="font-mono text-xs tracking-[0.35em] text-cyan-300 uppercase">Menu</span>
              </div>
              <button
                aria-label="Luk menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full border border-slate-700 text-slate-200 hover:border-cyan-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {NAV_ITEMS.map(({ label, section }) => (
                <button
                  key={section}
                  onClick={() => scrollTo(section)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors font-mono uppercase tracking-widest text-sm
                    ${activeSection === section
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/40 text-slate-200 hover:border-cyan-500/40 hover:bg-slate-900/70'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Hero Section --- */}
      <section id="home" className="relative h-screen z-10 overflow-hidden">
        <VirtualTour variant="hero" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/90"></div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-black/60 border border-cyan-500/40 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-auto"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-cyan-300 font-mono text-xs tracking-[0.4em] uppercase mb-4"
            >
              Aalborg CyberDome
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Hub for digital modstandskraft</h1>
            <p className="text-slate-200 text-lg md:text-xl mb-8">
              CyberDome er en arkitektonisk og teknologisk fæstning, designet til at bygge bro mellem menneskelig forståelse og digitale trusler.
              Oplevelsen er opdelt i tre zoner: <span className="text-cyan-200 font-semibold">The Command Center</span>, <span className="text-fuchsia-200 font-semibold">The Forge</span> og <span className="text-emerald-200 font-semibold">The Nexus</span>.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openTour(0)}
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-[0.3em] uppercase transition-all rounded-sm clip-path-cyber flex items-center justify-center gap-2"
              >
                <Box className="w-5 h-5" />
                Åbn virtuel rundtur
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollTo('facility')}
                className="px-8 py-4 bg-transparent border border-slate-500 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold tracking-[0.3em] uppercase transition-all rounded-sm"
              >
                Se de tre zoner
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- The Facility (3D Cards) --- */}
      <section id="facility" className="relative py-20 z-10 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">De tre zoner</h2>
            <div className="w-24 h-1 bg-cyan-500 mx-auto mb-6"></div>
            <div className="text-slate-300 max-w-3xl mx-auto text-lg space-y-5">
              <p>
                Aalborg CyberDome er mere end et sted, hvor man bliver undervist. Det er et samlet miljø, der arbejder med, hvordan man beskytter sig digitalt i praksis.
                Projektet er opstået, fordi cybersikkerhed ikke kan løses med teknik alene. Ægte sikkerhed kræver samspil mellem dem, der træffer beslutninger, dem der arbejder teknisk med systemerne, og almindelige borgere, som forstår deres rolle.
              </p>
              {zonesIntroExpanded && (
                <p>
                  Bygningen og måden man bevæger sig igennem den på, er tænkt som lag af beskyttelse. De tre områder er adskilt fysisk, men hænger tæt sammen i brug.
                  Erfaringer fra den tekniske Cyber Range bruges direkte i beslutningerne i War Room, mens oplevelserne i The Nexus giver historisk indsigt og en mere grundlæggende forståelse for, hvorfor cybersikkerhed er vigtig.
                  Samlet set skaber det en bedre fælles forståelse på tværs af roller.
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setZonesIntroExpanded((v) => !v)}
                className="px-5 py-2.5 rounded-full border border-slate-700 bg-slate-950/60 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-200 transition-colors flex items-center gap-2 text-sm font-mono uppercase tracking-widest"
              >
                {zonesIntroExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Skjul
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Læs mere
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => scrollTo('executive')}
                className="px-6 py-3 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-700 hover:border-cyan-400 text-cyan-200 font-bold tracking-[0.2em] uppercase transition-all rounded-sm flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                Command Center
              </button>
              <button
                onClick={() => scrollTo('forge')}
                className="px-6 py-3 bg-fuchsia-900/20 hover:bg-fuchsia-900/40 border border-fuchsia-700 hover:border-fuchsia-400 text-fuchsia-200 font-bold tracking-[0.2em] uppercase transition-all rounded-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                The Forge
              </button>
              <button
                onClick={() => scrollTo('nexus')}
                className="px-6 py-3 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-700 hover:border-emerald-400 text-emerald-200 font-bold tracking-[0.2em] uppercase transition-all rounded-sm flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                The Nexus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Zone 01: The Command Center */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <TiltCard
                className="h-[500px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                onClick={() => scrollTo('executive')}
                role="button"
                tabIndex={0}
                ariaLabel="Gå til Zone 01: The Command Center"
              >
                {/* Performance: image by default. Desktop/tablet video only on hover/focus (no src until then). */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80 opacity-60"
                  onMouseEnter={() => setActiveFacilityVideo('command')}
                  onMouseLeave={() => setActiveFacilityVideo((v) => (v === 'command' ? null : v))}
                  onFocus={() => setActiveFacilityVideo('command')}
                  onBlur={() => setActiveFacilityVideo((v) => (v === 'command' ? null : v))}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center md:hidden animate-[ken-burns_20s_infinite_alternate]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {/* Desktop poster always visible; video only mounts when active */}
                  <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center animate-[ken-burns_20s_infinite_alternate]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {activeFacilityVideo === 'command' && (
                    <video
                      className="hidden md:block absolute inset-0 w-full h-full object-cover"
                      src="/videos/command-center.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Activity className="w-5 h-5" />
                      <span className="font-mono text-sm tracking-widest">ZONE 01</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollTo('executive'); }}
                        className="px-3 py-2 bg-slate-950/60 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-slate-700 hover:border-cyan-400 transition-all rounded-sm text-xs font-mono uppercase tracking-widest"
                        title="Gå til zone"
                      >
                        Gå til
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">The Command Center</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Et højintens krisestabsmiljø til topledelse og krisestyring—med War Room, Deep-fake Simulator og Observer Gallery.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">War Room</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">Deep-fakes</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">Observer</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Zone 02: The Forge */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <TiltCard
                className="h-[500px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
                onClick={() => scrollTo('forge')}
                role="button"
                tabIndex={0}
                ariaLabel="Gå til Zone 02: The Forge"
              >
                {/* Performance: image by default. Desktop/tablet video only on hover/focus (no src until then). */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80 opacity-60"
                  onMouseEnter={() => setActiveFacilityVideo('forge')}
                  onMouseLeave={() => setActiveFacilityVideo((v) => (v === 'forge' ? null : v))}
                  onFocus={() => setActiveFacilityVideo('forge')}
                  onBlur={() => setActiveFacilityVideo((v) => (v === 'forge' ? null : v))}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center md:hidden animate-[ken-burns_25s_infinite_alternate-reverse]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {/* Desktop poster always visible; video only mounts when active */}
                  <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center animate-[ken-burns_25s_infinite_alternate-reverse]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {activeFacilityVideo === 'forge' && (
                    <video
                      className="hidden md:block absolute inset-0 w-full h-full object-cover"
                      src="/videos/forge.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-fuchsia-400">
                      <Lock className="w-5 h-5" />
                      <span className="font-mono text-sm tracking-widest">ZONE 02</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollTo('forge'); }}
                        className="px-3 py-2 bg-slate-950/60 hover:bg-fuchsia-500 hover:text-black text-fuchsia-200 border border-slate-700 hover:border-fuchsia-400 transition-all rounded-sm text-xs font-mono uppercase tracking-widest"
                        title="Gå til zone"
                      >
                        Gå til
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-2 group-hover:text-fuchsia-300 transition-colors">The Forge</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Den tekniske træningszone: Modular Cyber Range til Red/Blue Teaming, OT/IoT Lab med fysisk hardware, og en CTF Arena til gamificeret læring.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">Cyber Range</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">OT/IoT Lab</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">CTF</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Zone 03: The Nexus */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <TiltCard
                className="h-[500px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                onClick={() => scrollTo('nexus')}
                role="button"
                tabIndex={0}
                ariaLabel="Gå til Zone 03: The Nexus"
              >
                {/* Performance: image by default. Desktop/tablet video only on hover/focus (no src until then). */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80 opacity-60"
                  onMouseEnter={() => setActiveFacilityVideo('nexus')}
                  onMouseLeave={() => setActiveFacilityVideo((v) => (v === 'nexus' ? null : v))}
                  onFocus={() => setActiveFacilityVideo('nexus')}
                  onBlur={() => setActiveFacilityVideo((v) => (v === 'nexus' ? null : v))}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center md:hidden animate-[ken-burns_22s_infinite_alternate]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {/* Desktop poster always visible; video only mounts when active */}
                  <div
                    className="hidden md:block absolute inset-0 bg-cover bg-center animate-[ken-burns_22s_infinite_alternate]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=2000&q=80)' }}
                  />
                  {activeFacilityVideo === 'nexus' && (
                    <video
                      className="hidden md:block absolute inset-0 w-full h-full object-cover"
                      src="/videos/nexus.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Eye className="w-5 h-5" />
                      <span className="font-mono text-sm tracking-widest">ZONE 03</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollTo('nexus'); }}
                        className="px-3 py-2 bg-slate-950/60 hover:bg-emerald-500 hover:text-black text-emerald-200 border border-slate-700 hover:border-emerald-400 transition-all rounded-sm text-xs font-mono uppercase tracking-widest"
                        title="Gå til zone"
                      >
                        Gå til
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">The Nexus</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Oplevelsescenteret der gør det usynlige synligt: fysiske artefakter, VR “Journey through the Wire”, Social Engineering Maze og data-visualisering i realtid.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">Museum</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">VR</span>
                    <span className="px-2 py-1 bg-slate-900/80 text-xs font-mono text-slate-300 border border-slate-700 rounded">Social engineering</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>

          {/* Architecture & Atmosphere + Why Aalborg */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-10 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur">
              <p className="text-cyan-400 font-mono text-sm tracking-[0.35em] uppercase mb-4">Arkitektur og atmosfære</p>
              <h3 className="text-3xl font-bold mb-6 text-white">Bygningen understøtter formålet</h3>
              <div className="space-y-5 text-slate-300">
                <div>
                  <div className="font-bold text-white mb-1">Ydre</div>
                  <p className="text-slate-400">
                    Mørkt, halvgennemsigtigt glas med indbyggede LED-striber der minder om binær kode og kredsløb om natten.
                  </p>
                </div>
                <div>
                  <div className="font-bold text-white mb-1">Indre</div>
                  <p className="text-slate-400">
                    En blanding af rå beton (styrke) og varmt træ (det menneskelige element). Dæmpet akustik skaber fokus og fortrolighed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur">
              <p className="text-cyan-400 font-mono text-sm tracking-[0.35em] uppercase mb-4">Hvorfor Aalborg?</p>
              <h3 className="text-3xl font-bold mb-6 text-white">Synergien gør byen ideel</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                  <div className="font-bold text-white mb-1">Aalborg Universitet (AAU)</div>
                  <p className="text-slate-400">Førende miljøer inden for datalogi og it-sikkerhed.</p>
                </div>
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                  <div className="font-bold text-white mb-1">Industrien</div>
                  <p className="text-slate-400">Nordjysk produktion kræver beskyttelse af OT/IoT—og træning på rigtig hardware.</p>
                </div>
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                  <div className="font-bold text-white mb-1">Porten til Norden</div>
                  <p className="text-slate-400">Knudepunkt for digital infrastruktur mod Skandinavien.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Executive Narrative Flow --- */}
      <section id="executive" className="relative py-24 z-10 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950 border-y border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-cyan-400 font-mono text-sm tracking-[0.35em] uppercase mb-4">Zone 01</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Command Center</h2>
            <p className="text-slate-400 text-lg md:text-xl">
              Designet til at simulere de højintense omgivelser i en national eller virksomheds-specifik krisestab.
              Her træner topledelse og kriseledelse beslutninger i realtid—med klare konsekvenser og målbar læring.
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            {EXEC_METRICS.map(({ label, value, detail, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/60 transition-all shadow-[0_0_25px_rgba(8,145,178,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</span>
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-4xl font-bold text-white">{value}</div>
                <p className="text-slate-400 text-sm mt-2">{detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow timeline */}
          <div className="mt-20 relative">
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/60 via-cyan-500/10 to-transparent"></div>
            <div className="space-y-10">
              {EXEC_FLOW.map(({ phase, title, subtitle, narrative, signal, quote, icon: Icon }, index) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative md:pl-24"
                >
                  <div className="hidden md:flex absolute left-6 top-12 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full border border-cyan-500/40 bg-slate-950 text-cyan-300 font-mono text-sm">
                    {phase}
                  </div>
                  <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-8 md:p-10 backdrop-blur shadow-[0_20px_60px_rgba(2,6,23,0.6)] hover:border-cyan-500/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-cyan-400 font-mono text-sm tracking-[0.4em] uppercase">{subtitle}</p>
                        <h3 className="text-3xl font-bold mt-2">{title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Icon className="w-6 h-6 text-cyan-300" />
                        <span className="text-sm uppercase tracking-[0.3em]">{signal}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">{narrative}</p>
                    <div className="flex items-start gap-3 text-slate-400 italic">
                      <Quote className="w-6 h-6 text-cyan-500" />
                      <p>{quote}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-400 mb-4">Book en session i War Room. Vi tilpasser scenarierne til jeres vigtigste risici.</p>
            <button
              onClick={() => scrollTo('contact')}
              className="px-12 py-4 bg-white text-black font-bold tracking-[0.3em] uppercase rounded-sm hover:bg-cyan-400 transition-colors"
            >
              Planlæg besøg
            </button>
          </div>
        </div>
      </section>

      {/* --- Zone 02: The Forge --- */}
      <section id="forge" className="relative py-24 z-10 bg-gradient-to-b from-slate-950 via-fuchsia-950/10 to-slate-950 border-y border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-fuchsia-300 font-mono text-sm tracking-[0.35em] uppercase mb-4">Zone 02</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Forge</h2>
            <p className="text-slate-400 text-lg md:text-xl">
              Her foregår den praktiske træning af IT-specialister og teknikere i sikre, lukkede miljøer—med både cyber range og fysisk hardware.
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            {FORGE_METRICS.map(({ label, value, detail, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-fuchsia-500/60 transition-all shadow-[0_0_25px_rgba(217,70,239,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</span>
                  <Icon className="w-5 h-5 text-fuchsia-300" />
                </div>
                <div className="text-4xl font-bold text-white">{value}</div>
                <p className="text-slate-400 text-sm mt-2">{detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow timeline */}
          <div className="mt-20 relative">
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-fuchsia-400/60 via-fuchsia-400/10 to-transparent"></div>
            <div className="space-y-10">
              {FORGE_FLOW.map(({ phase, title, subtitle, narrative, signal, quote, icon: Icon }, index) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative md:pl-24"
                >
                  <div className="hidden md:flex absolute left-6 top-12 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full border border-fuchsia-500/40 bg-slate-950 text-fuchsia-200 font-mono text-sm">
                    {phase}
                  </div>
                  <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-8 md:p-10 backdrop-blur shadow-[0_20px_60px_rgba(2,6,23,0.6)] hover:border-fuchsia-500/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-fuchsia-300 font-mono text-sm tracking-[0.4em] uppercase">{subtitle}</p>
                        <h3 className="text-3xl font-bold mt-2">{title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Icon className="w-6 h-6 text-fuchsia-200" />
                        <span className="text-sm uppercase tracking-[0.3em]">{signal}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">{narrative}</p>
                    <div className="flex items-start gap-3 text-slate-400 italic">
                      <Quote className="w-6 h-6 text-fuchsia-400" />
                      <p>{quote}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-400 mb-4">Vil I træne Red/Blue Teaming eller OT-scenarier? Vi tilpasser niveau og målgruppe.</p>
            <button
              onClick={() => scrollTo('contact')}
              className="px-12 py-4 bg-white text-black font-bold tracking-[0.3em] uppercase rounded-sm hover:bg-fuchsia-300 transition-colors"
            >
              Planlæg besøg
            </button>
          </div>
        </div>
      </section>

      {/* --- Zone 03: The Nexus --- */}
      <section id="nexus" className="relative py-24 z-10 bg-gradient-to-b from-slate-950 via-emerald-950/10 to-slate-950 border-y border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-emerald-300 font-mono text-sm tracking-[0.35em] uppercase mb-4">Zone 03</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Nexus</h2>
            <p className="text-slate-400 text-lg md:text-xl">
              Oplevelsescenteret for offentligheden, skoler og virksomhedsbesøg. Målet er at gøre det usynlige synligt—og give alle et fælles sprog om cyber.
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            {NEXUS_METRICS.map(({ label, value, detail, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/60 transition-all shadow-[0_0_25px_rgba(16,185,129,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</span>
                  <Icon className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-4xl font-bold text-white">{value}</div>
                <p className="text-slate-400 text-sm mt-2">{detail}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow timeline */}
          <div className="mt-20 relative">
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/60 via-emerald-400/10 to-transparent"></div>
            <div className="space-y-10">
              {NEXUS_FLOW.map(({ phase, title, subtitle, narrative, signal, quote, icon: Icon }, index) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative md:pl-24"
                >
                  <div className="hidden md:flex absolute left-6 top-12 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full border border-emerald-500/40 bg-slate-950 text-emerald-200 font-mono text-sm">
                    {phase}
                  </div>
                  <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-8 md:p-10 backdrop-blur shadow-[0_20px_60px_rgba(2,6,23,0.6)] hover:border-emerald-500/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-emerald-300 font-mono text-sm tracking-[0.4em] uppercase">{subtitle}</p>
                        <h3 className="text-3xl font-bold mt-2">{title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Icon className="w-6 h-6 text-emerald-200" />
                        <span className="text-sm uppercase tracking-[0.3em]">{signal}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">{narrative}</p>
                    <div className="flex items-start gap-3 text-slate-400 italic">
                      <Quote className="w-6 h-6 text-emerald-400" />
                      <p>{quote}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-400 mb-4">Book en fremvisning for virksomhed, skole eller hold—vi tilpasser niveau og varighed.</p>
            <button
              onClick={() => scrollTo('contact')}
              className="px-12 py-4 bg-white text-black font-bold tracking-[0.3em] uppercase rounded-sm hover:bg-emerald-300 transition-colors"
            >
              Planlæg besøg
            </button>
          </div>
        </div>
      </section>

      {/* --- AI Simulation Demo --- */}
      <section id="simulation" className="relative py-24 z-10 bg-black overflow-hidden">
        {/* Animated Background Lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            {/* Left Column: Context */}
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-white"><span className="text-cyan-500 font-mono text-xl block mb-2">SCENARIO ENGINE</span> fra briefing til beslutning</h2>
              <p className="text-slate-400 mb-8 text-lg">
                I CyberDome kan vi drive scenarier på tværs af zonerne—fra War Room til Cyber Range og videre til oplevelsesdelen.
                Her er en mini-demo af et højintens kriseforløb.
              </p>

              <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6 backdrop-blur-sm glow-box">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-cyan-400 flex items-center gap-2"><Cpu className="w-4 h-4" /> REALTIDSDATA</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_THREAT_DATA}>
                      <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0891b2', color: '#fff' }}
                        itemStyle={{ color: '#22d3ee' }}
                      />
                      <Line type="monotone" dataKey="level" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: "#06b6d4" }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Interaction */}
            <div className="lg:w-1/2 w-full">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">SCENARIE: KRITISK RANSOMWARE</p>
              </div>
              <div className="bg-slate-950 border border-cyan-500/30 rounded-lg p-1 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                {/* Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/30 blur opacity-50 animate-[scan_3s_linear_infinite] pointer-events-none z-20"></div>
                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 z-20"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 z-20"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 z-20"></div>

                <div className="bg-slate-900/90 rounded p-6 min-h-[450px] flex flex-col relative z-10">
                  <div className="font-mono text-xs text-slate-500 mb-4 border-b border-slate-800 pb-2 flex justify-between">
                    <span>TERMINAL_ID: AAL_SEC_01</span>
                    <span>STATUS: {currentNode ? 'ACTIVE_CRISIS' : 'IDLE'}</span>
                  </div>

                  {/* Output Display */}
                  <div className="flex-grow font-mono text-sm text-cyan-100 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[250px] mb-4 min-h-[150px]">
                    {!currentNode && (
                      <div className="text-slate-500 italic flex items-center gap-2 h-full justify-center flex-col">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-900 flex items-center justify-center animate-pulse mb-4">
                          <Shield className="w-8 h-8 text-cyan-700" />
                        </div>
                        <p>System klar. Afventer initiering.</p>
                      </div>
                    )}

                    {currentNode && (
                      <div className="animate-in fade-in duration-500">
                        <div className="text-xs text-cyan-500 mb-2 tracking-widest uppercase border-b border-cyan-900/50 pb-1 w-fit">
                          {currentNode.title}
                        </div>
                        <div className="text-lg text-white mb-6 leading-relaxed shadow-cyan-500/10 drop-shadow-sm">
                          <TypewriterText text={currentNode.gamemasterText} />
                        </div>
                      </div>
                    )}
                  </div>

                  {visibleMessages.length > 0 && (
                    <div className="border-t border-slate-800 pt-4 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-mono text-red-400 tracking-[0.3em] uppercase flex items-center gap-2">
                          <Activity className="w-4 h-4 animate-pulse" />
                          Reaktioner i realtid
                        </span>
                        <span className="text-xs text-slate-500">{visibleMessages.length} nye beskeder</span>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <AnimatePresence mode='popLayout'>
                          {visibleMessages.map((msg, idx) => {
                            const toneStyle = PANIC_TONE_STYLES[msg.tone];
                            return (
                              <motion.div
                                key={`${msg.sender}-${idx}`}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`rounded-sm border-l-2 px-4 py-3 ${toneStyle.bubble} backdrop-blur-sm`}
                              >
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className={`uppercase tracking-[0.25em] border px-2 py-0.5 rounded-sm text-[10px] ${toneStyle.badge}`}>{msg.channel}</span>
                                  <span className="text-slate-400 font-mono">{msg.sender}</span>
                                </div>
                                <p className="text-sm text-slate-200 font-mono leading-snug">{msg.text}</p>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="mt-auto pt-4">
                    {!currentNode && (
                      <button
                        onClick={startScenario}
                        className="w-full py-4 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-800 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Zap className="w-5 h-5 group-hover:scale-125 transition-transform relative z-10" />
                        <span className="relative z-10">Start krisesimulering</span>
                      </button>
                    )}

                    {currentNode && (
                      <div className="grid grid-cols-1 gap-3">
                        {currentNode.choices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleNodeChange(choice.nextNodeId)}
                            className={`w-full py-3 px-4 text-left border font-mono text-sm transition-all hover:translate-x-1 relative overflow-hidden group
                              ${choice.variant === 'danger'
                                ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:border-red-500 hover:bg-red-900/30'
                                : choice.variant === 'success'
                                  ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-900/30'
                                  : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-cyan-500 hover:text-cyan-300'
                              }`}
                          >
                            <span className="uppercase tracking-widest text-xs opacity-50 mb-1 block">Handling</span>
                            <span className="font-bold">{choice.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact / Location --- */}
      <section id="contact" className="py-24 bg-slate-900 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">BOOKING OG KONTAKT</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors bg-slate-950/50"
            >
              <MapPin className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Lokation</h3>
              <p className="text-slate-400">Musikkens Plads<br />9000 Aalborg<br />Denmark</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors bg-slate-950/50"
            >
              <Users className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Kapacitet</h3>
              <p className="text-slate-400">Topledelse, IT-teams & besøgende<br />Sessions, holdtræning og fremvisninger<br />Format tilpasses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors bg-slate-950/50"
            >
              <Terminal className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Kontakt</h3>
              <p className="text-slate-400">info@cyberdome-aalborg.dk<br />+45 99 88 77 66</p>
            </motion.div>
          </div>

          <div className="mt-16">
            <button className="px-12 py-5 bg-white text-black font-bold text-lg rounded-sm hover:bg-cyan-400 transition-colors">
              BOOK EN FREMVISNING
            </button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Cyberdome Aalborg. Oplevelsesdesign af Virtual Architect.</p>
      </footer>

      {/* --- CSS for animations not in Tailwind default --- */}
      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes ken-burns {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.2) translate(-2%, -2%); }
        }
        .clip-path-cyber {
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }
      `}</style>
    </div>
  );
};

export default App;
