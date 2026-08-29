"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Clock3,
  CreditCard,
  ExternalLink,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

/* =========================================================
   CONFIGURATION MAGASIN
========================================================= */

const STORE_NAME = "DOCTECH";

const STORE_LATITUDE = "35.6613059";
const STORE_LONGITUDE = "-0.6324169";

const STORE_ADDRESS = "Es Sénia, Oran, Algérie";
const STORE_PLUS_CODE = "M969+G2 Es Sénia";

const STORE_PHONE_DISPLAY = "0563 26 67 74";
const STORE_PHONE_LINK = "+213563266774";

const STORE_EMAIL = "contact@doctech.dz";

/* =========================================================
   GOOGLE MAPS
========================================================= */

const GOOGLE_MAP_URL =
  `https://www.google.com/maps/search/?api=1&query=${STORE_LATITUDE},${STORE_LONGITUDE}`;

const GOOGLE_DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${STORE_LATITUDE},${STORE_LONGITUDE}`;

const GOOGLE_MAP_EMBED_URL =
  `https://www.google.com/maps?q=${STORE_LATITUDE},${STORE_LONGITUDE}&z=18&output=embed`;

/* =========================================================
   LIENS BOUTIQUE
========================================================= */

const boutiqueLinks = [
  { label: "PC Portables", href: "/articles?categorie=ordinateurs-portables" },
  { label: "PC Fixes", href: "/articles?categorie=pc-fixes" },
  { label: "Écrans", href: "/articles?categorie=ecrans" },
  { label: "Périphériques", href: "/articles?categorie=peripheriques" },
  { label: "Accessoires", href: "/articles?categorie=accessoires" },
  { label: "Promotions", href: "/promotions" },
];

/* =========================================================
   LIENS INFORMATIONS
========================================================= */

const informationLinks = [
  { label: "À propos", href: "/a-propos" },
  { label: "Livraison", href: "/livraison" },
  { label: "Garantie", href: "/garantie" },
  { label: "Suivi de commande", href: "/suivi" },
  { label: "Contact", href: "/contact" },
];

/* =========================================================
   MARQUES
========================================================= */

