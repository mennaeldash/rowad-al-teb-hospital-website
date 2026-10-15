import { useMemo, useState } from "react";

import {
  Stethoscope,
  HeartPulse,
  Activity,
  Flower,
  Bone,
  Scissors,
  Droplet,
  Smile,
  Brain,
  ArrowLeft,
  GraduationCap,
  Phone,
  Mail,
  Building2,
} from "lucide-react";

import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";

import {
  useDepartments,
  useDoctors,
} from "@/lib/hooks";

/* =========================================================
   BACKEND
========================================================= */

const BACKEND_ORIGIN = (
  import.meta.env.VITE_BACKEND_ORIGIN ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://rewaddashboard.runasp.net"
).replace(/\/$/, "");

/* =========================================================
   DEPARTMENT ICONS
========================================================= */

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
   TEXT HELPERS
========================================================= */

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/\s+/g, " ");

/* =========================================================
   IMAGE URL
========================================================= */

const getBackendImage = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${BACKEND_ORIGIN}${
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`
  }`;
};

/* =========================================================
   NORMALIZE DEPARTMENT
========================================================= */

const normalizeDepartment = (department) => ({
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

  image_url: getBackendImage(
    department.imageUrl ??
      department.ImageUrl ??
      department.image_url ??
      ""
  ),

  icon:
    department.icon ??
    department.Icon ??
    "stethoscope",
});

/* =========================================================
   NORMALIZE DOCTOR
========================================================= */

