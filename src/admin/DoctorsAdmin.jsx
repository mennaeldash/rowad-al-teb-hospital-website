import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
} from "lucide-react";

import PlaceholderImage from "@/components/PlaceholderImage";

import {
  getAllDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStatusOptions,
  updateDoctorStatus,
  getDoctorWorkingDayOptions,
  updateDoctorWorkingDays,
} from "@/services/doctors";

import {
  getDepartments,
} from "@/services/departments";

import {
  canManageContent,
  canChangeDoctorStatus,
  canChangeDoctorWorkingDays,
} from "@/lib/permissions";

/* ======================================================
   CONSTANTS
====================================================== */

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "https://rewaddashboard.runasp.net";

const ARABIC_DAYS = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

const ENGLISH_DAY_IDS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/* ======================================================
   MAIN
====================================================== */

export default function DoctorsAdmin() {
  /* ======================================================
     PERMISSIONS
  ====================================================== */

  const userCanManageContent =
    canManageContent();

  const userCanChangeStatus =
    canChangeDoctorStatus();

  const userCanChangeWorkingDays =
    canChangeDoctorWorkingDays();

  const [
    data,
    setData,
  ] = useState([]);

  const [
    departments,
    setDepartments,
  ] = useState([]);

  const [
    statusOptions,
    setStatusOptions,
  ] = useState([]);

  const [
    workingDayOptions,
    setWorkingDayOptions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    FullName: "",
    Specialization: "",
    Biography: "",
    DepartmentId: "",
    Status: "",
    WorkingDays: [],
    Image: null,
  });

  /* ======================================================
     IMAGE URL
  ====================================================== */

  const getDoctorImageUrl = (
    imageUrl
  ) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith(
        "http://"
      ) ||
      imageUrl.startsWith(
        "https://"
      ) ||
      imageUrl.startsWith(
        "blob:"
      )
    ) {
      return imageUrl;
    }

    return `${BACKEND_ORIGIN}${
      imageUrl.startsWith("/")
        ? imageUrl
        : `/${imageUrl}`
    }`;
  };

  /* ======================================================
     STATUS HELPERS
  ====================================================== */

  const getStatusId = (
    status
  ) => {
    if (
      status === null ||
      status === undefined ||
      status === ""
    ) {
      return "";
    }

    const numericStatus =
      Number(status);

    if (
      numericStatus === 0 ||
      numericStatus === 1
    ) {
      return numericStatus;
    }

    const normalizedStatus =
      String(status)
        .trim()
        .toLowerCase();

    if (
      normalizedStatus ===
      "active"
    ) {
      return 0;
    }

    if (
      normalizedStatus ===
        "unavailable" ||
      normalizedStatus ===
        "inactive"
    ) {
      return 1;
    }

    const matchedStatus =
      statusOptions.find(
        (option) =>
          String(
            option?.name ??
              option?.Name ??
              ""
          )
            .trim()
            .toLowerCase() ===
          normalizedStatus
      );

    return (
      matchedStatus?.id ??
      matchedStatus?.Id ??
      ""
    );
  };

  const getStatusLabel = (
    status
  ) => {
    const statusId =
      getStatusId(
        status
      );

    if (
      Number(statusId) === 0
    ) {
      return "نشط";
    }

    if (
      Number(statusId) === 1
    ) {
      return "غير متاح";
    }

    return status
      ? String(status)
      : "";
  };

  /* ======================================================
     WORKING DAYS HELPERS
  ====================================================== */

  const getWorkingDayId = (
    value
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    /* OBJECT */

    if (
      typeof value ===
        "object" &&
      value !== null
    ) {
      const objectId =
        value.id ??
        value.Id ??
        value.dayId ??
        value.DayId;

      if (
        objectId !== null &&
        objectId !== undefined &&
        objectId !== ""
      ) {
        const numericObjectId =
          Number(objectId);

        if (
          Number.isInteger(
            numericObjectId
          ) &&
          numericObjectId >= 0 &&
          numericObjectId <= 6
        ) {
          return numericObjectId;
        }
      }

      const objectName =
        value.name ??
        value.Name ??
        value.day ??
        value.Day ??
        value.dayName ??
        value.DayName ??
        "";

      return getWorkingDayId(
        objectName
      );
    }

    /* NUMBER */

    const stringValue =
      String(value).trim();

    if (
      /^\d+$/.test(
        stringValue
      )
    ) {
      const numericValue =
        Number(stringValue);

      if (
        Number.isInteger(
          numericValue
        ) &&
        numericValue >= 0 &&
        numericValue <= 6
      ) {
        return numericValue;
      }
    }

    /* ENGLISH NAME */

    const normalizedValue =
      stringValue.toLowerCase();

    if (
      Object.prototype.hasOwnProperty.call(
        ENGLISH_DAY_IDS,
        normalizedValue
      )
    ) {
      return ENGLISH_DAY_IDS[
        normalizedValue
      ];
    }

    /* MATCH BACKEND OPTIONS */

    const matchedDay =
      workingDayOptions.find(
        (option) =>
          String(
            option?.name ??
              option?.Name ??
              ""
          )
            .trim()
            .toLowerCase() ===
          normalizedValue
      );

    if (!matchedDay) {
      return null;
    }

    const matchedId =
      matchedDay.id ??
      matchedDay.Id;

    const numericMatchedId =
      Number(matchedId);

    if (
      Number.isInteger(
        numericMatchedId
      ) &&
      numericMatchedId >= 0 &&
      numericMatchedId <= 6
    ) {
      return numericMatchedId;
    }

    return null;
  };

  const normalizeRawWorkingDays = (
    rawDays
  ) => {
    if (
      rawDays === null ||
      rawDays === undefined ||
      rawDays === ""
    ) {
      return [];
    }

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
          (item) =>
            item.trim()
        )
        .filter(Boolean);
    }

    return [];
  };

  const getDoctorWorkingDayIds = (
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

    const normalized =
      normalizeRawWorkingDays(
        rawDays
      );

    return [
      ...new Set(
        normalized
          .map(
            getWorkingDayId
          )
          .filter(
            (day) =>
              day !== null
          )
      ),
    ].sort(
      (a, b) =>
        a - b
    );
  };

  const getDoctorWorkingDaysText = (
    doctor
  ) => {
    const days =
      getDoctorWorkingDayIds(
        doctor
      );

    if (
      days.length === 0
    ) {
      return "";
    }

    return days
      .map(
        (day) =>
          ARABIC_DAYS[
            Number(day)
          ]
      )
      .filter(Boolean)
      .join(" - ");
  };

  /* ======================================================
     TOGGLE WORKING DAY

     مهم:
     بنحوّل كل القيم لأرقام
     عشان includes يشتغل صح.
  ====================================================== */

  const toggleWorkingDay = (
    dayId
  ) => {
    const id =
      Number(dayId);

    if (
      !Number.isInteger(id) ||
      id < 0 ||
      id > 6
    ) {
      return;
    }

    setForm(
      (previous) => {
        const currentDays =
          Array.isArray(
            previous.WorkingDays
          )
            ? previous.WorkingDays
                .map(Number)
                .filter(
                  (day) =>
                    Number.isInteger(
                      day
                    )
                )
            : [];

        const exists =
          currentDays.includes(
            id
          );

        const nextDays =
          exists
            ? currentDays.filter(
                (day) =>
                  day !== id
              )
            : [
                ...currentDays,
                id,
              ];

        return {
          ...previous,

          WorkingDays:
            [
              ...new Set(
                nextDays
              ),
            ].sort(
              (a, b) =>
                a - b
            ),
        };
      }
    );
  };

  /* ======================================================
     LOAD DATA
  ====================================================== */