const brands = [
  "HP",
  "ASUS",
  "DELL",
  "LOGITECH",
  "LENOVO",
  "MSI",
  "INTEL",
  "MICROSOFT",
  "AMD",
];

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050d1f] text-white">
      {/* =====================================================
          BACKGROUND (gardé)
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-10
          h-[380px]
          w-[380px]
          rounded-full
          bg-blue-600/10
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          h-[450px]
          w-[450px]
          rounded-full
          bg-cyan-500/10
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
          [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
          [background-size:35px_35px]
        "
      />

      {/* =====================================================
          AVANTAGES – version cartes avec icônes plus grandes
      ====================================================== */}

      <div className="relative border-b border-white/10">
        <div
          className="
            mx-auto
            max-w-[1450px]
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <BenefitCard
              icon={<Truck size={24} />}
              title="Livraison nationale"
              text="Disponible dans 48 wilayas"
            />
            <BenefitCard
              icon={<CreditCard size={24} />}
              title="Paiement sécurisé"
              text="Achetez en toute confiance"
            />
            <BenefitCard
              icon={<ShieldCheck size={24} />}
              title="Produits garantis"
              text="Garantie jusqu'à 12 mois"
            />
            <BenefitCard
              icon={<Headphones size={24} />}
              title="Support DOCTECH"
              text="Une équipe à votre écoute"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENU PRINCIPAL – nouvelle disposition avec colonnes équilibrées
      ====================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-[1450px]
          px-4
          py-16
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            grid
            gap-12
            md:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]
          "
        >
          {/* Colonne 1 : Logo + description + contact rapide */}
          <div>
            <Link
              href="/"
              className="
                inline-block
                transition-transform
                duration-300
                hover:scale-[1.02]
              "
            >
              <div
                className="
                  relative
                  h-[64px]
                  w-[180px]
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  shadow-[0_15px_35px_rgba(0,0,0,0.18)]
                "
              >
                <Image
                  src="/images/logo-doctech.webp"
                  alt="DOCTECH"
                  fill
                  sizes="180px"
                  className="object-contain p-3"
                />
              </div>
            </Link>

            <p
              className="
                mt-6
                max-w-[380px]
                text-[13px]
                font-medium
                leading-7
                text-slate-400
              "
            >
              DOCTECH est votre spécialiste du matériel informatique
              à Es Sénia. Découvrez nos ordinateurs, écrans,
              périphériques et accessoires issus des plus grandes
              marques.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <ContactCompact icon={<Phone size={16} />} label="Téléphone" value={STORE_PHONE_DISPLAY} href={`tel:${STORE_PHONE_LINK}`} />
              <ContactCompact icon={<Mail size={16} />} label="Email" value={STORE_EMAIL} href={`mailto:${STORE_EMAIL}`} />
              <ContactCompact icon={<MapPin size={16} />} label="Adresse" value="Es Sénia, Oran" href={GOOGLE_MAP_URL} external />
            </div>

            <div className="mt-8 flex items-center gap-3">
              <SocialButton
                label="Facebook"
                href="#"
                icon={<FacebookIcon />}
              />
              <SocialButton
                label="Instagram"
                href="#"
                icon={<InstagramIcon />}
              />
              <SocialButton
                label="WhatsApp"
                href={`https://wa.me/${STORE_PHONE_LINK.replace("+", "")}`}
                icon={<MessageCircle size={20} />}
              />
            </div>
          </div>

          {/* Colonne 2 : Boutique */}
          <FooterColumn title="Boutique" links={boutiqueLinks} />

          {/* Colonne 3 : Informations */}
          <FooterColumn title="Informations" links={informationLinks} />

          {/* Colonne 4 : Contact + suivi commande */}
          <div>
            <FooterTitle>Nous contacter</FooterTitle>

            <div className="mt-7 space-y-5">
              <ContactRow
                icon={<MapPin size={17} />}
                title="Adresse"
                value={STORE_ADDRESS}
              />
              <ContactRow
                icon={<Phone size={17} />}
                title="Téléphone"
                value={STORE_PHONE_DISPLAY}
              />
              <ContactRow
                icon={<Mail size={17} />}
                title="E-mail"
                value={STORE_EMAIL}
              />
              <ContactRow
                icon={<Clock3 size={17} />}
                title="Horaires"
                value="Fermeture à 19h00"
              />
            </div>

            <Link
              href="/suivi"
              className="
                group
                mt-8
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-blue-500/15
                bg-blue-500/5
                p-4
                transition-all
                duration-300
                hover:border-blue-500/30
                hover:bg-blue-500/10
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600/15
                  text-blue-400
                  transition-all
                  duration-300
                  group-hover:bg-blue-600
                  group-hover:text-white
                "
              >
                <PackageCheck size={22} />
              </div>
              <div>
                <p className="text-[12px] font-extrabold text-white">
                  Suivi de commande
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Consultez facilement votre commande.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          GOOGLE MAPS – style intégré avec ombre et badge
      ====================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-[1450px]
          px-4
          pb-14
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-white/[0.025]
            p-2
            shadow-[0_30px_80px_rgba(0,0,0,0.25)]
          "
        >
          <div
            className="
              grid
              overflow-hidden
              rounded-[26px]
              bg-[#08142c]
              lg:grid-cols-[0.4fr_0.6fr]
            "
          >
            {/* Partie gauche : infos magasin */}
            <div
              className="
                relative
                flex
                flex-col
                justify-center
                p-8
                sm:p-10
                lg:p-12
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -left-20
                  -top-20
                  h-52
                  w-52
                  rounded-full
                  bg-blue-600/20
                  blur-[80px]
                "
              />
              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-16
                  right-0
                  h-44
                  w-44
                  rounded-full
                  bg-cyan-400/10
                  blur-[70px]
                "
              />

              <div className="relative z-10">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-600
                    text-white
                    shadow-[0_14px_35px_rgba(37,99,235,0.35)]
                  "
                >
                  <MapPin size={26} />
                </div>

                <span
                  className="
                    mt-6
                    block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-blue-400
                  "
                >
                  Notre magasin
                </span>

                <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
                  DOCTECH
                </h3>

                <p className="mt-1 text-sm font-semibold text-blue-300">
                  Magasin d&apos;informatique
                </p>

                <p className="mt-4 max-w-sm text-[13px] leading-7 text-slate-400">
                  Venez nous rendre visite à Es Sénia et découvrez
                  notre sélection de matériel informatique.
                </p>

                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-white/[0.035]
                    p-5
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-600/15
                        text-blue-400
                      "
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                        Localisation
                      </p>
                      <p className="mt-1 text-[13px] font-bold text-slate-300">
                        {STORE_ADDRESS}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        {STORE_PLUS_CODE}
                      </p>
                      <p className="mt-1 text-[9px] font-medium text-slate-600">
                        {STORE_LATITUDE}, {STORE_LONGITUDE}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <a
                    href={GOOGLE_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      text-[12px]
                      font-extrabold
                      text-white
                      shadow-[0_12px_30px_rgba(37,99,235,0.25)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:bg-blue-500
                    "
                  >
                    <Navigation size={16} />
                    Itinéraire
                    <ExternalLink
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </a>

                  <a
                    href={GOOGLE_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.06]
                      px-6
                      text-[12px]
                      font-extrabold
                      text-white
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-white/20
                      hover:bg-white/10
                    "
                  >
                    Google Maps
                    <ExternalLink
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Partie droite : iframe map */}
            <div
              className="
                relative
                min-h-[380px]
                overflow-hidden
                sm:min-h-[420px]
                lg:min-h-[500px]
              "
            >
              <iframe
                title="DOCTECH Es Sénia Google Maps"
                src={GOOGLE_MAP_EMBED_URL}
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  border-0
                "
              />

              {/* Badge en haut à gauche */}
              <div
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-4
                  z-10
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#050d1f]/90
                  px-4
                  py-3
                  shadow-2xl
                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                  "
                >
                  <MapPin size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">DOCTECH</p>
                  <p className="mt-0.5 text-[9px] text-slate-400">Es Sénia, Oran</p>
                </div>
              </div>

              {/* Bouton téléphone en bas à droite */}
              <a
                href={`tel:${STORE_PHONE_LINK}`}
                className="
                  absolute
                  bottom-4
                  right-4
                  z-10
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-[#050d1f]/90
                  px-4
                  py-3
                  text-[11px]
                  font-bold
                  text-white
                  shadow-2xl
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:bg-blue-600
                "
              >
                <Phone size={14} />
                {STORE_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MARQUES – style "pills"
      ====================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-[1450px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-3
            border-t
            border-white/10
            py-10
          "
        >
          {brands.map((brand) => (
            <span
              key={brand}
              className="
                cursor-default
                rounded-full
                border
                border-white/5
                bg-white/[0.03]
                px-5
                py-2
                text-[10px]
                font-black
                tracking-[0.06em]
                text-slate-500
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-blue-500/30
                hover:bg-blue-500/10
                hover:text-blue-400
              "
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* =====================================================
          COPYRIGHT
      ====================================================== */}

      <div className="relative border-t border-white/10 bg-black/10">
        <div
          className="
            mx-auto
            flex
            max-w-[1450px]
            flex-col
            gap-5
            px-4
            py-6
            sm:px-6
            md:flex-row
            md:items-center
            md:justify-between
            lg:px-8
          "
        >
          <p className="text-[10px] font-medium text-slate-500">
            © 2026{" "}
            <span className="font-extrabold text-slate-300">DOCTECH</span>
            . Tous droits réservés.
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-6
              gap-y-2
              text-[10px]
              font-medium
              text-slate-500
            "
          >
            <Link
              href="/confidentialite"
              className="transition hover:text-white"
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/conditions"
              className="transition hover:text-white"
            >
              Conditions d&apos;utilisation
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   COMPOSANTS
========================================================= */

// -------------------------------------
// BenefitCard (avantages en cartes)
// -------------------------------------
function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-white/5
        bg-white/[0.03]
        p-5
        transition-all
        duration-300
        hover:border-blue-500/20
        hover:bg-white/[0.06]
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-600/10
          text-blue-400
          transition-all
          duration-300
          group-hover:bg-blue-600
          group-hover:text-white
        "
      >
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-extrabold text-white">{title}</p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}

// -------------------------------------
// FooterTitle (titre avec trait)
// -------------------------------------
function FooterTitle({ children }: { children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-black text-white">{children}</h3>
      <div className="mt-3 h-[3px] w-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
    </div>
  );
}

// -------------------------------------
// FooterColumn (liste de liens)
// -------------------------------------
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <FooterTitle>{title}</FooterTitle>
      <ul className="mt-7 space-y-4">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="
                group
                flex
                items-center
                gap-3
                text-[13px]
                font-medium
                text-slate-400
                transition-all
                duration-300
                hover:translate-x-1
                hover:text-white
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-slate-700
                  transition-all
                  duration-300
                  group-hover:bg-blue-500
                  group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]
                "
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------
// ContactRow (pour la colonne contact)
// -------------------------------------
function ContactRow({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="group flex items-start gap-4">
      <div
        className="
          mt-0.5
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/5
          text-blue-400
          transition-all
          duration-300
          group-hover:bg-blue-600
          group-hover:text-white
        "
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
          {title}
        </p>
        <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-400">
          {value}
        </p>
      </div>
    </div>
  );
}

// -------------------------------------
// ContactCompact (pour la colonne 1)
// -------------------------------------
function ContactCompact({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  const isExternal = external || href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="
        group
        flex
        items-center
        gap-4
        text-[13px]
        font-semibold
        text-slate-400
        transition-all
        duration-300
        hover:text-white
      "
    >
      <span
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-white/5
          text-blue-400
          transition-all
          duration-300
          group-hover:bg-blue-600
          group-hover:text-white
        "
      >
        {icon}
      </span>
      <span>
        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </span>
        <span className="block text-[12px] font-semibold">{value}</span>
      </span>
    </a>
  );
}

// -------------------------------------
// SocialButton
// -------------------------------------
function SocialButton({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  const isExternal = href !== "#";
  return (
    <a
      href={href}
      aria-label={label}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-white/10
        bg-white/5
        text-slate-400
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500/30
        hover:bg-blue-600
        hover:text-white
        hover:shadow-[0_10px_25px_rgba(37,99,235,0.25)]
      "
    >
      {icon}
    </a>
  );
}

// -------------------------------------
// FacebookIcon
// -------------------------------------
function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 22v-9h3l.5-3h-3.5V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7v3h3v9h3.5Z" />
    </svg>
  );
}

// -------------------------------------
// InstagramIcon
// -------------------------------------
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}