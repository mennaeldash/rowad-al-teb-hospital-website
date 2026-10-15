import api from "./api";

const BACKEND_URL =
  "https://rewaddashboard.runasp.net";

/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith(
      "http://"
    ) ||
    imageUrl.startsWith(
      "https://"
    )
  ) {
    return imageUrl;
  }

  return `${BACKEND_URL}${
    imageUrl.startsWith("/")
      ? ""
      : "/"
  }${imageUrl}`;
}

/* =========================================================
   NORMALIZE PARTNER
========================================================= */

function normalizePartner(
  partner
) {
  if (!partner) {
    return null;
  }

  return {
    id:
      partner.id ??
      partner.Id,

    name:
      partner.name ??
      partner.Name ??
      "",

    description:
      partner.description ??
      partner.Description ??
      "",

    logo_url:
      getImageUrl(
        partner.imageUrl ??
          partner.ImageUrl ??
          ""
      ),

    imageUrl:
      partner.imageUrl ??
      partner.ImageUrl ??
      null,
  };
}

/* =========================================================
   EXTRACT PARTNERS
========================================================= */

function extractPartners(
  data
) {
  if (
    Array.isArray(data)
  ) {
    return data
      .map(
        normalizePartner
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
        normalizePartner
      )
      .filter(Boolean);
  }

  if (
    Array.isArray(
      data?.contracts
    )
  ) {
    return data.contracts
      .map(
        normalizePartner
      )
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   BUILD FORM DATA
========================================================= */

function buildPartnerFormData(
  data
) {
  const formData =
    new FormData();

  /* NAME */

  formData.append(
    "Name",
    data?.name ??
      data?.Name ??
      ""
  );

  /* DESCRIPTION */

  formData.append(
    "Description",
    data?.description ??
      data?.Description ??
      ""
  );

  /* IMAGE */

  const image =
    data?.logo_url instanceof
    File
      ? data.logo_url
      : data?.image instanceof
          File
      ? data.image
      : data?.Image instanceof
          File
      ? data.Image
      : null;

  if (image) {
    formData.append(
      "Image",
      image
    );
  }

  return formData;
}

/* =========================================================
   GET ALL PARTNERS
========================================================= */

export async function getPartners() {
  try {
    const response =
      await api.get(
        "/api/dashboard/contracts"
      );

    return extractPartners(
      response.data
    );
  } catch (error) {
    console.error(
      "Failed to fetch partners:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* =========================================================
   GET PARTNER BY ID
========================================================= */

export async function getPartnerById(
  id
) {
  try {
    const response =
      await api.get(
        `/api/dashboard/contracts/${id}`
      );

    return normalizePartner(
      response.data
    );
  } catch (error) {
    console.error(
      "Failed to fetch partner:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* =========================================================
   CREATE PARTNER
========================================================= */

export async function createPartner(
  data
) {
  try {
    const formData =
      buildPartnerFormData(
        data
      );

    const response =
      await api.post(
        "/api/dashboard/contracts",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to create partner:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* =========================================================
   UPDATE PARTNER
========================================================= */

export async function updatePartner(
  id,
  data
) {
  try {
    const formData =
      buildPartnerFormData(
        data
      );

    const response =
      await api.put(
        `/api/dashboard/contracts/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update partner:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}

/* =========================================================
   DELETE PARTNER
========================================================= */

export async function deletePartner(
  id
) {
  try {
    const response =
      await api.delete(
        `/api/dashboard/contracts/${id}`
      );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to delete partner:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}