import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Cross,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
} from "lucide-react";

import {
  getContactInfo,
} from "@/services/contact";

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const [
    contactInfo,
    setContactInfo,
  ] = useState(null);

  /* =======================================================
     LOAD CONTACT INFO
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadContactInfo =
      async () => {
        try {
          const data =
            await getContactInfo();

          if (!cancelled) {
            setContactInfo(
              data || null
            );
          }
        } catch (error) {
          console.error(
            "FOOTER CONTACT INFO ERROR:",
            error
          );

          if (!cancelled) {
            setContactInfo(null);
          }
        }
      };

    loadContactInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CONTACT DATA

     مفيش بيانات Default وهمية.
  ======================================================= */

  const contact =
    useMemo(
      () => ({
        address:
          String(
            contactInfo?.address ||
              ""
          ).trim(),

        phone:
          String(
            contactInfo?.phone ||
              ""
          ).trim(),

        whatsapp:
          String(
            contactInfo?.whatsapp ??
              contactInfo?.whatsApp ??
              ""
          ).trim(),

        email:
          String(
            contactInfo?.email ||
              ""
          ).trim(),

        hours:
          String(
            contactInfo?.hours ||
              ""
          ).trim(),
      }),
      [contactInfo]
    );

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const whatsappLink =
    contact.whatsapp
      ? `https://wa.me/${contact.whatsapp.replace(
          /[^0-9]/g,
          ""
        )}`
      : "";

  /* =======================================================
     QUICK LINKS
  ======================================================= */

  const quickLinks = [
    {
      to: "/",
      label: "الرئيسية",
    },

    {
      to: "/clinics",
      label:
        "العيادات الخارجية",
    },

    {
      to: "/doctors",
      label: "أطباؤنا",
    },

    {
      to: "/technologies",
      label: "خدماتنا",
    },

    {
      to: "/contact",
      label: "تواصل معنا",
    },
  ];

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <footer
      className="
        bg-slate-900
        text-slate-300
        pt-10
        pb-2
        relative
        overflow-hidden
      "
    >
      {/* Decorative gradient */}

      <div className="absolute top-0 left-0 right-0 h-1 animated-gradient" />

      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl" />

      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />

      <div className="container-custom relative">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 mb-1">

          {/* =================================================
              ABOUT
          ================================================= */}

          <div>

            <Link
              to="/"
              className="flex items-center gap-3 mb-5"
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-gradient-to-br
                  from-primary-500
                  to-secondary-500
                  flex
                  items-center
                  justify-center
                  shadow-lg
                "
              >
                <Cross className="w-7 h-7 text-white" />
              </div>

              <div>

                <h3 className="font-extrabold text-xl text-white">
                  مستشفى رواد الطب التخصصي
                </h3>

              </div>

            </Link>

            <p className="text-md leading-relaxed text-slate-400 mb-5">
              صرح طبي رائد يقدم خدمات صحية متكاملة بأعلى المعايير العالمية، نجمع بين الخبرة الطبية والتقنية المتقدمة.
            </p>

            {/* SOCIAL */}

            <div className="flex gap-3">

              <a
                href="https://www.facebook.com/eltakhsossyfym"
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-800
                  hover:bg-primary-600
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  hover:scale-110
                "
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-800
                  hover:bg-secondary-600
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  hover:scale-110
                "
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-800
                  hover:bg-accent-600
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  hover:scale-110
                "
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              {whatsappLink && (
                <a
                  href={
                    whatsappLink
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-800
                    hover:bg-success-600
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    hover:scale-110
                  "
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}

            </div>

          </div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div>

            <h3
              className="
                font-bold
                text-white
                text-xl
                mb-5
                relative
                inline-block
              "
            >
              روابط سريعة

              <span className="absolute -bottom-2 right-0 w-12 h-1 bg-primary-500 rounded-full" />

            </h3>

            <ul className="space-y-3">

              {quickLinks.map(
                (link) => (
                  <li
                    key={
                      link.to
                    }
                  >

                    <Link
                      to={
                        link.to
                      }
                      className="
                        text-md
                        text-slate-400
                        hover:text-primary-400
                        transition-colors
                        flex
                        items-center
                        gap-2
                        group
                      "
                    >

                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary-500 transition-colors" />

                      {
                        link.label
                      }

                    </Link>

                  </li>
                )
              )}

            </ul>

          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div>

            <h3
              className="
                font-bold
                text-white
                text-xl
                mb-5
                relative
                inline-block
              "
            >
              تواصل معنا

              <span className="absolute -bottom-2 right-0 w-12 h-1 bg-accent-500 rounded-full" />

            </h3>

            <ul className="space-y-4">

              {/* ADDRESS */}

              {contact.address && (
                <li className="flex items-start gap-3 text-md">

                  <MapPin className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />

                  <span className="text-slate-400">
                    {
                      contact.address
                    }
                  </span>

                </li>
              )}

              {/* PHONE */}

              {contact.phone && (
                <li className="flex items-center gap-3 text-sm">

                  <Phone className="w-5 h-5 text-secondary-400 shrink-0" />

                  <a
                    href={`tel:${contact.phone}`}
                    className="text-slate-400 hover:text-white transition-colors"
                    dir="ltr"
                  >
                    {
                      contact.phone
                    }
                  </a>

                </li>
              )}

              {/* EMAIL */}

              {contact.email && (
                <li className="flex items-center gap-3 text-sm">

                  <Mail className="w-5 h-5 text-accent-400 shrink-0" />

                  <a
                    href={`mailto:${contact.email}`}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {
                      contact.email
                    }
                  </a>

                </li>
              )}

              {/* HOURS */}

              {contact.hours && (
                <li className="flex items-start gap-3 text-sm">

                  <Clock className="w-5 h-5 text-warning-400 shrink-0 mt-0.5" />

                  <span className="text-slate-400">
                    {
                      contact.hours
                    }
                  </span>

                </li>
              )}

              {/* WHATSAPP */}

              {contact.whatsapp &&
                whatsappLink && (
                  <li className="flex items-center gap-3 text-sm">

                    <MessageCircle className="w-5 h-5 text-success-400 shrink-0" />

                    <a
                      href={
                        whatsappLink
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                      dir="ltr"
                    >
                      {
                        contact.whatsapp
                      }
                    </a>

                  </li>
                )}

            </ul>

            {/* لو مفيش أي بيانات */}

            {!contact.address &&
              !contact.phone &&
              !contact.email &&
              !contact.hours &&
              !contact.whatsapp && (
                <p className="text-sm text-slate-500">
                  لا توجد بيانات تواصل متاحة حالياً.
                </p>
              )}

          </div>

        </div>

        {/* =================================================
            BOTTOM BAR
        ================================================= */}

        <div
          className="
            border-t
            border-slate-800
            pt-4
            pb-2
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-4
          "
        >

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} مستشفى رواد الطب التخصصي. جميع الحقوق محفوظة.
          </p>

          <div className="flex gap-6 text-sm text-slate-500">

            <a
              href="#"
              className="hover:text-primary-400 transition-colors"
            >
              سياسة الخصوصية
            </a>

            <a
              href="#"
              className="hover:text-primary-400 transition-colors"
            >
              الشروط والأحكام
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}