const normalizeDoctor = (doctor) => ({
  ...doctor,

  id:
    doctor.id ??
    doctor.Id ??
    doctor.doctorId ??
    doctor.DoctorId ??
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

  image_url: getBackendImage(
    doctor.imageUrl ??
      doctor.ImageUrl ??
      doctor.image_url ??
      ""
  ),

  status:
    doctor.status ??
    doctor.Status ??
    "",

  qualification:
    doctor.qualification ??
    doctor.Qualification ??
    "",

  office_number:
    doctor.office_number ??
    doctor.officeNumber ??
    doctor.OfficeNumber ??
    "",

  phone:
    doctor.phone ??
    doctor.Phone ??
    "",

  email:
    doctor.email ??
    doctor.Email ??
    "",
});

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Doctors() {
  const {
    data: departments = [],
    loading: deptLoading,
  } = useDepartments();

  const {
    data: doctors = [],
    loading: doctorsLoading,
  } = useDoctors();

  const [selectedDept, setSelectedDept] =
    useState(null);

  /* =======================================================
     DEPARTMENTS FROM DEPARTMENTS API ONLY
  ======================================================= */

  const normalizedDepartments = useMemo(() => {
    if (!Array.isArray(departments)) {
      return [];
    }

    return departments.map(
      normalizeDepartment
    );
  }, [departments]);

  /* =======================================================
     DOCTORS FROM DOCTORS API ONLY
  ======================================================= */

  const normalizedDoctors = useMemo(() => {
    if (!Array.isArray(doctors)) {
      return [];
    }

    return doctors.map(normalizeDoctor);
  }, [doctors]);

  /* =======================================================
     DEPARTMENT SELECTED
  ======================================================= */

  if (selectedDept) {
    const departmentDoctors =
      normalizedDoctors.filter((doctor) => {
        /*
          الأفضل: الربط بالـ DepartmentId
          لو الباك بيرجعه.
        */
        if (
          doctor.department_id !== null &&
          doctor.department_id !== undefined &&
          selectedDept.id !== null &&
          selectedDept.id !== undefined
        ) {
          return (
            String(doctor.department_id) ===
            String(selectedDept.id)
          );
        }

        /*
          Fallback مؤقت:
          الربط باسم القسم.
        */
        return (
          normalizeText(
            doctor.department_name
          ) ===
          normalizeText(selectedDept.name)
        );
      });

    return (
      <DoctorsByDepartment
        department={selectedDept}
        doctors={departmentDoctors}
        loading={doctorsLoading}
        onBack={() =>
          setSelectedDept(null)
        }
      />
    );
  }

  return (
    <div className="pt-24">

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style>
        {`
          .department-border-path {
            fill: none;
            stroke: #197786;
            stroke-width: 3;
            vector-effect: non-scaling-stroke;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;

            transition:
              stroke-dashoffset
              1.15s
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          .department-card-normal:hover
          .department-border-path {
            stroke-dashoffset: 0;
          }

          @media (prefers-reduced-motion: reduce) {
            .department-border-path {
              transition: none;
            }
          }
        `}
      </style>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative py-20 overflow-hidden">

        <div className="absolute inset-0">

          <img
            src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
              فريقنا الطبي
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
              أطباؤنا
            </h1>

            <p
              className="
                text-xl
                text-slate-200
                max-w-2xl
                mx-auto
              "
            >
              نخبة من أمهر الأطباء والاستشاريين
              في مختلف التخصصات الطبية
            </p>

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          DEPARTMENTS
      ====================================================== */}

      <section className="section-padding bg-slate-50">

        <div className="px-8">

          <Reveal>

            <SectionHeading
              badge="التخصصات"
              title="اختر القسم"
              subtitle="اختر القسم للتعرف على أطبائه"
            />

          </Reveal>

          {deptLoading ? (

            /* =================================================
                LOADING
            ================================================== */

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
                length: 8,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    card
                    shimmer-bg
                    h-48
                    rounded-2xl
                  "
                />

              ))}

            </div>

          ) : normalizedDepartments.length === 0 ? (

            /* =================================================
                EMPTY
            ================================================== */

            <div className="text-center py-16">

              <p className="text-slate-500 text-lg">
                لا توجد أقسام متاحة حالياً
              </p>

            </div>

          ) : (

            /* =================================================
                DEPARTMENTS GRID
            ================================================== */

            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-6
              "
            >

              {normalizedDepartments.map(
                (dept, index) => {

                  const Icon =
                    departmentIcons[
                      dept.icon || ""
                    ] || Stethoscope;

                  /* ===========================================
                     DOCTORS COUNT
                  ============================================ */

                  const count =
                    normalizedDoctors.filter(
                      (doctor) => {

                        if (
                          doctor.department_id !==
                            null &&
                          doctor.department_id !==
                            undefined &&
                          dept.id !== null &&
                          dept.id !== undefined
                        ) {
                          return (
                            String(
                              doctor.department_id
                            ) ===
                            String(dept.id)
                          );
                        }

                        return (
                          normalizeText(
                            doctor.department_name
                          ) ===
                          normalizeText(dept.name)
                        );
                      }
                    ).length;

                  return (
                    <Reveal
                      key={
                        dept.id ??
                        `${dept.name}-${index}`
                      }
                      delay={index * 50}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDept(dept)
                        }
                        className="
                          department-card-normal

                          card
                          card-lift

                          relative
                          overflow-hidden

                          p-6

                          text-center

                          w-full
                          h-full

                          group
                        "
                      >

                        {/* =====================================
                            BORDER
                        ====================================== */}

                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="
                            absolute
                            inset-0

                            z-30

                            w-full
                            h-full

                            pointer-events-none

                            overflow-visible
                          "
                        >

                          <path
                            pathLength="100"
                            d="
                              M 99 50
                              L 99 8
                              Q 99 1 92 1
                              L 8 1
                              Q 1 1 1 8
                              L 1 92
                              Q 1 99 8 99
                              L 92 99
                              Q 99 99 99 92
                              Z
                            "
                            className="department-border-path"
                          />

                        </svg>

                        {/* =====================================
                            ICON / IMAGE
                        ====================================== */}

                        {dept.image_url ? (

                          <PlaceholderImage
                            type="department"
                            src={dept.image_url}
                            alt={dept.name}
                            className="
                              relative
                              z-10
                              w-16
                              h-16
                              mx-auto
                              mb-4
                            "
                            rounded="rounded-2xl"
                            objectFit="object-cover"
                          />

                        ) : (

                          <div
                            className="
                              relative
                              z-10

                              w-16
                              h-16

                              mx-auto

                              rounded-2xl

                              bg-gradient-to-br
                              from-primary-100
                              to-secondary-100

                              flex
                              items-center
                              justify-center

                              mb-4

                              group-hover:from-primary-500
                              group-hover:to-secondary-500

                              group-hover:scale-110

                              transition-all
                              duration-500
                            "
                          >

                            <Icon
                              className="
                                w-8
                                h-8

                                text-primary-600

                                group-hover:text-white

                                transition-colors
                                duration-500
                              "
                            />

                          </div>

                        )}

                        {/* =====================================
                            NAME
                        ====================================== */}

                        <h3
                          className="
                            relative
                            z-10

                            text-2xl

                            font-bold

                            text-slate-800

                            mb-1

                            group-hover:text-[#197786]

                            transition-colors
                            duration-500
                          "
                        >
                          {dept.name}
                        </h3>

                        {/* =====================================
                            COUNT
                        ====================================== */}

                        <p
                          className="
                            relative
                            z-10

                            text-lg

                            text-slate-500
                          "
                        >
                          {count} طبيب
                        </p>

                      </button>

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

/* =========================================================
   DOCTORS BY DEPARTMENT
========================================================= */

function DoctorsByDepartment({
  department,
  doctors,
  loading,
  onBack,
}) {
  const Icon =
    departmentIcons[
      department.icon || ""
    ] || Stethoscope;

  const [
    focusedDoctor,
    setFocusedDoctor,
  ] = useState(null);

  const openDoctor = (doctor) => {
    setFocusedDoctor(doctor);
  };

  const closeDoctor = () => {
    setFocusedDoctor(null);
  };

  return (
    <div className="pt-24">

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style>
        {`
          @keyframes doctorBackdropShow {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes doctorFocusShow {
            0% {
              opacity: 0;
              transform:
                translateY(30px)
                scale(0.72);
            }

            60% {
              opacity: 1;
              transform:
                translateY(-5px)
                scale(1.03);
            }

            100% {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }

          .doctor-focus-backdrop {
            animation:
              doctorBackdropShow
              0.25s
              ease-out
              forwards;
          }

          .doctor-focus-card {
            transform-origin:
              center center;

            animation:
              doctorFocusShow
              0.48s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              )
              forwards;
          }

          .doctor-border-path {
            fill: none;

            stroke: #197786;

            stroke-width: 3;

            vector-effect:
              non-scaling-stroke;

            stroke-linecap: round;

            stroke-linejoin: round;

            stroke-dasharray: 100;

            stroke-dashoffset: 100;

            transition:
              stroke-dashoffset
              1.15s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
          }

          .doctor-card-normal:hover
          .doctor-border-path {
            stroke-dashoffset: 0;
          }

          @media (prefers-reduced-motion: reduce) {
            .doctor-border-path {
              transition: none;
            }
          }
        `}
      </style>

      {/* =====================================================
          DEPARTMENT HEADER
      ====================================================== */}

      <section
        className="
          relative
          py-12
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
            onClick={onBack}
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

          <div
            className="
              flex
              items-center
              gap-5
            "
          >

            {department.image_url ? (

              <PlaceholderImage
                type="department"
                src={department.image_url}
                alt={department.name}
                className="
                  w-20
                  h-20
                "
                rounded="rounded-3xl"
                objectFit="object-cover"
              />

            ) : (

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

            )}

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
                {department.name}
              </h1>

              {department.description && (

                <p className="text-white/80">
                  {department.description}
                </p>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DOCTORS
      ====================================================== */}

      <section
        className="
          py-14

          bg-slate-50

          min-h-[420px]
        "
      >

        <div className="container-custom">

          <Reveal>

            <SectionHeading
              badge="فريق القسم"
              title={`أطباء ${department.name}`}
              subtitle="تعرف على أطباء واستشاريي القسم"
            />

          </Reveal>

          {loading ? (

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3

                gap-7
              "
            >

              {Array.from({
                length: 6,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    shimmer-bg
                    rounded-[26px]
                    h-[420px]
                  "
                />

              ))}

            </div>

          ) : doctors.length === 0 ? (

            <div className="text-center py-16">

              <p
                className="
                  text-slate-500
                  text-lg
                "
              >
                لا يوجد أطباء في هذا القسم حالياً
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-[repeat(auto-fit,minmax(280px,340px))]
                justify-center
                gap-7
                items-stretch
              "
            >

              {doctors.map(
                (doctor, index) => (

                  <Reveal
                    key={
                      doctor.id ??
                      `${doctor.name}-${index}`
                    }
                    delay={index * 80}
                    className="h-full"
                  >

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        openDoctor(doctor)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          openDoctor(doctor);
                        }
                      }}
                      className="
                        w-full
                        h-full

                        min-h-[390px]

                        cursor-pointer
                      "
                    >

                      <DoctorCard
                        doctor={doctor}
                        expanded={false}
                      />

                    </div>

                  </Reveal>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          LARGE DOCTOR CARD
      ====================================================== */}

      {focusedDoctor && (

        <div
          className="
            doctor-focus-backdrop

            fixed
            inset-0

            z-[9999]

            flex
            items-center
            justify-center

            p-5

            bg-[#0F172A]/25

            backdrop-blur-[4px]
          "
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeDoctor();
            }

          }}
        >

          <div
            className="
              doctor-focus-card

              w-full
              max-w-[440px]

              max-h-[88vh]

              overflow-y-auto

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <DoctorCard
              doctor={focusedDoctor}
              expanded
            />

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   DOCTOR CARD
========================================================= */

function DoctorCard({
  doctor,
  expanded = false,
}) {
  return (
    <div
      className={`
        group

        ${
          !expanded
            ? "doctor-card-normal"
            : ""
        }

        relative

        w-full
        h-full

        flex
        flex-col

        overflow-hidden

        rounded-[26px]

        border

        ${
          expanded
            ? "border-[#83BDC4]"
            : "border-[#E7E3E3]"
        }

        bg-white

        ${
          expanded
            ? "p-7"
            : "p-5"
        }

        ${
          expanded
            ? "shadow-[0_30px_70px_rgba(25,119,134,0.22)]"
            : "shadow-[0_10px_30px_rgba(47,52,55,0.07)]"
        }

        transition-all
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]

        ${
          !expanded
            ? `
              hover:-translate-y-2
              hover:shadow-[0_22px_48px_rgba(25,119,134,0.17)]
            `
            : ""
        }
      `}
    >

      {/* =====================================================
          BORDER
      ====================================================== */}

      {!expanded && (

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="
            absolute
            inset-0

            z-30

            w-full
            h-full

            pointer-events-none

            overflow-visible
          "
        >

          <path
            pathLength="100"
            d="
              M 99 50
              L 99 8
              Q 99 1 92 1
              L 8 1
              Q 1 1 1 8
              L 1 92
              Q 1 99 8 99
              L 92 99
              Q 99 99 99 92
              Z
            "
            className="doctor-border-path"
          />

        </svg>

      )}

      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className={`
          relative
          z-10

          shrink-0

          mx-auto

          rounded-full

          p-[4px]

          bg-gradient-to-br
          from-[#197786]
          to-[#83BDC4]

          shadow-[0_8px_25px_rgba(25,119,134,0.16)]

          transition-all
          duration-500

          ${
            !expanded
              ? `
                group-hover:scale-[1.05]
              `
              : ""
          }

          ${
            expanded
              ? `
                w-[190px]
                h-[190px]
                mb-6
              `
              : `
                w-[145px]
                h-[145px]
                mb-5
              `
          }
        `}
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
            src={doctor.image_url}
            alt={doctor.name}
            className="
              w-full
              h-full

              rounded-full

              transition-transform
              duration-500

              group-hover:scale-[1.04]
            "
            rounded="rounded-full"
            objectFit="object-cover"
          />

        </div>

      </div>

      {/* =====================================================
          NAME
      ====================================================== */}

      <h3
        className={`
          relative
          z-10

          text-center

          font-extrabold

          text-[#1E293B]

          leading-relaxed

          mb-1

          transition-all
          duration-500

          ${
            !expanded
              ? "group-hover:text-[#197786]"
              : ""
          }

          ${
            expanded
              ? "text-2xl"
              : "text-xl"
          }
        `}
      >
        {doctor.name}
      </h3>

      {/* =====================================================
          SPECIALIZATION
      ====================================================== */}

      {doctor.specialty && (

        <p
          className={`
            relative
            z-10

            text-center

            text-[#197786]

            font-bold

            leading-6

            mb-3

            ${
              expanded
                ? "text-base"
                : "text-sm"
            }
          `}
        >
          {doctor.specialty}
        </p>

      )}

      {/* =====================================================
          BIOGRAPHY
      ====================================================== */}

      {doctor.bio && (

        <p
          className={`
            relative
            z-10

            text-[#6D686A]

            text-center

            leading-6

            mb-4

            ${
              expanded
                ? "text-sm"
                : "text-xs line-clamp-3"
            }
          `}
        >
          {doctor.bio}
        </p>

      )}

      {/* =====================================================
          QUALIFICATION
      ====================================================== */}

      {doctor.qualification && (

        <div
          className="
            relative
            z-10

            flex
            items-start

            gap-2

            pt-4

            border-t
            border-[#E7E3E3]

            mb-3
          "
        >

          <div
            className={`
              shrink-0

              rounded-lg

              bg-[#D1F9FC]/60

              text-[#197786]

              flex
              items-center
              justify-center

              ${
                expanded
                  ? "w-10 h-10"
                  : "w-8 h-8"
              }
            `}
          >

            <GraduationCap
              className={
                expanded
                  ? "w-5 h-5"
                  : "w-4 h-4"
              }
            />

          </div>

          <span
            className={`
              flex-1

              text-[#5F6670]

              leading-6

              ${
                expanded
                  ? "text-sm"
                  : "text-xs line-clamp-3"
              }
            `}
          >
            {doctor.qualification}
          </span>

        </div>

      )}

      {/* =====================================================
          OFFICE
      ====================================================== */}

      {doctor.office_number && (

        <div
          className="
            relative
            z-10

            flex
            items-center
            gap-2

            text-[#6D686A]

            mb-3

            text-sm
          "
        >

          <Building2
            className="
              w-4
              h-4

              shrink-0

              text-[#83BDC4]
            "
          />

          <span>
            {doctor.office_number}
          </span>

        </div>

      )}

      {/* =====================================================
          CONTACT
      ====================================================== */}

      {(doctor.phone || doctor.email) && (

        <div
          className="
            relative
            z-10

            mt-auto

            flex
            justify-center
            gap-2

            pt-3

            border-t
            border-[#E7E3E3]
          "
        >

          {doctor.phone && (

            <a
              href={`tel:${doctor.phone}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                w-9
                h-9

                rounded-xl

                bg-[#D1F9FC]/60

                text-[#197786]

                flex
                items-center
                justify-center

                transition-all
                duration-300

                hover:bg-[#197786]
                hover:text-white
                hover:scale-110
              "
              aria-label="اتصال بالطبيب"
            >

              <Phone className="w-4 h-4" />

            </a>

          )}

          {doctor.email && (

            <a
              href={`mailto:${doctor.email}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                w-9
                h-9

                rounded-xl

                bg-[#953238]/10

                text-[#953238]

                flex
                items-center
                justify-center

                transition-all
                duration-300

                hover:bg-[#953238]
                hover:text-white
                hover:scale-110
              "
              aria-label="إرسال بريد للطبيب"
            >

              <Mail className="w-4 h-4" />

            </a>

          )}

        </div>

      )}

    </div>
  );
}