import api from "./api";

const DOCTORS_ENDPOINT =
  "/api/dashboard/doctors";

const DEPARTMENTS_WITH_DOCTORS_ENDPOINT =
  "/api/dashboard/departments/with-doctors";

/* ======================================================
   HELPERS
====================================================== */

const getBackendOrigin = () => {
  const backendOrigin =
    import.meta.env.VITE_BACKEND_ORIGIN ||
    "";

  if (
    backendOrigin.startsWith("http://") ||
    backendOrigin.startsWith("https://")
  ) {
    return backendOrigin.replace(/\/$/, "");
  }

  const baseURL =
    import.meta.env.VITE_API_BASE_URL ||
    "";

  if (
    baseURL.startsWith("http://") ||
    baseURL.startsWith("https://")
  ) {
    return baseURL
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");
  }

  return "https://rewaddashboard.runasp.net";
};

const BACKEND_ORIGIN =
  getBackendOrigin();

/* ======================================================
   IMAGE URL
====================================================== */

function normalizeImageUrl(imageUrl) {
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
}

/* ======================================================
   NORMALIZE WORKING DAYS
====================================================== */

function normalizeWorkingDays(
  doctor
) {
  if (!doctor) {
    return [];
  }

  const rawDays =
    doctor.workingDays ??
    doctor.WorkingDays ??
    doctor.working_days ??
    doctor.days ??
    doctor.Days ??
    [];

  if (
    !Array.isArray(rawDays)
  ) {
    return [];
  }

  return rawDays
    .map((day) => {
      if (
        day === null ||
        day === undefined
      ) {
        return null;
      }

      if (
        typeof day === "string" ||
        typeof day === "number"
      ) {
        return day;
      }

      return (
        day.name ??
        day.Name ??
        day.day ??
        day.Day ??
        day.id ??
        day.Id ??
        null
      );
    })
    .filter(
      (day) =>
        day !== null &&
        day !== undefined &&
        day !== ""
    );
}

/* ======================================================
   NORMALIZE DOCTOR
====================================================== */

function normalizeDoctor(
  doctor,
  parentDepartment = null
) {
  if (!doctor) {
    return null;
  }

  const id =
    doctor.id ??
    doctor.Id ??
    doctor.doctorId ??
    doctor.DoctorId ??
    null;

  const name =
    doctor.fullName ??
    doctor.FullName ??
    doctor.name ??
    doctor.Name ??
    "";

  const specialization =
    doctor.specialization ??
    doctor.Specialization ??
    doctor.specialty ??
    doctor.Specialty ??
    "";

  const biography =
    doctor.biography ??
    doctor.Biography ??
    doctor.bio ??
    doctor.Bio ??
    "";

  const departmentId =
    doctor.departmentId ??
    doctor.DepartmentId ??
    doctor.department_id ??
    parentDepartment?.id ??
    parentDepartment?.Id ??
    null;

  const departmentName =
    doctor.departmentName ??
    doctor.DepartmentName ??
    doctor.department_name ??
    parentDepartment?.name ??
    parentDepartment?.Name ??
    "";

  const rawImage =
    doctor.imageUrl ??
    doctor.ImageUrl ??
    doctor.image_url ??
    doctor.image ??
    doctor.Image ??
    "";

  const imageUrl =
    normalizeImageUrl(
      rawImage
    );

  const status =
    doctor.status ??
    doctor.Status ??
    "";

  const workingDays =
    normalizeWorkingDays(
      doctor
    );

  return {
    ...doctor,

    /* Backend style */

    id,

    fullName:
      name,

    specialization,

    biography,

    departmentId,

    departmentName,

    imageUrl,

    status,

    workingDays,

    /* Frontend style */

    name,

    specialty:
      specialization,

    bio:
      biography,

    department_id:
      departmentId,

    department_name:
      departmentName,

    image_url:
      imageUrl,

    working_days:
      workingDays,
  };
}

/* ======================================================
   GET ALL DOCTORS
====================================================== */

