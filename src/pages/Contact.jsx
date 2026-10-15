import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

import {
  getContactInfo,
  createPatientFeedback,
} from "@/services/contact";

/* =========================================================
   HELPERS
========================================================= */

const normalizeText = (value) =>
  String(value || "").trim();

const normalizePhone = (value) =>
  String(value || "").trim();

const getWhatsappLink = (value) => {
  const phone =
    String(value || "").replace(
      /[^0-9]/g,
      ""
    );

  if (!phone) {
    return "";
  }

  return `https://wa.me/${phone}`;
};

const getMapSrc = (
  mapUrl,
  address
) => {
  const url =
    String(
      mapUrl || ""
    ).trim();

  /*
    نستخدم رابط Google Maps مباشرة
    فقط لو هو Embed URL فعلاً.

    الروابط العادية مثل:
    https://www.google.com/maps/place/...
    لا تعمل داخل iframe وGoogle يرفض الاتصال.
  */

  if (
    url &&
    (
      url.includes("/maps/embed") ||
      url.includes("output=embed")
    )
  ) {
    return url;
  }

  /*
    لو الـ mapUrl رابط عادي أو غير صالح للـ iframe،
    نستخدم عنوان المستشفى ونبني منه Embed URL صالح.
  */

  const safeAddress =
    String(
      address || ""
    ).trim();

  if (safeAddress) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      safeAddress
    )}&output=embed`;
  }

  /*
    لا يوجد Embed URL صالح ولا عنوان
    = لا نعرض خريطة.
  */

  return "";
};

/* =========================================================
   CONTACT PAGE
========================================================= */

export default function Contact() {
  /* =======================================================
     CONTACT INFO FROM BACKEND
  ======================================================= */

  const [
    contactInfo,
    setContactInfo,
  ] = useState(null);

  const [
    contactLoading,
    setContactLoading,
  ] = useState(true);

  const [
    contactError,
    setContactError,
  ] = useState("");

  useEffect(() => {
    let cancelled =
      false;

    const loadContactInfo =
      async () => {
        try {
          setContactLoading(
            true
          );

          setContactError(
            ""
          );

          const data =
            await getContactInfo();

          if (!cancelled) {
            setContactInfo(
              data || null
            );
          }
        } catch (error) {
          console.error(
            "CONTACT PAGE GET CONTACT INFO ERROR:",
            error
          );

          if (!cancelled) {
            setContactInfo(
              null
            );

            setContactError(
              "تعذر تحميل بيانات التواصل حالياً."
            );
          }
        } finally {
          if (!cancelled) {
            setContactLoading(
              false
            );
          }
        }
      };

    loadContactInfo();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     CONTACT DATA
  ======================================================= */

  const contact =
    useMemo(
      () => ({
        id:
          contactInfo?.id ??
          null,

        address:
          normalizeText(
            contactInfo?.address
          ),

        phone:
          normalizePhone(
            contactInfo?.phone
          ),

        whatsapp:
          normalizePhone(
            contactInfo?.whatsapp ??
              contactInfo?.whatsApp
          ),

        email:
          normalizeText(
            contactInfo?.email
          ),

        hours:
          normalizeText(
            contactInfo?.hours
          ),

        mapUrl:
          normalizeText(
            contactInfo?.mapUrl ??
              contactInfo?.map_url
          ),
      }),
      [
        contactInfo,
      ]
    );

  const whatsappLink =
    getWhatsappLink(
      contact.whatsapp
    );

  const mapSrc =
    getMapSrc(
      contact.mapUrl,
      contact.address
    );

  const hasContactInfo =
    Boolean(
      contact.address ||
        contact.phone ||
        contact.whatsapp ||
        contact.email ||
        contact.hours ||
        contact.mapUrl
    );

  /* =======================================================
     CONTACT CARDS
  ======================================================= */

  const contactCards =
    useMemo(
      () => {
        const cards = [];

        if (contact.address) {
          cards.push({
            key: "address",
            title: "العنوان",
            value:
              contact.address,
            icon: MapPin,
            iconClass:
              "bg-primary-100 text-primary-600",
            delay: 0,
          });
        }

        if (
          contact.phone ||
          contact.whatsapp
        ) {
          cards.push({
            key: "phone",
            title: "الهاتف",
            value:
              contact.phone,
            icon: Phone,
            iconClass:
              "bg-secondary-100 text-secondary-600",
            delay: 100,
          });
        }

        if (contact.email) {
          cards.push({
            key: "email",
            title:
              "البريد الإلكتروني",
            value:
              contact.email,
            icon: Mail,
            iconClass:
              "bg-accent-100 text-accent-600",
            delay: 200,
          });
        }

        if (contact.hours) {
          cards.push({
            key: "hours",
            title:
              "ساعات العمل",
            value:
              contact.hours,
            icon: Clock,
            iconClass:
              "bg-warning-100 text-warning-600",
            delay: 300,
          });
        }

        return cards;
      },
      [
        contact.address,
        contact.phone,
        contact.whatsapp,
        contact.email,
        contact.hours,
      ]
    );

  /* =======================================================
     COMPLAINTS FORM
  ======================================================= */

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    message: "",
  });

  const [
    submitState,
    setSubmitState,
  ] = useState({
    type: "",
    message: "",
  });

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (
        previous
      ) => ({
        ...previous,

        [name]:
          value,
      })
    );

    if (
      submitState.message
    ) {
      setSubmitState({
        type: "",
        message: "",
      });
    }
  };

  /* =======================================================
     SUBMIT COMPLAINT / SUGGESTION
  ======================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      const trimmedName =
        form.name.trim();

      const trimmedMessage =
        form.message.trim();

      if (
        !trimmedName ||
        !trimmedMessage
      ) {
        setSubmitState({
          type:
            "error",

          message:
            "يرجى إدخال الاسم ونص الرسالة.",
        });

        return;
      }

      try {
        setIsSubmitting(
          true
        );

        setSubmitState({
          type: "",
          message: "",
        });

        await createPatientFeedback({
          name:
            trimmedName,

          message:
            trimmedMessage,
        });

        setForm({
          name: "",
          message: "",
        });

        setSubmitState({
          type:
            "success",

          message:
            "تم إرسال رسالتك بنجاح، شكرًا لتواصلك معنا.",
        });
      } catch (error) {
        console.error(
          "SEND PATIENT FEEDBACK ERROR:",
          error?.response?.data ||
            error
        );

        setSubmitState({
          type:
            "error",

          message:
            "حدث خطأ أثناء إرسال رسالتك، يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="pt-24">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative py-20 overflow-hidden">

        <div className="absolute inset-0">

          <img
            src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 hero-overlay" />

        </div>

        <div className="container-custom relative z-10 text-center">

          <Reveal>

            <span
              className="
                inline-block
                px-4
                py-1.5
                rounded-full
                bg-white/10
                backdrop-blur-md
                text-white
                text-lg
                font-bold
                mb-4
                border
                border-white/20
              "
            >
              تواصل معنا
            </span>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-extrabold
                text-white
                mb-4
              "
            >
              تواصل معنا
            </h1>

            <p
              className="
                text-xl
                text-slate-200
                max-w-2xl
                mx-auto
              "
            >
              نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت
            </p>

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          COMPLAINTS / SUGGESTIONS
      ===================================================== */}

      <section className="section-padding bg-white">

        <div className="container-custom">

          <div className="max-w-4xl mx-auto">

            <div className="card p-6 md:p-8">

              <div className="mb-8 text-center">

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-primary-100
                    bg-primary-50
                    px-4
                    py-1.5
                    text-sm
                    font-bold
                    text-primary-700
                  "
                >
                  الشكاوى والمقترحات
                </span>

                <h2
                  className="
                    mt-4
                    text-3xl
                    font-extrabold
                    text-slate-800
                  "
                >
                  الشكاوى والمقترحات
                </h2>

                <p
                  className="
                    mt-3
                    text-base
                    text-slate-600
                  "
                >
                  نسعد باستقبال ملاحظاتكم ومقترحاتكم، ونعمل دائمًا على تحسين مستوى الخدمة المقدمة.
                </p>

              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
                noValidate
              >

                <div>

                  <label
                    htmlFor="complaint-name"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    الاسم
                  </label>

                  <input
                    id="complaint-name"
                    name="name"
                    type="text"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSubmitting
                    }
                    placeholder="اكتب اسمك"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#E7E3E3]
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60
                    "
                  />

                </div>

                <div>

                  <label
                    htmlFor="complaint-message"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    نص الرسالة
                  </label>

                  <textarea
                    id="complaint-message"
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSubmitting
                    }
                    rows={6}
                    placeholder="اكتب شكواك أو مقترحك هنا"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#E7E3E3]
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60
                    "
                  />

                </div>

                {submitState.message && (
                  <div
                    className={`
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-bold

                      ${
                        submitState.type ===
                        "success"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    `}
                  >
                    {
                      submitState.message
                    }
                  </div>
                )}

                <div className="flex justify-start">

                  <button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                    className="
                      btn
                      btn-primary
                      min-w-[180px]
                      disabled:opacity-50
                    "
                  >
                    {isSubmitting
                      ? "جاري الإرسال..."
                      : "إرسال"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section className="section-padding bg-slate-50">

        <div className="container-custom">

          <Reveal>

            <SectionHeading
              badge="بيانات التواصل"
              title="تواصل مع مستشفى رواد الطب"
              subtitle="يسعدنا تواصلك معنا وسنكون دائماً على استعداد لخدمتك"
            />

          </Reveal>

          {/* ERROR */}

          {contactError && (
            <div
              className="
                mb-6
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-center
                text-sm
                font-bold
                text-amber-700
              "
            >
              {contactError}
            </div>
          )}

          {/* LOADING */}

          {contactLoading && (
            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-4
                gap-6
              "
            >
              {Array.from({
                length: 4,
              }).map(
                (
                  _,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="
                      card
                      h-[220px]
                      shimmer-bg
                    "
                  />
                )
              )}
            </div>
          )}

          {/* =================================================
              NO CONTACT INFO
          ================================================= */}

          {!contactLoading &&
            !contactError &&
            !hasContactInfo && (
              <div
                className="
                  card
                  p-10
                  text-center
                  text-slate-500
                  font-bold
                "
              >
                لا توجد بيانات تواصل متاحة حالياً.
              </div>
            )}

          {/* =================================================
              CONTACT INFO
          ================================================= */}

          {!contactLoading &&
            hasContactInfo && (
              <>

                {/* CARDS */}

                {contactCards.length >
                  0 && (
                  <div
                    className={`
                      grid
                      gap-6
                      mb-12
                      items-stretch

                      ${
                        contactCards.length ===
                        1
                          ? "max-w-sm mx-auto"
                          : contactCards.length ===
                            2
                          ? "sm:grid-cols-2 max-w-3xl mx-auto"
                          : contactCards.length ===
                            3
                          ? "sm:grid-cols-2 lg:grid-cols-3"
                          : "sm:grid-cols-2 lg:grid-cols-4"
                      }
                    `}
                  >

                    {contactCards.map(
                      (
                        card
                      ) => {
                        const Icon =
                          card.icon;

                        return (
                          <Reveal
                            key={
                              card.key
                            }
                            delay={
                              card.delay
                            }
                            className="h-full"
                          >

                            <div
                              className="
                                card
                                card-lift
                                p-6
                                text-center
                                h-full
                                min-h-[220px]
                                flex
                                flex-col
                                items-center
                                justify-center
                              "
                            >

                              <div
                                className={`
                                  w-14
                                  h-14
                                  mx-auto
                                  rounded-2xl
                                  flex
                                  items-center
                                  justify-center
                                  mb-4
                                  shrink-0

                                  ${card.iconClass}
                                `}
                              >
                                <Icon className="w-7 h-7" />
                              </div>

                              <h3 className="font-bold text-slate-800 mb-2">
                                {
                                  card.title
                                }
                              </h3>

                              {card.key ===
                                "address" && (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {
                                    contact.address
                                  }
                                </p>
                              )}

                              {card.key ===
                                "phone" && (
                                <>

                                  {contact.phone && (
                                    <a
                                      href={`tel:${contact.phone}`}
                                      className="
                                        text-sm
                                        text-slate-600
                                        hover:text-primary-600
                                        transition-colors
                                      "
                                      dir="ltr"
                                    >
                                      {
                                        contact.phone
                                      }
                                    </a>
                                  )}

                                  {whatsappLink && (
                                    <div className="mt-2">

                                      <a
                                        href={
                                          whatsappLink
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                          inline-flex
                                          items-center
                                          gap-1
                                          text-sm
                                          text-success-600
                                          font-bold
                                        "
                                      >
                                        <MessageCircle className="w-4 h-4" />

                                        واتساب
                                      </a>

                                    </div>
                                  )}

                                </>
                              )}

                              {card.key ===
                                "email" && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="
                                    text-sm
                                    text-slate-600
                                    hover:text-primary-600
                                    break-all
                                    transition-colors
                                  "
                                >
                                  {
                                    contact.email
                                  }
                                </a>
                              )}

                              {card.key ===
                                "hours" && (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {
                                    contact.hours
                                  }
                                </p>
                              )}

                            </div>

                          </Reveal>
                        );
                      }
                    )}

                  </div>
                )}

                {/* =================================================
                    MAP
                ================================================= */}

                {mapSrc && (
                  <Reveal>

                    <div className="card overflow-hidden w-full">

                      <div
                        className="
                          w-full
                          h-[450px]
                          md:h-[520px]
                          bg-slate-200
                        "
                      >

                        <iframe
                          src={
                            mapSrc
                          }
                          width="100%"
                          height="100%"
                          style={{
                            border:
                              0,

                            width:
                              "100%",

                            height:
                              "100%",
                          }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="موقع المستشفى"
                        />

                      </div>

                    </div>

                  </Reveal>
                )}

                {/* =================================================
                    SOCIAL MEDIA
                ================================================= */}

                <Reveal>

                  <div className="text-center mt-12">

                    <h3
                      className="
                        text-xl
                        font-bold
                        text-slate-800
                        mb-6
                      "
                    >
                      تابعنا على وسائل التواصل
                    </h3>

                    <div className="flex justify-center gap-4">

                      <a
                        href="https://www.facebook.com/eltakhsossyfym"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-primary-100
                          hover:bg-primary-600
                          hover:text-white
                          text-primary-600
                          flex
                          items-center
                          justify-center
                          transition-all
                          hover:scale-110
                        "
                        aria-label="Facebook"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>

                      <a
                        href="#"
                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-secondary-100
                          hover:bg-secondary-600
                          hover:text-white
                          text-secondary-600
                          flex
                          items-center
                          justify-center
                          transition-all
                          hover:scale-110
                        "
                        aria-label="Instagram"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>

                      <a
                        href="#"
                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-accent-100
                          hover:bg-accent-600
                          hover:text-white
                          text-accent-600
                          flex
                          items-center
                          justify-center
                          transition-all
                          hover:scale-110
                        "
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-6 h-6" />
                      </a>

                      {whatsappLink && (
                        <a
                          href={
                            whatsappLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            w-12
                            h-12
                            rounded-2xl
                            bg-success-100
                            hover:bg-success-600
                            hover:text-white
                            text-success-600
                            flex
                            items-center
                            justify-center
                            transition-all
                            hover:scale-110
                          "
                          aria-label="WhatsApp"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </a>
                      )}

                    </div>

                  </div>

                </Reveal>

              </>
            )}

        </div>

      </section>

    </div>
  );
}