"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingContactButtons() {
  /*
   * =========================================================
   * CONFIGURATION
   * =========================================================
   */

  // Remplacez par votre numéro WhatsApp
  // Format international SANS + et SANS espaces
  const whatsappNumber = "213563266774";

  // Remplacez par votre page Messenger
  const messengerUrl =
    "https://www.facebook.com/messages/t/1627625560841341";

  return (
    <>
      {/* =====================================================
          BOUTONS CONTACT FLOTTANTS
      ===================================================== */}

      <div
        className="
          fixed
          bottom-[105px]
          end-4
          z-[80]
          flex
          flex-col
          items-end
          gap-3
          sm:bottom-8
          sm:end-6
        "
      >

        {/* =================================================
            WHATSAPP
        ================================================= */}

        <motion.a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          initial={{
            opacity: 0,
            scale: 0.5,
            x: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.45,
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-[0_10px_35px_rgba(37,211,102,0.38)]
            ring-4
            ring-white
            transition
            sm:h-16
            sm:w-16
          "
        >

          {/* Animation halo */}

          <motion.span
            className="
              absolute
              inset-0
              rounded-full
              border-2
              border-[#25D366]
            "
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Icon WhatsApp */}

          <svg
            viewBox="0 0 32 32"
            className="relative z-10 h-7 w-7 sm:h-8 sm:w-8"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M16 3C8.82 3 3 8.82 3 16c0 2.29.59 4.45 1.72 6.38L3 29l6.8-1.68A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3Zm0 23.75c-2.02 0-3.98-.54-5.69-1.57l-.41-.24-4.04 1 .98-3.94-.27-.42A10.7 10.7 0 0 1 5.25 16C5.25 10.07 10.07 5.25 16 5.25S26.75 10.07 26.75 16 21.93 26.75 16 26.75Zm5.87-7.98c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.77-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.97-2.36-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.64 0 1.56 1.13 3.07 1.29 3.28.16.21 2.22 3.39 5.38 4.76.75.32 1.34.51 1.8.65.76.24 1.45.21 1.99.13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"
            />
          </svg>

          {/* Label */}

          <span
            className="
              pointer-events-none
              absolute
              end-[calc(100%+10px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              duration-200
              group-hover:opacity-100
            "
          >
            WhatsApp
          </span>

        </motion.a>

        {/* =================================================
            MESSENGER
        ================================================= */}

        <motion.a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Messenger"
          initial={{
            opacity: 0,
            scale: 0.5,
            x: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
          }}
          transition={{
            delay: 0.4,
            duration: 0.45,
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            group
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            from-[#00B2FF]
            via-[#006AFF]
            to-[#A033FF]
            text-white
            shadow-[0_10px_35px_rgba(0,106,255,0.35)]
            ring-4
            ring-white
            sm:h-16
            sm:w-16
          "
        >

          {/* Animation halo */}

          <motion.span
            className="
              absolute
              inset-0
              rounded-full
              border-2
              border-[#168AFF]
            "
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.8,
            }}
          />

          {/* Messenger icon */}

          <svg
            viewBox="0 0 32 32"
            className="relative z-10 h-7 w-7 sm:h-8 sm:w-8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 3C8.82 3 3 8.6 3 15.5c0 3.94 1.88 7.48 4.88 9.78V29l4.48-2.46c1.15.31 2.37.46 3.64.46 7.18 0 13-5.6 13-12.5S23.18 3 16 3Z"
              fill="white"
            />

            <path
              d="m9 18.2 5.15-5.45 3.05 2.8 5.8-3.35-5.15 5.45-3.05-2.8L9 18.2Z"
              fill="#168AFF"
            />
          </svg>

          {/* Label */}

          <span
            className="
              pointer-events-none
              absolute
              end-[calc(100%+10px)]
              whitespace-nowrap
              rounded-xl
              bg-slate-950
              px-3
              py-2
              text-[10px]
              font-black
              text-white
              opacity-0
              shadow-xl
              transition
              duration-200
              group-hover:opacity-100
            "
          >
            Messenger
          </span>

        </motion.a>

      </div>
    </>
  );
}