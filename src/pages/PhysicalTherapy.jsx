import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CalendarPlus,
} from "lucide-react";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PlaceholderImage from "@/components/PlaceholderImage";

import {
  getAllDoctors,
  getDoctor,
} from "@/services/doctors";

/* =========================================================
   CONSTANTS
========================================================= */

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "https://rewaddashboard.runasp.net";

const PHYSICAL_THERAPY_NAME =
  "العلاج الطبيعي";

const dayLabels = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeText = (
  value
) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");

/* =========================================================
   IMAGE URL
========================================================= */

const getDoctorImageUrl = (
  imageUrl
) => {
  if (!imageUrl) {
    return "";
  }

  const value =
    String(
      imageUrl
    ).trim();

  if (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    ) ||
    value.startsWith(
      "blob:"
    ) ||
    value.startsWith(
      "data:"
    )
  ) {
    return value;
  }

  return `${BACKEND_ORIGIN}${
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
};

/* =========================================================
   WORKING DAYS
========================================================= */

const normalizeWorkingDays = (
  doctor
) => {
  if (!doctor) {
    return [];
  }

  const rawDays =
    doctor?.workingDays ??
    doctor?.WorkingDays ??
    doctor?.working_days ??
    doctor?.days ??
    doctor?.Days ??
    doctor?.workingDayIds ??
    doctor?.WorkingDayIds ??
    doctor?.workingDaysIds ??
    doctor?.WorkingDaysIds ??
    [];

  if (
    Array.isArray(
      rawDays
    )
  ) {
    return rawDays;
  }

  if (
    typeof rawDays ===
    "string"
  ) {
    return rawDays
      .split(/[,;|]+/)
      .map(
        (
          day
        ) =>
          day.trim()
      )
      .filter(Boolean);
  }

  return [];
};

/* =========================================================
   ARABIC DAY
========================================================= */

const getArabicDay = (
  day
) => {
  if (
    day === null ||
    day === undefined ||
    day === ""
  ) {
    return "";
  }

  /*
    لو اليوم Object
  */

  if (
    typeof day ===
      "object" &&
    day !== null
  ) {
    const dayId =
      day.id ??
      day.Id ??
      day.dayId ??
      day.DayId;

    const numericDays = {
      0: "الأحد",
      1: "الإثنين",
      2: "الثلاثاء",
      3: "الأربعاء",
      4: "الخميس",
      5: "الجمعة",
      6: "السبت",
    };

    if (
      dayId !== null &&
      dayId !== undefined &&
      numericDays[
        Number(dayId)
      ]
    ) {
      return numericDays[
        Number(dayId)
      ];
    }

    const dayName =
      day.name ??
      day.Name ??
      day.day ??
      day.Day ??
      day.dayName ??
      day.DayName ??
      "";

    return getArabicDay(
      dayName
    );
  }

  const value =
    String(
      day
    )
      .trim()
      .toLowerCase();

  /*
    لو Backend رجع أرقام
  */

  const numericDays = {
    0: "الأحد",
    1: "الإثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت",
  };

  if (
    Object.prototype.hasOwnProperty.call(
      numericDays,
      value
    )
  ) {
    return numericDays[
      value
    ];
  }

  return (
    dayLabels[
      value
    ] ||
    String(day)
  );
};

/* =========================================================
   STATUS
========================================================= */

const isDoctorActive = (
  doctor
) => {
  const status =
    doctor?.status ??
    doctor?.Status ??
    "";

  const normalized =
    String(
      status
    )
      .trim()
      .toLowerCase();

  if (
    normalized ===
      "unavailable" ||
    normalized ===
      "inactive" ||
    normalized ===
      "1"
  ) {
    return false;
  }

  return true;
};

/* =========================================================
   PHYSICAL THERAPY PAGE
========================================================= */

export default function PhysicalTherapy() {
  const navigate =
    useNavigate();

  const [
    allDoctors,
    setAllDoctors,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LOAD DOCTORS + FULL DETAILS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const loadDoctors =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          /*
            1- نجيب قائمة الدكاترة
          */

          const response =
            await getAllDoctors();

          const baseDoctors =
            Array.isArray(
              response
            )
              ? response
              : [];

          /*
            2- نجيب تفاصيل كل دكتور
            عشان workingDays تكون موجودة
          */

          const doctorsWithDetails =
            await Promise.all(
              baseDoctors.map(
                async (
                  doctor
                ) => {
                  const doctorId =
                    doctor?.id ??
                    doctor?.Id;

                  if (
                    doctorId ===
                      null ||
                    doctorId ===
                      undefined ||
                    doctorId ===
                      ""
                  ) {
                    return doctor;
                  }

                  try {
                    const details =
                      await getDoctor(
                        doctorId
                      );

                    const listDays =
                      normalizeWorkingDays(
                        doctor
                      );

                    const detailsDays =
                      normalizeWorkingDays(
                        details
                      );

                    const finalWorkingDays =
                      detailsDays.length >
                      0
                        ? detailsDays
                        : listDays;

                    /*
                      نحافظ على بيانات القسم
                      من القائمة لو GET BY ID
                      مش بيرجعها.
                    */

                    return {
                      ...doctor,
                      ...(details ||
                        {}),

                      id:
                        details?.id ??
                        details?.Id ??
                        doctor?.id ??
                        doctor?.Id,

                      departmentId:
                        details?.departmentId ??
                        details?.DepartmentId ??
                        doctor?.departmentId ??
                        doctor?.DepartmentId ??
                        doctor?.department_id ??
                        null,

                      department_id:
                        details?.departmentId ??
                        details?.DepartmentId ??
                        details?.department_id ??
                        doctor?.departmentId ??
                        doctor?.DepartmentId ??
                        doctor?.department_id ??
                        null,

                      departmentName:
                        details?.departmentName ??
                        details?.DepartmentName ??
                        details?.department_name ??
                        doctor?.departmentName ??
                        doctor?.DepartmentName ??
                        doctor?.department_name ??
                        "",

                      department_name:
                        details?.departmentName ??
                        details?.DepartmentName ??
                        details?.department_name ??
                        doctor?.departmentName ??
                        doctor?.DepartmentName ??
                        doctor?.department_name ??
                        "",

                      workingDays:
                        finalWorkingDays,

                      working_days:
                        finalWorkingDays,
                    };
                  } catch (
                    error
                  ) {
                    console.error(
                      `GET PHYSICAL THERAPY DOCTOR ${doctorId} ERROR:`,
                      error?.response
                        ?.data ||
                        error
                    );

                    /*
                      لو تفاصيل دكتور واحد فشلت
                      منبوظش الصفحة كلها.
                    */

                    return doctor;
                  }
                }
              )
            );

          if (
            cancelled
          ) {
            return;
          }

          console.log(
            "PHYSICAL THERAPY DOCTORS WITH DETAILS:",
            doctorsWithDetails
          );

          setAllDoctors(
            doctorsWithDetails
          );
        } catch (error) {
          console.error(
            "PHYSICAL THERAPY DOCTORS ERROR:",
            error?.response?.data ||
              error
          );

          if (
            !cancelled
          ) {
            setAllDoctors(
              []
            );

            setError(
              "تعذر تحميل أطباء العلاج الطبيعي حالياً."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadDoctors();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     FILTER PHYSICAL THERAPY DOCTORS
  ======================================================= */

  const doctors =
    useMemo(() => {
      const targetName =
        normalizeText(
          PHYSICAL_THERAPY_NAME
        );

      return allDoctors.filter(
        (
          doctor
        ) => {
          const departmentName =
            doctor?.departmentName ??
            doctor?.department_name ??
            doctor?.DepartmentName ??
            doctor?.department?.name ??
            doctor?.department?.Name ??
            "";

          return (
            normalizeText(
              departmentName
            ) ===
            targetName
          );
        }
      );
    }, [
      allDoctors,
    ]);

  /* =======================================================
     BOOKING
  ======================================================= */

  const handleBooking = (
    doctor
  ) => {
    if (
      !isDoctorActive(
        doctor
      )
    ) {
      return;
    }

    const doctorId =
      doctor?.id ??
      doctor?.Id ??
      "";

    const departmentId =
      doctor?.departmentId ??
      doctor?.department_id ??
      doctor?.DepartmentId ??
      "";

    if (
      !doctorId ||
      !departmentId
    ) {
      console.error(
        "BOOKING DATA MISSING:",
        {
          doctorId,
          departmentId,
        }
      );

      return;
    }

    navigate(
      `/booking?doctor=${encodeURIComponent(
        doctorId
      )}&dept=${encodeURIComponent(
        departmentId
      )}`
    );
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
            src="https://images.pexels.com/photos/3825584/pexels-photo-3825584.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
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
              العلاج الطبيعي
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
              قسم العلاج الطبيعي
            </h1>

            <p
              className="
                text-xl
                text-slate-200
                max-w-2xl
                mx-auto
              "
            >
              رعاية متخصصة لاستعادة الحركة وتحسين الوظائف الجسدية بأحدث أساليب
              العلاج الطبيعي والتأهيل.
            </p>

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          DOCTORS
      ===================================================== */}

      <section className="section-padding bg-[#F8FAFB]">

        <div className="container-custom">

          <Reveal>

            <SectionHeading
              badge="الأطباء"
              title="أطباء العلاج الطبيعي"
              subtitle="تعرف على فريق العلاج الطبيعي بالمستشفى"
            />

          </Reveal>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {Array.from({
                length: 2,
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
                      h-[330px]
                      rounded-[24px]
                      shimmer-bg
                    "
                  />
                )
              )}

            </div>

          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (

              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-5
                  py-6
                  text-center
                  font-bold
                  text-red-700
                "
              >
                {error}
              </div>

            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            doctors.length ===
              0 && (

              <div
                className="
                  rounded-[24px]
                  border
                  border-[#E7E3E3]
                  bg-white
                  px-6
                  py-14
                  text-center
                  shadow-[0_8px_28px_rgba(47,52,55,0.05)]
                "
              >
                <p className="text-slate-500 font-bold">
                  لا يوجد أطباء علاج طبيعي متاحون للعرض حالياً.
                </p>
              </div>

            )}

          {/* =================================================
              DOCTORS GRID
          ================================================= */}

          {!loading &&
            !error &&
            doctors.length >
              0 && (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {doctors.map(
                  (
                    doctor,
                    idx
                  ) => {
                    const id =
                      doctor?.id ??
                      doctor?.Id ??
                      idx;

                    const name =
                      doctor?.fullName ??
                      doctor?.FullName ??
                      doctor?.name ??
                      "";

                    const specialty =
                      doctor?.specialization ??
                      doctor?.Specialization ??
                      doctor?.specialty ??
                      "";

                    const bio =
                      doctor?.biography ??
                      doctor?.Biography ??
                      doctor?.bio ??
                      "";

                    const rawImage =
                      doctor?.imageUrl ??
                      doctor?.ImageUrl ??
                      doctor?.image_url ??
                      "";

                    const imageUrl =
                      getDoctorImageUrl(
                        rawImage
                      );

                    const workingDays =
                      normalizeWorkingDays(
                        doctor
                      );

                    const active =
                      isDoctorActive(
                        doctor
                      );

                    const departmentId =
                      doctor?.departmentId ??
                      doctor?.department_id ??
                      doctor?.DepartmentId ??
                      "";

                    const canBook =
                      active &&
                      Boolean(
                        id
                      ) &&
                      Boolean(
                        departmentId
                      );

                    return (
                      <Reveal
                        key={
                          id
                        }
                        delay={
                          idx *
                          80
                        }
                        className="h-full"
                      >

                        <div
                          className="
                            group
                            h-full
                            w-full
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-[#E7E3E3]
                            bg-white
                            p-5
                            shadow-[0_8px_28px_rgba(47,52,55,0.06)]
                            transition-all
                            duration-500
                            hover:-translate-y-1
                            hover:border-[#83BDC4]
                            hover:shadow-[0_16px_35px_rgba(25,119,134,0.11)]
                          "
                        >

                          <div
                            dir="rtl"
                            className="text-right"
                          >

                            {/* IMAGE */}

                            <div
                              className="
                                float-none
                                sm:float-left
                                w-[150px]
                                h-[150px]
                                sm:w-[200px]
                                sm:h-[200px]
                                mx-auto
                                sm:mx-0
                                sm:mr-5
                                mb-4
                                rounded-full
                                p-[3px]
                                bg-gradient-to-br
                                from-[#197786]
                                to-[#83BDC4]
                                shadow-[0_8px_22px_rgba(25,119,134,0.15)]
                              "
                            >

                              <div
                                className="
                                  w-full
                                  h-full
                                  rounded-full
                                  bg-white
                                  p-[3px]
                                  overflow-hidden
                                "
                              >

                                <PlaceholderImage
                                  type="doctor"
                                  src={
                                    imageUrl
                                  }
                                  alt={
                                    name
                                  }
                                  className="
                                    w-full
                                    h-full
                                    object-cover
                                    object-center
                                    rounded-full
                                    transition-transform
                                    duration-700
                                    group-hover:scale-[1.06]
                                  "
                                  rounded="rounded-full"
                                />

                              </div>

                            </div>

                            {/* NAME */}

                            <h3
                              className="
                                text-xl
                                lg:text-[22px]
                                font-extrabold
                                text-[#1E293B]
                                leading-[1.5]
                                mb-1
                              "
                            >
                              {name ||
                                "اسم الطبيب"}
                            </h3>

                            {/* SPECIALIZATION */}

                            {specialty && (

                              <p
                                className="
                                  text-[#197786]
                                  text-sm
                                  font-bold
                                  leading-6
                                  mb-1
                                "
                              >
                                {
                                  specialty
                                }
                              </p>

                            )}

                            {/* BIOGRAPHY */}

                            {bio && (

                              <p
                                className="
                                  text-[#6D686A]
                                  text-md
                                  leading-6
                                  mb-2
                                  mt-2
                                "
                              >
                                {
                                  bio
                                }
                              </p>

                            )}

                            <div className="clear-both" />

                            {/* =================================================
                                WORKING DAYS
                            ================================================= */}

                            <div
                              className="
                                pt-3
                                mt-2
                                border-t
                                border-[#E7E3E3]
                                mb-3
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >

                              <span
                                className="
                                  text-md
                                  font-extrabold
                                  text-[#197786]
                                "
                              >
                                أيام العمل:
                              </span>

                              {workingDays.length >
                                0 ? (

                                workingDays.map(
                                  (
                                    day,
                                    dayIndex
                                  ) => (

                                    <span
                                      key={`${String(
                                        day
                                      )}-${dayIndex}`}
                                      className="
                                        px-2
                                        py-1.5
                                        rounded-lg
                                        bg-[#D1F9FC]/55
                                        text-[#197786]
                                        text-[16px]
                                        font-bold
                                      "
                                    >
                                      {
                                        getArabicDay(
                                          day
                                        )
                                      }
                                    </span>

                                  )
                                )

                              ) : (

                                <span className="text-sm font-bold text-slate-400">
                                  لم يتم تحديد أيام العمل
                                </span>

                              )}

                            </div>

                            {/* STATUS */}

                            {!active && (

                              <div className="mb-3">

                                <span
                                  className="
                                    inline-flex
                                    rounded-full
                                    bg-slate-100
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-bold
                                    text-slate-500
                                  "
                                >
                                  غير متاح حالياً
                                </span>

                              </div>

                            )}

                            {/* BOOKING */}

                            <button
                              type="button"
                              disabled={
                                !canBook
                              }
                              onClick={() =>
                                handleBooking(
                                  doctor
                                )
                              }
                              className={`
                                group/btn
                                mt-3
                                w-full
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                px-5
                                py-3
                                text-sm
                                font-extrabold
                                transition-all
                                duration-300

                                ${
                                  canBook
                                    ? `
                                      bg-[#953238]
                                      text-white
                                      shadow-[0_8px_20px_rgba(149,50,56,0.18)]
                                      hover:bg-[#7C3439]
                                      hover:-translate-y-0.5
                                    `
                                    : `
                                      bg-slate-200
                                      text-slate-500
                                      cursor-not-allowed
                                    `
                                }
                              `}
                            >

                              <CalendarPlus className="w-4 h-4" />

                              {active
                                ? "احجز الآن"
                                : "غير متاح حالياً"}

                            </button>

                          </div>

                        </div>

                      </Reveal>
                    );
                  }
                )}

              </div>

            )}

        </div>

      </section>

    </div>
  );
}