export async function getAllDoctors() {
  try {
    const response =
      await api.get(
        DEPARTMENTS_WITH_DOCTORS_ENDPOINT
      );

    const departments =
      Array.isArray(
        response.data
      )
        ? response.data
        : [];

    const doctors =
      departments.flatMap(
        (department) => {
          const departmentDoctors =
            Array.isArray(
              department.doctors
            )
              ? department.doctors
              : [];

          return departmentDoctors
            .map((doctor) =>
              normalizeDoctor(
                doctor,
                department
              )
            )
            .filter(Boolean);
        }
      );

    console.log(
      "DOCTORS WITH IDS RESPONSE:",
      doctors
    );

    return doctors;
  } catch (error) {
    console.warn(
      "with-doctors failed, using doctors endpoint.",
      error
    );

    const response =
      await api.get(
        DOCTORS_ENDPOINT
      );

    if (
      !Array.isArray(
        response.data
      )
    ) {
      return [];
    }

    return response.data
      .map((doctor) =>
        normalizeDoctor(
          doctor
        )
      )
      .filter(Boolean);
  }
}

/* ======================================================
   GET DOCTORS
====================================================== */

export async function getDoctors() {
  return getAllDoctors();
}

/* ======================================================
   GET ONE DOCTOR
====================================================== */

export async function getDoctor(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Doctor id is required"
    );
  }

  const response =
    await api.get(
      `${DOCTORS_ENDPOINT}/${id}`
    );

  return normalizeDoctor({
    ...response.data,

    id:
      response.data?.id ??
      response.data?.Id ??
      Number(id),
  });
}

/* ======================================================
   CREATE DOCTOR
====================================================== */

export async function createDoctor(
  data
) {
  const fullName =
    data?.FullName ??
    data?.fullName ??
    data?.name;

  const departmentId =
    data?.DepartmentId ??
    data?.departmentId ??
    data?.department_id;

  if (
    !String(
      fullName || ""
    ).trim()
  ) {
    throw new Error(
      "FullName is required"
    );
  }

  if (
    departmentId === null ||
    departmentId === undefined ||
    departmentId === ""
  ) {
    throw new Error(
      "DepartmentId is required"
    );
  }

  const formData =
    new FormData();

  formData.append(
    "FullName",
    String(
      fullName
    ).trim()
  );

  formData.append(
    "DepartmentId",
    String(
      departmentId
    )
  );

  const image =
    data?.Image ??
    data?.image ??
    null;

  if (
    image instanceof File
  ) {
    formData.append(
      "Image",
      image
    );
  }

  const specialization =
    data?.Specialization ??
    data?.specialization ??
    data?.specialty;

  if (
    specialization !== undefined &&
    specialization !== null &&
    String(
      specialization
    ).trim() !== ""
  ) {
    formData.append(
      "Specialization",
      String(
        specialization
      ).trim()
    );
  }

  const biography =
    data?.Biography ??
    data?.biography ??
    data?.bio;

  if (
    biography !== undefined &&
    biography !== null &&
    String(
      biography
    ).trim() !== ""
  ) {
    formData.append(
      "Biography",
      String(
        biography
      ).trim()
    );
  }

  const response =
    await api.post(
      DOCTORS_ENDPOINT,
      formData
    );

  console.log(
    "CREATE DOCTOR RESPONSE:",
    response.data
  );

  return response.data;
}

/* ======================================================
   UPDATE DOCTOR
====================================================== */

