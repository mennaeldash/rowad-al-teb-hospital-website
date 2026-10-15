import api from "./api";

const EQUIPMENT_ENDPOINT =
  "/api/dashboard/services";

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "https://rewaddashboard.runasp.net";

/* ======================================================
   IMAGE URL
====================================================== */

function getBackendImageUrl(
  imageUrl
) {
  if (!imageUrl) {
    return "";
  }

  const value =
    String(
      imageUrl
    ).trim();

  /*
    لو الصورة بالفعل URL كامل
  */

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

  /*
    Backend بيرجع مثلاً:

    /images/Services/abc.png

    نحوله إلى:

    https://rewaddashboard.runasp.net/images/Services/abc.png
  */

  return `${BACKEND_ORIGIN}${
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
}

/* ======================================================
   NORMALIZE
====================================================== */

function normalizeEquipment(
  item
) {
  if (!item) {
    return null;
  }

  const rawImageUrl =
    item.imageUrl ??
    item.ImageUrl ??
    item.image_url ??
    "";

  const imageUrl =
    getBackendImageUrl(
      rawImageUrl
    );

  return {
    ...item,

    id:
      item.id ??
      item.Id ??
      null,

    name:
      item.name ??
      item.Name ??
      "",

    description:
      item.description ??
      item.Description ??
      "",

    /*
      نخلي الاتنين URL كامل
      عشان الأدمن والموقع
      يشتغلوا بنفس القيمة.
    */

    imageUrl,

    image_url:
      imageUrl,
  };
}

/* ======================================================
   EXTRACT DATA
====================================================== */

function extractData(
  responseData
) {
  return (
    responseData?.data ??
    responseData
  );
}

/* ======================================================
   BUILD FORM DATA
====================================================== */

function buildFormData(
  data
) {
  const formData =
    new FormData();

  formData.append(
    "Name",
    String(
      data?.name ??
        data?.Name ??
        ""
    ).trim()
  );

  formData.append(
    "Description",
    String(
      data?.description ??
        data?.Description ??
        ""
    ).trim()
  );

  /*
    CrudAdmin بيحط الصورة الجديدة
    في image_url كـ File.

    أثناء التعديل لو image_url
    عبارة عن URL قديم مش هنبعته،
    ونبعت Image فقط لو المستخدم
    اختار File جديد.
  */

  const selectedImage =
    data?.image_url instanceof
    File
      ? data.image_url
      : data?.image instanceof
        File
      ? data.image
      : data?.Image instanceof
        File
      ? data.Image
      : null;

  if (selectedImage) {
    formData.append(
      "Image",
      selectedImage,
      selectedImage.name
    );
  }

  console.log(
    "EQUIPMENT FORM DATA:"
  );

  for (
    const [key, value]
    of formData.entries()
  ) {
    console.log(
      key,
      value
    );
  }

  return formData;
}

/* ======================================================
   GET ALL

   GET /api/dashboard/services
====================================================== */

export async function getEquipment() {
  try {
    const response =
      await api.get(
        EQUIPMENT_ENDPOINT
      );

    console.log(
      "GET EQUIPMENT RESPONSE:",
      response.data
    );

    const result =
      extractData(
        response.data
      );

    if (
      !Array.isArray(
        result
      )
    ) {
      return [];
    }

    return result
      .map(
        normalizeEquipment
      )
      .filter(Boolean);
  } catch (error) {
    console.error(
      "GET EQUIPMENT ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   GET BY ID

   GET /api/dashboard/services/{id}
====================================================== */

export async function getEquipmentById(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Equipment id is required"
    );
  }

  try {
    const response =
      await api.get(
        `${EQUIPMENT_ENDPOINT}/${id}`
      );

    console.log(
      "GET EQUIPMENT BY ID RESPONSE:",
      response.data
    );

    const result =
      extractData(
        response.data
      );

    return result
      ? normalizeEquipment(
          result
        )
      : null;
  } catch (error) {
    console.error(
      "GET EQUIPMENT BY ID ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   CREATE

   POST /api/dashboard/services
====================================================== */

export async function createEquipment(
  data
) {
  try {
    const formData =
      buildFormData(
        data
      );

    const response =
      await api.post(
        EQUIPMENT_ENDPOINT,
        formData
      );

    console.log(
      "CREATE EQUIPMENT RESPONSE:",
      response.data
    );

    const result =
      extractData(
        response.data
      );

    return result
      ? normalizeEquipment(
          result
        )
      : null;
  } catch (error) {
    console.error(
      "CREATE EQUIPMENT ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   UPDATE

   PUT /api/dashboard/services/{id}
====================================================== */

export async function updateEquipment(
  id,
  data
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Equipment id is required"
    );
  }

  try {
    const formData =
      buildFormData(
        data
      );

    const response =
      await api.put(
        `${EQUIPMENT_ENDPOINT}/${id}`,
        formData
      );

    console.log(
      "UPDATE EQUIPMENT RESPONSE:",
      response.data
    );

    const result =
      extractData(
        response.data
      );

    return result
      ? normalizeEquipment(
          result
        )
      : null;
  } catch (error) {
    console.error(
      "UPDATE EQUIPMENT ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   DELETE

   DELETE /api/dashboard/services/{id}
====================================================== */

export async function deleteEquipment(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Equipment id is required"
    );
  }

  try {
    const response =
      await api.delete(
        `${EQUIPMENT_ENDPOINT}/${id}`
      );

    console.log(
      "DELETE EQUIPMENT RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "DELETE EQUIPMENT ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   ALIASES
====================================================== */

export const getEquipments =
  getEquipment;

export const getAllEquipment =
  getEquipment;

export const getServices =
  getEquipment;