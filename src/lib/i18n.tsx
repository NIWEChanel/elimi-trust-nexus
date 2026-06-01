import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "rw";

const STORAGE_KEY = "elimi-lang";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  en: {
    brand: "Elimi Trust Ltd",
    tagline: "Premium classified marketplace",
    nav_home: "Home",
    nav_products: "Products",
    nav_categories: "Categories",
    nav_about: "About",
    nav_contact: "Contact",
    nav_login: "Staff Login",
    nav_dashboard: "Dashboard",
    nav_logout: "Logout",
    hero_title: "Trusted marketplace for everything that matters",
    hero_sub: "Real estate, vehicles, electronics, fashion and more — verified by Elimi Trust.",
    cta_browse: "Browse products",
    cta_contact: "Contact us",
    featured: "Featured",
    trending: "Most liked",
    recent: "Recently uploaded",
    view_all: "View all",
    search_placeholder: "Search products…",
    filter_category: "Category",
    filter_status: "Status",
    filter_all: "All",
    no_products: "No products found",
    contact_whatsapp: "Contact on WhatsApp",
    price: "Price",
    location: "Location",
    condition: "Condition",
    brand: "Brand",
    status: "Status",
    description: "Description",
    details: "Details",
    related: "Related",
    status_available: "Available",
    status_sold: "Sold",
    status_pending: "Pending",
    status_reserved: "Reserved",
    about_title: "About Elimi Trust Ltd",
    about_mission: "We connect buyers with trusted sellers across Rwanda — from real estate to electronics — with a premium, verified experience.",
    contact_title: "Get in touch",
    contact_intro: "Reach our team any time via WhatsApp, call, or email.",
    login_title: "Staff Login",
    login_sub: "Authorised personnel only",
    email: "Email",
    password: "Password",
    sign_in: "Sign in",
    select_language: "Choose your language",
    select_language_sub: "Select your preferred language to continue",
    continue: "Continue",
    footer_rights: "All rights reserved.",
    follow_us: "Follow us",
  },
  fr: {
    brand: "Elimi Trust Ltd",
    tagline: "Marché de petites annonces premium",
    nav_home: "Accueil",
    nav_products: "Produits",
    nav_categories: "Catégories",
    nav_about: "À propos",
    nav_contact: "Contact",
    nav_login: "Connexion staff",
    nav_dashboard: "Tableau de bord",
    nav_logout: "Déconnexion",
    hero_title: "Le marché de confiance pour tout ce qui compte",
    hero_sub: "Immobilier, véhicules, électronique, mode et plus — vérifié par Elimi Trust.",
    cta_browse: "Parcourir les produits",
    cta_contact: "Contactez-nous",
    featured: "À la une",
    trending: "Les plus aimés",
    recent: "Récemment ajoutés",
    view_all: "Tout voir",
    search_placeholder: "Rechercher des produits…",
    filter_category: "Catégorie",
    filter_status: "Statut",
    filter_all: "Tous",
    no_products: "Aucun produit trouvé",
    contact_whatsapp: "Contacter sur WhatsApp",
    price: "Prix",
    location: "Emplacement",
    condition: "État",
    brand: "Marque",
    status: "Statut",
    description: "Description",
    details: "Détails",
    related: "Similaires",
    status_available: "Disponible",
    status_sold: "Vendu",
    status_pending: "En attente",
    status_reserved: "Réservé",
    about_title: "À propos d'Elimi Trust Ltd",
    about_mission: "Nous mettons en relation acheteurs et vendeurs de confiance au Rwanda — de l'immobilier à l'électronique — avec une expérience premium et vérifiée.",
    contact_title: "Contactez-nous",
    contact_intro: "Joignez notre équipe à tout moment via WhatsApp, appel ou e-mail.",
    login_title: "Connexion staff",
    login_sub: "Personnel autorisé uniquement",
    email: "E-mail",
    password: "Mot de passe",
    sign_in: "Se connecter",
    select_language: "Choisissez votre langue",
    select_language_sub: "Sélectionnez votre langue préférée pour continuer",
    continue: "Continuer",
    footer_rights: "Tous droits réservés.",
    follow_us: "Suivez-nous",
  },
  rw: {
    brand: "Elimi Trust Ltd",
    tagline: "Isoko ryizewe ry'ibicuruzwa byiza",
    nav_home: "Ahabanza",
    nav_products: "Ibicuruzwa",
    nav_categories: "Ibyiciro",
    nav_about: "Ibyerekeye",
    nav_contact: "Twandikire",
    nav_login: "Injira (Abakozi)",
    nav_dashboard: "Imbonerahamwe",
    nav_logout: "Sohoka",
    hero_title: "Isoko ryizewe ku byingenzi byose",
    hero_sub: "Imitungo, ibinyabiziga, ibikoresho bya elegitoroniki, imyenda n'ibindi — byemejwe na Elimi Trust.",
    cta_browse: "Reba ibicuruzwa",
    cta_contact: "Twandikire",
    featured: "Byatoranyijwe",
    trending: "Byakunzwe cyane",
    recent: "Bishya",
    view_all: "Reba byose",
    search_placeholder: "Shakisha ibicuruzwa…",
    filter_category: "Icyiciro",
    filter_status: "Imiterere",
    filter_all: "Byose",
    no_products: "Nta gicuruzwa kibonetse",
    contact_whatsapp: "Vugana kuri WhatsApp",
    price: "Igiciro",
    location: "Aho biherereye",
    condition: "Uko bimeze",
    brand: "Ikirango",
    status: "Imiterere",
    description: "Ibisobanuro",
    details: "Amakuru",
    related: "Bisa",
    status_available: "Birahari",
    status_sold: "Byagurishijwe",
    status_pending: "Bitegerejwe",
    status_reserved: "Byabikiwe",
    about_title: "Ibyerekeye Elimi Trust Ltd",
    about_mission: "Duhuza abaguzi n'abacuruzi bizewe mu Rwanda — kuva ku mitungo kugeza kuri elegitoroniki — mu buryo bwiza kandi bwemejwe.",
    contact_title: "Twandikire",
    contact_intro: "Vugana n'ikipe yacu igihe icyo aricyo cyose kuri WhatsApp, telefoni, cyangwa imeyili.",
    login_title: "Injira (Abakozi)",
    login_sub: "Abakozi bemewe gusa",
    email: "Imeyili",
    password: "Ijambobanga",
    sign_in: "Injira",
    select_language: "Hitamo ururimi rwawe",
    select_language_sub: "Hitamo ururimi ukunda kugira ngo ukomeze",
    continue: "Komeza",
    footer_rights: "Uburenganzira bwose burabitswe.",
    follow_us: "Dukurikire",
  },
};

interface I18nCtx {
  lang: Lang | null;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Lang | null) : null;
    if (stored && ["en", "fr", "rw"].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: string) => {
    const active = lang ?? "en";
    return translations[active][key] ?? key;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
