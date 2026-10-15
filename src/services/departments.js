import api from "./api";

const DEPARTMENTS_ENDPOINT =
  "/api/dashboard/departments";

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "https://rewaddashboard.runasp.net";


function getDepartmentImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${BACKEND_ORIGIN}${
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`
  }`;
}


function normalizeDepartment(department) {
  if (!department) {
    return null;
  }

  const id =
    department.id ??
    department.Id ??
    null;

  return {
    ...department,

    id,

    name:
      department.name ??
      department.Name ??
      "",

    description:
      department.description ??
      department.Description ??
      "",

    image_url: getDepartmentImageUrl(
      department.imageUrl ??
        department.ImageUrl ??
        department.image_url ??
        ""
    ),

    slug:
      id !== null &&
      id !== undefined
        ? String(id)
        : "",

    icon:
      department.icon ??
      "stethoscope",
  };
}


export async function getDepartments() {
  const response = await api.get(
    DEPARTMENTS_ENDPOINT
  );

  console.log(
    "GET DEPARTMENTS RESPONSE:",
    response.data
  );

  if (!Array.isArray(response.data)) {
    console.warn(
      "Departments response is not an array:",
      response.data
    );

    return [];
  }

  return response.data
    .map(normalizeDepartment)
    .filter(Boolean);
}


export async function getDepartment(id) {
  const response = await api.get(
    `${DEPARTMENTS_ENDPOINT}/${id}`
  );

  console.log(
    "GET DEPARTMENT RESPONSE:",
    response.data
  );

  return normalizeDepartment(
    response.data
  );
}


export async function createDepartment(data) {
  const formData = new FormData();

  const name =
    data?.Name ??
    data?.name ??
    "";

  const description =
    data?.Description ??
    data?.description ??
    "";


  const image =
    data?.Image ??
    data?.image ??
    data?.image_url ??
    null;

  if (name.trim()) {
    formData.append(
      "Name",
      name.trim()
    );
  }

  if (
    description !== null &&
    description !== undefined &&
    String(description).trim()
  ) {
    formData.append(
      "Description",
      String(description).trim()
    );
  }

 
  if (image instanceof File) {
    formData.append(
      "Image",
      image
    );
  }

  const response = await api.post(
    DEPARTMENTS_ENDPOINT,
    formData
  );

  console.log(
    "CREATE DEPARTMENT RESPONSE:",
    response.data
  );

  return response.data;
}



export async function updateDepartment(id, data) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Department id is required"
    );
  }

  const formData = new FormData();

  const name =
    data?.Name ??
    data?.name;

  const description =
    data?.Description ??
    data?.description;

  const image =
    data?.Image ??
    data?.image ??
    data?.image_url ??
    null;



  if (name !== undefined && name !== null) {
    formData.append(
      "Name",
      String(name).trim()
    );
  }

  if (
    description !== undefined &&
    description !== null
  ) {
    formData.append(
      "Description",
      String(description).trim()
    );
  }


  if (image instanceof File) {
    formData.append(
      "Image",
      image
    );
  }

  const response = await api.put(
    `${DEPARTMENTS_ENDPOINT}/${id}`,
    formData
  );

  console.log(
    "UPDATE DEPARTMENT RESPONSE:",
    response.data
  );

  return response.data;
}


export async function deleteDepartment(id) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Department id is required"
    );
  }

  const response = await api.delete(
    `${DEPARTMENTS_ENDPOINT}/${id}`
  );

  console.log(
    "DELETE DEPARTMENT RESPONSE:",
    response.data
  );

  return response.data;
}


export async function getDepartmentsWithDoctors() {
  const response = await api.get(
    `${DEPARTMENTS_ENDPOINT}/with-doctors`
  );

  console.log(
    "GET DEPARTMENTS WITH DOCTORS RESPONSE:",
    response.data
  );

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data.map((department) => {
    const normalizedDepartment =
      normalizeDepartment(department);

    return {
      ...normalizedDepartment,

      doctors: Array.isArray(
        department.doctors
      )
        ? department.doctors.map(
            (doctor) => ({
              ...doctor,

              id:
                doctor.id ??
                doctor.Id ??
                null,

              name:
                doctor.fullName ??
                doctor.FullName ??
                "",

              specialty:
                doctor.specialization ??
                doctor.Specialization ??
                "",

              bio:
                doctor.biography ??
                doctor.Biography ??
                "",

              image_url:
                doctor.imageUrl ??
                doctor.ImageUrl ??
                "",

              status:
                doctor.status ??
                doctor.Status ??
                "",

              // أهم جزء
              department_id:
                normalizedDepartment.id,

              department_name:
                normalizedDepartment.name,
            })
          )
        : [],
    };
  });
}