export async function updateDoctor(
  id,
  data
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Doctor id is required"
    );
  }

  const formData =
    new FormData();

  const fullName =
    data?.FullName ??
    data?.fullName ??
    data?.name;

  if (
    fullName !== undefined &&
    fullName !== null
  ) {
    formData.append(
      "FullName",
      String(
        fullName
      ).trim()
    );
  }

  const image =
    data?.Image ??
    data?.image ??
    null;

  if (
    image instanceof File
  ) {
    formData.append(
      "Image",
      image
    );
  }

  const specialization =
    data?.Specialization ??
    data?.specialization ??
    data?.specialty;

  if (
    specialization !== undefined &&
    specialization !== null
  ) {
    formData.append(
      "Specialization",
      String(
        specialization
      ).trim()
    );
  }

  const biography =
    data?.Biography ??
    data?.biography ??
    data?.bio;

  if (
    biography !== undefined &&
    biography !== null
  ) {
    formData.append(
      "Biography",
      String(
        biography
      ).trim()
    );
  }

  const departmentId =
    data?.DepartmentId ??
    data?.departmentId ??
    data?.department_id;

  if (
    departmentId !== undefined &&
    departmentId !== null &&
    departmentId !== ""
  ) {
    formData.append(
      "DepartmentId",
      String(
        departmentId
      )
    );
  }

  const response =
    await api.put(
      `${DOCTORS_ENDPOINT}/${id}`,
      formData
    );

  console.log(
    "UPDATE DOCTOR RESPONSE:",
    response.data
  );

  return response.data;
}

/* ======================================================
   DELETE DOCTOR
====================================================== */

export async function deleteDoctor(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Doctor id is required"
    );
  }

  const response =
    await api.delete(
      `${DOCTORS_ENDPOINT}/${id}`
    );

  return response.data;
}

/* ======================================================
   GET STATUS OPTIONS

   GET /api/dashboard/doctors/status
====================================================== */

export async function getDoctorStatusOptions() {
  const response =
    await api.get(
      `${DOCTORS_ENDPOINT}/status`
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
}

/* ======================================================
   UPDATE STATUS

   0 = Active
   1 = Unavailable
====================================================== */

export async function updateDoctorStatus(
  id,
  status
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Doctor id is required"
    );
  }

  const numericStatus =
    Number(status);

  if (
    ![0, 1].includes(
      numericStatus
    )
  ) {
    throw new Error(
      "Status must be 0 or 1"
    );
  }

  const response =
    await api.put(
      `${DOCTORS_ENDPOINT}/${id}/status`,
      null,
      {
        params: {
          status:
            numericStatus,
        },
      }
    );

  return response.data;
}

/* ======================================================
   GET WORKING DAY OPTIONS

   GET /api/dashboard/doctors/working-days

   0 Sunday
   1 Monday
   2 Tuesday
   3 Wednesday
   4 Thursday
   5 Friday
   6 Saturday
====================================================== */

export async function getDoctorWorkingDayOptions() {
  const response =
    await api.get(
      `${DOCTORS_ENDPOINT}/working-days`
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
}

/* ======================================================
   UPDATE WORKING DAYS

   PUT /api/dashboard/doctors/{id}/working-days

   Example:

   {
     days: [6, 1, 3]
   }

   = السبت + الاثنين + الأربعاء
====================================================== */

export async function updateDoctorWorkingDays(
  id,
  days
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Doctor id is required"
    );
  }

  if (
    !Array.isArray(days)
  ) {
    throw new Error(
      "Days must be an array"
    );
  }

  const normalizedDays =
    [
      ...new Set(
        days.map(
          (day) =>
            Number(day)
        )
      ),
    ];

  const invalidDay =
    normalizedDays.some(
      (day) =>
        !Number.isInteger(
          day
        ) ||
        day < 0 ||
        day > 6
    );

  if (invalidDay) {
    throw new Error(
      "Each working day must be between 0 and 6"
    );
  }

  const response =
    await api.put(
      `${DOCTORS_ENDPOINT}/${id}/working-days`,
      {
        days:
          normalizedDays,
      }
    );

  console.log(
    "UPDATE DOCTOR WORKING DAYS RESPONSE:",
    response.data
  );

  return response.data;
}

/* ======================================================
   GET DOCTOR SCHEDULE

   خلاص مفيش Mock.

   بناخد أيام الدكتور الحقيقية
   من GET /doctors/{id}
====================================================== */

export async function getDoctorSchedule(
  doctorId
) {
  if (
    doctorId === null ||
    doctorId === undefined ||
    doctorId === ""
  ) {
    return null;
  }

  const doctor =
    await getDoctor(
      doctorId
    );

  return {
    doctor_id:
      doctor.id,

    working_days:
      Array.isArray(
        doctor.working_days
      )
        ? doctor.working_days
        : [],
  };
}