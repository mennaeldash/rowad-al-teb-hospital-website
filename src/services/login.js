import api from "./api";

/* =========================================================
   ROLES
========================================================= */

export const ADMIN_ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
};

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(role) {
  const value = String(
    role || ""
  )
    .trim()
    .toLowerCase();

  if (value === "admin") {
    return ADMIN_ROLES.ADMIN;
  }

  if (value === "manager") {
    return ADMIN_ROLES.MANAGER;
  }

  return "";
}

/* =========================================================
   GET ROLE FROM JWT TOKEN
========================================================= */

function getRoleFromToken(token) {
  if (
    !token ||
    typeof token !== "string"
  ) {
    return "";
  }

  try {
    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return "";
    }

    let base64 =
      parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    /*
      JWT Base64 URL
      أحيانًا بيكون ناقص padding
    */

    while (
      base64.length % 4 !== 0
    ) {
      base64 += "=";
    }

    const decoded =
      window.atob(base64);

    const jsonPayload =
      decodeURIComponent(
        decoded
          .split("")
          .map(
            (char) =>
              "%" +
              (
                "00" +
                char
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)
          )
          .join("")
      );

    const payload =
      JSON.parse(
        jsonPayload
      );

    /*
      ASP.NET Identity
      غالبًا بيحط الـ Role
      في الـ claim الطويل ده.
    */

    const role =
      payload?.[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ??
      payload?.role ??
      payload?.Role ??
      "";

    return normalizeRole(
      role
    );
  } catch (error) {
    console.error(
      "TOKEN ROLE PARSE ERROR:",
      error
    );

    return "";
  }
}

/* =========================================================
   LOGIN ADMIN

   POST /api/auth/login

   REQUEST:
   email
   password

   BACKEND RESPONSE:
   token

   FRONTEND:
   بنستخرج الـ Role من الـ JWT
========================================================= */

export async function loginAdmin(
  email,
  password
) {
  const normalizedEmail =
    String(
      email || ""
    ).trim();

  const normalizedPassword =
    String(
      password || ""
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (!normalizedEmail) {
    throw new Error(
      "البريد الإلكتروني مطلوب"
    );
  }

  if (!normalizedPassword) {
    throw new Error(
      "كلمة المرور مطلوبة"
    );
  }

  /* =======================================================
     REQUEST
  ======================================================= */

  const response =
    await api.post(
      "/api/auth/login",
      {
        email:
          normalizedEmail,

        password:
          normalizedPassword,
      }
    );

  const data =
    response.data || {};

  const token =
    data?.token ??
    data?.Token ??
    data?.accessToken ??
    data?.access_token ??
    "";

  /*
    احتياطي:
    لو الباك رجّع Role مباشرة
    ناخده.

    لو مش موجود،
    نستخرجه من الـ JWT.
  */

  let role =
    normalizeRole(
      data?.role ??
        data?.Role ??
        data?.user?.role ??
        data?.user?.Role
    );

  if (
    !role &&
    token
  ) {
    role =
      getRoleFromToken(
        token
      );
  }

  console.log(
    "LOGIN ADMIN RESPONSE:",
    data
  );

  console.log(
    "LOGGED USER ROLE:",
    role
  );

  return {
    ...data,

    token,

    role,
  };
}

/* =========================================================
   CREATE ADMIN

   POST /api/auth/create-admin

   REQUEST:
   fullName
   email
   password
   confirmPassword
   role
========================================================= */

export async function createAdmin(
  data
) {
  /* =======================================================
     FULL NAME
  ======================================================= */

  const fullName =
    String(
      data?.fullName ??
        data?.FullName ??
        ""
    ).trim();

  /* =======================================================
     EMAIL
  ======================================================= */

  const email =
    String(
      data?.email ??
        data?.Email ??
        ""
    ).trim();

  /* =======================================================
     PASSWORD
  ======================================================= */

  const password =
    String(
      data?.password ??
        data?.Password ??
        ""
    );

  /* =======================================================
     CONFIRM PASSWORD
  ======================================================= */

  const confirmPassword =
    String(
      data?.confirmPassword ??
        data?.ConfirmPassword ??
        ""
    );

  /* =======================================================
     ROLE
  ======================================================= */

  const role =
    normalizeRole(
      data?.role ??
        data?.Role
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (!fullName) {
    throw new Error(
      "اسم الأدمن مطلوب"
    );
  }

  if (!email) {
    throw new Error(
      "البريد الإلكتروني مطلوب"
    );
  }

  if (!password) {
    throw new Error(
      "كلمة المرور مطلوبة"
    );
  }

  if (!confirmPassword) {
    throw new Error(
      "تأكيد كلمة المرور مطلوب"
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    throw new Error(
      "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
    );
  }

  if (!role) {
    throw new Error(
      "يجب اختيار الصلاحية: Admin أو Manager"
    );
  }

  /* =======================================================
     PAYLOAD

     Swagger:
     {
       fullName,
       email,
       password,
       confirmPassword,
       role
     }
  ======================================================= */

  const payload = {
    fullName,
    email,
    password,
    confirmPassword,
    role,
  };

  console.log(
    "CREATE ADMIN PAYLOAD:",
    {
      fullName:
        payload.fullName,

      email:
        payload.email,

      role:
        payload.role,
    }
  );

  /* =======================================================
     REQUEST
  ======================================================= */

  try {
    const response =
      await api.post(
        "/api/auth/create-admin",
        payload
      );

    console.log(
      "CREATE ADMIN RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "CREATE ADMIN ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}
/* =========================================================
   GET USERS
   GET /api/auth/users
========================================================= */

export async function getUsers() {
  try {
    const response =
      await api.get(
        "/api/auth/users"
      );

    return (
      response.data?.data ||
      []
    );
  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}


/* =========================================================
   DELETE USER
   DELETE /api/auth/users/{userId}
========================================================= */

export async function deleteUser(
  userId
) {
  const normalizedUserId =
    String(
      userId ?? ""
    ).trim();

  if (!normalizedUserId) {
    throw new Error(
      "معرّف المستخدم مطلوب"
    );
  }

  try {
    const response =
      await api.delete(
        `/api/auth/users/${normalizedUserId}`
      );

    return response.data;
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error?.response?.data ||
        error
    );

    throw error;
  }
}