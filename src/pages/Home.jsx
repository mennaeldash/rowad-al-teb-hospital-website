import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import { Link } from "react-router-dom";

import {
  Cross,
  Eye,
  Target,
  Shield,
  Heart,
  Award,
  ShieldCheck,
  Lock,
  Info,
  UserRound,
  Cpu,
  Clock,
  Activity,
  Zap,
  Target as TargetIcon,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Building2,
  X,
  CalendarPlus,
} from "lucide-react";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import PlaceholderImage from "@/components/PlaceholderImage";

import {
  useSiteContent,
  useStatistics,
  useTestimonials,
  useStaff,
  usePartners,
} from "@/lib/hooks";

/* =========================================================
   HERO IMAGES
========================================================= */

const HERO_IMAGES = [
  {
    src: "/images/photo_2026-09-28_05-46-44.webp",
    position: "center center",
  },
  {
    src: "/images/Screenshot (5314).webp",
    position:"center 72%",
  },
  {
    src: "/images/Screenshot (5310).webp",
    position: "center 50%",
  },
  {
    src: "/images/Screenshot (5315).webp",
    position: "center 45%",
  },
    {
    src: "/images/Screenshot (5309).webp",
    position: "center 30%",
  },
  
];

/* =========================================================
   ICONS
========================================================= */

const patientRightsIcons = {
  shield: Shield,
  heart: Heart,
  award: Award,
  "shield-check": ShieldCheck,
  lock: Lock,
  info: Info,
};

const whyChooseIcons = {
  "user-md": UserRound,
  cpu: Cpu,
  clock: Clock,
  activity: Activity,
  zap: Zap,
  target: TargetIcon,
};

const getStatisticIcon = (key) => {
  const normalizedKey = String(key || "")
    .trim()
    .toLowerCase();

  if (
    normalizedKey.includes("طبيب") ||
    normalizedKey.includes("أطباء") ||
    normalizedKey.includes("اطباء") ||
    normalizedKey.includes("دكتور")
  ) {
    return UserRound;
  }

  if (
    normalizedKey.includes("خبرة") ||
    normalizedKey.includes("سنة") ||
    normalizedKey.includes("سنوات") ||
    normalizedKey.includes("عام")
  ) {
    return Award;
  }

  if (
    normalizedKey.includes("قسم") ||
    normalizedKey.includes("أقسام") ||
    normalizedKey.includes("اقسام") ||
    normalizedKey.includes("عيادة") ||
    normalizedKey.includes("عيادات") ||
    normalizedKey.includes("فرع")
  ) {
    return Building2;
  }

  return Activity;
};

const normalizeStatisticDigits = (value) =>
  String(value ?? "")
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    )
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    );

const parseStatisticValue = (value) => {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      raw: "",
      number: null,
      suffix: "",
    };
  }

  const normalized = normalizeStatisticDigits(raw)
    .replace(/,/g, "");

  const match = normalized.match(
    /^(-?\d+(?:\.\d+)?)\s*(.*)$/
  );

  if (!match) {
    return {
      raw,
      number: null,
      suffix: "",
    };
  }

  const number = Number(match[1]);

  return {
    raw,
    number: Number.isFinite(number)
      ? number
      : null,
    suffix: match[2] || "",
  };
};

/* =========================================================
   DEFAULT ABOUT
========================================================= */

const DEFAULT_ABOUT = {
  title: "من نحن",

  description:
    " أمن وسلامة ورضاء العميل. تطوير الأداء ليتناسب مع معايير جودة الرعاية الصحية المعتمدة، وكذلك يحقق احتياجات المرضى وذويهم. رفع كفاءة ومهارات العاملين. إضافة خدمات جديدة حسب متطلبات المجتمع.",

  vision:
    "أن تصبح مستشفى رواد الطب التخصصي الاختيار الأول للمرضى، والرائدة في تقديم خدمات الرعاية الطبية بمستوى منافس للصروح الطبية على مستوى جمهورية مصر العربية، وفق معايير الجودة المصرية والعالمية.",

  mission:
    "تقديم خدمات الرعاية الصحية بأعلى مستوى من الكفاءة الطبية طبقًا لمعايير الجودة وسلامة المرضى، وتشمل أقسام الرعاية العاجلة والجراحات والعيادات الخارجية والرعاية المركزة والحضانات وأحدث الأجهزة الطبية، مع خدمة فندقية متميزة في بيئة آمنة، ومن خلال فريق طبي متميز وفريق إداري متكامل.",
};

/* =========================================================
   DEFAULT RIGHTS
========================================================= */

const DEFAULT_RIGHTS = [
  {
    title: "الخصوصية",
    description: "الحفاظ التام على خصوصية المريض",
    icon: "shield",
  },

  {
    title: "الاحترام",
    description: "معاملة كل مريض باحترام وتقدير",
    icon: "heart",
  },

  {
    title: "جودة الرعاية",
    description: "رعاية صحية بأعلى المعايير",
    icon: "award",
  },

  {
    title: "سلامة المريض",
    description: "بيئة آمنة خالية من الأخطار",
    icon: "shield-check",
  },

  {
    title: "السرية الطبية",
    description: "حماية المعلومات الطبية",
    icon: "lock",
  },

  {
    title: "حق المعرفة",
    description: "الإطلاع على التشخيص والعلاج",
    icon: "info",
  },
];

/* =========================================================
   DEFAULT WHY CHOOSE
========================================================= */

