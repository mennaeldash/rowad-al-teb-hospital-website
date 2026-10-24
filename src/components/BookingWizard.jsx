import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle,
  User,
  Loader2,
  Check,
  X,
  Building2,
  Stethoscope,
  CalendarDays,
} from "lucide-react";

import {
  createAppointment,
} from "@/services/appointments";

import {
  createNotification,
} from "@/services/notifications";

import {
  getDoctor,
} from "@/services/doctors";

/* =========================================================
   DAYS
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

/* =========================================================
   WORKING DAYS HELPERS
========================================================= */

const getArabicDay = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const dayId =
      value.id ??
      value.Id ??
      value.dayId ??
      value.DayId;

    if (
      dayId !== null &&
      dayId !== undefined &&
      DAY_LABELS[Number(dayId)]
    ) {
      return DAY_LABELS[
        Number(dayId)
      ];
    }

    const dayName =
      value.name ??
      value.Name ??
      value.day ??
      value.Day ??
      value.dayName ??
      value.DayName ??
      "";

    return getArabicDay(
      dayName
    );
  }

  const numericValue =
    Number(value);

  if (
    Number.isInteger(
      numericValue
    ) &&
    numericValue >= 0 &&
    numericValue <= 6
  ) {
    return DAY_LABELS[
      numericValue
    ];
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return (
    DAY_LABELS[
      normalized
    ] ||
    String(value)
  );
};

const normalizeDaysArray = (
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
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    return value
      .split(/[,|;]+/)
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

const getDoctorWorkingDays = (
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

  const labels =
    normalizeDaysArray(
      rawDays
    )
      .map(
        getArabicDay
      )
      .filter(Boolean);

  return [
    ...new Set(
      labels
    ),
  ];
};

/* =========================================================
   DATE HELPERS
========================================================= */

const getTodayDateValue = () => {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getDateDayName = (
  dateValue
) => {
  if (!dateValue) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] =
    dateValue
      .split("-")
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return "";
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return (
    DAY_LABELS[
      date.getDay()
    ] || ""
  );
};


/* =========================================================
   ARABIC CALENDAR
========================================================= */

const ARABIC_WEEK_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const formatDateValue = (date) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getDateFromValue = (
  value
) => {
  if (!value) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day
  );
};