/* ======================================================
   LOAD DATA
====================================================== */

const fetchData = async () => {
  try {
    setLoading(true);
    setError("");

    const [
      doctorsResponse,
      departmentsResponse,
      statusesResponse,
      workingDaysResponse,
    ] = await Promise.all([
      getAllDoctors(),
      getDepartments(),
      getDoctorStatusOptions(),
      getDoctorWorkingDayOptions(),
    ]);

    const doctorsList =
      Array.isArray(doctorsResponse)
        ? doctorsResponse
        : [];

    /* =====================================================
       IMPORTANT

       with-doctors بيرجع status و workingDays،
       لكن بعض الدكاترة بيرجع لهم workingDays: []
       رغم إن عندهم أيام فعلية.

       لذلك:
       - لو الأيام موجودة في with-doctors نستخدمها مباشرة.
       - لو الأيام فاضية فقط، نطلب GET /doctors/{id}
         مرة واحدة للتأكد من الأيام الحقيقية.

       ده يقلل عدد الـ requests ويحافظ على عرض الأيام.
    ===================================================== */

    const doctorsWithDetails =
      await Promise.all(
        doctorsList.map(
          async (doctor) => {
            const doctorId =
              doctor?.id ??
              doctor?.Id ??
              null;

            const listWorkingDays =
              getDoctorWorkingDayIds(
                doctor
              );

            /* لو with-doctors رجع الأيام، مفيش داعي لطلب إضافي */
            if (
              listWorkingDays.length > 0
            ) {
              return {
                ...doctor,
                workingDays:
                  listWorkingDays,
                working_days:
                  listWorkingDays,
              };
            }

            if (
              doctorId === null ||
              doctorId === undefined ||
              doctorId === ""
            ) {
              return doctor;
            }

            try {
              const details =
                await getDoctor(
                  doctorId
                );

              const detailsWorkingDays =
                getDoctorWorkingDayIds(
                  details
                );

              const finalWorkingDays =
                detailsWorkingDays.length > 0
                  ? detailsWorkingDays
                  : listWorkingDays;

              const finalDepartmentId =
                doctor?.departmentId ??
                doctor?.department_id ??
                details?.departmentId ??
                details?.department_id ??
                null;

              const finalDepartmentName =
                details?.departmentName ||
                details?.department_name ||
                doctor?.departmentName ||
                doctor?.department_name ||
                "";

              return {
                ...doctor,
                ...details,

                id: doctorId,

                departmentId:
                  finalDepartmentId,
                department_id:
                  finalDepartmentId,

                departmentName:
                  finalDepartmentName,
                department_name:
                  finalDepartmentName,

                workingDays:
                  finalWorkingDays,
                working_days:
                  finalWorkingDays,
              };
            } catch (detailsError) {
              console.error(
                `GET DOCTOR ${doctorId} DETAILS ERROR:`,
                detailsError
              );

              return doctor;
            }
          }
        )
      );

    setData(
      doctorsWithDetails
    );

    setDepartments(
      Array.isArray(
        departmentsResponse
      )
        ? departmentsResponse
        : []
    );

    setStatusOptions(
      Array.isArray(
        statusesResponse
      )
        ? statusesResponse
        : []
    );

    setWorkingDayOptions(
      Array.isArray(
        workingDaysResponse
      )
        ? workingDaysResponse
        : []
    );
  } catch (err) {
    console.error(
      "FETCH DATA ERROR:",
      err
    );

    console.error(
      "FETCH DATA RESPONSE:",
      err?.response?.data
    );

    setError(
      "حدث خطأ أثناء تحميل بيانات الأطباء."
    );
  } finally {
    setLoading(false);
  }
};