const DEFAULT_WHY_CHOOSE = [
  {
    title: "أطباء ذوو خبرة",
    description: "نخبة من أمهر الأطباء",
    icon: "user-md",
  },

  {
    title: "أحدث الأجهزة الطبية",
    description: "تقنيات طبية متطورة",
    icon: "cpu",
  },

  {
    title: "طوارئ 24/7",
    description: "خدمات طوارئ متواصلة",
    icon: "clock",
  },

  {
    title: "العناية المركزة ICU",
    description: "وحدة عناية مركزة مجهزة",
    icon: "activity",
  },

  {
    title: "خدمة سريعة",
    description: "سرعة في الإجراءات",
    icon: "zap",
  },

  {
    title: "تشخيص دقيق",
    description: "تشخيص بأحدث التقنيات",
    icon: "target",
  },
];

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const { content: aboutContent } =
    useSiteContent("about");

  const { content: rightsContent } =
    useSiteContent("patient_rights");

  const { content: whyContent } =
    useSiteContent("why_choose");

  const { data: stats = [] } =
    useStatistics();

  const { data: testimonials = [] } =
    useTestimonials();

  const { data: staff = [] } =
    useStaff();

  const { data: partners = [] } =
    usePartners();

  const about =
    aboutContent || DEFAULT_ABOUT;

  const rights =
    rightsContent?.items || DEFAULT_RIGHTS;

  const whyChoose =
    whyContent?.items || DEFAULT_WHY_CHOOSE;

  /* =========================================================
     SMART MARKETING BANNER

     - يظهر بعد 5 ثوانٍ من دخول الصفحة.
     - يظهر مرة واحدة فقط خلال نفس الـ session.
     - لا يغيّر أي API أو routing أو logic موجود.
  ========================================================= */

  const [showMarketingBanner, setShowMarketingBanner] =
    useState(false);

  useEffect(() => {
    const sessionKey =
      "rowad_home_marketing_banner_shown";

    const alreadyShown =
      window.sessionStorage.getItem(sessionKey);

    if (alreadyShown === "1") {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowMarketingBanner(true);
      window.sessionStorage.setItem(
        sessionKey,
        "1"
      );
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const closeMarketingBanner = () => {
    setShowMarketingBanner(false);
  };

  /* =========================================================
     HERO SLIDER
  ========================================================= */

  const [
    activeHeroImage,
    setActiveHeroImage,
  ] = useState(0);

  /*
   * Performance:
   * - نعرض صورة Hero واحدة فقط في الـ DOM بدل الأربع صور.
   * - نحمّل الصورة التالية مسبقًا فقط حتى يظل الانتقال سلسًا.
   * - التبديل كل 4.5 ثانية بدل ثانيتين لتقليل التحديثات المستمرة.
   */
  useEffect(() => {
    if (HERO_IMAGES.length <= 1) {
      return;
    }

    const nextImageIndex =
      (activeHeroImage + 1) %
      HERO_IMAGES.length;

    const preloader = new Image();
    preloader.decoding = "async";
  preloader.src =
  HERO_IMAGES[nextImageIndex].src;
  }, [activeHeroImage]);

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) {
      return;
    }

    const interval =
      window.setInterval(() => {
        if (document.hidden) {
          return;
        }

        setActiveHeroImage(
          (previous) =>
            (previous + 1) %
            HERO_IMAGES.length
        );
      }, 3500);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =========================================================
     TESTIMONIALS
  ========================================================= */

  const [
    activeTestimonial,
    setActiveTestimonial,
  ] = useState(0);

  useEffect(() => {
    if (!testimonials.length) return;

    const interval =
      window.setInterval(() => {
        if (document.hidden) return;

        setActiveTestimonial(
          (prev) =>
            (prev + 1) %
            testimonials.length
        );
      }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [testimonials.length]);

  /* =========================================================
     PARTNERS CAROUSEL
  ========================================================= */

  const carouselTrackRef =
    useRef(null);

  const animationFrameRef =
    useRef(null);

  const isCarouselVisibleRef =
    useRef(false);

  const isPausedRef =
    useRef(false);

  const isDraggingRef =
    useRef(false);

  const dragStartXRef =
    useRef(0);

  const dragStartScrollRef =
    useRef(0);

  const resumeTimerRef =
    useRef(null);

  const carouselPartners =
    useMemo(() => {
      if (
        !Array.isArray(partners) ||
        !partners.length
      ) {
        return [];
      }

      const sortedPartners = [
        ...partners,
      ].sort(
        (a, b) =>
          Number(b.id || 0) -
          Number(a.id || 0)
      );

      const repeatCount =
        Math.max(
          3,
          Math.ceil(
            8 /
              sortedPartners.length
          ) + 2
        );

      return Array.from(
        {
          length: repeatCount,
        },
        () => sortedPartners
      ).flat();
    }, [partners]);

  const pauseCarousel =
    useCallback(() => {
      isPausedRef.current = true;

      if (
        resumeTimerRef.current
      ) {
        window.clearTimeout(
          resumeTimerRef.current
        );
      }
    }, []);

  const resumeCarousel =
    useCallback((delay = 0) => {
      if (
        resumeTimerRef.current
      ) {
        window.clearTimeout(
          resumeTimerRef.current
        );
      }

      resumeTimerRef.current =
        window.setTimeout(() => {
          isPausedRef.current =
            false;
        }, delay);
    }, []);

  const getLoopWidth =
    useCallback(() => {
      const track =
        carouselTrackRef.current;

      if (
        !track ||
        !partners.length
      ) {
        return 0;
      }

      const cards =
        track.querySelectorAll(
          ".partner-card"
        );

      if (
        cards.length <=
        partners.length
      ) {
        return 0;
      }

      return (
        cards[
          partners.length
        ].offsetLeft -
        cards[0].offsetLeft
      );
    }, [partners.length]);

  const normalizeCarousel =
    useCallback(() => {
      const track =
        carouselTrackRef.current;

      if (
        !track ||
        !partners.length
      ) {
        return;
      }

      const loopWidth =
        getLoopWidth();

      if (!loopWidth) return;

      const maxScroll =
        track.scrollWidth -
        track.clientWidth;

      if (
        track.scrollLeft >=
        maxScroll - 2
      ) {
        track.scrollLeft -=
          loopWidth;
      } else if (
        track.scrollLeft <= 2
      ) {
        track.scrollLeft +=
          loopWidth;
      }
    }, [
      getLoopWidth,
      partners.length,
    ]);

  const getPartnerStep =
    useCallback(() => {
      const track =
        carouselTrackRef.current;

      if (!track) {
        return 220;
      }

      const card =
        track.querySelector(
          ".partner-card"
        );

      if (!card) {
        return 220;
      }

      const cardWidth =
        card.getBoundingClientRect()
          .width;

      const styles =
        window.getComputedStyle(
          track
        );

      const gap =
        parseFloat(
          styles.columnGap ||
            styles.gap ||
            "24"
        ) || 24;

      return cardWidth + gap;
    }, []);

  const moveCarousel =
    useCallback(
      (direction) => {
        const track =
          carouselTrackRef.current;

        if (
          !track ||
          !partners.length
        ) {
          return;
        }

        pauseCarousel();

        const amount =
          getPartnerStep();

        track.scrollBy({
          left:
            direction === "next"
              ? amount
              : -amount,
          behavior: "smooth",
        });

        window.setTimeout(() => {
          normalizeCarousel();
        }, 650);

        resumeCarousel(2500);
      },
      [
        partners.length,
        pauseCarousel,
        resumeCarousel,
        getPartnerStep,
        normalizeCarousel,
      ]
    );

  const handlePointerDown =
    useCallback(
      (event) => {
        const track =
          carouselTrackRef.current;

        if (
          !track ||
          !partners.length
        ) {
          return;
        }

        pauseCarousel();

        isDraggingRef.current =
          true;

        dragStartXRef.current =
          event.clientX;

        dragStartScrollRef.current =
          track.scrollLeft;

        track.setPointerCapture?.(
          event.pointerId
        );
      },
      [
        partners.length,
        pauseCarousel,
      ]
    );

  const handlePointerMove =
    useCallback(
      (event) => {
        if (
          !isDraggingRef.current
        ) {
          return;
        }

        const track =
          carouselTrackRef.current;

        if (!track) return;

        const distance =
          event.clientX -
          dragStartXRef.current;

        track.scrollLeft =
          dragStartScrollRef.current -
          distance;

        normalizeCarousel();
      },
      [normalizeCarousel]
    );

  const handlePointerUp =
    useCallback(
      (event) => {
        const track =
          carouselTrackRef.current;

        if (
          !track ||
          !isDraggingRef.current
        ) {
          return;
        }

        try {
          track.releasePointerCapture?.(
            event.pointerId
          );
        } catch {
          // Pointer already released.
        }

        isDraggingRef.current =
          false;

        normalizeCarousel();

        resumeCarousel(2200);
      },
      [
        normalizeCarousel,
        resumeCarousel,
      ]
    );

  useEffect(() => {
    const track =
      carouselTrackRef.current;

    if (
      !track ||
      !partners.length
    ) {
      return;
    }

    let initialFrame = null;
    let resizeFrame = null;
    let lastCarouselMoveTime = 0;

  
    const setInitialPosition =
      () => {
        const loopWidth =
          getLoopWidth();

        if (loopWidth > 0) {
          track.scrollLeft =
            loopWidth;
        }
      };

    initialFrame =
      window.requestAnimationFrame(
        setInitialPosition
      );

    const stopAnimation = () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    };

    const animate = (timestamp) => {
      animationFrameRef.current =
        null;

      if (
        !isCarouselVisibleRef.current ||
        document.hidden ||
        prefersReducedMotion
      ) {
        return;
      }

      /*
       * نقلل عمليات scroll/layout إلى حوالي 30fps بدل كل frame.
       * الشكل يظل سلسًا لكن استهلاك المعالج أقل، خصوصًا على الموبايل.
       */
      if (
        !isPausedRef.current &&
        !isDraggingRef.current &&
        timestamp -
          lastCarouselMoveTime >=
          32
      ) {
        track.scrollLeft += 1;

        normalizeCarousel();

        lastCarouselMoveTime =
          timestamp;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(
          animate
        );
    };

    const startAnimation = () => {
      if (
        animationFrameRef.current ===
          null &&
        isCarouselVisibleRef.current &&
        !document.hidden &&
        !prefersReducedMotion
      ) {
        animationFrameRef.current =
          window.requestAnimationFrame(
            animate
          );
      }
    };

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          isCarouselVisibleRef.current =
            entry.isIntersecting;

          if (
            entry.isIntersecting
          ) {
            startAnimation();
          } else {
            stopAnimation();
          }
        },
        {
          rootMargin:
            "200px 0px",
          threshold: 0,
        }
      );

    observer.observe(track);

    const handleVisibility =
      () => {
        if (document.hidden) {
          stopAnimation();
        } else {
          startAnimation();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    const handleResize = () => {
      if (resizeFrame) {
        window.cancelAnimationFrame(
          resizeFrame
        );
      }

      resizeFrame =
        window.requestAnimationFrame(
          () => {
            const loopWidth =
              getLoopWidth();

            if (loopWidth > 0) {
              track.scrollLeft =
                loopWidth;
            }
          }
        );
    };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      }
    );

    return () => {
      observer.disconnect();

      stopAnimation();

      if (initialFrame) {
        window.cancelAnimationFrame(
          initialFrame
        );
      }

      if (resizeFrame) {
        window.cancelAnimationFrame(
          resizeFrame
        );
      }

      if (
        resumeTimerRef.current
      ) {
        window.clearTimeout(
          resumeTimerRef.current
        );
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    partners.length,
    getLoopWidth,
    normalizeCarousel,
  ]);

  return (
    <div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[92vh] items-center overflow-hidden bg-[#0f5963]">

        {/* HERO SLIDER IMAGES */}

        <div className="absolute inset-0 z-0 overflow-hidden [perspective:1300px]">
          <style>{`
            @keyframes rowadHeroFadeIn {
              from { opacity: 0.35; }
              to { opacity: 1; }
            }

            .rowad-hero-fade {
              animation: rowadHeroFadeIn 900ms ease-out both;
            }

            @media (prefers-reduced-motion: reduce) {
              .rowad-hero-fade {
                animation: none !important;
              }
            }
          `}</style>
<img
  key={HERO_IMAGES[activeHeroImage].src}
  src={HERO_IMAGES[activeHeroImage].src}
  alt="مستشفى رواد الطب"
  fetchPriority={
    activeHeroImage === 0
      ? "high"
      : "auto"
  }
  loading="eager"
  decoding="async"
  style={{
    objectPosition:
      HERO_IMAGES[activeHeroImage].position,
  }}
  className="
    hero-image-3d
    rowad-hero-fade
    absolute
    inset-0
    w-full
    h-full
    object-cover
  "
/>



          {/* OVERLAY ثابت فوق كل الصور */}

          <div
            className="
              absolute
              inset-0
              z-10
              bg-[linear-gradient(90deg,rgba(149,50,56,0.12)_0%,rgba(25,119,134,0.08)_30%,rgba(19,94,105,0.48)_65%,rgba(12,67,76,0.90)_100%)]
            "
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-10
              h-[45%]
              bg-gradient-to-t
              from-[#124f58]/60
              via-[#124f58]/10
              to-transparent
            "
          />
        </div>

        <div
          className="
            absolute
            z-[1]
            top-[10%]
            -right-[15%]
            w-[65%]
            h-[85%]
            rounded-[100px]
            bg-white/[0.045]
            backdrop-blur-[2px]
            border
            border-white/[0.07]
            rotate-[-6deg]
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            z-[1]
            top-[23%]
            right-[4%]
            w-[45%]
            h-[58%]
            rounded-[70px]
            bg-[#D1F9FC]/[0.035]
            border
            border-white/[0.06]
            rotate-[4deg]
            pointer-events-none
          "
        />

        <div className="container-custom relative z-10 pt-28 pb-32">
          <div className="max-w-[760px] ml-auto text-right">

            <Reveal>
              <div className="mb-7">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-3
                    px-5
                    py-2.5
                    rounded-full
                    bg-white/[0.10]
                    backdrop-blur-xl
                    border
                    border-white/20
                    text-white
                    text-lg
                    font-bold
                    shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                  "
                >
                  <span
                    className="
                      w-7
                      h-7
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-[#D1F9FC]/15
                      text-[#D1F9FC]
                    "
                  >
                    <Cross className="w-4 h-4" />
                  </span>

                  رعاية متكاملة لأن صحتك تستحق الأفضل
                </span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1
                className="
                  text-[46px]
                  sm:text-5xl
                  md:text-6xl
                  lg:text-[72px]
                  font-black
                  text-white
                  leading-[1.15]
                  mb-6
                "
              >
                مستشفى رواد الطب

                <span className="relative block w-fit mt-2">
                  <span
                    className="
                      relative
                      z-10
                      bg-[linear-gradient(90deg,#FFFFFF_0%,#D1F9FC_50%,#83BDC4_100%)]
                      bg-clip-text
                      text-transparent
                    "
                  >
                    التخصصي
                  </span>

                  <span
                    className="
                      absolute
                      bottom-2
                      right-0
                      w-[105%]
                      h-3
                      rounded-full
                      bg-[#953238]/35
                      -rotate-1
                      blur-[1px]
                    "
                  />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-[3px] rounded-full bg-[#83BDC4]" />
                <div className="w-2 h-2 rounded-full bg-[#953238]" />
                <div className="w-7 h-[3px] rounded-full bg-white/40" />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <p
                className="
                  max-w-2xl
                  text-xl
                  md:text-2xl
                  lg:text-3xl
                  leading-[1.8]
                  text-white
                  font-semibold
                  mb-9
                "
              >
                صرح طبي رائد يجمع بين الخبرة الطبية والتقنيات الحديثة
                والرعاية الإنسانية، لنقدم لك ولعائلتك تجربة صحية آمنة
                ومتكاملة تضع راحتك وصحتك أولاً.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  items-stretch
                  sm:items-center
                  gap-4
                "
              >
                <Link
                  to="/clinics"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    min-w-[170px]
                    px-8
                    py-4
                    rounded-2xl
                    bg-[#953238]
                    text-white
                    text-base
                    font-extrabold
                    shadow-[0_12px_35px_rgba(149,50,56,0.30)]
                    transition-all
                    duration-500
                    ease-out
                    hover:bg-[#7C3439]
                    hover:-translate-y-1
                    hover:shadow-[0_18px_45px_rgba(149,50,56,0.42)]
                  "
                >
                  احجز الآن

                  <ArrowLeft
                    className="
                      w-5
                      h-5
                      transition-transform
                      duration-500
                      group-hover:-translate-x-1.5
                    "
                  />
                </Link>

                <Link
                  to="/about"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    min-w-[170px]
                    px-8
                    py-4
                    rounded-2xl
                    bg-white/[0.08]
                    backdrop-blur-xl
                    border
                    border-white/25
                    text-white
                    text-base
                    font-bold
                    transition-all
                    duration-500
                    hover:bg-white/[0.16]
                    hover:border-white/40
                    hover:-translate-y-1
                  "
                >
                  تعرف علينا
                </Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  w-fit
                  rounded-[22px]
                  bg-white/[0.075]
                  backdrop-blur-xl
                  border
                  border-white/[0.14]
                  overflow-hidden
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3.5
                    hover:bg-white/[0.08]
                    transition-all
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-[#83BDC4]" />

                  <span className="text-white/90 text-sm font-bold">
                    نخبة من الأطباء
                  </span>
                </div>

                <div className="hidden sm:block w-px bg-white/15 my-3" />

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3.5
                    hover:bg-white/[0.08]
                    transition-all
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-[#D1F9FC]" />

                  <span className="text-white/90 text-sm font-bold">
                    أحدث التقنيات الطبية
                  </span>
                </div>

                <div className="hidden sm:block w-px bg-white/15 my-3" />

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3.5
                    hover:bg-white/[0.08]
                    transition-all
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-[#CCAEB0]" />

                  <span className="text-white/90 text-sm font-bold">
                    رعاية صحية متكاملة
                  </span>
                </div>
              </div>
            </Reveal>

          </div>
        </div>

        <div
          className="
            absolute
            bottom-[-1px]
            left-0
            right-0
            z-[5]
            pointer-events-none
          "
        >
          <svg
            viewBox="0 0 1440 100"
            className="w-full h-[70px] md:h-[95px]"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,65 C260,105 420,20 720,58 C990,93 1160,27 1440,55 L1440,100 L0,100 Z"
              fill="#FAF6F6"
            />
          </svg>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary-50 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary-50 translate-x-1/2 translate-y-1/2" />

        <div className="container-custom relative">
          <Reveal>
            <SectionHeading
              badge="من نحن"
              title="نحن هنا من أجل صحتك"
              subtitle="مستشفى رواد الطب التخصصي صرح طبي رائد يقدم رعاية صحية متكاملة بأعلى المعايير العالمية"
            />
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">

            <Reveal className="h-full">
              <div
                className="
                  relative
                  h-full
                  transition-transform
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  hover:scale-[1.06]
                  hover:z-20
                "
              >
                <div className="card card-lift p-8 h-full border-t-4 border-primary-500">
                  <div className="icon-circle bg-primary-100 text-primary-600 mb-6">
                    <Cross className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-800 mb-4">
                    عن المستشفى
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {about.description}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal
              delay={100}
              className="h-full"
            >
              <div
                className="
                  relative
                  h-full
                  transition-transform
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  hover:scale-[1.06]
                  hover:z-20
                "
              >
                <div className="card card-lift p-8 h-full border-t-4 border-secondary-500">
                  <div className="icon-circle bg-secondary-100 text-secondary-600 mb-6">
                    <Eye className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-800 mb-4">
                    الرؤية
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {about.vision}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal
              delay={200}
              className="h-full"
            >
              <div
                className="
                  relative
                  h-full
                  transition-transform
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  hover:scale-[1.06]
                  hover:z-20
                "
              >
                <div className="card card-lift p-8 h-full border-t-4 border-accent-500">
                  <div className="icon-circle bg-accent-100 text-accent-600 mb-6">
                    <Target className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-800 mb-4">
                    الرسالة
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {about.mission}
                  </p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* =====================================================
          PATIENT RIGHTS
      ===================================================== */}

      <section
        className="
          section-padding
          relative
          overflow-hidden
          bg-[linear-gradient(135deg,#FAF6F6_0%,#F4FAFA_48%,#D1F9FC_100%)]
        "
      >
        <div
          className="
            absolute
            top-0
            left-0
            w-full
            h-[3px]
            bg-[linear-gradient(90deg,#953238_0%,#83BDC4_45%,#197786_100%)]
          "
        />

        <div className="container-custom relative z-10">
          <Reveal>
            <SectionHeading
              badge="حقوق المرضى"
              title="نحن نحترم حقوقك"
              subtitle="نلتزم بأعلى معايير حقوق المرضى لضمان رعاية عادلة وآمنة للجميع"
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rights.map(
              (right, idx) => {
                const Icon =
                  patientRightsIcons[
                    right.icon
                  ] || Shield;

                return (
                  <Reveal
                    key={idx}
                    delay={
                      idx * 110
                    }
                  >
                    <div
                      className="
                        group
                        relative
                        h-full
                        overflow-hidden
                        rounded-[24px]
                        bg-white/95
                        border
                        border-[#E7E3E3]
                        p-10
                        shadow-[0_8px_30px_rgba(25,119,134,0.07)]
                        transition-all
                        duration-500
                        ease-out
                        hover:-translate-y-2
                        hover:border-[#83BDC4]
                        hover:shadow-[0_20px_50px_rgba(25,119,134,0.15)]
                      "
                    >
                      <div
                        className="
                          absolute
                          top-0
                          right-0
                          h-[3px]
                          w-0
                          bg-[linear-gradient(90deg,#953238,#197786)]
                          transition-all
                          duration-500
                          group-hover:w-full
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-[linear-gradient(135deg,rgba(209,249,252,0.28),rgba(250,246,246,0.15))]
                          opacity-0
                          transition-opacity
                          duration-500
                          group-hover:opacity-100
                          pointer-events-none
                        "
                      />

                      <div className="relative z-10 flex items-start gap-4">
                        <div
                          className="
                            w-14
                            h-14
                            rounded-2xl
                            shrink-0
                            flex
                            items-center
                            justify-center
                            bg-[linear-gradient(135deg,#197786_0%,#83BDC4_100%)]
                            text-white
                            shadow-[0_8px_22px_rgba(25,119,134,0.18)]
                            transition-all
                            duration-500
                            group-hover:scale-110
                            group-hover:-rotate-3
                          "
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        <div>
                          <h3
                            className="
                              text-xl
                              font-bold
                              text-[#2F3437]
                              mb-2
                              group-hover:text-[#197786]
                              transition-colors
                            "
                          >
                            {right.title}
                          </h3>

                          <p className="text-[#6D686A] text-sm leading-7">
                            {
                              right.description
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE
      ===================================================== */}

      <section className="section-padding bg-white relative overflow-hidden">
        <div className="container-custom relative">
          <Reveal>
            <SectionHeading
              badge="لماذا نحن"
              title="لماذا تختار مستشفى رواد الطب"
              subtitle="نقدم لك أسباباً وجيهة لاختيارنا وجهتك الصحية الأولى"
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map(
              (item, idx) => {
                const Icon =
                  whyChooseIcons[
                    item.icon
                  ] || Award;

                return (
                  <Reveal
                    key={idx}
                    delay={
                      idx * 80
                    }
                  >
                    <div
                      className="
                        card
                        card-lift
                        p-8
                        text-center
                        group
                        relative
                        overflow-hidden
                        border
                        border-[#E7E3E3]
                        transition-all
                        duration-500
                        ease-out
                        hover:-translate-y-2
                        hover:border-[#83BDC4]
                        hover:shadow-[0_18px_45px_rgba(25,119,134,0.14)]
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-x-0
                          bottom-0
                          h-full
                          bg-[linear-gradient(180deg,#D1F9FC_0%,#E8FAFB_55%,#F3FCFC_100%)]
                          translate-y-full
                          group-hover:translate-y-0
                          transition-transform
                          duration-700
                          ease-[cubic-bezier(0.22,1,0.36,1)]
                          pointer-events-none
                        "
                      />

                      <div
                        className="
                          absolute
                          -left-[50%]
                          bottom-0
                          w-[40%]
                          h-[150%]
                          bg-white/35
                          blur-2xl
                          translate-y-full
                          -rotate-12
                          group-hover:translate-y-[-20%]
                          group-hover:left-[120%]
                          transition-all
                          duration-[1100ms]
                          ease-out
                          pointer-events-none
                        "
                      />

                      <div className="relative z-10">
                        <div
                          className="
                            w-20
                            h-20
                            mx-auto
                            rounded-3xl
                            bg-gradient-to-br
                            from-primary-100
                            to-secondary-100
                            flex
                            items-center
                            justify-center
                            mb-5
                            transition-all
                            duration-500
                            group-hover:bg-[#197786]
                            group-hover:scale-110
                            group-hover:-translate-y-1
                            group-hover:shadow-[0_10px_25px_rgba(25,119,134,0.25)]
                          "
                        >
                          <Icon
                            className="
                              w-10
                              h-10
                              text-primary-600
                              transition-all
                              duration-500
                              group-hover:text-white
                            "
                          />
                        </div>

                        <h3
                          className="
                            text-xl
                            font-bold
                            text-slate-800
                            mb-3
                            transition-colors
                            group-hover:text-[#197786]
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            text-slate-600
                            leading-relaxed
                            transition-colors
                            group-hover:text-[#2F3437]
                          "
                        >
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1280"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-l
              from-primary-900/95
              to-secondary-900/90
            "
          />
        </div>

        <div className="container-custom relative z-10">
          <Reveal>
            <SectionHeading
              title="إنجازاتنا بالأرقام"
              subtitle="أرقام تعكس التزامنا بخدمة المجتمع"
              light
            />
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stats.map(
              (stat, idx) => {
                const Icon =
                  getStatisticIcon(
                    stat.key
                  );

                const counter =
                  parseStatisticValue(
                    stat.value
                  );

                return (
                  <Reveal
                    key={stat.id}
                    delay={
                      idx * 80
                    }
                  >
                    <div className="text-center group">
                      <div
                        className="
                          w-16
                          h-16
                          mx-auto
                          rounded-2xl
                          bg-white/10
                          backdrop-blur-md
                          flex
                          items-center
                          justify-center
                          mb-4
                          group-hover:scale-110
                          group-hover:bg-white/20
                          transition-all
                          duration-300
                        "
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                        {counter.number !== null ? (
                          <AnimatedCounter
                            value={
                              counter.number
                            }
                            suffix={
                              counter.suffix
                            }
                            withPulse
                          />
                        ) : (
                          counter.raw
                        )}
                      </div>

                      <p className="text-slate-300 text-sm font-bold">
                        {stat.key}
                      </p>
                    </div>
                  </Reveal>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PARTNERS
      ===================================================== */}

      <section
        className="
          section-padding
          relative
          overflow-hidden
          bg-[linear-gradient(135deg,#FAF6F6_0%,#F4FAFA_50%,#D1F9FC_100%)]
        "
      >
        <div className="container-custom relative">
          <Reveal>
            <SectionHeading
              badge="شركاء النجاح"
              title="شراكات نفخر بها"
              subtitle="نعتز بثقة شركائنا وتعاونهم معنا لتقديم رعاية صحية متكاملة بأعلى مستوى من الجودة"
            />
          </Reveal>

          <div className="relative mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label="الانتقال إلى السابق"
                  onClick={() =>
                    moveCarousel(
                      "prev"
                    )
                  }
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#83BDC4]/40
                    bg-white/90
                    backdrop-blur-xl
                    text-[#197786]
                    shadow-[0_8px_25px_rgba(25,119,134,0.10)]
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:bg-[#197786]
                    hover:text-white
                    hover:border-[#197786]
                  "
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="الانتقال إلى التالي"
                  onClick={() =>
                    moveCarousel(
                      "next"
                    )
                  }
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#83BDC4]/40
                    bg-white/90
                    backdrop-blur-xl
                    text-[#197786]
                    shadow-[0_8px_25px_rgba(25,119,134,0.10)]
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:bg-[#197786]
                    hover:text-white
                    hover:border-[#197786]
                  "
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                className="
                  pointer-events-none
                  absolute
                  right-0
                  top-0
                  bottom-0
                  z-20
                  w-10
                  md:w-16
                  bg-gradient-to-l
                  from-[#EEF9FA]
                  via-[#EEF9FA]/60
                  to-transparent
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  left-0
                  top-0
                  bottom-0
                  z-20
                  w-10
                  md:w-16
                  bg-gradient-to-r
                  from-[#F6F8F8]
                  via-[#F6F8F8]/60
                  to-transparent
                "
              />

              <div
                ref={
                  carouselTrackRef
                }
                dir="ltr"
                onPointerDown={
                  handlePointerDown
                }
                onPointerMove={
                  handlePointerMove
                }
                onPointerUp={
                  handlePointerUp
                }
                onPointerCancel={
                  handlePointerUp
                }
                className="
                  flex
                  gap-5
                  overflow-x-scroll
                  overflow-y-hidden
                  px-3
                  py-7
                  select-none
                  touch-pan-y
                  cursor-grab
                  active:cursor-grabbing
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {carouselPartners.map(
                  (
                    partner,
                    idx
                  ) => (
                    <div
                      key={`${partner.id}-${idx}`}
                      dir="rtl"
                      className="
                        partner-card
                        group
                        shrink-0
                        w-[150px]
                        sm:w-[180px]
                        md:w-[195px]
                        lg:w-[200px]
                        transition-transform
                        duration-500
                        hover:-translate-y-2
                      "
                    >
                      <div
                        className="
                          flex
                          h-full
                          min-h-[220px]
                          flex-col
                          items-center
                          justify-center
                          gap-3
                          rounded-[24px]
                          border
                          border-[#E7E3E3]
                          bg-white
                          px-4
                          py-5
                          text-center
                          shadow-[0_8px_28px_rgba(25,119,134,0.06)]
                          transition-all
                          duration-500
                          ease-out
                          group-hover:border-[#83BDC4]
                          group-hover:shadow-[0_18px_40px_rgba(25,119,134,0.14)]
                        "
                      >
                        <div
                          className="
                            flex
                            h-[95px]
                            w-full
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#FAF6F6]/60
                            p-3
                          "
                        >
                          <PlaceholderImage
                            type="company"
                            src={
                              partner.logo_url
                            }
                            alt={
                              partner.name
                            }
                            className="
                              h-[75px]
                              w-full
                              object-contain
                              transition-transform
                              duration-500
                              group-hover:scale-105
                            "
                            rounded="rounded-xl"
                          />
                        </div>

                        <h3
                          className="
                            text-sm
                            sm:text-base
                            font-bold
                            text-[#2F3437]
                            transition-colors
                            duration-300
                            group-hover:text-[#197786]
                          "
                        >
                          {
                            partner.name
                          }
                        </h3>

                        {partner.description && (
                          <p
                            className="
                              px-1
                              text-lg
                              sm:text-sm
                              leading-6
                            whitespace-normal
                             break-words
                            "
                          >
                            {partner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STAFF
      ===================================================== */}

      <section
        className="
          section-padding
          relative
          overflow-hidden
          bg-[linear-gradient(135deg,#FAF6F6_0%,#D1F9FC_100%)]
        "
      >
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#83BDC4]/30 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />

        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#CCAEB0]/20 translate-x-1/2 translate-y-1/2 animate-float-reverse" />

        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-[#953238]/10 blur-3xl animate-pulse-slow" />

        <div className="container-custom relative z-10">
          <Reveal>
            <SectionHeading
              badge="فريق الإدارة"
              title="فريقنا الإداري"
              subtitle="قيادة متميزة تقود المستشفى نحو التميز"
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {staff.map(
              (member, idx) => (
                <Reveal
                  key={
                    member.id
                  }
                  delay={
                    idx * 120
                  }
                  className="h-full"
                >
                  <div
                    className="
                      card
                      card-lift
                      h-full
                      p-6
                      text-center
                      group
                      relative
                      overflow-hidden
                      border-t-4
                      border-[#197786]
                      transition-all
                      duration-500
                      ease-out
                      hover:-translate-y-3
                      hover:shadow-2xl
                    "
                  >
                    <div
                      className="
                        relative
                        inline-block
                        mb-5
                        transition-all
                        duration-500
                        group-hover:-translate-y-1
                        group-hover:scale-105
                      "
                    >
                      <PlaceholderImage
                        type="admin"
                        src={
                          member.image_url
                        }
                        alt={
                          member.name
                        }
                        className="w-28 h-28"
                        rounded="rounded-full"
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          rounded-full
                          bg-gradient-to-br
                          from-primary-500/0
                          to-secondary-500/0
                          group-hover:from-primary-500/20
                          group-hover:to-secondary-500/20
                          transition-all
                          duration-500
                          pointer-events-none
                        "
                      />
                    </div>

                    <h3
                      className="
                        text-2xl
                        font-bold
                        text-slate-800
                        mb-1
                        transition-colors
                        duration-300
                        group-hover:text-[#197786]
                      "
                    >
                      {
                        member.name
                      }
                    </h3>

                    <p className="text-[#197786] font-bold text-lg mb-3">
                      {
                        member.position
                      }
                    </p>

                    {member.description && (
                      <p className="text-slate-600 text-lg leading-relaxed mb-4">
                        {
                          member.description
                        }
                      </p>
                    )}
                  </div>
                </Reveal>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}

      <section
        className="
          section-padding
          bg-gradient-to-br
          from-primary-900
          to-secondary-900
          relative
          overflow-hidden
        "
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />

        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary-500/20 blur-3xl" />

        <div className="container-custom relative">
          <Reveal>
            <SectionHeading
              badge="آراء المرضى"
              title="ماذا يقول مرضانا"
              subtitle="تجارب حقيقية من مرضى وثقوا بنا"
              light
            />
          </Reveal>

          {testimonials.length >
            0 && (
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <div className="glass rounded-3xl p-8 md:p-12 text-center">

                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({
                      length:
                        testimonials[
                          activeTestimonial
                        ]
                          ?.rating ||
                        5,
                    }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="
                            w-6
                            h-6
                            text-warning-400
                            fill-warning-400
                          "
                        />
                      )
                    )}
                  </div>

                  <p className="text-xl md:text-2xl text-white leading-relaxed mb-6 font-medium">
                    "
                    {
                      testimonials[
                        activeTestimonial
                      ]?.text
                    }
                    "
                  </p>

                  <div className="flex items-center justify-center gap-4">
                    <PlaceholderImage
                      type="patient"
                      src={
                        testimonials[
                          activeTestimonial
                        ]
                          ?.image_url
                      }
                      alt={
                        testimonials[
                          activeTestimonial
                        ]
                          ?.patient_name
                      }
                      className="w-16 h-16"
                      rounded="rounded-full"
                    />

                    <div className="text-right">
                      <h4 className="font-bold text-white text-lg">
                        {
                          testimonials[
                            activeTestimonial
                          ]
                            ?.patient_name
                        }
                      </h4>

                      <p className="text-slate-300 text-sm">
                        مريض
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map(
                  (_, idx) => (
                    <button
                      key={
                        idx
                      }
                      type="button"
                      onClick={() =>
                        setActiveTestimonial(
                          idx
                        )
                      }
                      className={`
                        h-2.5
                        rounded-full
                        transition-all
                        duration-300
                        ${
                          idx ===
                          activeTestimonial
                            ? "w-8 bg-white"
                            : "w-2.5 bg-white/40"
                        }
                      `}
                      aria-label={`الرأي ${
                        idx +
                        1
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="py-20 bg-white">
        <div className="container-custom">
          <Reveal>
            <div
              className="
                relative
                rounded-3xl
                overflow-hidden
                p-10
                md:p-16
                text-center
              "
            >
              <div className="absolute inset-0 animated-gradient" />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  هل تحتاج إلى موعد؟
                </h2>

                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  احجز موعدك الآن مع نخبة من أمهر الأطباء في مختلف التخصصات
                </p>

                <Link
                  to="/clinics"
                  className="
                    btn
                    bg-white
                    text-primary-700
                    hover:bg-slate-100
                    text-lg
                    px-8
                    py-4
                    group
                  "
                >
                  احجز موعدك الآن

                  <ArrowLeft
                    className="
                      w-5
                      h-5
                      group-hover:-translate-x-1
                      transition-transform
                    "
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          SMART MARKETING BANNER

          يظهر بعد 5 ثوانٍ فقط ومرة واحدة في الـ session.
          Fixed، لذلك لا يغيّر مقاسات أو ترتيب أي Section.
      ===================================================== */}

      <div
        className={`
          fixed
          inset-x-3
          bottom-3
          sm:inset-x-5
          sm:bottom-5
          z-[80]
          flex
          justify-center
          transition-all
          duration-1000
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            showMarketingBanner
              ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
              : "translate-y-20 scale-[0.96] opacity-0 pointer-events-none"
          }
        `}
        aria-hidden={!showMarketingBanner}
      >
        
        <div
          dir="rtl"
          className="
            group/marketing
            relative
            w-full
            max-w-6xl
            pt-10
          "
        >
          {/* =====================================================
              CLOUD SHAPES
          ===================================================== */}


       

      

          {/* =====================================================
              MAIN CLOUD BODY
          ===================================================== */}

          <div
            className="
              relative
              z-10
              overflow-hidden
              border
              border-white/80
              bg-[linear-gradient(135deg,rgba(255,255,255,0.99)_0%,rgba(244,250,250,0.99)_45%,rgba(209,249,252,0.97)_100%)]
              backdrop-blur-2xl
              shadow-[0_30px_90px_rgba(15,89,99,0.30)]
              transition-all
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover/marketing:-translate-y-2
              group-hover/marketing:shadow-[0_40px_100px_rgba(15,89,99,0.38)]
            "
            style={{
              borderRadius:
                "52px 76px 58px 82px / 68px 52px 76px 58px",
            }}
          >
            {/* =====================================================
                ANIMATED BORDER DRAWING
            ===================================================== */}

            <div className="pointer-events-none absolute inset-0 z-30">
              {/* TOP LINE */}
              <span
                className="
                  absolute
                  right-[8%]
                  top-0
                  h-[3px]
                  w-0
                  rounded-full
                  bg-[linear-gradient(90deg,#953238_0%,#83BDC4_48%,#197786_100%)]
                  shadow-[0_0_14px_rgba(25,119,134,0.30)]
                  transition-all
                  duration-700
                  ease-out
                  group-hover/marketing:w-[84%]
                "
              />

              {/* RIGHT LINE */}
              <span
                className="
                  absolute
                  right-0
                  top-[13%]
                  h-0
                  w-[3px]
                  rounded-full
                  bg-[linear-gradient(180deg,#197786_0%,#83BDC4_55%,#953238_100%)]
                  shadow-[0_0_14px_rgba(25,119,134,0.25)]
                  transition-all
                  duration-700
                  delay-150
                  ease-out
                  group-hover/marketing:h-[74%]
                "
              />

              {/* BOTTOM LINE */}
              <span
                className="
                  absolute
                  bottom-0
                  left-[8%]
                  h-[3px]
                  w-0
                  rounded-full
                  bg-[linear-gradient(90deg,#197786_0%,#83BDC4_48%,#953238_100%)]
                  shadow-[0_0_14px_rgba(149,50,56,0.22)]
                  transition-all
                  duration-700
                  delay-300
                  ease-out
                  group-hover/marketing:w-[84%]
                "
              />

              {/* LEFT LINE */}
              <span
                className="
                  absolute
                  bottom-[13%]
                  left-0
                  h-0
                  w-[3px]
                  rounded-full
                  bg-[linear-gradient(0deg,#953238_0%,#83BDC4_55%,#197786_100%)]
                  shadow-[0_0_14px_rgba(149,50,56,0.20)]
                  transition-all
                  duration-700
                  delay-500
                  ease-out
                  group-hover/marketing:h-[74%]
                "
              />

              {/* CORNER DOT 1 */}
              <span
                className="
                  absolute
                  right-[7.5%]
                  top-[-4px]
                  h-2.5
                  w-2.5
                  scale-0
                  rounded-full
                  bg-[#953238]
                  shadow-[0_0_18px_rgba(149,50,56,0.55)]
                  transition-all
                  duration-300
                  delay-100
                  group-hover/marketing:scale-100
                "
              />

              {/* CORNER DOT 2 */}
              <span
                className="
                  absolute
                  bottom-[-4px]
                  left-[7.5%]
                  h-2.5
                  w-2.5
                  scale-0
                  rounded-full
                  bg-[#197786]
                  shadow-[0_0_18px_rgba(25,119,134,0.55)]
                  transition-all
                  duration-300
                  delay-500
                  group-hover/marketing:scale-100
                "
              />
            </div>

            {/* =====================================================
                MOVING LIGHT SWEEP
            ===================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -left-[45%]
                top-[-70%]
                z-[2]
                h-[250%]
                w-[20%]
                rotate-[18deg]
                bg-white/50
                blur-2xl
                transition-all
                duration-[1400ms]
                ease-out
                group-hover/marketing:left-[125%]
              "
            />

            {/* =====================================================
                DECORATIVE GLOWS
            ===================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                bg-[#83BDC4]/35
                blur-3xl
                motion-safe:animate-pulse
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                left-10
                h-56
                w-56
                rounded-full
                bg-[#953238]/15
                blur-3xl
                
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                left-[43%]
                top-1/2
                h-36
                w-36
                -translate-y-1/2
                rounded-full
                bg-white/60
                blur-3xl
              "
            />

            {/* =====================================================
                SMALL FLOATING DOTS
            ===================================================== */}

            <span
              className="
                pointer-events-none
                absolute
                right-[5%]
                top-[32%]
                h-2
                w-2
                rounded-full
                bg-[#953238]/55
                transition-all
                duration-700
                group-hover/marketing:-translate-y-3
                group-hover/marketing:scale-150
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                right-[47%]
                bottom-[15%]
                h-2.5
                w-2.5
                rounded-full
                bg-[#197786]/45
                transition-all
                duration-700
                delay-100
                group-hover/marketing:translate-y-2
                group-hover/marketing:scale-150
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                left-[8%]
                top-[28%]
                h-1.5
                w-1.5
                rounded-full
                bg-[#83BDC4]
                transition-all
                duration-700
                delay-200
                group-hover/marketing:-translate-y-3
                group-hover/marketing:scale-[2]
              "
            />

            {/* =====================================================
                CLOSE BUTTON
            ===================================================== */}

            <button
              type="button"
              onClick={closeMarketingBanner}
              aria-label="إغلاق الرسالة"
              className="
                absolute
                left-5
                top-5
                z-40
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-[#E7E3E3]
                bg-white/90
                text-[#6D686A]
                shadow-[0_8px_20px_rgba(47,52,55,0.10)]
                backdrop-blur-xl
                transition-all
                duration-500
                hover:rotate-90
                hover:scale-110
                hover:border-[#953238]/35
                hover:bg-[#FAF6F6]
                hover:text-[#953238]
                hover:shadow-[0_12px_25px_rgba(149,50,56,0.16)]
              "
            >
              <X className="h-5 w-5" />
            </button>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
              className="
                relative
                z-10
                grid
                grid-cols-1
                gap-7
                px-6
                pb-7
                pt-11
                sm:px-9
                sm:pb-9
                lg:grid-cols-[1.3fr_0.7fr]
                lg:items-center
                lg:gap-12
                lg:px-12
                lg:py-11
              "
            >
              {/* =====================================================
                  MAIN MESSAGE
              ===================================================== */}

              <div className="flex min-w-0 items-start gap-5 sm:items-center">
                {/* ICON */}

                <div
                  className="
                    relative
                    flex
                    h-20
                    w-20
                    shrink-0
                    items-center
                    justify-center
                    rounded-[28px]
                    bg-[linear-gradient(135deg,#197786_0%,#83BDC4_100%)]
                    text-white
                    shadow-[0_18px_40px_rgba(25,119,134,0.30)]
                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    group-hover/marketing:-translate-y-2
                    group-hover/marketing:rotate-[-7deg]
                    group-hover/marketing:scale-110
                    group-hover/marketing:shadow-[0_24px_46px_rgba(25,119,134,0.38)]
                  "
                >
                  <span
                    className="
                      absolute
                      inset-0
                      rounded-[28px]
                      border
                      border-white/40
                      motion-safe:animate-ping
                      [animation-duration:3s]
                    "
                  />

                  <span
                    className="
                      absolute
                      inset-[6px]
                      rounded-[22px]
                      border
                      border-white/15
                      transition-transform
                      duration-700
                      group-hover/marketing:rotate-12
                    "
                  />

                  <CalendarPlus className="relative z-10 h-9 w-9" />
                </div>

                {/* TEXT */}

                <div className="min-w-0 text-right">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#83BDC4]/35
                        bg-white/80
                        px-4
                        py-2
                        text-xs
                        font-extrabold
                        text-[#197786]
                        shadow-sm
                        transition-all
                        duration-500
                        group-hover/marketing:-translate-y-1
                        group-hover/marketing:shadow-[0_8px_18px_rgba(25,119,134,0.10)]
                      "
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className="
                            absolute
                            inline-flex
                            h-full
                            w-full
                            rounded-full
                            bg-[#197786]/40
                            motion-safe:animate-ping
                          "
                        />

                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#197786]" />
                      </span>

                      حجز أونلاين سريع
                    </span>

                    <span
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        bg-[#953238]/10
                        px-4
                        py-2
                        text-xs
                        font-extrabold
                        text-[#7C3439]
                        transition-all
                        duration-500
                        group-hover/marketing:-translate-y-1
                      "
                    >
                      من غير انتظار
                    </span>
                  </div>

                  {/* HEADLINE */}

                  <h3
                    className="
                      mb-3
                      text-2xl
                      font-black
                      leading-[1.5]
                      text-[#2F3437]
                      sm:text-3xl
                      lg:text-[34px]
                    "
                  >
                    محتاج تكشف ومش عايز تضيع وقتك؟

                    <span
                      className="
                        relative
                        mr-2
                        inline-block
                        text-[#197786]
                        transition-all
                        duration-700
                        group-hover/marketing:scale-[1.03]
                      "
                    >
                      احجز دلوقتي

                      <span
                        className="
                          absolute
                          -bottom-1
                          right-0
                          h-[5px]
                          w-full
                          origin-right
                          scale-x-0
                          rounded-full
                          bg-[linear-gradient(90deg,#953238_0%,#83BDC4_45%,#197786_100%)]
                          transition-transform
                          duration-700
                          ease-out
                          group-hover/marketing:scale-x-100
                        "
                      />
                    </span>
                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      max-w-3xl
                      text-sm
                      font-medium
                      leading-7
                      text-[#6D686A]
                      sm:text-base
                      lg:text-[17px]
                    "
                  >
                    طبيبك أقرب مما تتخيل؛ اختار التخصص والطبيب المناسب ليك،
                    وحدد موعدك بسهولة في خطوات بسيطة من غير مكالمات كتير
                    ولا انتظار.
                  </p>

                  {/* =====================================================
                      STEPS
                  ===================================================== */}

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {[
                      "اختار التخصص",
                      "اختار الطبيب",
                      "حدد موعدك",
                    ].map((step, index) => (
                      <span
                        key={step}
                        className="
                          group/step
                          inline-flex
                          items-center
                          gap-2
                          rounded-2xl
                          border
                          border-[#83BDC4]/25
                          bg-white/75
                          px-3.5
                          py-2.5
                          text-xs
                          font-bold
                          text-[#2F3437]
                          shadow-[0_5px_15px_rgba(25,119,134,0.06)]
                          transition-all
                          duration-500
                          hover:-translate-y-1.5
                          hover:border-[#83BDC4]
                          hover:bg-white
                          hover:shadow-[0_12px_28px_rgba(25,119,134,0.14)]
                        "
                      >
                        <span
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#D1F9FC]
                            text-[11px]
                            font-black
                            text-[#197786]
                            transition-all
                            duration-500
                            group-hover/step:rotate-6
                            group-hover/step:scale-110
                            group-hover/step:bg-[#197786]
                            group-hover/step:text-white
                          "
                        >
                          {index + 1}
                        </span>

                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* =====================================================
                  ACTION PANEL
              ===================================================== */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-white/90
                  bg-white/75
                  p-5
                  shadow-[0_16px_40px_rgba(25,119,134,0.11)]
                  backdrop-blur-xl
                  transition-all
                  duration-700
                  ease-out
                  group-hover/marketing:-translate-y-1.5
                  group-hover/marketing:shadow-[0_24px_50px_rgba(25,119,134,0.17)]
                "
              >
                {/* PANEL GLOW */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -left-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-[#D1F9FC]
                    blur-3xl
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-12
                    -right-12
                    h-28
                    w-28
                    rounded-full
                    bg-[#953238]/10
                    blur-3xl
                  "
                />

                <div className="relative mb-4">
                  <span className="mb-1 block text-xs font-bold text-[#953238]">
                    خطوتك الأولى
                  </span>

                  <p className="text-base font-black text-[#2F3437]">
                    احجز موعدك وخلّي الباقي علينا
                  </p>
                </div>

                <div className="relative flex flex-col gap-3">
                  {/* BOOKING */}

                  <Link
                    to="/clinics"
                    onClick={closeMarketingBanner}
                    className="
                      group/banner
                      relative
                      inline-flex
                      min-h-[60px]
                      items-center
                      justify-center
                      gap-2.5
                      overflow-hidden
                      rounded-2xl
                      bg-[#953238]
                      px-6
                      py-4
                      text-base
                      font-extrabold
                      text-white
                      shadow-[0_12px_28px_rgba(149,50,56,0.28)]
                      transition-all
                      duration-500
                      ease-out
                      hover:-translate-y-1.5
                      hover:bg-[#7C3439]
                      hover:shadow-[0_22px_42px_rgba(149,50,56,0.40)]
                    "
                  >
                    {/* BUTTON LIGHT */}

                    <span
                      className="
                        absolute
                        -left-[60%]
                        top-[-25%]
                        h-[150%]
                        w-[30%]
                        rotate-12
                        bg-white/25
                        blur-md
                        transition-all
                        duration-700
                        group-hover/banner:left-[125%]
                      "
                    />

                    <CalendarPlus className="relative z-10 h-5 w-5" />

                    <span className="relative z-10">
                      احجز موعدك الآن
                    </span>

                    <ArrowLeft
                      className="
                        relative
                        z-10
                        h-5
                        w-5
                        transition-transform
                        duration-500
                        group-hover/banner:-translate-x-2
                      "
                    />
                  </Link>

                  {/* DOCTORS */}

                  <Link
                    to="/doctors"
                    onClick={closeMarketingBanner}
                    className="
                      group/doctors
                      inline-flex
                      min-h-[52px]
                      items-center
                      justify-center
                      gap-2.5
                      rounded-2xl
                      border
                      border-[#83BDC4]/60
                      bg-[#D1F9FC]/50
                      px-6
                      py-3
                      text-sm
                      font-extrabold
                      text-[#197786]
                      transition-all
                      duration-500
                      ease-out
                      hover:-translate-y-1
                      hover:border-[#197786]
                      hover:bg-[#197786]
                      hover:text-white
                      hover:shadow-[0_14px_28px_rgba(25,119,134,0.20)]
                    "
                  >
                    <UserRound
                      className="
                        h-5
                        w-5
                        transition-transform
                        duration-500
                        group-hover/doctors:scale-110
                        group-hover/doctors:-rotate-6
                      "
                    />

                    شوف أطبائنا
                  </Link>
                </div>
              </div>
            </div>

            {/* =====================================================
                BOTTOM MINI MESSAGE
            ===================================================== */}

            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-[#83BDC4]/15
                bg-white/25
                px-5
                py-2.5
                text-center
                text-[11px]
                font-bold
                text-[#6D686A]
                sm:text-xs
              "
            >
              <ShieldCheck className="h-4 w-4 text-[#197786]" />

              حجز سهل وسريع من خلال الموقع
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}