function ArabicDatePicker({
  value,
  onChange,
  min,
  disabled,
}) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const selectedDate =
    useMemo(
      () =>
        getDateFromValue(
          value
        ),
      [value]
    );

  const initialViewDate =
    selectedDate ||
    new Date();

  const [
    viewDate,
    setViewDate,
  ] = useState(
    new Date(
      initialViewDate.getFullYear(),
      initialViewDate.getMonth(),
      1
    )
  );

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setViewDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );
  }, [selectedDate]);

  const year =
    viewDate.getFullYear();

  const month =
    viewDate.getMonth();

  const firstDayIndex =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const calendarCells = [
    ...Array(
      firstDayIndex
    ).fill(null),
    ...Array.from(
      {
        length:
          daysInMonth,
      },
      (_, index) =>
        index + 1
    ),
  ];

  while (
    calendarCells.length %
      7 !==
    0
  ) {
    calendarCells.push(
      null
    );
  }

  const goToPreviousMonth =
    () => {
      setViewDate(
        new Date(
          year,
          month - 1,
          1
        )
      );
    };

  const goToNextMonth =
    () => {
      setViewDate(
        new Date(
          year,
          month + 1,
          1
        )
      );
    };

  const displayValue =
    selectedDate
      ? `${
          DAY_LABELS[
            selectedDate.getDay()
          ]
        } ${
          selectedDate.getDate()
        } ${
          ARABIC_MONTHS[
            selectedDate.getMonth()
          ]
        } ${
          selectedDate.getFullYear()
        }`
      : " برجاء الضغط علي التقويم لاختيار اليوم المحدد";

  return (
    <div
      className="relative"
      dir="rtl"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(
              (previous) =>
                !previous
            );
          }
        }}
        className="
          w-full
          px-8
          py-3
          rounded-xl
          border
          border-slate-200
          bg-white
          text-right
          text-slate-800
          outline-none
          transition-all
          hover:border-primary-400
          focus:border-primary-500
          focus:ring-2
          focus:ring-primary-200
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <span className="flex items-center justify-between gap-3">
          <span>
            {displayValue}
          </span>

          <CalendarDays className="w-8 h-8 shrink-0 text-primary-900" />
        </span>
        <span className="absolute top-0 left-0 h-full w-10 flex items-center justify-center text-primary-900"> ➤ </span>
      </button>

      {isOpen &&
        !disabled && (
          <div
            className="
              absolute
              z-50
              top-full
              right-0
              mt-2
              w-[min(88vw,390px)]
              max-w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-3
              shadow-xl
            "
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <button
                type="button"
                onClick={
                  goToPreviousMonth
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  text-slate-700
                  text-lg
                  font-black
                  transition-all
                  hover:bg-primary-100
                  hover:text-primary-700
                "
                aria-label="الشهر السابق"
              >
                ›
              </button>

              <div className="text-center font-extrabold text-slate-800">
                {
                  ARABIC_MONTHS[
                    month
                  ]
                }{" "}
                {year}
              </div>

              <button
                type="button"
                onClick={
                  goToNextMonth
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  text-slate-700
                  text-lg
                  font-black
                  transition-all
                  hover:bg-primary-100
                  hover:text-primary-700
                "
                aria-label="الشهر التالي"
              >
                ‹
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
              {ARABIC_WEEK_DAYS.map(
                (dayName) => (
                  <div
                    key={
                      dayName
                    }
                    className="
                      h-7
                      flex
                      items-center
                      justify-center
                      px-0.5
                      text-center
                      text-[10px]
                      sm:text-[11px]
                      md:text-[12px]
                      leading-tight
                      font-extrabold
                      text-primary-700
                    "
                  >
                    {dayName}
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map(
                (
                  dayNumber,
                  index
                ) => {
                  if (
                    !dayNumber
                  ) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="h-7"
                      />
                    );
                  }

                  const date =
                    new Date(
                      year,
                      month,
                      dayNumber
                    );

                  const dateValue =
                    formatDateValue(
                      date
                    );

                  const isPast =
                    Boolean(min) &&
                    dateValue <
                      min;

                  const isSelected =
                    value ===
                    dateValue;

                  return (
                    <button
                      key={
                        dateValue
                      }
                      type="button"
                      disabled={
                        isPast
                      }
                      onClick={() => {
                        onChange(
                          dateValue
                        );
                        setIsOpen(
                          false
                        );
                      }}
                      className={`
                        h-7
                        rounded-lg
                        text-md
                        font-bold
                        transition-all
                        ${
                          isSelected
                            ? "bg-primary-600 text-white shadow-md"
                            : "text-slate-700 hover:bg-primary-100 hover:text-primary-700"
                        }
                        ${
                          isPast
                            ? "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-700"
                            : ""
                        }
                      `}
                    >
                      {dayNumber}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
    </div>
  );
}

/* =========================================================
   DOCTOR STATUS
========================================================= */

const isDoctorAvailable = (
  status
) => {
  if (
    status === null ||
    status === undefined ||
    status === ""
  ) {
    return true;
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

  const normalized =
    String(status)
      .trim()
      .toLowerCase();

  return (
    normalized === "active" ||
    normalized === "نشط" ||
    normalized === "متاح"
  );
};

/* =========================================================
   BOOKING WIZARD
========================================================= */

export default function BookingWizard({
  doctor,
  department,
  onClose,
}) {
  /* =======================================================
     DOCTOR DETAILS
  ======================================================= */

  const [
    doctorDetails,
    setDoctorDetails,
  ] = useState(null);

  const [
    doctorLoading,
    setDoctorLoading,
  ] = useState(true);

  const [
    doctorError,
    setDoctorError,
  ] = useState(null);

  useEffect(() => {
    let cancelled =
      false;

    const loadDoctor =
      async () => {
        if (
          doctor?.id === null ||
          doctor?.id ===
            undefined ||
          doctor?.id === ""
        ) {
          setDoctorDetails(
            doctor || null
          );

          setDoctorLoading(
            false
          );

          return;
        }

        try {
          setDoctorLoading(
            true
          );

          setDoctorError(
            null
          );

          const details =
            await getDoctor(
              doctor.id
            );

          console.log(
            "BOOKING DOCTOR DETAILS:",
            details
          );

          if (
            !cancelled
          ) {
            setDoctorDetails(
              details ||
                doctor
            );
          }
        } catch (err) {
          console.error(
            "GET DOCTOR DETAILS ERROR:",
            err
          );

          if (
            !cancelled
          ) {
            setDoctorDetails(
              doctor ||
                null
            );

            setDoctorError(
              "تعذر تحميل حالة وأيام عمل الطبيب حالياً."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setDoctorLoading(
              false
            );
          }
        }
      };

    loadDoctor();

    return () => {
      cancelled =
        true;
    };
  }, [
    doctor?.id,
  ]);

  /* =======================================================
     CURRENT DOCTOR
  ======================================================= */

  const currentDoctor =
    doctorDetails ||
    doctor ||
    {};

  /* =======================================================
     STATUS
  ======================================================= */

  const doctorStatus =
    currentDoctor.status ??
    currentDoctor.Status ??
    "";

  const doctorAvailable =
    isDoctorAvailable(
      doctorStatus
    );

  /* =======================================================
     WORKING DAYS
  ======================================================= */

  const workingDays =
    useMemo(
      () =>
        getDoctorWorkingDays(
          currentDoctor
        ),
      [
        currentDoctor,
      ]
    );

  /* =======================================================
     FORM
  ======================================================= */

  const [
    form,
    setForm,
  ] = useState({
    full_name: "",
    phone: "",
    type: "",
    appointment_date: "",
    email: "",
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    confirmed,
    setConfirmed,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* =======================================================
     DATE VALIDATION
  ======================================================= */

  const todayDate =
    getTodayDateValue();

  const selectedDayName =
    useMemo(
      () =>
        getDateDayName(
          form.appointment_date
        ),
      [
        form.appointment_date,
      ]
    );

  const dateIsPast =
    Boolean(
      form.appointment_date
    ) &&
    form.appointment_date <
      todayDate;

  const dateMatchesWorkingDays =
    useMemo(() => {
      if (
        !form.appointment_date
      ) {
        return true;
      }

      /*
        لو مفيش أيام عمل راجعة،
        نخلي الـBackend هو اللي يتحقق.
      */

      if (
        workingDays.length ===
        0
      ) {
        return true;
      }

      return workingDays.includes(
        selectedDayName
      );
    }, [
      form.appointment_date,
      workingDays,
      selectedDayName,
    ]);

  const dateIsValid =
    Boolean(
      form.appointment_date
    ) &&
    !dateIsPast &&
    dateMatchesWorkingDays;

  /* =======================================================
     STYLES
  ======================================================= */

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "focus:border-primary-500 focus:ring-2 focus:ring-primary-200 " +
    "outline-none transition-all bg-white text-slate-800";

  const labelClass =
    "block text-sm font-bold text-slate-700 mb-2";

  /* =======================================================
     VALIDATION
  ======================================================= */

  const canSubmit =
    form.full_name
      .trim() !==
      "" &&
    form.phone
      .trim() !==
      "" &&
    form.type
      .trim() !==
      "" &&
    dateIsValid &&
    doctorAvailable &&
    !doctorLoading;

  /* =======================================================
     CHANGE
  ======================================================= */

  const handleInputChange = (
    field,
    value
  ) => {
    setForm(
      (
        previousForm
      ) => ({
        ...previousForm,
        [field]:
          value,
      })
    );

    if (
      field !==
      "appointment_date"
    ) {
      if (error) {
        setError(
          null
        );
      }

      return;
    }

    setError(
      null
    );

    if (!value) {
      return;
    }

    if (
      value <
      todayDate
    ) {
      setError(
        "لا يمكن اختيار تاريخ سابق."
      );

      return;
    }

    const chosenDay =
      getDateDayName(
        value
      );

    if (
      workingDays.length >
        0 &&
      !workingDays.includes(
        chosenDay
      )
    ) {
      setError(
        `الطبيب غير متاح يوم ${chosenDay}. برجاء اختيار يوم من أيام عمل الطبيب.`
      );
    }
  };

  /* =======================================================
     CONFIRM
  ======================================================= */

  const handleConfirm =
    async () => {
      if (
        submitting
      ) {
        return;
      }

      if (
        !doctorAvailable
      ) {
        setError(
          "هذا الطبيب غير متاح للحجز حالياً."
        );

        return;
      }

      if (
        !form.appointment_date
      ) {
        setError(
          "برجاء اختيار تاريخ الحجز."
        );

        return;
      }

      if (
        dateIsPast
      ) {
        setError(
          "لا يمكن اختيار تاريخ سابق."
        );

        return;
      }

      if (
        !dateMatchesWorkingDays
      ) {
        setError(
          `الطبيب غير متاح يوم ${selectedDayName}. برجاء اختيار يوم من أيام عمل الطبيب.`
        );

        return;
      }

      if (
        !form.type.trim()
      ) {
        setError(
          "برجاء اختيار نوع الحجز."
        );

        return;
      }

      if (
        !form.full_name.trim()
      ) {
        setError(
          "برجاء إدخال الاسم الكامل."
        );

        return;
      }

      if (
        !form.phone.trim()
      ) {
        setError(
          "برجاء إدخال رقم الهاتف."
        );

        return;
      }

      setSubmitting(
        true
      );

      setError(
        null
      );

      try {
        await createAppointment({
          doctorId:
            currentDoctor?.id ??
            doctor?.id ??
            null,

          patientName:
            form.full_name
              .trim(),

          patientPhone:
            form.phone
              .trim(),

          type:
            form.type
              .trim(),

          appointmentDate:
            form.appointment_date,
        });

        try {
          await createNotification({
            type:
              "appointment",

            title:
              "طلب حجز جديد",

            message:
              `طلب حجز جديد: ${form.full_name.trim()} مع ${
                currentDoctor?.name ||
                currentDoctor?.fullName ||
                doctor?.name ||
                "الطبيب"
              }`,
          });
        } catch (
          notificationError
        ) {
          console.error(
            "Notification error:",
            notificationError
          );
        }

        setConfirmed(
          true
        );
      } catch (err) {
        console.error(
          "Booking error:",
          err
        );

        const backendMessage =
          err?.response?.data
            ?.message ||
          "";

        if (
          backendMessage ===
          "Doctor is not available on this day."
        ) {
          setError(
            "الطبيب غير متاح في اليوم الذي تم اختياره. برجاء اختيار يوم من أيام عمل الطبيب."
          );
        } else {
          setError(
            "حدث خطأ أثناء إرسال طلب الحجز. يرجى المحاولة مرة أخرى."
          );
        }
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =======================================================
     CONFIRMED
  ======================================================= */

  if (confirmed) {
    return (
      <div
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
          p-4
        "
      >
        <div
          className="
            bg-white
            rounded-3xl
            max-w-lg
            w-full
            p-8
            md:p-12
            text-center
            animate-scale-in
            shadow-xl
          "
        >
          <div
            className="
              w-24
              h-24
              mx-auto
              rounded-full
              bg-success-100
              flex
              items-center
              justify-center
              mb-6
            "
          >
            <CheckCircle
              className="
                w-12
                h-12
                text-success-600
              "
            />
          </div>

          <h2
            className="
              text-2xl
              font-extrabold
              text-slate-800
              mb-3
            "
          >
            تم إرسال طلب الحجز  بنجاح
          </h2>

          <p
            className="
              text-slate-600
              mb-6
            "
          >
            تم تلقي طلبك، وسوف يتم
            التواصل معك لتأكيد  الحجز.
          </p>

          <div
            className="
              bg-slate-50
              rounded-2xl
              p-5
              mb-6
              text-right
              space-y-3
            "
          >
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                الطبيب
              </span>

              <span className="font-bold text-slate-800 text-sm">
                {currentDoctor?.name ||
                  currentDoctor?.fullName ||
                  doctor?.name}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                القسم
              </span>

              <span className="font-bold text-slate-800 text-sm">
                {department?.name}
              </span>
            </div>

            {workingDays.length >
              0 && (
              <div
                className="
                  flex
                  justify-between
                  items-start
                  gap-4
                "
              >
                <span className="text-slate-500 text-sm shrink-0">
                  أيام العمل
                </span>

                <div
                  className="
                    flex
                    flex-wrap
                    justify-end
                    gap-1.5
                  "
                >
                  {workingDays.map(
                    (
                      day,
                      index
                    ) => (
                      <span
                        key={`${day}-${index}`}
                        className="
                          px-2.5
                          py-1
                          rounded-lg
                          bg-primary-100
                          text-primary-700
                          text-xs
                          font-bold
                        "
                      >
                        {day}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                المريض
              </span>

              <span className="font-bold text-slate-800 text-sm">
                {form.full_name}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                الهاتف
              </span>

              <span
                className="font-bold text-slate-800 text-sm"
                dir="ltr"
              >
                {form.phone}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                نوع الحجز
              </span>

              <span className="font-bold text-slate-800 text-sm">
                {form.type}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                تاريخ الحجز 
              </span>

              <span
                className="font-bold text-slate-800 text-sm"
                dir="ltr"
              >
                {form.appointment_date}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-500 text-sm">
                حالة الطلب
              </span>

              <span
                className="
                  px-3
                  py-1
                  rounded-lg
                  bg-amber-100
                  text-amber-700
                  text-xs
                  font-bold
                "
              >
                في انتظار تأكيد موعد الحجز
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              btn
              btn-primary
              w-full
            "
          >
            تم
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     FORM
  ======================================================= */

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-xl
        max-w-2xl
        w-full
        mx-auto
        overflow-hidden
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-l
          from-primary-600
          to-secondary-600
          p-6
          text-white
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            mb-4
          "
        >
          <h2
            className="
              text-xl
              font-extrabold
            "
          >
            حجز موعد
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              submitting
            }
            className="
              p-2
              rounded-xl
              hover:bg-white/10
              transition-all
              disabled:opacity-50
            "
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="
            grid
            sm:grid-cols-2
            gap-4
          "
        >
          <div
            className="
              bg-white/10
              backdrop-blur-md
              rounded-2xl
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-white/70
                text-xs
                mb-1
              "
            >
              <Building2 className="w-4 h-4" />

              القسم
            </div>

            <p
              className="
                font-bold
                text-lg
              "
            >
              {department?.name}
            </p>
          </div>

          <div
            className="
              bg-white/10
              backdrop-blur-md
              rounded-2xl
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-white/70
                text-xs
                mb-1
              "
            >
              <Stethoscope className="w-4 h-4" />

              الطبيب
            </div>

            <p
              className="
                font-bold
                text-lg
              "
            >
              {currentDoctor?.name ||
                currentDoctor?.fullName ||
                doctor?.name}
            </p>

            {(currentDoctor?.specialty ||
              currentDoctor?.specialization ||
              doctor?.specialty) && (
              <p
                className="
                  text-xs
                  text-white/70
                "
              >
                {currentDoctor?.specialty ||
                  currentDoctor?.specialization ||
                  doctor?.specialty}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PATIENT TITLE */}

      <div
        className="
          px-6
          pt-6
          pb-4
          border-b
          border-slate-100
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-2xl
              bg-primary-600
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              shadow-primary-500/30
            "
          >
            <User className="w-5 h-5" />
          </div>

          <div>
            <h3
              className="
                font-extrabold
                text-slate-800
              "
            >
              بيانات المريض
            </h3>

            <p
              className="
                text-xs
                text-slate-500
                mt-1
              "
            >
              أدخل بياناتك وسوف نتواصل معك
              لتحديد الموعد
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}

      <div className="p-6">
        {error && (
          <div
            className="
              bg-error-50
              text-error-700
              p-4
              rounded-xl
              mb-5
              text-sm
              font-bold
            "
          >
            {error}
          </div>
        )}

        <div
          className="
            space-y-5
            animate-fade-in
          "
        >
          {/* DOCTOR INFO */}

          {doctorLoading ? (
            <div
              className="
                bg-slate-50
                rounded-2xl
                p-4
                flex
                items-center
                gap-2
                text-sm
                text-slate-500
              "
            >
              <Loader2
                className="
                  w-4
                  h-4
                  animate-spin
                  text-primary-600
                "
              />

              جاري تحميل بيانات الطبيب...
            </div>
          ) : (
            <div
              className="
                bg-slate-50
                rounded-2xl
                p-4
                space-y-4
              "
            >
              {/* STATUS */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  حالة الطبيب
                </span>

                {doctorAvailable ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1.5
                      rounded-full
                      bg-green-100
                      text-green-700
                      text-xs
                      font-extrabold
                    "
                  >
                    <CheckCircle className="w-4 h-4" />

                    متاح
                  </span>
                ) : (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1.5
                      rounded-full
                      bg-red-100
                      text-red-700
                      text-xs
                      font-extrabold
                    "
                  >
                    <X className="w-4 h-4" />

                    غير متاح حالياً
                  </span>
                )}
              </div>

              {/* WORKING DAYS */}

              {workingDays.length >
              0 ? (
                <div
                  className="
                    border-t
                    border-slate-200
                    pt-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      text-slate-700
                      mb-3
                    "
                  >
                    <CalendarDays
                      className="
                        w-4
                        h-4
                        text-primary-600
                      "
                    />

                    أيام عمل الطبيب
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {workingDays.map(
                      (
                        day,
                        index
                      ) => (
                        <span
                          key={`${day}-${index}`}
                          className="
                            px-3
                            py-1.5
                            rounded-lg
                            bg-primary-100
                            text-primary-700
                            text-sm
                            font-bold
                          "
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="
                    border-t
                    border-slate-200
                    pt-4
                    text-sm
                    text-slate-500
                  "
                >
                  لم يتم تحديد أيام عمل هذا الطبيب حالياً.
                </div>
              )}

              {doctorError && (
                <p
                  className="
                    text-xs
                    text-amber-600
                  "
                >
                  {doctorError}
                </p>
              )}
            </div>
          )}

          {!doctorLoading &&
            !doctorAvailable && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  text-sm
                  font-bold
                  text-red-700
                "
              >
                الطبيب غير متاح للحجز حالياً.
              </div>
            )}

          {/* APPOINTMENT DATE */}

          <div>
            <label
              className={
                labelClass
              }
            >
تاريخ الكشف

يرجى اختيار تاريخ من أيام تواجد الطبيب الموضحة بالأعلى، ويمكنك اختيار نفس اليوم في الأسبوع الحالي أو أي أسبوع قادم، حسب الموعد المناسب لك.            </label>

            <ArabicDatePicker
              value={
                form.appointment_date
              }
              min={
                todayDate
              }
              disabled={
                submitting ||
                !doctorAvailable
              }
              onChange={(
                value
              ) =>
                handleInputChange(
                  "appointment_date",
                  value
                )
              }
            />

            {form.appointment_date &&
              !dateIsPast &&
              dateMatchesWorkingDays && (
                <p
                  className="
                    mt-2
                    text-xs
                    font-bold
                    text-green-600
                  "
                >
                  اليوم المختار:{" "}
                  {selectedDayName}
                </p>
              )}

            {form.appointment_date &&
              !dateIsPast &&
              !dateMatchesWorkingDays && (
                <p
                  className="
                    mt-2
                    text-xs
                    font-bold
                    text-red-600
                  "
                >
                  الطبيب غير متاح يوم{" "}
                  {selectedDayName}
                </p>
              )}
          </div>

          {/* BOOKING TYPE */}

          <div>
            <label
              className={
                labelClass
              }
            >
              نوع الحجز *
            </label>

            <select
              required
              value={
                form.type
              }
              onChange={(
                event
              ) =>
                handleInputChange(
                  "type",
                  event.target.value
                )
              }
              className={
                inputClass
              }
              disabled={
                submitting ||
                !doctorAvailable
              }
            >
              <option value="">
                اختر نوع الحجز
              </option>

              <option value="نقدي">
                نقدي
              </option>

              <option value="تعاقدات">
                تعاقدات
              </option>
            </select>
          </div>

          {/* NAME + PHONE */}

          <div
            className="
              grid
              sm:grid-cols-2
              gap-5
            "
          >
            <div>
              <label
                className={
                  labelClass
                }
              >
                الاسم الكامل *
              </label>

              <input
                type="text"
                required
                value={
                  form.full_name
                }
                onChange={(
                  event
                ) =>
                  handleInputChange(
                    "full_name",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
                placeholder="أدخل اسمك الكامل"
                disabled={
                  submitting ||
                  !doctorAvailable
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                رقم الهاتف *
              </label>

              <input
                type="tel"
                required
                value={
                  form.phone
                }
                onChange={(
                  event
                ) =>
                  handleInputChange(
                    "phone",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
                placeholder="01xxxxxxxxx"
                dir="ltr"
                disabled={
                  submitting ||
                  !doctorAvailable
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}

      <div
        className="
          border-t
          border-slate-100
          p-4
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            submitting
          }
          className="
            btn
            btn-secondary
            disabled:opacity-50
          "
        >
          <X className="w-4 h-4" />

          إلغاء
        </button>

        <button
          type="button"
          onClick={
            handleConfirm
          }
          disabled={
            !canSubmit ||
            submitting ||
            doctorLoading
          }
          className="
            btn
            btn-primary
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting ? (
            <>
              <Loader2
                className="
                  w-4
                  h-4
                  animate-spin
                "
              />

              جاري الحجز...
            </>
          ) : !doctorAvailable ? (
            <>
              <X className="w-4 h-4" />

              غير متاح للحجز
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />

ارسال طلبك            </>
          )}
        </button>
      </div>
    </div>
  );
}