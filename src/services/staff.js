import api from "./api";

const BACKEND_URL =
  "https://rewaddashboard.runasp.net";

/* ======================================================
   IMAGE URL
====================================================== */

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${BACKEND_URL}${
    imageUrl.startsWith("/")
      ? ""
      : "/"
  }${imageUrl}`;
}

/* ======================================================
   NORMALIZE STAFF
====================================================== */

function normalizeStaff(member) {
  if (!member) {
    return null;
  }

  const sortOrder =
    member.sortOrder ??
    member.SortOrder ??
    member.sort_order ??
    0;

  return {
    id:
      member.id ??
      member.Id ??
      null,

    name:
      member.name ??
      member.Name ??
      "",

    position:
      member.role ??
      member.Role ??
      "",

    description:
      member.description === "-" ||
      member.Description === "-"
        ? ""
        : member.description ??
          member.Description ??
          "",

    /* ================================================
       SORT ORDER
    ================================================= */

    sort_order:
      Number(sortOrder) || 0,

    sortOrder:
      Number(sortOrder) || 0,

    /* ================================================
       IMAGE
    ================================================= */

    image_url:
      getImageUrl(
        member.imageUrl ??
          member.ImageUrl ??
          member.image_url ??
          ""
      ),

    imageUrl:
      member.imageUrl ??
      member.ImageUrl ??
      null,
  };
}

/* ======================================================
   BUILD FORM DATA
====================================================== */

function buildStaffFormData(data) {
  const formData =
    new FormData();

  /* ==================================================
     NAME
  ================================================== */

  formData.append(
    "Name",
    String(
      data?.name || ""
    ).trim()
  );

  /* ==================================================
     ROLE
  ================================================== */

  formData.append(
    "Role",
    String(
      data?.position || ""
    ).trim()
  );

  /* ==================================================
     DESCRIPTION

     الـ Backend عامل Description required.
     لو المستخدم مسابش وصف نبعت "-"
     وبعد GET نخفيها من الواجهة.
  ================================================== */

  const description =
    String(
      data?.description || ""
    ).trim();

  formData.append(
    "Description",
    description || "-"
  );

  /* ==================================================
     SORT ORDER

     Swagger:
     SortOrder = integer(int32)
  ================================================== */

  const sortOrder =
    data?.sort_order ??
    data?.sortOrder ??
    0;

  formData.append(
    "SortOrder",
    String(
      Number(sortOrder) || 0
    )
  );

  /* ==================================================
     IMAGE

     نبعت Image فقط لو المستخدم
     اختار صورة جديدة من الجهاز.
  ================================================== */

  if (
    data?.image_url instanceof File
  ) {
    formData.append(
      "Image",
      data.image_url
    );
  }

  return formData;
}

/* ======================================================
   GET ALL STAFF
====================================================== */

export async function getStaff() {
  try {
    const response =
      await api.get(
        "/api/Staff"
      );

    const data =
      response.data;

    if (
      Array.isArray(data)
    ) {
      return data
        .map(
          normalizeStaff
        )
        .filter(Boolean);
    }

    if (
      Array.isArray(
        data?.data
      )
    ) {
      return data.data
        .map(
          normalizeStaff
        )
        .filter(Boolean);
    }

    if (
      Array.isArray(
        data?.Data
      )
    ) {
      return data.Data
        .map(
          normalizeStaff
        )
        .filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to fetch staff:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   GET STAFF BY ID
====================================================== */

export async function getStaffById(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Staff id is required"
    );
  }

  try {
    const response =
      await api.get(
        `/api/Staff/${id}`
      );

    return normalizeStaff(
      response.data?.data ??
        response.data?.Data ??
        response.data
    );
  } catch (error) {
    console.error(
      "Failed to fetch staff member:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   CREATE STAFF
====================================================== */

export async function createStaff(
  data
) {
  try {
    const formData =
      buildStaffFormData(
        data
      );

    const response =
      await api.post(
        "/api/Staff",
        formData
      );

    console.log(
      "CREATE STAFF RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to create staff:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   UPDATE STAFF
====================================================== */

export async function updateStaff(
  id,
  data
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Staff id is required"
    );
  }

  try {
    const formData =
      buildStaffFormData(
        data
      );

    const response =
      await api.put(
        `/api/Staff/${id}`,
        formData
      );

    console.log(
      "UPDATE STAFF RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update staff:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* ======================================================
   DELETE STAFF
====================================================== */

export async function deleteStaff(
  id
) {
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    throw new Error(
      "Staff id is required"
    );
  }

  try {
    const response =
      await api.delete(
        `/api/Staff/${id}`
      );

    console.log(
      "DELETE STAFF RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to delete staff:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}