/* ======================================================
   LOAD ONCE
====================================================== */

useEffect(() => {
  fetchData();
}, []);

  /* ======================================================
     SEARCH
  ====================================================== */

  const filtered =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return data;
      }

      return data.filter(
        (doctor) => {
          const fullName =
            String(
              doctor.fullName ||
                doctor.name ||
                ""
            ).toLowerCase();

          const specialization =
            String(
              doctor.specialization ||
                doctor.specialty ||
                ""
            ).toLowerCase();

          const departmentName =
            String(
              doctor.departmentName ||
                doctor.department_name ||
                ""
            ).toLowerCase();

          const biography =
            String(
              doctor.biography ||
                doctor.bio ||
                ""
            ).toLowerCase();

          return (
            fullName.includes(
              value
            ) ||
            specialization.includes(
              value
            ) ||
            departmentName.includes(
              value
            ) ||
            biography.includes(
              value
            )
          );
        }
      );
    }, [
      data,
      search,
    ]);

  /* ======================================================
     OPEN ADD
  ====================================================== */

  const openAdd = () => {
    if (!userCanManageContent) {
      return;
    }

    setEditing(
      null
    );

    setForm({
      FullName: "",
      Specialization: "",
      Biography: "",
      DepartmentId: "",
      Status: "",
      WorkingDays: [],
      Image: null,
    });

    setError("");

    setModalOpen(
      true
    );
  };

  /* ======================================================
     OPEN EDIT
  ====================================================== */

  const openEdit = (doctor) => {
    if (
      !userCanManageContent &&
      !userCanChangeStatus &&
      !userCanChangeWorkingDays
    ) {
      return;
    }

    console.log(
      "EDIT DOCTOR:",
      doctor
    );

    const workingDays =
      getDoctorWorkingDayIds(
        doctor
      );

    setEditing(
      doctor
    );

    /*
      البيانات هنا بالفعل متجمعة في fetchData.
      لذلك لا نعمل GET /doctors/{id} مرة أخرى عند فتح التعديل.
    */

    setForm({
      FullName:
        doctor.fullName ||
        doctor.name ||
        "",

      Specialization:
        doctor.specialization ||
        doctor.specialty ||
        "",

      Biography:
        doctor.biography ||
        doctor.bio ||
        "",

      DepartmentId:
        doctor.departmentId ??
        doctor.department_id ??
        "",

      Status:
        getStatusId(
          doctor.status ??
            doctor.Status ??
            ""
        ),

      WorkingDays:
        workingDays,

      Image: null,
    });

    setError("");
    setModalOpen(true);
  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave =
    async (
      event
    ) => {
      event.preventDefault();

      const selectedWorkingDays =
        Array.isArray(
          form.WorkingDays
        )
          ? [
              ...new Set(
                form.WorkingDays
                  .map(Number)
                  .filter(
                    (day) =>
                      Number.isInteger(
                        day
                      ) &&
                      day >= 0 &&
                      day <= 6
                  )
              ),
            ].sort(
              (a, b) =>
                a - b
            )
          : [];

      /* ===================================================
         MANAGER MODE

         Manager لا يعدّل بيانات الطبيب الأساسية.
         مسموح له فقط:
         - الحالة
         - أيام العمل
      =================================================== */

      if (!userCanManageContent) {
        if (!editing) {
          setError(
            "غير مسموح بإضافة طبيب."
          );

          return;
        }

        if (
          editing.id === null ||
          editing.id === undefined ||
          editing.id === ""
        ) {
          setError(
            "Doctor ID not found"
          );

          return;
        }

        try {
          setSaving(true);
          setError("");

          if (
            userCanChangeStatus &&
            form.Status !== "" &&
            form.Status !== null &&
            form.Status !== undefined
          ) {
            await updateDoctorStatus(
              editing.id,
              Number(
                form.Status
              )
            );
          }

          if (
            userCanChangeWorkingDays
          ) {
            await updateDoctorWorkingDays(
              editing.id,
              selectedWorkingDays
            );
          }

          setData(
            (previousData) =>
              previousData.map(
                (doctorItem) => {
                  if (
                    String(
                      doctorItem.id
                    ) !==
                    String(
                      editing.id
                    )
                  ) {
                    return doctorItem;
                  }

                  const nextStatus =
                    userCanChangeStatus &&
                    form.Status !== "" &&
                    form.Status !== null &&
                    form.Status !== undefined
                      ? Number(
                          form.Status
                        ) === 1
                        ? "Unavailable"
                        : "Active"
                      : doctorItem.status ??
                        doctorItem.Status ??
                        "";

                  return {
                    ...doctorItem,

                    status:
                      nextStatus,

                    ...(userCanChangeWorkingDays
                      ? {
                          workingDays:
                            selectedWorkingDays,

                          working_days:
                            selectedWorkingDays,
                        }
                      : {}),
                  };
                }
              )
          );

          setModalOpen(false);
          setEditing(null);
        } catch (err) {
          console.error(
            "SAVE DOCTOR PERMISSIONS ERROR:",
            err
          );

          console.error(
            "SAVE DOCTOR RESPONSE:",
            err?.response?.data
          );

          const backendMessage =
            err?.response?.data;

          if (
            typeof backendMessage ===
            "string"
          ) {
            setError(
              backendMessage
            );
          } else {
            setError(
              "حدث خطأ أثناء تعديل حالة الطبيب أو أيام العمل."
            );
          }
        } finally {
          setSaving(false);
        }

        return;
      }

      /* ===================================================
         ADMIN MODE
      =================================================== */

      if (
        !form.FullName.trim()
      ) {
        setError(
          "من فضلك أدخل اسم الطبيب."
        );

        return;
      }

      if (
        form.DepartmentId ===
          "" ||
        form.DepartmentId ===
          null ||
        form.DepartmentId ===
          undefined
      ) {
        setError(
          "من فضلك اختر القسم."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        setError("");

        const payload = {
          FullName:
            form.FullName.trim(),

          Specialization:
            form.Specialization.trim(),

          Biography:
            form.Biography.trim(),

          DepartmentId:
            Number(
              form.DepartmentId
            ),

          Image:
            form.Image,
        };

        if (editing) {
          if (
            editing.id ===
              null ||
            editing.id ===
              undefined ||
            editing.id ===
              ""
          ) {
            throw new Error(
              "Doctor ID not found"
            );
          }

          /* =============================
             1. BASIC DATA
          ============================= */

          await updateDoctor(
            editing.id,
            payload
          );

          /* =============================
             2. STATUS
          ============================= */

          if (
            userCanChangeStatus &&
            form.Status !==
              "" &&
            form.Status !==
              null &&
            form.Status !==
              undefined
          ) {
            await updateDoctorStatus(
              editing.id,
              Number(
                form.Status
              )
            );
          }

          /* =============================
             3. WORKING DAYS
          ============================= */

          if (
            userCanChangeWorkingDays
          ) {
            console.log(
              "SENDING WORKING DAYS:",
              {
                doctorId:
                  editing.id,

                days:
                  selectedWorkingDays,
              }
            );

            await updateDoctorWorkingDays(
              editing.id,
              selectedWorkingDays
            );
          }

          /*
            نحدّث الكارت فورًا محليًا.
          */

          setData(
            (previousData) =>
              previousData.map(
                (doctorItem) => {
                  if (
                    String(
                      doctorItem.id
                    ) !==
                    String(
                      editing.id
                    )
                  ) {
                    return doctorItem;
                  }

                  return {
                    ...doctorItem,

                    fullName:
                      form.FullName.trim(),

                    name:
                      form.FullName.trim(),

                    specialization:
                      form.Specialization.trim(),

                    specialty:
                      form.Specialization.trim(),

                    biography:
                      form.Biography.trim(),

                    bio:
                      form.Biography.trim(),

                    departmentId:
                      Number(
                        form.DepartmentId
                      ),

                    department_id:
                      Number(
                        form.DepartmentId
                      ),

                    ...(userCanChangeStatus &&
                    form.Status !== "" &&
                    form.Status !== null &&
                    form.Status !== undefined
                      ? {
                          status:
                            Number(
                              form.Status
                            ) === 1
                              ? "Unavailable"
                              : "Active",
                        }
                      : {}),

                    ...(userCanChangeWorkingDays
                      ? {
                          workingDays:
                            selectedWorkingDays,

                          working_days:
                            selectedWorkingDays,
                        }
                      : {}),
                  };
                }
              )
          );
        } else {
          /* =============================
             CREATE
          ============================= */

          const createdDoctor =
            await createDoctor(
              payload
            );

          console.log(
            "CREATED DOCTOR RESPONSE:",
            createdDoctor
          );

          /*
            أيام العمل لها Endpoint منفصل،
            لذلك بعد إنشاء الطبيب لازم نأخذ ID
            الطبيب الجديد ثم نحفظ الأيام عليه.
          */

          if (
            userCanChangeWorkingDays &&
            selectedWorkingDays.length >
              0
          ) {
            let createdDoctorId =
              createdDoctor?.id ??
              createdDoctor?.Id ??
              createdDoctor?.doctorId ??
              createdDoctor?.DoctorId ??
              null;

            /*
              بعض الـ Backends لا ترجع ID
              في Response الـ POST.

              لو حصل كده نحاول نجيب الطبيب
              من القائمة بعد الإضافة.
            */

            if (
              createdDoctorId === null ||
              createdDoctorId === undefined ||
              createdDoctorId === ""
            ) {
              const doctorsAfterCreate =
                await getAllDoctors();

              const matchingDoctors =
                Array.isArray(
                  doctorsAfterCreate
                )
                  ? doctorsAfterCreate.filter(
                      (doctorItem) => {
                        const itemName =
                          String(
                            doctorItem.fullName ??
                              doctorItem.name ??
                              ""
                          ).trim();

                        const itemDepartmentId =
                          doctorItem.departmentId ??
                          doctorItem.department_id ??
                          null;

                        return (
                          itemName ===
                            form.FullName.trim() &&
                          String(
                            itemDepartmentId
                          ) ===
                            String(
                              form.DepartmentId
                            )
                        );
                      }
                    )
                  : [];

              const newestMatch =
                matchingDoctors[
                  matchingDoctors.length -
                    1
                ];

              createdDoctorId =
                newestMatch?.id ??
                newestMatch?.Id ??
                null;
            }

            if (
              createdDoctorId === null ||
              createdDoctorId === undefined ||
              createdDoctorId === ""
            ) {
              throw new Error(
                "تمت إضافة الطبيب، لكن تعذر تحديد ID لحفظ أيام العمل."
              );
            }

            console.log(
              "SENDING NEW DOCTOR WORKING DAYS:",
              {
                doctorId:
                  createdDoctorId,

                days:
                  selectedWorkingDays,
              }
            );

            await updateDoctorWorkingDays(
              createdDoctorId,
              selectedWorkingDays
            );
          }
        }

        setModalOpen(
          false
        );

        setEditing(
          null
        );

        /*
          في حالة الإضافة نعمل Refresh
          حتى يظهر الطبيب الجديد.

          في حالة التعديل لا نعمل Refresh
          مباشرة لأن بعض Responses القديمة
          قد ترجع workingDays فارغة.
        */

        if (!editing) {
          await fetchData();
        }
      } catch (err) {
        console.error(
          "SAVE DOCTOR ERROR:",
          err
        );

        console.error(
          "SAVE DOCTOR RESPONSE:",
          err?.response?.data
        );

        const backendMessage =
          err?.response?.data;

        if (
          typeof backendMessage ===
          "string"
        ) {
          setError(
            backendMessage
          );
        } else {
          setError(
            editing
              ? "حدث خطأ أثناء تعديل الطبيب."
              : "حدث خطأ أثناء إضافة الطبيب."
          );
        }
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ======================================================
     DELETE
  ====================================================== */

  const handleDelete =
    async (
      doctor
    ) => {
      if (!userCanManageContent) {
        return;
      }

      if (
        doctor.id === null ||
        doctor.id === undefined
      ) {
        window.alert(
          "لا يوجد ID لهذا الطبيب."
        );

        return;
      }

      const name =
        doctor.fullName ||
        doctor.name ||
        "الطبيب";

      const confirmed =
        window.confirm(
          `هل أنت متأكد من حذف "${name}"؟`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteDoctor(
          doctor.id
        );

        await fetchData();
      } catch (err) {
        console.error(
          "DELETE DOCTOR ERROR:",
          err
        );

        console.error(
          "DELETE DOCTOR RESPONSE:",
          err?.response?.data
        );

        const message =
          err?.response?.data;

        window.alert(
          typeof message ===
            "string"
            ? message
            : "حدث خطأ أثناء حذف الطبيب."
        );
      }
    };

  /* ======================================================
     STYLES
  ====================================================== */

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white text-slate-800 text-sm";

  const labelClass =
    "block text-sm font-bold text-slate-700 mb-1.5";

  /* ======================================================
     RETURN
  ====================================================== */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">

        <div className="relative flex-1 max-w-md">

          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            placeholder="ابحث عن طبيب..."
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            className={`${inputClass} pr-11`}
          />

        </div>

        {userCanManageContent && (
          <button
            type="button"
            onClick={
              openAdd
            }
            className="btn btn-primary shrink-0"
          >
            <Plus className="w-5 h-5" />

            إضافة طبيب
          </button>
        )}

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error &&
        !modalOpen && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          {Array.from({
            length: 6,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className="card p-6 shimmer-bg h-64 rounded-2xl"
              />
            )
          )}

        </div>

      ) : filtered.length ===
        0 ? (

        <div className="card p-10 text-center">

          <p className="font-bold text-slate-700">
            {search
              ? "لا توجد نتائج مطابقة للبحث"
              : "لا يوجد أطباء لعرضهم حالياً"}
          </p>

        </div>

      ) : (

        /* =====================================================
            DOCTORS GRID
        ====================================================== */

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          {filtered.map(
            (
              doctor,
              index
            ) => {

              const id =
                doctor.id;

              const fullName =
                doctor.fullName ||
                doctor.name ||
                "بدون اسم";

              const specialization =
                doctor.specialization ||
                doctor.specialty ||
                "التخصص غير محدد";

              const departmentName =
                doctor.departmentName ||
                doctor.department_name ||
                "القسم غير محدد";

              const biography =
                doctor.biography ||
                doctor.bio ||
                "";

              const status =
                doctor.status ??
                doctor.Status ??
                "";

              const rawImage =
                doctor.imageUrl ||
                doctor.image_url ||
                "";

              const imageUrl =
                getDoctorImageUrl(
                  rawImage
                );

              const statusId =
                getStatusId(
                  status
                );

              const isActive =
                Number(
                  statusId
                ) === 0;

              const statusLabel =
                getStatusLabel(
                  status
                );

              const workingDaysText =
                getDoctorWorkingDaysText(
                  doctor
                );

              return (
                <div
                  key={
                    id ??
                    `${fullName}-${index}`
                  }
                  className="card p-5 group"
                >

                  {/* DOCTOR DATA */}

                  <div className="text-center">

                    <PlaceholderImage
                      type="doctor"
                      src={
                        imageUrl
                      }
                      alt={
                        fullName
                      }
                      className="w-20 h-20 mx-auto mb-3"
                      rounded="rounded-full"
                    />

                    <h3 className="font-bold text-slate-800">
                      {fullName}
                    </h3>

                    <p className="text-sm text-primary-600 font-bold mt-1">
                      {specialization}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      {departmentName}
                    </p>

                    {biography && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-5">
                        {biography}
                      </p>
                    )}

                    {workingDaysText && (
                      <p className="mt-3 text-xs font-bold text-primary-600">
                        أيام العمل:{" "}
                        {workingDaysText}
                      </p>
                    )}

                    {statusLabel && (
                      <span
                        className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-success-100 text-success-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    )}

                  </div>

                  {/* ACTIONS */}

                  {(userCanManageContent ||
                    userCanChangeStatus ||
                    userCanChangeWorkingDays) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            doctor
                          )
                        }
                        className="flex-1 btn btn-secondary text-xs py-2 px-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />

                        {userCanManageContent
                          ? "تعديل"
                          : "تعديل الحالة وأيام العمل"}
                      </button>

                      {userCanManageContent && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              doctor
                            )
                          }
                          title="حذف الطبيب"
                          className="px-3 py-2 rounded-xl bg-error-50 text-error-600 hover:bg-error-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {modalOpen && (

        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={() => {
            if (
              !saving
            ) {
              setModalOpen(
                false
              );
            }
          }}
        >

          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">

              <h3 className="text-xl font-extrabold text-slate-800">

                {editing
                  ? userCanManageContent
                    ? "تعديل بيانات الطبيب"
                    : "تعديل حالة الطبيب وأيام العمل"
                  : "إضافة طبيب جديد"}

              </h3>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  setModalOpen(
                    false
                  )
                }
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSave
              }
              className="p-6 space-y-5"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              {userCanManageContent && (
                <>
              {/* FULL NAME */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  اسم الطبيب *
                </label>

                <input
                  type="text"
                  required
                  value={
                    form.FullName
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        FullName:
                          event.target.value,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="اسم الطبيب"
                />

              </div>

              {/* SPECIALIZATION */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  التخصص
                </label>

                <input
                  type="text"
                  value={
                    form.Specialization
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        Specialization:
                          event.target.value,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="مثال: استشاري جراحة العظام"
                />

              </div>

              {/* DEPARTMENT */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  القسم *
                </label>

                <select
                  required
                  value={
                    form.DepartmentId
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        DepartmentId:
                          event.target.value,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                >

                  <option value="">
                    اختر القسم...
                  </option>

                  {departments.map(
                    (
                      department,
                      index
                    ) => {

                      const id =
                        department.id ??
                        department.Id;

                      const name =
                        department.name ??
                        department.Name ??
                        "قسم";

                      return (
                        <option
                          key={
                            id ??
                            index
                          }
                          value={
                            id
                          }
                        >
                          {name}
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

                </>
              )}

              {/* STATUS */}

              {editing &&
                userCanChangeStatus && (

                <div>

                  <label
                    className={
                      labelClass
                    }
                  >
                    حالة الطبيب
                  </label>

                  <select
                    value={
                      form.Status
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          Status:
                            event.target.value,
                        })
                      )
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="">
                      اختر الحالة...
                    </option>

                    {statusOptions.map(
                      (
                        option
                      ) => {

                        const id =
                          option.id ??
                          option.Id;

                        const name =
                          option.name ??
                          option.Name ??
                          "";

                        const arabicName =
                          Number(
                            id
                          ) === 0
                            ? "نشط"
                            : Number(
                                id
                              ) === 1
                            ? "غير متاح"
                            : name;

                        return (
                          <option
                            key={
                              id
                            }
                            value={
                              id
                            }
                          >
                            {arabicName}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>

              )}

              {(userCanManageContent ||
                editing) &&
                userCanChangeWorkingDays && (
                <>
              {/* =================================================
                  WORKING DAYS
              ================================================= */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  أيام عمل الطبيب
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {workingDayOptions.map(
                    (
                      option
                    ) => {

                      const id =
                        Number(
                          option.id ??
                            option.Id
                        );

                      const apiName =
                        option.name ??
                        option.Name ??
                        "";

                      const currentDays =
                        Array.isArray(
                          form.WorkingDays
                        )
                          ? form.WorkingDays
                              .map(Number)
                              .filter(
                                (day) =>
                                  Number.isInteger(
                                    day
                                  )
                              )
                          : [];

                      const checked =
                        currentDays.includes(
                          id
                        );

                      return (
                        <label
                          key={
                            id
                          }
                          className={`
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            px-3
                            py-3
                            cursor-pointer
                            select-none
                            transition-all

                            ${
                              checked
                                ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                                : "border-slate-200 bg-white hover:border-primary-300"
                            }
                          `}
                        >

                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleWorkingDay(
                                id
                              )
                            }
                            className="
                              w-4
                              h-4
                              accent-primary-600
                              cursor-pointer
                            "
                          />

                          <span
                            className={`text-sm font-bold ${
                              checked
                                ? "text-primary-700"
                                : "text-slate-700"
                            }`}
                          >
                            {ARABIC_DAYS[
                              id
                            ] ||
                              apiName}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>

                {/* SELECTED DAYS PREVIEW */}

                {form.WorkingDays.length >
                  0 && (
                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <span className="text-xs font-bold text-slate-500">
                      الأيام المختارة:
                    </span>

                    {form.WorkingDays
                      .map(Number)
                      .filter(
                        (day) =>
                          Number.isInteger(
                            day
                          )
                      )
                      .sort(
                        (
                          a,
                          b
                        ) =>
                          a - b
                      )
                      .map(
                        (
                          day
                        ) => (
                          <span
                            key={
                              day
                            }
                            className="
                              rounded-lg
                              bg-primary-100
                              px-2.5
                              py-1
                              text-xs
                              font-bold
                              text-primary-700
                            "
                          >
                            {
                              ARABIC_DAYS[
                                day
                              ]
                            }
                          </span>
                        )
                      )}
                  </div>
                )}

                {workingDayOptions.length ===
                  0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    لا توجد أيام متاحة للعرض.
                  </p>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  يمكنك اختيار أكثر من يوم للطبيب.
                </p>

              </div>

                </>
              )}

              {userCanManageContent && (
                <>
              {/* BIOGRAPHY */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  السيرة الذاتية
                </label>

                <textarea
                  value={
                    form.Biography
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        Biography:
                          event.target.value,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                  rows={
                    4
                  }
                  placeholder="نبذة عن الطبيب..."
                />

              </div>

              {/* IMAGE */}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  صورة الطبيب
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        Image:
                          event.target.files?.[0] ||
                          null,
                      })
                    )
                  }
                  className={
                    inputClass
                  }
                />

                {editing && (
                  <p className="text-xs text-slate-400 mt-2">
                    إذا لم تختَر صورة جديدة سيتم الاحتفاظ بالصورة الحالية.
                  </p>
                )}

              </div>

                </>
              )}

              {/* BUTTONS */}

              <div className="flex gap-3 pt-4 border-t border-slate-100">

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >

                  {saving
                    ? "جاري الحفظ..."
                    : !userCanManageContent
                    ? "حفظ الحالة وأيام العمل"
                    : editing
                    ? "حفظ التعديلات"
                    : "إضافة الطبيب"}

                </button>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    setModalOpen(
                      false
                    )
                  }
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}