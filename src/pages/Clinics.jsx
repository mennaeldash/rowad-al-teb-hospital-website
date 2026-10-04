import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import {
  Stethoscope,
  HeartPulse,
  Bone,
  Scissors,
  Droplet,
  Smile,
  Flower,
  Activity,
  Brain,
  ArrowLeft,
  CalendarPlus,
  GraduationCap,
} from "lucide-react";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";

import {
  useDepartments,
  useDoctors,
} from "@/lib/hooks";

import {
  getDoctor,
} from "@/services/doctors";


const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "http://rewaddashboard.runasp.net";

const PHYSICAL_THERAPY_DEPARTMENT_NAME =
  "العلاج الطبيعي";


const departmentIcons = {
  "heart-pulse": HeartPulse,
  stethoscope: Stethoscope,
  activity: Activity,
  flower: Flower,
  bone: Bone,
  scissors: Scissors,
  droplet: Droplet,
  smile: Smile,
  brain: Brain,
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
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(
      /[ًٌٍَُِّْـ]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    );

/* =========================================================
   PHYSICAL THERAPY CHECK
========================================================= */

const isPhysicalTherapyDepartment = (
  department
) => {
  if (!department) {
    return false;
  }

  const departmentName =
    department.name ??
    department.Name ??
    "";

  return (
    normalizeText(
      departmentName
    ) ===
    normalizeText(
      PHYSICAL_THERAPY_DEPARTMENT_NAME
    )
  );
};

/* =========================================================
   IMAGE URL
========================================================= */

const getBackendImageUrl = (
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
   DEPARTMENT
========================================================= */

const normalizeDepartment = (
  department
) => ({
  ...department,

  id:
    department.id ??
    department.Id ??
    null,

  name:
    department.name ??
    department.Name ??
    "",

  description:
    department.description ??
    department.Description ??
    "",

  icon:
    department.icon ??
    department.Icon ??
    "stethoscope",

  image_url:
    getBackendImageUrl(
      department.imageUrl ??
        department.ImageUrl ??
        department.image_url ??
        ""
    ),
});

/* =========================================================
   WORKING DAYS
========================================================= */

const DAY_LABELS = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",

  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
};

const getArabicDayLabel = (
  day
) => {
  if (
    day === null ||
    day === undefined ||
    day === ""
  ) {
    return "";
  }

  /* OBJECT */

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

    if (
      dayId !== null &&
      dayId !== undefined &&
      DAY_LABELS[
        Number(dayId)
      ]
    ) {
      return DAY_LABELS[
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

    return getArabicDayLabel(
      dayName
    );
  }

  /* NUMBER */

  const numericDay =
    Number(day);

  if (
    Number.isInteger(
      numericDay
    ) &&
    numericDay >= 0 &&
    numericDay <= 6
  ) {
    return DAY_LABELS[
      numericDay
    ];
  }

  /* ENGLISH STRING */

  const value =
    String(day)
      .trim()
      .toLowerCase();

  return (
    DAY_LABELS[value] ||
    String(day)
  );
};

const normalizeWorkingDaysArray = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    return value
      .split(
        /[,|;]+/
      )
      .map(
        (
          item
        ) =>
          item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

const extractDoctorWorkingDays = (
  doctor
) => {
  if (!doctor) {
    return [];
  }

  const rawDays =
    doctor.workingDays ??
    doctor.WorkingDays ??
    doctor.working_days ??
    doctor.days ??
    doctor.Days ??
    doctor.workingDayIds ??
    doctor.WorkingDayIds ??
    doctor.workingDaysIds ??
    doctor.WorkingDaysIds ??
    [];

  return normalizeWorkingDaysArray(
    rawDays
  );
};

const getWorkingDaysLabels = (
  doctor
) => {
  const days =
    extractDoctorWorkingDays(
      doctor
    );

  return [
    ...new Set(
      days
        .map(
          getArabicDayLabel
        )
        .filter(Boolean)
    ),
  ];
};

/* =========================================================
   NORMALIZE DOCTOR
========================================================= */

const normalizeDoctor = (
  doctor
) => ({
  ...doctor,

  id:
    doctor.id ??
    doctor.Id ??
    null,

  name:
    doctor.fullName ??
    doctor.FullName ??
    doctor.name ??
    doctor.Name ??
    "",

  specialty:
    doctor.specialization ??
    doctor.Specialization ??
    doctor.specialty ??
    doctor.Specialty ??
    "",

  bio:
    doctor.biography ??
    doctor.Biography ??
    doctor.bio ??
    doctor.Bio ??
    "",

  department_id:
    doctor.departmentId ??
    doctor.DepartmentId ??
    doctor.department_id ??
    null,

  department_name:
    doctor.departmentName ??
    doctor.DepartmentName ??
    doctor.department_name ??
    "",

  image_url:
    getBackendImageUrl(
      doctor.imageUrl ??
        doctor.ImageUrl ??
        doctor.image_url ??
        doctor.image ??
        doctor.Image ??
        ""
    ),

  status:
    doctor.status ??
    doctor.Status ??
    "",

  working_days:
    extractDoctorWorkingDays(
      doctor
    ),

  qualification:
    doctor.qualification ??
    doctor.Qualification ??
    "",
});

/* =========================================================
   STATUS
========================================================= */

const isDoctorActive = (
  status
) => {
  if (
    status === null ||
    status === undefined ||
    status === ""
  ) {
    return true;
  }

  if (
    typeof status ===
    "number"
  ) {
    return (
      status === 0
    );
  }

  const numericStatus =
    Number(status);

  if (
    numericStatus === 0
  ) {
    return true;
  }

  if (
    numericStatus === 1
  ) {
    return false;
  }

  const value =
    normalizeText(
      status
    );

  return (
    value ===
      "active" ||
    value ===
      "نشط" ||
    value ===
      "متاح"
  );
};

const getStatusLabel = (
  status
) =>
  isDoctorActive(
    status
  )
    ? "متاح"
    : "غير متاح";

/* =========================================================
   CLINICS LIST
========================================================= */

function ClinicsList() {
  const {
    data:
      departments = [],
    loading:
      deptLoading,
  } = useDepartments();

  /*
    هنا بنجيب كل الأقسام من Backend
  */

  const normalizedDepartments =
    useMemo(
      () =>
        Array.isArray(
          departments
        )
          ? departments.map(
              normalizeDepartment
            )
          : [],
      [
        departments,
      ]
    );

  /*
    IMPORTANT:

    العلاج الطبيعي موجود في Backend
    لكنه مش عيادة خارجية.

    لذلك نستبعده فقط من صفحة
    العيادات الخارجية.
  */

  const outpatientDepartments =
    useMemo(
      () =>
        normalizedDepartments.filter(
          (
            department
          ) =>
            !isPhysicalTherapyDepartment(
              department
            )
        ),
      [
        normalizedDepartments,
      ]
    );

  return (
    <>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative py-20 overflow-hidden">

        <div className="absolute inset-0">

          <img
            src="https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
              العيادات الخارجية
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
              أقسامنا الطبية
            </h1>

            <p
              className="
                text-xl
                text-slate-200
                max-w-2xl
                mx-auto
              "
            >
              اختر القسم ثم الطبيب واحجز موعدك في خطوات بسيطة
            </p>

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          DEPARTMENTS
      ===================================================== */}

      <section className="section-padding bg-slate-50">

        <div className="px-8">

          {deptLoading ? (

            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-6
              "
            >

              {Array.from({
                length: 12,
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
                      p-8
                      shimmer-bg
                      h-64
                      rounded-2xl
                    "
                  />
                )
              )}

            </div>

          ) : outpatientDepartments.length ===
            0 ? (

            <div className="text-center py-16">

              <p className="text-slate-500 text-lg">
                لا توجد أقسام متاحة حالياً
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-6
              "
            >

              {outpatientDepartments.map(
                (
                  dept,
                  idx
                ) => {
                  const Icon =
                    departmentIcons[
                      dept.icon ||
                        ""
                    ] ||
                    Stethoscope;

                  return (
                    <Reveal
                      key={
                        dept.id ??
                        `${dept.name}-${idx}`
                      }
                      delay={
                        idx *
                        50
                      }
                    >

                      <Link
                        to={`/clinics/${dept.id}`}
                        className="
                          card
                          card-lift
                          p-6
                          text-center
                          w-full
                          group
                          h-full
                          block
                        "
                      >

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
                            overflow-hidden
                            group-hover:from-primary-500
                            group-hover:to-secondary-500
                            transition-all
                            duration-500
                          "
                        >

                          {dept.image_url ? (

                            <img
                              src={
                                dept.image_url
                              }
                              alt={
                                dept.name
                              }
                              className="
                                w-12
                                h-12
                                object-contain
                                transition-transform
                                duration-500
                                group-hover:scale-110
                              "
                            />

                          ) : (

                            <Icon
                              className="
                                w-10
                                h-10
                                text-primary-600
                                group-hover:text-white
                                transition-colors
                                duration-500
                              "
                            />

                          )}

                        </div>

                        <h3
                          className="
                            text-2xl
                            font-bold
                            text-slate-800
                            mb-2
                          "
                        >
                          {
                            dept.name
                          }
                        </h3>

                        {dept.description && (

                          <p
                            className="
                              text-slate-600
                              text-lg
                              leading-relaxed
                              line-clamp-2
                              mb-4
                            "
                          >
                            {
                              dept.description
                            }
                          </p>

                        )}

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            text-primary-600
                            font-bold
                            text-md
                            group-hover:gap-2
                            transition-all
                          "
                        >
                          عرض الأطباء

                          <ArrowLeft className="w-4 h-4" />
                        </span>

                      </Link>

                    </Reveal>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

    </>
  );
}

/* =========================================================
   DEPARTMENT DETAIL
========================================================= */

function DepartmentDetailPage() {
  const {
    slug,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    data:
      departments = [],
    loading:
      deptLoading,
  } = useDepartments();

  const {
    data:
      doctors = [],
    loading:
      doctorsLoading,
  } = useDoctors();

  const normalizedDepartments =
    useMemo(
      () =>
        Array.isArray(
          departments
        )
          ? departments.map(
              normalizeDepartment
            )
          : [],
      [
        departments,
      ]
    );

  const normalizedDoctors =
    useMemo(
      () =>
        Array.isArray(
          doctors
        )
          ? doctors.map(
              normalizeDoctor
            )
          : [],
      [
        doctors,
      ]
    );

  /*
    نبحث عن القسم أولاً
    وسط كل الأقسام.
  */

  const requestedDepartment =
    useMemo(() => {
      return normalizedDepartments.find(
        (
          item
        ) =>
          String(
            item.id
          ) ===
          String(
            slug
          )
      );
    }, [
      normalizedDepartments,
      slug,
    ]);

  /*
    لو الـID ده خاص بالعلاج الطبيعي
    نخرجه تماماً من /clinics
    ونحوّله لصفحته المستقلة.
  */

  const requestedIsPhysicalTherapy =
    useMemo(
      () =>
        isPhysicalTherapyDepartment(
          requestedDepartment
        ),
      [
        requestedDepartment,
      ]
    );

  useEffect(() => {
    if (
      !deptLoading &&
      requestedIsPhysicalTherapy
    ) {
      navigate(
        "/physical-therapy",
        {
          replace: true,
        }
      );
    }
  }, [
    deptLoading,
    requestedIsPhysicalTherapy,
    navigate,
  ]);

  /*
    القسم المستخدم فعلياً
    في العيادات الخارجية
    لا يمكن أن يكون علاج طبيعي.
  */

  const department =
    requestedIsPhysicalTherapy
      ? null
      : requestedDepartment;

  const deptDoctors =
    useMemo(() => {
      if (!department) {
        return [];
      }

      return normalizedDoctors.filter(
        (
          doctor
        ) => {
          const sameDepartmentById =
            doctor.department_id !==
              null &&
            doctor.department_id !==
              undefined &&
            String(
              doctor.department_id
            ) ===
              String(
                department.id
              );

          const sameDepartmentByName =
            normalizeText(
              doctor.department_name
            ) ===
            normalizeText(
              department.name
            );

          return (
            sameDepartmentById ||
            sameDepartmentByName
          );
        }
      );
    }, [
      department,
      normalizedDoctors,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    deptLoading ||
    requestedIsPhysicalTherapy
  ) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50">

        <div className="container-custom py-20">

          <div className="h-40 rounded-3xl shimmer-bg" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

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
                  className="h-72 rounded-3xl shimmer-bg"
                />
              )
            )}

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     DEPARTMENT NOT FOUND
  ======================================================= */

  if (!department) {
    return (
      <div
        className="
          pt-24
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <p className="text-slate-500 text-lg mb-4">
            القسم غير موجود
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/clinics"
              )
            }
            className="btn btn-primary"
          >
            العودة للأقسام
          </button>

        </div>

      </div>
    );
  }

  const Icon =
    departmentIcons[
      department.icon ||
        ""
    ] ||
    Stethoscope;

  return (
    <div className="pt-24">

      {/* =====================================================
          DEPARTMENT HERO
      ===================================================== */}

      <section
        className="
          relative
          py-16
          overflow-hidden
        "
      >

        <div className="absolute inset-0 animated-gradient" />

        <div
          className="
            container-custom
            relative
            z-10
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                "/clinics"
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              text-white/90
              hover:text-white
              font-bold
              mb-6
              transition-colors
            "
          >
            <ArrowLeft className="w-5 h-5" />

            العودة للأقسام
          </button>

          <div className="flex items-center gap-5">

            <div
              className="
                w-20
                h-20
                rounded-3xl
                bg-white/20
                backdrop-blur-md
                flex
                items-center
                justify-center
              "
            >
              <Icon className="w-10 h-10 text-white" />
            </div>

            <div>

              <h1
                className="
                  text-3xl
                  md:text-4xl
                  font-extrabold
                  text-white
                  mb-2
                "
              >
                {
                  department.name
                }
              </h1>

              {department.description && (

                <p className="text-white/80">
                  {
                    department.description
                  }
                </p>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DOCTORS
      ===================================================== */}

      <section className="section-padding bg-[#F8FAFB]">

        <div className="container-custom">

          <Reveal>

            <SectionHeading
              badge="أطباء القسم"
              title={`أطباء ${department.name}`}
              subtitle="اختر الطبيب المناسب واحجز موعدك مباشرة"
            />

          </Reveal>

          {doctorsLoading ? (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                    className="h-[370px] rounded-3xl shimmer-bg"
                  />
                )
              )}

            </div>

          ) : deptDoctors.length ===
            0 ? (

            <div className="text-center py-16">

              <p className="text-slate-500 text-lg">
                لا يوجد أطباء في هذا القسم حالياً
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {deptDoctors.map(
                (
                  doctor,
                  idx
                ) => (
                  <Reveal
                    key={
                      doctor.id ??
                      `${doctor.name}-${idx}`
                    }
                    delay={
                      idx *
                      80
                    }
                    className="h-full"
                  >

                    <DoctorCard
                      doctor={
                        doctor
                      }
                      department={
                        department
                      }
                    />

                  </Reveal>
                )
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   DOCTOR CARD
========================================================= */

function DoctorCard({
  doctor,
  department,
  showBookButton = true,
}) {
  const navigate =
    useNavigate();

  const [
    doctorDetails,
    setDoctorDetails,
  ] = useState(
    doctor
  );

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(
    Boolean(
      doctor.id
    )
  );

  /* =======================================================
     SYNC DOCTOR PROP
  ======================================================= */

  useEffect(() => {
    setDoctorDetails(
      doctor
    );
  }, [
    doctor,
  ]);

  /* =======================================================
     GET FULL DOCTOR DETAILS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const loadDoctorDetails =
      async () => {
        if (
          !doctor.id
        ) {
          setDoctorDetails(
            doctor
          );

          setDetailsLoading(
            false
          );

          return;
        }

        setDetailsLoading(
          true
        );

        try {
          const details =
            await getDoctor(
              doctor.id
            );

          console.log(
            "CLINIC DOCTOR DETAILS:",
            details
          );

          if (
            cancelled
          ) {
            return;
          }

          const normalizedDetails =
            details
              ? normalizeDoctor(
                  details
                )
              : null;

          const detailsWorkingDays =
            extractDoctorWorkingDays(
              normalizedDetails
            );

          const originalWorkingDays =
            extractDoctorWorkingDays(
              doctor
            );

          const finalWorkingDays =
            detailsWorkingDays.length >
            0
              ? detailsWorkingDays
              : originalWorkingDays;

          setDoctorDetails({
            ...doctor,
            ...(normalizedDetails ||
              {}),

            department_id:
              doctor.department_id ??
              normalizedDetails?.department_id ??
              details?.departmentId ??
              null,

            department_name:
              normalizedDetails?.department_name ||
              details?.departmentName ||
              doctor.department_name ||
              "",

            workingDays:
              finalWorkingDays,

            working_days:
              finalWorkingDays,
          });
        } catch (error) {
          console.error(
            "GET CLINIC DOCTOR DETAILS ERROR:",
            error?.response?.data ||
              error
          );

          if (
            !cancelled
          ) {
            setDoctorDetails(
              doctor
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setDetailsLoading(
              false
            );
          }
        }
      };

    loadDoctorDetails();

    return () => {
      cancelled =
        true;
    };
  }, [
    doctor.id,
  ]);

  /* =======================================================
     STATUS
  ======================================================= */

  const currentStatus =
    doctorDetails?.status ??
    doctorDetails?.Status ??
    doctor.status ??
    "";

  const doctorAvailable =
    isDoctorActive(
      currentStatus
    );

  /* =======================================================
     WORKING DAYS
  ======================================================= */

  const workingDays =
    useMemo(
      () =>
        getWorkingDaysLabels(
          doctorDetails
        ),
      [
        doctorDetails,
      ]
    );

  /* =======================================================
     BOOK
  ======================================================= */

  const handleBook = () => {
    if (
      !doctorAvailable
    ) {
      return;
    }

    navigate(
      `/booking?doctor=${encodeURIComponent(
        doctor.id
      )}&dept=${encodeURIComponent(
        department.id
      )}`
    );
  };

  return (
    <div
      className="
        group
        h-full
        w-full
        overflow-hidden
        rounded-[24px]
        border
        border-[#83BDC4]
        bg-white
        p-5
        shadow-[0_10px_30px_rgba(25,119,134,0.08)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_18px_42px_rgba(25,119,134,0.14)]
      "
    >

      <div
        dir="rtl"
        className="flex h-full flex-col"
      >

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:flex-row-reverse
            items-center
            sm:items-start
            gap-5
          "
        >

          {/* IMAGE */}

          <div
            className="
              shrink-0
              w-[170px]
              h-[170px]
              sm:w-[190px]
              sm:h-[190px]
              rounded-full
              p-[3px]
              bg-gradient-to-br
              from-[#197786]
              to-[#83BDC4]
              shadow-[0_8px_24px_rgba(25,119,134,0.14)]
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
                  doctorDetails?.image_url ||
                  doctor.image_url
                }
                alt={
                  doctorDetails?.name ||
                  doctor.name
                }
                className="
                  w-full
                  h-full
                  rounded-full
                  transition-transform
                  duration-700
                  group-hover:scale-[1.04]
                "
                rounded="rounded-full"
                objectFit="object-cover"
              />

            </div>

          </div>

          {/* DETAILS */}

          <div className="flex-1 min-w-0 text-center sm:text-right">

            <h3
              className="
                text-[22px]
                lg:text-[24px]
                font-extrabold
                text-[#1E293B]
                leading-[1.5]
                mb-1
              "
            >
              {doctorDetails?.name ||
                doctor.name}
            </h3>

            {(doctorDetails?.specialty ||
              doctor.specialty) && (

              <p
                className="
                  text-[#197786]
                  text-[15px]
                  font-extrabold
                  leading-7
                  mb-2
                "
              >
                {doctorDetails?.specialty ||
                  doctor.specialty}
              </p>

            )}

            {(doctorDetails?.qualification ||
              doctor.qualification) && (

              <div className="mt-2 mb-3">

                <div
                  className="
                    flex
                    items-start
                    justify-center
                    sm:justify-start
                    gap-2
                  "
                >

                  <div
                    className="
                      w-8
                      h-8
                      shrink-0
                      rounded-lg
                      bg-[#D1F9FC]/70
                      flex
                      items-center
                      justify-center
                      text-[#197786]
                    "
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>

                  <p
                    className="
                      text-[#5F6670]
                      text-[15px]
                      leading-7
                      font-medium
                    "
                  >
                    {doctorDetails?.qualification ||
                      doctor.qualification}
                  </p>

                </div>

              </div>

            )}

            {(doctorDetails?.bio ||
              doctor.bio) && (

              <p
                className="
                  text-[#6D686A]
                  text-[15px]
                  leading-7
                  mb-1
                "
              >
                {doctorDetails?.bio ||
                  doctor.bio}
              </p>

            )}

          </div>

        </div>

        {/* =================================================
            WORKING DAYS
        ================================================= */}

        <div
          className="
            mt-5
            flex
            flex-wrap
            items-center
            gap-2
          "
        >

          <span
            className="
              text-[#197786]
              text-sm
              font-extrabold
            "
          >
            أيام العمل:
          </span>

          {detailsLoading ? (

            <span className="text-sm font-bold text-slate-400">
              جاري تحميل أيام العمل...
            </span>

          ) : workingDays.length >
            0 ? (

            workingDays.map(
              (
                day,
                index
              ) => (
                <span
                  key={`${day}-${index}`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    min-h-[34px]
                    rounded-lg
                    bg-[#D1F9FC]
                    px-3
                    py-1.5
                    text-[#197786]
                    text-sm
                    font-extrabold
                  "
                >
                  {
                    day
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

        {/* =================================================
            STATUS
        ================================================= */}

        <div
          className="
            mt-4
            pt-4
            border-t
            border-[#E7E3E3]
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <span
              className="
                text-[#2F3437]
                text-sm
                font-extrabold
              "
            >
              الحالة:
            </span>

            <span
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                px-3
                py-1.5
                text-sm
                font-extrabold

                ${
                  doctorAvailable
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[#953238]/10 text-[#953238]"
                }
              `}
            >

              <span
                className={`
                  h-2
                  w-2
                  rounded-full

                  ${
                    doctorAvailable
                      ? "bg-emerald-500"
                      : "bg-[#953238]"
                  }
                `}
              />

              {getStatusLabel(
                currentStatus
              )}

            </span>

          </div>

        </div>

        {/* =================================================
            BOOK BUTTON
        ================================================= */}

        {showBookButton &&
          doctor.id && (

            <button
              type="button"
              onClick={
                handleBook
              }
              disabled={
                !doctorAvailable
              }
              className={`
                group/btn
                mt-5
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
                  doctorAvailable
                    ? `
                        bg-[#953238]
                        text-white
                        shadow-[0_8px_20px_rgba(149,50,56,0.18)]
                        hover:bg-[#7C3439]
                        hover:-translate-y-0.5
                        hover:shadow-[0_12px_28px_rgba(149,50,56,0.26)]
                      `
                    : `
                        cursor-not-allowed
                        bg-slate-200
                        text-slate-500
                      `
                }
              `}
            >

              <CalendarPlus className="w-4 h-4" />

              {doctorAvailable
                ? "احجز الآن"
                : "غير متاح للحجز"}

            </button>

          )}

      </div>

    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Clinics() {
  const {
    slug,
  } = useParams();

  if (slug) {
    return (
      <DepartmentDetailPage />
    );
  }

  return (
    <ClinicsList />
  );
}